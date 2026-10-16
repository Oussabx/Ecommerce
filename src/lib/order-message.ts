/** Plain-text order confirmation used for WhatsApp (automatic and the admin one-click button). */
export function orderConfirmationText(o: {
  ref: string;
  firstName: string;
  storeName: string;
  lines: { name: string; quantity: number; colorName?: string; configLabel?: string | null; unitPriceCents: number }[];
  subtotalCents: number;
  deliveryFeeCents: number | null;
  paymentMethodLabel: string;
  line1: string;
  city: string;
  area: string;
}) {
  const usd = (c: number) => `$${(c / 100).toLocaleString("en-US", { minimumFractionDigits: c % 100 ? 2 : 0 })}`;
  const items = o.lines.map((l) => `• ${l.quantity} × ${l.name}${[l.colorName, l.configLabel].filter(Boolean).length ? ` (${[l.colorName, l.configLabel].filter(Boolean).join(", ")})` : ""} — ${usd(l.unitPriceCents * l.quantity)}`).join("\n");
  const total = o.subtotalCents + (o.deliveryFeeCents ?? 0);
  return [
    `Hi ${o.firstName}, thank you for your order at ${o.storeName}! ✅`,
    ``,
    `Order number: ${o.ref}`,
    ``,
    items,
    ``,
    `Subtotal: ${usd(o.subtotalCents)}`,
    `Delivery: ${o.deliveryFeeCents === null ? "to be confirmed" : usd(o.deliveryFeeCents)}`,
    `Total: ${usd(total)} (${o.paymentMethodLabel.toLowerCase()})`,
    ``,
    `Delivery to: ${o.line1}, ${o.city}, ${o.area}`,
    ``,
    `We'll contact you shortly to confirm the delivery time.`,
  ].join("\n");
}
