import Link from "next/link";
import { Body, PageHeader, Panel, td, th } from "@/components/admin/ui";
import { StockAdjuster } from "@/components/admin/StockAdjuster";
import { requireStaff } from "@/server/auth";
import { db } from "@/server/db";
import { LOW_STOCK_THRESHOLD } from "@/lib/catalog";
import { cn } from "@/lib/format";

export const metadata = { title: "Inventory" };

export default async function InventoryPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  await requireStaff();
  const { filter } = await searchParams;
  const [products, movements, reserved] = await Promise.all([
    db.product.findMany({
      where: filter === "low" ? { stock: { lte: LOW_STOCK_THRESHOLD } } : {},
      orderBy: [{ stock: "asc" }, { name: "asc" }],
      select: { id: true, name: true, brand: true, stock: true, published: true, colors: { where: { soldOut: true }, select: { name: true } } },
    }),
    db.stockMovement.findMany({ orderBy: { createdAt: "desc" }, take: 30, include: { product: { select: { name: true, id: true } } } }),
    // Units in orders not yet delivered (already deducted from stock).
    db.orderLine.groupBy({ by: ["productId"], where: { order: { status: { in: ["RECEIVED", "CONFIRMED", "OUT_FOR_DELIVERY"] } } }, _sum: { quantity: true } }),
  ]);
  const reservedFor = (id: string) => reserved.find((r) => r.productId === id)?._sum.quantity ?? 0;

  return (
    <>
      <PageHeader title="Inventory" kicker="Stock is deducted when an order is placed and returned if it is cancelled.">
        <nav className="mt-4 flex gap-1">
          <Link href="/admin/inventory" className={cn("label inline-flex h-9 items-center border px-3", !filter ? "border-rule bg-ink text-paper" : "border-rule-strong")}>
            All products
          </Link>
          <Link href="/admin/inventory?filter=low" className={cn("label inline-flex h-9 items-center border px-3", filter === "low" ? "border-rule bg-ink text-paper" : "border-rule-strong")}>
            Low &amp; out of stock
          </Link>
        </nav>
      </PageHeader>
      <Body className="grid gap-6 2xl:grid-cols-3">
        <div className="overflow-x-auto border border-rule bg-[#fbfaf7] 2xl:col-span-2">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr>
                <th className={th}>Product</th>
                <th className={`${th} text-right`}>In stock</th>
                <th className={`${th} text-right`}>In open orders</th>
                <th className={th}>Adjust</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td className={td}>
                    <Link href={`/admin/products/${p.id}`} className="font-semibold hover:underline">
                      {p.name}
                    </Link>
                    <span className="block text-xs text-muted">
                      {p.brand}
                      {!p.published && " · hidden"}
                      {p.colors.length > 0 && ` · sold out: ${p.colors.map((c) => c.name).join(", ")}`}
                    </span>
                  </td>
                  <td className={cn(td, "text-right tabular-nums text-base", p.stock === 0 ? "text-danger" : p.stock <= LOW_STOCK_THRESHOLD && "text-warn")}>{p.stock}</td>
                  <td className={`${td} text-right tabular-nums text-muted`}>{reservedFor(p.id)}</td>
                  <td className={td}>
                    <StockAdjuster productId={p.id} name={p.name} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Panel title="Recent stock movements">
          <ul className="divide-y divide-rule text-sm">
            {movements.map((m) => (
              <li key={m.id} className="flex gap-3 py-2">
                <span className={cn("w-12 shrink-0 text-right tabular-nums", m.delta > 0 ? "text-ok" : "text-danger")}>{m.delta > 0 ? `+${m.delta}` : m.delta}</span>
                <span className="min-w-0 flex-1">
                  <Link href={`/admin/products/${m.product.id}`} className="block truncate font-medium hover:underline">
                    {m.product.name}
                  </Link>
                  <span className="text-xs text-muted">
                    {m.reason}
                    {m.orderRef && (
                      <>
                        {" · "}
                        <Link href={`/admin/orders/${m.orderRef}`} className="underline">
                          {m.orderRef}
                        </Link>
                      </>
                    )}
                    {" · "}
                    {m.actorName ?? "Website"} · {m.createdAt.toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" })}
                  </span>
                </span>
              </li>
            ))}
            {!movements.length && <li className="py-2 text-muted">No movements yet.</li>}
          </ul>
        </Panel>
      </Body>
    </>
  );
}
