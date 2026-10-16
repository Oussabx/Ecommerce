import Link from "next/link";
import { Body, Empty, PageHeader, Pager, td, th } from "@/components/admin/ui";
import { requireStaff } from "@/server/auth";
import { db, fromCents } from "@/server/db";
import { formatDate, formatPrice } from "@/lib/format";

export const metadata = { title: "Customers" };
const PER_PAGE = 30;

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  await requireStaff();
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 100);
  const page = Math.max(1, Number(sp.page) || 1);
  const where = q ? { OR: [{ name: { contains: q, mode: "insensitive" as const } }, { email: { contains: q, mode: "insensitive" as const } }, { phone: { contains: q } }] } : {};
  const [users, total, guestCount] = await Promise.all([
    db.user.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PER_PAGE, take: PER_PAGE, include: { orders: { where: { status: { not: "CANCELLED" } }, select: { subtotalCents: true } } } }),
    db.user.count({ where }),
    db.order.findMany({ where: { userId: null }, distinct: ["email"], select: { email: true } }).then((r) => r.length),
  ]);
  return (
    <>
      <PageHeader title="Customers" kicker={`${total} accounts · ${guestCount} guest checkout ${guestCount === 1 ? "email" : "emails"}`}>
        <form className="mt-5 flex" action="/admin/customers">
          <label className="sr-only" htmlFor="q">
            Search customers
          </label>
          <input id="q" name="q" defaultValue={q} placeholder="Name, email or phone" className="field !min-h-9 w-64 !py-1.5 text-sm" />
          <button className="btn btn-primary !min-h-9 !px-3 text-xs">Search</button>
        </form>
      </PageHeader>
      <Body>
        {users.length ? (
          <div className="overflow-x-auto border border-rule bg-[#fbfaf7]">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr>
                  <th className={th}>Customer</th>
                  <th className={th}>Phone</th>
                  <th className={th}>Joined</th>
                  <th className={`${th} text-right`}>Orders</th>
                  <th className={`${th} text-right`}>Spent</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-paper-2">
                    <td className={td}>
                      <Link href={`/admin/customers/${u.id}`} className="font-semibold hover:underline">
                        {u.name}
                      </Link>
                      {u.role !== "CUSTOMER" && <span className="label ml-2 bg-ink px-1.5 text-paper">{u.role.toLowerCase()}</span>}
                      <span className="block text-xs text-muted">{u.email}</span>
                    </td>
                    <td className={`${td} text-muted`}>{u.phone || "—"}</td>
                    <td className={`${td} text-muted`}>{formatDate(u.createdAt.toISOString())}</td>
                    <td className={`${td} text-right font-mono`}>{u.orders.length}</td>
                    <td className={`${td} text-right font-mono`}>{formatPrice(fromCents(u.orders.reduce((s, o) => s + o.subtotalCents, 0)))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty title="No customer accounts found." />
        )}
        <Pager page={page} pages={Math.ceil(total / PER_PAGE)} href={(p) => `/admin/customers?${new URLSearchParams({ ...(q && { q }), page: String(p) })}`} />
        <p className="mt-4 text-xs text-muted">Guests who check out without an account appear on their orders; search orders by email to see their history.</p>
      </Body>
    </>
  );
}
