import { notFound } from "next/navigation";
import { requireStaff } from "@/server/auth";
import { fromCents } from "@/server/db";
import { getOrder, orderTotal } from "@/server/orders";
import { getSettings } from "@/server/settings";
import { formatPrice } from "@/lib/format";
import { Logo } from "@/components/layout/Logo";
import { PrintButton } from "@/components/admin/PrintButton";

export const metadata = { title: "Delivery slip" };

export default async function SlipPage({ params }: { params: Promise<{ ref: string }> }) {
  await requireStaff();
  const order = await getOrder((await params).ref);
  if (!order) notFound();
  const { store } = await getSettings();
  return (
    <div className="mx-auto max-w-2xl bg-white p-10 text-ink print:p-0">
      <div className="flex items-start justify-between border-b-2 border-ink pb-4">
        <div>
          <Logo className="w-32" />
          {store.contact.phone && <p className="mt-2 text-xs">{store.contact.phone}</p>}
        </div>
        <div className="text-right">
          <p className="label">Delivery slip</p>
          <p className="display-wide text-2xl">{order.ref}</p>
          <p className="text-xs">{order.createdAt.toLocaleDateString("en-GB", { dateStyle: "medium" })}</p>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-6 text-sm">
        <div>
          <p className="label">Deliver to</p>
          <p className="mt-1 font-semibold">
            {order.firstName} {order.lastName}
          </p>
          <p>{order.phone}</p>
          <p className="mt-1">
            {order.line1}
            {order.line2 && <>, {order.line2}</>}
            <br />
            {order.city}, {order.area}
          </p>
          {order.notes && <p className="mt-1 italic">Note: {order.notes}</p>}
        </div>
        <div>
          <p className="label">Payment</p>
          <p className="mt-1 font-semibold">{order.paymentMethodLabel}</p>
          <p className="label mt-3">Amount to collect</p>
          <p className="display-wide text-3xl">{formatPrice(orderTotal(order))}</p>
          {order.deliveryFeeCents === null && <p className="text-xs">Delivery fee not yet recorded — add it to the amount.</p>}
        </div>
      </div>
      <table className="mt-8 w-full text-sm">
        <thead>
          <tr className="border-b border-ink text-left">
            <th className="label py-1 font-normal">Item</th>
            <th className="label py-1 text-right font-normal">Qty</th>
            <th className="label py-1 text-right font-normal">Price</th>
          </tr>
        </thead>
        <tbody>
          {order.lines.map((l) => (
            <tr key={l.id} className="border-b border-rule">
              <td className="py-2">
                {l.brand} {l.name}
                <span className="block text-xs text-muted">{[l.colorName, l.configLabel].filter(Boolean).join(" · ")}</span>
              </td>
              <td className="py-2 text-right">{l.quantity}</td>
              <td className="py-2 text-right">{formatPrice(fromCents(l.unitPriceCents * l.quantity))}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-10 grid grid-cols-2 gap-10 text-xs">
        <div className="border-t border-ink pt-1">Received by (name &amp; signature)</div>
        <div className="border-t border-ink pt-1">Date</div>
      </div>
      <PrintButton />
    </div>
  );
}
