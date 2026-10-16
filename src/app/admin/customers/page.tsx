import Link from "next/link";
import { Body, Empty, PageHeader, td, th } from "@/components/admin/ui";
import { requireStaff } from "@/server/auth";
import { db, fromCents } from "@/server/db";
import { formatDate, formatPrice } from "@/lib/format";

export const metadata = { title: "Customers" };

/** Customers don't have accounts: they're grouped from orders by email. */
export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireStaff();
  const q = ((await searchParams).q ?? "").trim().slice(0, 100);
  const where = q
    ? { OR: [{ email: { contains: q, mode: "insensitive" as const } }, { firstName: { contains: q, mode: "insensitive" as const } }, { lastName: { contains: q, mode: "insensitive" as const } }, { phone: { contains: q } }] }
    : {};
  const groups = await db.order.groupBy({
    by: ["email"],
    where,
    _count: true,
    _max: { createdAt: true },
    orderBy: { _max: { createdAt: "desc" } },
    take: 200,
  });
  const [latest, spent] = await Promise.all([
    db.order.findMany({ where: { email: { in: groups.map((g) => g.email) } }, orderBy: { createdAt: "desc" }, distinct: ["email"], select: { email: true, firstName: true, lastName: true, phone: true, area: true } }),
    db.order.groupBy({ by: ["email"], where: { email: { in: groups.map((g) => g.email) }, status: { not: "CANCELLED" } }, _sum: { subtotalCents: true } }),
  ]);
  const info = new Map(latest.map((o) => [o.email, o]));
  const spend = new Map(spent.map((s) => [s.email, s._sum.subtotalCents ?? 0]));

  return (
    <>
      <PageHeader title="Customers" kicker={`${groups.length} ${groups.length === 1 ? "customer" : "customers"} from orders`}>
        <form className="mt-5 flex" action="/admin/customers">
          <label className="sr-only" htmlFor="q">
            Search customers
          </label>
          <input id="q" name="q" defaultValue={q} placeholder="Name, email or phone" className="field !min-h-9 w-64 !py-1.5 text-sm" />
          <button className="btn btn-primary !min-h-9 !px-3 text-xs">Search</button>
        </form>
      </PageHeader>
      <Body>
        {groups.length ? (
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr>
                  <th className={th}>Customer</th>
                  <th className={th}>Phone</th>
                  <th className={th}>Last order</th>
                  <th className={`${th} text-right`}>Orders</th>
                  <th className={`${th} text-right`}>Spent</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((g) => {
                  const c = info.get(g.email);
                  return (
                    <tr key={g.email} className="transition-colors hover:bg-paper-2 [&:last-child>td]:border-b-0">
                      <td className={td}>
                        <Link href={`/admin/customers/${encodeURIComponent(g.email)}`} className="font-semibold hover:underline">
                          {c ? `${c.firstName} ${c.lastName}` : g.email}
                        </Link>
                        <span className="block text-xs text-muted">{g.email}</span>
                      </td>
                      <td className={`${td} text-muted`}>
                        {c?.phone}
                        <span className="block text-xs">{c?.area}</span>
                      </td>
                      <td className={`${td} text-muted`}>{g._max.createdAt ? formatDate(g._max.createdAt.toISOString()) : "—"}</td>
                      <td className={`${td} text-right tabular-nums`}>{g._count}</td>
                      <td className={`${td} text-right tabular-nums`}>{formatPrice(fromCents(spend.get(g.email) ?? 0))}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty title={q ? "No customers match." : "No customers yet."}>Customers appear here once they place an order.</Empty>
        )}
      </Body>
    </>
  );
}
