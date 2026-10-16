import Link from "next/link";
import { notFound } from "next/navigation";
import { Body, PageHeader, Panel, StatusBadge, td, th } from "@/components/admin/ui";
import { requireStaff } from "@/server/auth";
import { db, fromCents } from "@/server/db";
import { orderTotal } from "@/server/orders";
import { formatDate, formatPrice } from "@/lib/format";

export const metadata = { title: "Customer" };

export default async function CustomerPage({ params }: { params: Promise<{ email: string }> }) {
  await requireStaff();
  const email = decodeURIComponent((await params).email).toLowerCase();
  const orders = await db.order.findMany({ where: { email }, orderBy: { createdAt: "desc" } });
  if (!orders.length) notFound();
  const last = orders[0];
  const spent = orders.filter((o) => o.status !== "CANCELLED").reduce((s, o) => s + o.subtotalCents, 0);
  const waNumber = last.phone.replace(/\D/g, "").replace(/^0+/, "");
  return (
    <>
      <PageHeader
        kicker={`First order ${formatDate(orders[orders.length - 1].createdAt.toISOString())} · ${formatPrice(fromCents(spent))} spent`}
        title={`${last.firstName} ${last.lastName}`}
        actions={
          <Link href="/admin/customers" className="text-sm font-medium text-accent hover:underline">
            ← All customers
          </Link>
        }
      />
      <Body className="grid gap-6 xl:grid-cols-3">
        <Panel title={`Orders (${orders.length})`} className="xl:col-span-2">
          <div className="-mx-5 -mb-5 overflow-x-auto md:-mx-6">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className={th}>Order</th>
                  <th className={th}>Date</th>
                  <th className={th}>Status</th>
                  <th className={`${th} text-right`}>Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="transition-colors hover:bg-paper-3 [&:last-child>td]:border-b-0">
                    <td className={td}>
                      <Link href={`/admin/orders/${o.ref}`} className="font-semibold tabular-nums hover:text-accent">
                        {o.ref}
                      </Link>
                    </td>
                    <td className={`${td} text-muted`}>{formatDate(o.createdAt.toISOString())}</td>
                    <td className={td}>
                      <StatusBadge status={o.status} />
                    </td>
                    <td className={`${td} text-right tabular-nums`}>{formatPrice(orderTotal(o))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <div className="space-y-6">
          <Panel title="Contact">
            <p>
              <a href={`mailto:${email}`} className="text-link">
                {email}
              </a>
            </p>
            <p className="mt-1">
              <a href={`tel:${last.phone.replace(/\s/g, "")}`} className="text-link">
                {last.phone}
              </a>
              {waNumber && (
                <>
                  {" · "}
                  <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" className="text-link">
                    WhatsApp
                  </a>
                </>
              )}
            </p>
          </Panel>
          <Panel title="Last delivery address">
            <p className="text-sm">
              {last.line1}
              {last.line2 && `, ${last.line2}`}
              <br />
              {last.city}, {last.area}
            </p>
          </Panel>
        </div>
      </Body>
    </>
  );
}
