"use server";
import { z } from "zod";
import type { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { db, toCents } from "@/server/db";
import { ActionError, audit, parse, refreshCatalog, requireStaffAction, run } from "@/server/admin";
import { statusLabel } from "@/server/orders";
import { TRANSITIONS } from "@/lib/order-status";


export async function changeStatus(ref: string, to: OrderStatus, note: string) {
  return run(async () => {
    const user = await requireStaffAction();
    const order = await db.order.findUnique({ where: { ref }, include: { lines: true } });
    if (!order) throw new ActionError("Order not found.");
    if (!TRANSITIONS[order.status].includes(to)) throw new ActionError(`Can't move an order from “${statusLabel[order.status]}” to “${statusLabel[to]}”.`);
    const message = z.string().trim().max(500).parse(note);

    await db.$transaction(async (tx) => {
      // Optimistic check so two staff members can't apply conflicting changes.
      const res = await tx.order.updateMany({ where: { id: order.id, status: order.status }, data: { status: to } });
      if (!res.count) throw new ActionError("This order was just updated by someone else. Reload and try again.");
      if (to === "CANCELLED") {
        for (const l of order.lines) {
          if (!l.productId) continue;
          const exists = await tx.product.findUnique({ where: { id: l.productId }, select: { id: true } });
          if (!exists) continue;
          await tx.product.update({ where: { id: l.productId }, data: { stock: { increment: l.quantity } } });
          await tx.stockMovement.create({ data: { productId: l.productId, delta: l.quantity, reason: "Order cancelled", orderRef: order.ref, actorName: user.name } });
        }
      }
      await tx.orderEvent.create({
        data: { orderId: order.id, type: "status", fromStatus: order.status, toStatus: to, message: message || statusLabel[to], actorName: user.name },
      });
    });
    await audit(user, "order.status", "order", ref, { from: order.status, to });
    if (to === "CANCELLED") refreshCatalog();
    revalidatePath(`/admin/orders/${ref}`);
    revalidatePath("/admin/orders");
    return { ok: true, message: `Order marked “${statusLabel[to]}”.` } as const;
  });
}

export async function setDeliveryFee(ref: string, fee: string) {
  return run(async () => {
    const user = await requireStaffAction();
    const value = fee.trim() === "" ? null : parse(z.coerce.number().min(0, "Fee can't be negative.").max(1000), fee);
    const order = await db.order.findUnique({ where: { ref } });
    if (!order) throw new ActionError("Order not found.");
    if (order.status === "DELIVERED" || order.status === "CANCELLED") throw new ActionError("This order is closed.");
    await db.order.update({
      where: { ref },
      data: {
        deliveryFeeCents: value === null ? null : toCents(value),
        events: { create: { type: "fee", message: value === null ? "Delivery fee cleared" : `Delivery fee set to $${value.toFixed(2)}`, actorName: user.name } },
      },
    });
    await audit(user, "order.fee", "order", ref, { fee: value });
    revalidatePath(`/admin/orders/${ref}`);
    return { ok: true, message: "Delivery fee saved." } as const;
  });
}

export async function addOrderNote(ref: string, note: string) {
  return run(async () => {
    const user = await requireStaffAction();
    const message = parse(z.string().trim().min(1, "Write a note first.").max(1000), note);
    const order = await db.order.findUnique({ where: { ref }, select: { id: true } });
    if (!order) throw new ActionError("Order not found.");
    await db.orderEvent.create({ data: { orderId: order.id, type: "note", message, actorName: user.name } });
    revalidatePath(`/admin/orders/${ref}`);
    return { ok: true, message: "Note added." } as const;
  });
}

export async function resendReceiptEmail(ref: string) {
  return run(async () => {
    const user = await requireStaffAction();
    const { emailConfigured } = await import("@/server/email");
    if (!emailConfigured) throw new ActionError("Email isn't connected yet. Add RESEND_API_KEY and EMAIL_FROM in Vercel to send receipts.");
    const { getOrder } = await import("@/server/orders");
    const { resendReceipt } = await import("@/server/notify");
    const order = await getOrder(ref);
    if (!order) throw new ActionError("Order not found.");
    await resendReceipt(order);
    await audit(user, "order.receipt", "order", ref);
    revalidatePath(`/admin/orders/${ref}`);
    return { ok: true, message: `Receipt sent to ${order.email}.` } as const;
  });
}
