import Link from "next/link";
import type { OrderStatus, Prisma } from "@prisma/client";
import { Body, Empty, PageHeader, Pager, StatusBadge, statusShort, tableWrap, td, th, tr } from "@/components/admin/ui";
import { requireStaff } from "@/server/auth";
import { db } from "@/server/db";
import { orderTotal } from "@/server/orders";
import { cn, formatPrice } from "@/lib/format";

export const metadata = { title: "Orders" };
const PER_PAGE = 25;
const STATUSES: OrderStatus[] = ["RECEIVED", "CONFIRMED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; page?: string }> }) {
  await requireStaff();
  const sp = await searchParams;
  const status = STATUSES.includes(sp.status as OrderStatus) ? (sp.status as OrderStatus) : undefined;
  const q = (sp.q ?? "").trim().slice(0, 100);
  const page = Math.max(1, Number(sp.page) || 1);

  const where: Prisma.OrderWhereInput = {
    ...(status && { status }),
    ...(q && {
      OR: [
        { ref: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { phone: { contains: q } },
        { firstName: { contains: q, mode: "insensitive" } },
        { lastName: { contains: q, mode: "insensitive" } },
      ],
    }),
  };
  const [orders, total, counts] = await Promise.all([
    db.order.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PER_PAGE, take: PER_PAGE, include: { lines: { select: { quantity: true, name: true } } } }),
    db.order.count({ where }),
    db.order.groupBy({ by: ["status"], _count: true }),
  ]);
  const countFor = (s: OrderStatus) => counts.find((c) => c.status === s)?._count ?? 0;
  const href = (p: Record<string, string | undefined>) => {
    const u = new URLSearchParams();
    const merged = { status, q: q || undefined, ...p };
    for (const [k, v] of Object.entries(merged)) if (v) u.set(k, v);
    return `/admin/orders${u.size ? `?${u}` : ""}`;
  };

  return (
    <>
      <PageHeader title="Orders" kicker={`${total} ${total === 1 ? "order" : "orders"}`}>
        <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <nav className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0" aria-label="Filter by status">
            <Link href={href({ status: undefined, page: undefined })} aria-current={!status ? "page" : undefined} className={cn("chip shrink-0", !status ? "is-active" : "bg-paper shadow-[var(--shadow-card)] hover:bg-paper-3")}>
              All
            </Link>
            {STATUSES.map((s) => (
              <Link key={s} href={href({ status: s, page: undefined })} aria-current={status === s ? "page" : undefined} className={cn("chip shrink-0 gap-2", status === s ? "is-active" : "bg-paper shadow-[var(--shadow-card)] hover:bg-paper-3")}>
                {statusShort[s]} <span className="tabular-nums opacity-60">{countFor(s)}</span>
              </Link>
            ))}
          </nav>
          <form className="flex gap-2" action="/admin/orders">
            {status && <input type="hidden" name="status" value={status} />}
            <label htmlFor="q" className="sr-only">
              Search orders
            </label>
            <input id="q" name="q" defaultValue={q} placeholder="Ref, name, email or phone" className="field !min-h-10 w-full !rounded-full !py-1.5 text-sm sm:w-64" />
            <button className="btn btn-primary !min-h-10 !px-4 text-sm">Search</button>
          </form>
        </div>
      </PageHeader>
      <Body>
        {orders.length ? (
          <div className={tableWrap}>
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr>
                  <th className={th}>Order</th>
                  <th className={th}>Placed</th>
                  <th className={th}>Customer</th>
                  <th className={th}>Items</th>
                  <th className={th}>Status</th>
                  <th className={`${th} text-right`}>Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className={tr}>
                    <td className={td}>
                      <Link href={`/admin/orders/${o.ref}`} className="font-semibold hover:text-accent">
                        {o.ref}
                      </Link>
                    </td>
                    <td className={`${td} whitespace-nowrap text-muted`}>{o.createdAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</td>
                    <td className={td}>
                      {o.firstName} {o.lastName}
                      <span className="block text-xs text-muted">
                        {o.phone} · {o.area}
                      </span>
                    </td>
                    <td className={`${td} max-w-[240px]`}>
                      <span className="line-clamp-1">{o.lines.map((l) => `${l.quantity}× ${l.name}`).join(", ")}</span>
                    </td>
                    <td className={td}>
                      <StatusBadge status={o.status} />
                    </td>
                    <td className={`${td} text-right font-medium tabular-nums`}>
                      {formatPrice(orderTotal(o))}
                      {o.deliveryFeeCents === null && o.status !== "CANCELLED" && <span className="block text-[10px] text-muted">+ delivery</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty title={q || status ? "No orders match." : "No orders yet."}>{q || status ? <Link href="/admin/orders" className="text-link">Clear filters</Link> : "New orders from the website appear here."}</Empty>
        )}
        <Pager page={page} pages={Math.ceil(total / PER_PAGE)} href={(p) => href({ page: String(p) })} />
      </Body>
    </>
  );
}
