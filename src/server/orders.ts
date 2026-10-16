import "server-only";
import { randomInt } from "node:crypto";
import { Prisma, type OrderStatus } from "@prisma/client";
import { availability, priceFor, primaryImage } from "@/lib/catalog";
import { db, fromCents, toCents } from "./db";
import { mapProduct, productInclude } from "./catalog";
import { getSettings } from "./settings";
import type { OrderInput } from "./validation";

export class OrderError extends Error {
  constructor(
    message: string,
    public field?: string,
  ) {
    super(message);
  }
}

const REF_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const newRef = () => "OSA-" + Array.from({ length: 6 }, () => REF_ALPHABET[randomInt(REF_ALPHABET.length)]).join("");

export const orderInclude = { lines: true, events: { orderBy: { createdAt: "asc" } } } satisfies Prisma.OrderInclude;
export type OrderWithLines = Prisma.OrderGetPayload<{ include: typeof orderInclude }>;

/**
 * Validate, price and store an order entirely from database data.
 * Client-sent prices are never trusted. Stock is reserved atomically: the
 * order is rejected if any product would go below zero.
 */
export async function createOrder(input: OrderInput, userId: string | null) {
  const { store } = await getSettings();
  if (!store.deliveryAreas.includes(input.address.area)) throw new OrderError("Choose a governorate we deliver to.", "address.area");
  const delivery = store.deliveryMethods.find((d) => d.id === input.deliveryMethod);
  const payment = store.paymentMethods.find((p) => p.id === input.paymentMethod);
  if (!delivery) throw new OrderError("Choose a delivery method.", "deliveryMethod");
  if (!payment) throw new OrderError("Choose a payment method.", "paymentMethod");
  if (input.discountCode) throw new OrderError("Discount codes are not available right now.", "discountCode");

  const existing = await db.order.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
  if (existing) return existing;

  const dbProducts = await db.product.findMany({ where: { slug: { in: input.items.map((i) => i.slug) }, published: true }, include: productInclude });
  const bySlug = new Map(dbProducts.map((p) => [p.slug, p]));

  const lines = input.items.map((item, i) => {
    const row = bySlug.get(item.slug);
    if (!row) throw new OrderError("One of the products in your cart is no longer available.", `items.${i}`);
    const product = mapProduct(row);
    const color = product.colors.find((c) => c.id === item.colorId);
    if (!color) throw new OrderError(`Choose an available colour for ${product.name}.`, `items.${i}`);
    const config = product.configs?.length ? product.configs.find((c) => c.id === item.configId) : undefined;
    if (product.configs?.length && !config) throw new OrderError(`Choose an available option for ${product.name}.`, `items.${i}`);
    if (availability(product, color.id) === "out-of-stock") throw new OrderError(`${product.name} (${color.name}) is out of stock. Please remove it from your cart.`, `items.${i}`);
    return {
      productId: row.id,
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      colorKey: color.id,
      colorName: color.name,
      configKey: config?.id ?? null,
      configLabel: config?.label ?? null,
      unitPriceCents: toCents(priceFor(product, config?.id).price),
      quantity: item.quantity,
      image: primaryImage(product, color.id).src,
    };
  });

  const qty = new Map<string, number>();
  for (const l of lines) qty.set(l.productId, (qty.get(l.productId) ?? 0) + l.quantity);
  const subtotalCents = lines.reduce((s, l) => s + l.unitPriceCents * l.quantity, 0);

  for (let attempt = 0; attempt < 3; attempt++) {
    const ref = newRef();
    try {
      const order = await db.$transaction(async (tx) => {
        for (const [productId, q] of qty) {
          const res = await tx.product.updateMany({ where: { id: productId, stock: { gte: q } }, data: { stock: { decrement: q } } });
          if (res.count === 0) {
            const p = await tx.product.findUnique({ where: { id: productId }, select: { name: true, stock: true } });
            throw new OrderError(p && p.stock > 0 ? `Only ${p.stock} × ${p.name} available. Please reduce the quantity.` : `${p?.name ?? "A product"} just sold out. Please remove it from your cart.`);
          }
          await tx.stockMovement.create({ data: { productId, delta: -q, reason: "Order placed", orderRef: ref } });
        }
        return tx.order.create({
          data: {
            ref,
            idempotencyKey: input.idempotencyKey,
            userId,
            ...input.customer,
            line1: input.address.line1,
            line2: input.address.line2,
            city: input.address.city,
            area: input.address.area,
            notes: input.address.notes,
            deliveryMethodId: delivery.id,
            deliveryMethodLabel: delivery.label,
            deliveryFeeCents: delivery.feeUSD === null ? null : toCents(delivery.feeUSD),
            paymentMethodId: payment.id,
            paymentMethodLabel: payment.label,
            subtotalCents,
            lines: { create: lines },
            events: { create: { type: "status", message: "Order placed on the website", toStatus: "RECEIVED", actorName: "Customer" } },
          },
          include: orderInclude,
        });
      });
      return order;
    } catch (e) {
      // Retry only on a reference collision; an idempotency collision means a parallel duplicate submit.
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        const dup = await db.order.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
        if (dup) return dup;
        continue;
      }
      throw e;
    }
  }
  throw new Error("Could not allocate an order reference");
}

export const getOrder = (ref: string) => db.order.findUnique({ where: { ref }, include: orderInclude });
export const ordersForUser = (userId: string) => db.order.findMany({ where: { userId }, include: { lines: true }, orderBy: { createdAt: "desc" } });

export const orderTotalCents = (o: { subtotalCents: number; deliveryFeeCents: number | null }) => o.subtotalCents + (o.deliveryFeeCents ?? 0);
export const orderTotal = (o: { subtotalCents: number; deliveryFeeCents: number | null }) => fromCents(orderTotalCents(o));

export const statusLabel: Record<OrderStatus, string> = {
  RECEIVED: "Received — awaiting confirmation",
  CONFIRMED: "Confirmed",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};
