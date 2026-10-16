import Link from "next/link";
import Image from "next/image";
import { Body, PageHeader, Panel, StatusBadge, td, th, tr } from "@/components/admin/ui";
import { OrdersChart } from "@/components/admin/OrdersChart";
import { requireStaff } from "@/server/auth";
import { db, fromCents } from "@/server/db";
import { orderTotal } from "@/server/orders";
import { LOW_STOCK_THRESHOLD } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";

export const metadata = { title: "Overview" };

const DAY = 86_400_000;
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export default async function AdminOverview() {
  const user = await requireStaff();
  const today = startOfDay(new Date());
  const since14 = new Date(today.getTime() - 13 * DAY);
  const since30 = new Date(today.getTime() - 29 * DAY);

  const [toConfirm, outForDelivery, todayCount, recent, lowStock, unread, last14, revenue30] = await Promise.all([
    db.order.count({ where: { status: "RECEIVED" } }),
    db.order.count({ where: { status: "OUT_FOR_DELIVERY" } }),
    db.order.count({ where: { createdAt: { gte: today } } }),
    db.order.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { lines: { select: { quantity: true } } } }),
    db.product.findMany({ where: { stock: { lte: LOW_STOCK_THRESHOLD } }, orderBy: { stock: "asc" }, take: 8, include: { images: { take: 1, orderBy: { position: "asc" } } } }),
    db.message.count({ where: { handled: false } }),
    db.order.findMany({ where: { createdAt: { gte: since14 }, status: { not: "CANCELLED" } }, select: { createdAt: true, subtotalCents: true } }),
    db.order.aggregate({ where: { createdAt: { gte: since30 }, status: { in: ["CONFIRMED", "OUT_FOR_DELIVERY", "DELIVERED"] } }, _sum: { subtotalCents: true }, _count: true }),
  ]);

  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(since14.getTime() + i * DAY);
    const next = d.getTime() + DAY;
    const rows = last14.filter((o) => o.createdAt.getTime() >= d.getTime() && o.createdAt.getTime() < next);
    return {
      date: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      orders: rows.length,
      revenue: fromCents(rows.reduce((s, o) => s + o.subtotalCents, 0)),
    };
  });

  const tiles = [
    { label: "To confirm by phone", value: toConfirm, href: "/admin/orders?status=RECEIVED", hot: toConfirm > 0 },
    { label: "Orders today", value: todayCount, href: "/admin/orders" },
    { label: "Out for delivery", value: outForDelivery, href: "/admin/orders?status=OUT_FOR_DELIVERY" },
    { label: "Confirmed sales · 30 days", value: formatPrice(fromCents(revenue30._sum.subtotalCents ?? 0)), sub: `${revenue30._count} orders`, href: "/admin/orders" },
  ];

  return (
    <>
      <PageHeader title={`Hello, ${user.name.split(" ")[0]}.`} kicker={new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })} />
      <Body className="space-y-6">
        <ul className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          {tiles.map((t) => (
            <li key={t.label}>
              <Link href={t.href} className="card block h-full p-5 transition-shadow hover:shadow-[var(--shadow-lift)] md:p-6">
                <p className="flex items-center gap-2 text-[13px] font-medium text-muted">
                  {t.hot && <span className="size-2 shrink-0 rounded-full bg-warn" aria-hidden />}
                  {t.label}
                </p>
                <p className={`mt-2 text-[1.75rem] font-semibold tabular-nums tracking-[-0.03em] md:text-4xl ${t.hot ? "text-warn" : ""}`}>{t.value}</p>
                {t.sub && <p className="mt-1 text-[13px] text-muted">{t.sub}</p>}
              </Link>
            </li>
          ))}
        </ul>

        <div className="grid gap-6 xl:grid-cols-3">
          <Panel title="Orders · last 14 days" className="xl:col-span-2">
            <OrdersChart days={days} />
            <p className="mt-2 text-xs text-muted">Excludes cancelled orders. Value is the product subtotal before delivery.</p>
          </Panel>
          <Panel title="Needs attention">
            <ul className="divide-y divide-rule text-sm">
              <li className="flex justify-between py-2.5">
                <Link href="/admin/orders?status=RECEIVED" className="hover:underline">
                  Orders waiting for a call
                </Link>
                <span className="font-semibold tabular-nums">{toConfirm}</span>
              </li>
              <li className="flex justify-between py-2.5">
                <Link href="/admin/messages" className="hover:underline">
                  Unread messages
                </Link>
                <span className="font-semibold tabular-nums">{unread}</span>
              </li>
              <li className="flex justify-between py-2.5">
                <Link href="/admin/inventory?filter=low" className="hover:underline">
                  Low or out of stock
                </Link>
                <span className="font-semibold tabular-nums">{lowStock.length}</span>
              </li>
            </ul>
          </Panel>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <Panel title="Recent orders" className="xl:col-span-2" actions={<Link href="/admin/orders" className="text-link text-sm">All orders →</Link>}>
            {recent.length ? (
              <div className="-mx-5 -mb-5 overflow-x-auto md:-mx-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className={th}>Order</th>
                      <th className={th}>Customer</th>
                      <th className={th}>Items</th>
                      <th className={th}>Status</th>
                      <th className={`${th} text-right`}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((o) => (
                      <tr key={o.id} className={tr}>
                        <td className={td}>
                          <Link href={`/admin/orders/${o.ref}`} className="font-semibold hover:text-accent">
                            {o.ref}
                          </Link>
                          <span className="block text-xs text-muted">{o.createdAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</span>
                        </td>
                        <td className={td}>
                          {o.firstName} {o.lastName}
                          <span className="block text-xs text-muted">{o.area}</span>
                        </td>
                        <td className={td}>{o.lines.reduce((s, l) => s + l.quantity, 0)}</td>
                        <td className={td}>
                          <StatusBadge status={o.status} />
                        </td>
                        <td className={`${td} text-right font-medium tabular-nums`}>{formatPrice(orderTotal(o))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted">No orders yet. They&apos;ll appear here as soon as customers check out.</p>
            )}
          </Panel>
          <Panel title="Low stock" actions={<Link href="/admin/inventory" className="text-link text-sm">Inventory →</Link>}>
            {lowStock.length ? (
              <ul className="divide-y divide-rule">
                {lowStock.map((p) => (
                  <li key={p.id} className="flex items-center gap-3 py-2.5">
                    <span className="relative size-10 shrink-0 overflow-hidden rounded-xl bg-paper-2">{p.images[0] && <Image src={p.images[0].url} alt="" fill sizes="40px" className="object-contain p-0.5" />}</span>
                    <Link href={`/admin/products/${p.id}`} className="min-w-0 flex-1 truncate text-sm hover:text-accent">
                      {p.name}
                    </Link>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${p.stock === 0 ? "bg-[#fdecee] text-danger" : "bg-[#fff4e5] text-warn"}`}>{p.stock}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">Everything is above {LOW_STOCK_THRESHOLD} units.</p>
            )}
          </Panel>
        </div>
      </Body>
    </>
  );
}
