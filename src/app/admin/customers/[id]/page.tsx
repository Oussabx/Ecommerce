import Link from "next/link";
import { notFound } from "next/navigation";
import { Body, PageHeader, Panel, StatusBadge, td, th } from "@/components/admin/ui";
import { requireStaff } from "@/server/auth";
import { db } from "@/server/db";
import { orderTotal } from "@/server/orders";
import { formatDate, formatPrice } from "@/lib/format";

export const metadata = { title: "Customer" };

export default async function CustomerPage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff();
  const { id } = await params;
  const user = /^[0-9a-f-]{36}$/.test(id) ? await db.user.findUnique({ where: { id }, include: { addresses: true } }) : null;
  if (!user) notFound();
  // Include guest orders placed with the same email.
  const orders = await db.order.findMany({ where: { OR: [{ userId: user.id }, { email: user.email }] }, orderBy: { createdAt: "desc" } });
  return (
    <>
      <PageHeader
        kicker={`Customer since ${formatDate(user.createdAt.toISOString())}`}
        title={user.name}
        actions={
          <Link href="/admin/customers" className="label text-muted hover:text-ink">
            ← All customers
          </Link>
        }
      />
      <Body className="grid gap-6 xl:grid-cols-3">
        <Panel title={`Orders (${orders.length})`} className="xl:col-span-2">
          {orders.length ? (
            <div className="-m-4 overflow-x-auto">
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
                    <tr key={o.id}>
                      <td className={td}>
                        <Link href={`/admin/orders/${o.ref}`} className="font-mono font-semibold hover:underline">
                          {o.ref}
                        </Link>
                        {!o.userId && <span className="label ml-2 text-muted">guest</span>}
                      </td>
                      <td className={`${td} text-muted`}>{formatDate(o.createdAt.toISOString())}</td>
                      <td className={td}>
                        <StatusBadge status={o.status} />
                      </td>
                      <td className={`${td} text-right font-mono`}>{formatPrice(orderTotal(o))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted">No orders yet.</p>
          )}
        </Panel>
        <div className="space-y-6">
          <Panel title="Contact">
            <p>
              <a href={`mailto:${user.email}`} className="underline underline-offset-4">
                {user.email}
              </a>
            </p>
            <p className="mt-1">{user.phone || <span className="text-muted">No phone saved</span>}</p>
            <p className="label mt-3 text-muted">Role: {user.role.toLowerCase()}</p>
          </Panel>
          <Panel title="Saved addresses">
            {user.addresses.length ? (
              <ul className="space-y-3 text-sm">
                {user.addresses.map((a) => (
                  <li key={a.id}>
                    <p className="label">{a.label}</p>
                    <p>
                      {a.line1}
                      {a.line2 && `, ${a.line2}`}, {a.city}, {a.area}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">None.</p>
            )}
          </Panel>
        </div>
      </Body>
    </>
  );
}
