import { after } from "next/server";
import { createOrder, OrderError, orderInclude } from "@/server/orders";
import { notifyOrderPlaced } from "@/server/notify";
import { db } from "@/server/db";
import { orderSchema } from "@/server/validation";
import { currentUser } from "@/server/auth";
import { orderAccessToken } from "@/server/crypto";
import { rateLimit } from "@/server/rate-limit";
import { fail, ok, parseBody, sameOrigin, noDatabase } from "@/server/http";

export async function POST(req: Request) {
  const offline = noDatabase();
  if (offline) return offline;
  if (!sameOrigin(req)) return fail("Forbidden.", 403);
  if (!(await rateLimit("orders", 10, 10 * 60_000))) return fail("Too many attempts. Please wait a few minutes and try again.", 429);
  const parsed = await parseBody(req, orderSchema);
  if ("response" in parsed) return parsed.response;
  try {
    const user = await currentUser();
    const order = await createOrder(parsed.data, user?.id ?? null);
    // Send the receipt email + WhatsApp after the response, once per order
    // (a retried submission returns the same order, which already has notification events).
    after(async () => {
      const full = await db.order.findUnique({ where: { id: order.id }, include: orderInclude });
      if (full && full.events.length <= 1) await notifyOrderPlaced(full);
    });
    return ok({ ref: order.ref, token: orderAccessToken(order.ref) }, 201);
  } catch (e) {
    if (e instanceof OrderError) return fail(e.message, 409, e.field ? { [e.field]: e.message } : undefined);
    console.error("[orders] failed to create order", e);
    return fail("We couldn't place your order. Nothing was charged — please try again.", 500);
  }
}
