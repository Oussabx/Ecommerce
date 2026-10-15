import { createOrder, OrderError } from "@/server/orders";
import { orderSchema } from "@/server/validation";
import { currentUser } from "@/server/auth";
import { orderAccessToken } from "@/server/crypto";
import { rateLimit } from "@/server/rate-limit";
import { fail, ok, parseBody, sameOrigin } from "@/server/http";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail("Forbidden.", 403);
  if (!(await rateLimit("orders", 10, 10 * 60_000))) return fail("Too many attempts. Please wait a few minutes and try again.", 429);
  const parsed = await parseBody(req, orderSchema);
  if ("response" in parsed) return parsed.response;
  try {
    const user = await currentUser();
    const order = await createOrder(parsed.data, user?.id ?? null);
    return ok({ ref: order.ref, token: orderAccessToken(order.ref) }, 201);
  } catch (e) {
    if (e instanceof OrderError) return fail(e.message, 409, e.field ? { [e.field]: e.message } : undefined);
    console.error("[orders] failed to create order", e);
    return fail("We couldn't place your order. Nothing was charged — please try again.", 500);
  }
}
