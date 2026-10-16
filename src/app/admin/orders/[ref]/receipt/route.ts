import { currentUser, isStaff } from "@/server/auth";
import { getOrder } from "@/server/orders";
import { receiptPreview } from "@/server/notify";

export const dynamic = "force-dynamic";

/** Staff-only preview of the receipt email for an order. */
export async function GET(_req: Request, { params }: { params: Promise<{ ref: string }> }) {
  if (!isStaff(await currentUser())) return new Response("Forbidden", { status: 403 });
  const order = await getOrder((await params).ref);
  if (!order) return new Response("Not found", { status: 404 });
  return new Response(await receiptPreview(order), { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}
