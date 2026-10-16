import { currentUser, isStaff } from "@/server/auth";
import { db } from "@/server/db";

export const dynamic = "force-dynamic";

const csv = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

export async function GET() {
  const user = await currentUser();
  if (!isStaff(user)) return new Response("Forbidden", { status: 403 });
  const rows = await db.subscriber.findMany({ orderBy: { createdAt: "asc" } });
  const body = ["email,subscribed_at", ...rows.map((r) => `${csv(r.email)},${r.createdAt.toISOString()}`)].join("\n");
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="osa-subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
