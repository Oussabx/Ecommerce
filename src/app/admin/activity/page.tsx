import { Body, PageHeader, Pager, td, th } from "@/components/admin/ui";
import { requireStaff } from "@/server/auth";
import { db } from "@/server/db";

export const metadata = { title: "Activity log" };
const PER_PAGE = 50;

const describe = (a: { action: string; entity: string; entityId: string; detail: unknown }) => {
  const d = (a.detail ?? {}) as Record<string, unknown>;
  switch (a.action) {
    case "order.status":
      return `Order ${a.entityId}: ${d.from} → ${d.to}`;
    case "order.fee":
      return `Order ${a.entityId}: delivery fee ${d.fee === null ? "cleared" : `$${d.fee}`}`;
    case "product.create":
    case "product.update":
    case "product.delete":
      return `${a.action.split(".")[1]} product “${d.name}”`;
    case "stock.adjust":
      return `Stock ${Number(d.delta) > 0 ? "+" : ""}${d.delta} (${d.reason})`;
    case "team.role":
      return `${d.email}: ${String(d.from).toLowerCase()} → ${String(d.to).toLowerCase()}`;
    default:
      return `${a.action} · ${a.entity} ${a.entityId}`;
  }
};

export default async function ActivityPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireStaff({ admin: true });
  const page = Math.max(1, Number((await searchParams).page) || 1);
  const [rows, total] = await Promise.all([db.auditLog.findMany({ orderBy: { createdAt: "desc" }, skip: (page - 1) * PER_PAGE, take: PER_PAGE }), db.auditLog.count()]);
  return (
    <>
      <PageHeader title="Activity log" kicker="Every change made in the admin" />
      <Body>
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr>
                <th className={th}>When</th>
                <th className={th}>Who</th>
                <th className={th}>What</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className={`${td} whitespace-nowrap text-muted`}>{r.createdAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</td>
                  <td className={td}>{r.actorName}</td>
                  <td className={td}>{describe(r)}</td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td className={`${td} text-muted`} colSpan={3}>
                    Nothing yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pager page={page} pages={Math.ceil(total / PER_PAGE)} href={(p) => `/admin/activity?page=${p}`} />
      </Body>
    </>
  );
}
