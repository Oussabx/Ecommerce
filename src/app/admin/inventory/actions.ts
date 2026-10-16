"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { ActionError, audit, parse, refreshCatalog, requireStaffAction, run } from "@/server/admin";

const schema = z.object({
  productId: z.string().uuid(),
  delta: z.coerce.number().int("Whole units only.").refine((n) => n !== 0, "Enter a change other than zero.").refine((n) => Math.abs(n) <= 10000, "That's a very large change."),
  reason: z.string().trim().min(2, "Give a short reason.").max(120),
});

export async function adjustStock(input: { productId: string; delta: string | number; reason: string }) {
  return run(async () => {
    const user = await requireStaffAction();
    const { productId, delta, reason } = parse(schema, input);
    const updated = await db.$transaction(async (tx) => {
      const res = await tx.product.updateMany({ where: { id: productId, stock: { gte: delta < 0 ? -delta : 0 } }, data: { stock: { increment: delta } } });
      if (!res.count) throw new ActionError("Stock can't go below zero.");
      await tx.stockMovement.create({ data: { productId, delta, reason, actorName: user.name } });
      return tx.product.findUniqueOrThrow({ where: { id: productId }, select: { stock: true, name: true } });
    });
    await audit(user, "stock.adjust", "product", productId, { delta, reason });
    refreshCatalog();
    revalidatePath("/admin/inventory");
    return { ok: true, message: `${updated.name}: now ${updated.stock} in stock.` } as const;
  });
}
