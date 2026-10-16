import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Body, PageHeader, Panel, StatusBadge, td, th } from "@/components/admin/ui";
import { OrderActions } from "@/components/admin/OrderActions";
import { requireStaff } from "@/server/auth";
import { db, fromCents } from "@/server/db";
import { getOrder, orderTotal, statusLabel } from "@/server/orders";
import { formatPrice } from "@/lib/format";

export const metadata = { title: "Order" };

export default async function AdminOrderPage({ params }: { params: Promise<{ ref: string }> }) {
  await requireStaff();
  const { ref } = await params;
  const order = await getOrder(ref);
  if (!order) notFound();
  const previous = await db.order.count({ where: { email: order.email, id: { not: order.id } } });
  const waNumber = order.phone.replace(/\D/g, "").replace(/^0+/, "");

  return (
    <>
      <PageHeader
        kicker={`Placed ${order.createdAt.toLocaleString("en-GB", { dateStyle: "full", timeStyle: "short" })}`}
        title={order.ref}
        actions={
          <>
            <StatusBadge status={order.status} />
            <Link href={`/admin/orders/${order.ref}/slip`} target="_blank" className="btn btn-outline !min-h-10 text-xs">
              Print slip
            </Link>
          </>
        }
      >
        <Link href="/admin/orders" className="label mt-3 inline-block text-muted hover:text-ink">
          ← All orders
        </Link>
      </PageHeader>
      <Body className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Panel title="Items">
            <div className="-m-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className={th}>Product</th>
                    <th className={th}>Option</th>
                    <th className={`${th} text-right`}>Qty</th>
                    <th className={`${th} text-right`}>Unit</th>
                    <th className={`${th} text-right`}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.lines.map((l) => (
                    <tr key={l.id}>
                      <td className={td}>
                        <span className="flex items-center gap-3">
                          <span className="relative size-12 shrink-0 bg-paper-2">
                            <Image src={l.image} alt="" fill sizes="48px" className="object-contain p-1" />
                          </span>
                          <span>
                            <span className="label block text-muted">{l.brand}</span>
                            {l.productId ? (
                              <Link href={`/admin/products/${l.productId}`} className="font-semibold hover:underline">
                                {l.name}
                              </Link>
                            ) : (
                              <span className="font-semibold">{l.name}</span>
                            )}
                          </span>
                        </span>
                      </td>
                      <td className={`${td} text-muted`}>{[l.colorName, l.configLabel].filter(Boolean).join(" · ")}</td>
                      <td className={`${td} text-right font-mono`}>{l.quantity}</td>
                      <td className={`${td} text-right font-mono`}>{formatPrice(fromCents(l.unitPriceCents))}</td>
                      <td className={`${td} text-right font-mono`}>{formatPrice(fromCents(l.unitPriceCents * l.quantity))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <dl className="ml-auto mt-4 max-w-xs space-y-1.5 text-sm">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd className="font-mono">{formatPrice(fromCents(order.subtotalCents))}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Delivery</dt>
                <dd className="font-mono">{order.deliveryFeeCents === null ? <span className="text-warn">To confirm</span> : formatPrice(fromCents(order.deliveryFeeCents))}</dd>
              </div>
              <div className="flex justify-between border-t border-ink pt-1.5 font-semibold">
                <dt>Total</dt>
                <dd className="font-mono">{formatPrice(orderTotal(order))}</dd>
              </div>
              <div className="flex justify-between text-muted">
                <dt>Payment</dt>
                <dd>{order.paymentMethodLabel}</dd>
              </div>
            </dl>
          </Panel>

          <Panel title="Timeline">
            <ol className="relative space-y-4 border-l border-rule pl-5">
              {[...order.events].reverse().map((e) => (
                <li key={e.id} className="relative">
                  <span className={`absolute -left-[25px] top-1 size-2.5 ${e.type === "status" ? "bg-ink" : e.type === "note" ? "bg-lime ring-1 ring-ink" : "bg-cobalt"}`} aria-hidden />
                  <p className="text-sm">
                    {e.type === "status" && e.toStatus ? <strong>{statusLabel[e.toStatus]}</strong> : null}
                    {e.type === "status" && e.message !== statusLabel[e.toStatus ?? "RECEIVED"] ? <> — {e.message}</> : e.type !== "status" ? e.message : null}
                  </p>
                  <p className="label mt-0.5 text-muted">
                    {e.createdAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })} · {e.actorName ?? "System"}
                  </p>
                </li>
              ))}
            </ol>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Actions">
            <OrderActions orderRef={order.ref} status={order.status} fee={order.deliveryFeeCents === null ? null : fromCents(order.deliveryFeeCents)} />
          </Panel>
          <Panel title="Customer">
            <p className="font-semibold">
              {order.firstName} {order.lastName}
            </p>
            <p className="mt-1 text-sm">
              <a href={`mailto:${order.email}`} className="underline underline-offset-4">
                {order.email}
              </a>
            </p>
            <p className="text-sm">
              <a href={`tel:${order.phone.replace(/\s/g, "")}`} className="underline underline-offset-4">
                {order.phone}
              </a>
              {waNumber && (
                <>
                  {" · "}
                  <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                    WhatsApp
                  </a>
                </>
              )}
            </p>
            <p className="label mt-3 text-muted">
              {order.userId ? "Has an account" : "Guest checkout"} · {previous} previous {previous === 1 ? "order" : "orders"}
            </p>
          </Panel>
          <Panel title="Deliver to">
            <address className="text-sm not-italic leading-relaxed">
              {order.line1}
              {order.line2 && (
                <>
                  <br />
                  {order.line2}
                </>
              )}
              <br />
              {order.city}, {order.area}
            </address>
            {order.notes && <p className="mt-2 border-l-2 border-lime pl-2 text-sm">“{order.notes}”</p>}
            <p className="label mt-3 text-muted">{order.deliveryMethodLabel}</p>
          </Panel>
        </div>
      </Body>
    </>
  );
}
