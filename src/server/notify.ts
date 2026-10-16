import "server-only";
import { db } from "./db";
import { emailConfigured, sendEmail } from "./email";
import { getSettings } from "./settings";
import { orderAccessToken } from "./crypto";
import { siteUrl } from "@/config/store";
import { toWhatsAppNumber } from "@/lib/phone";
import { orderConfirmationText } from "@/lib/order-message";
import type { OrderWithLines } from "./orders";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const usd = (c: number) => `$${(c / 100).toLocaleString("en-US", { minimumFractionDigits: c % 100 ? 2 : 0 })}`;
const abs = (src: string) => (src.startsWith("http") ? src : `${siteUrl}${src}`);

/** WhatsApp Cloud API (Meta) — enabled when these are set. */
export const whatsappConfigured = Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);

export function receiptHtml(o: OrderWithLines, storeName: string, contactLine: string) {
  const link = `${siteUrl}/order/${o.ref}?t=${orderAccessToken(o.ref)}`;
  const rows = o.lines
    .map(
      (l) => `<tr>
        <td style="padding:12px 0;border-bottom:1px solid #d6d2c7;width:64px"><img src="${esc(abs(l.image))}" width="56" height="56" alt="" style="display:block;background:#ece9e1;border-radius:6px;object-fit:contain"></td>
        <td style="padding:12px;border-bottom:1px solid #d6d2c7;font-size:14px;color:#171816"><strong>${esc(l.name)}</strong><br><span style="color:#64655f">${esc([l.brand, l.colorName, l.configLabel].filter(Boolean).join(" · "))} · Qty ${l.quantity}</span></td>
        <td style="padding:12px 0;border-bottom:1px solid #d6d2c7;text-align:right;font-size:14px;white-space:nowrap">${usd(l.unitPriceCents * l.quantity)}</td>
      </tr>`,
    )
    .join("");
  const total = o.subtotalCents + (o.deliveryFeeCents ?? 0);
  return `<!doctype html><html><body style="margin:0;background:#f5f3ee;font-family:Helvetica,Arial,sans-serif;color:#171816">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ee;padding:24px 12px"><tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #171816">
    <tr><td style="background:#171816;padding:20px 24px;color:#f5f3ee;font-size:18px;font-weight:800;letter-spacing:2px">${esc(storeName.toUpperCase())}</td></tr>
    <tr><td style="background:#d5ff45;padding:24px">
      <div style="font-size:13px">Order received ✓</div>
      <div style="font-size:28px;font-weight:800;margin-top:6px">Thank you, ${esc(o.firstName)}.</div>
      <div style="font-size:14px;margin-top:10px">Order number <strong>${esc(o.ref)}</strong> · ${o.createdAt.toLocaleDateString("en-GB", { dateStyle: "medium" })}</div>
    </td></tr>
    <tr><td style="padding:8px 24px 0">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;font-size:14px">
        <tr><td style="padding:4px 0;color:#64655f">Subtotal</td><td style="text-align:right">${usd(o.subtotalCents)}</td></tr>
        <tr><td style="padding:4px 0;color:#64655f">Delivery</td><td style="text-align:right">${o.deliveryFeeCents === null ? "To be confirmed" : usd(o.deliveryFeeCents)}</td></tr>
        <tr><td style="padding:10px 0 4px;border-top:2px solid #171816;font-weight:700;font-size:16px">Total</td><td style="padding-top:10px;border-top:2px solid #171816;text-align:right;font-weight:700;font-size:16px">${usd(total)}</td></tr>
        <tr><td style="padding:4px 0;color:#64655f">Payment</td><td style="text-align:right">${esc(o.paymentMethodLabel)}</td></tr>
      </table>
    </td></tr>
    <tr><td style="padding:20px 24px;font-size:14px;line-height:1.5">
      <strong>Delivery to</strong><br>${esc(o.firstName)} ${esc(o.lastName)}<br>${esc(o.line1)}${o.line2 ? `<br>${esc(o.line2)}` : ""}<br>${esc(o.city)}, ${esc(o.area)}<br>${esc(o.phone)}
    </td></tr>
    <tr><td style="padding:0 24px 24px;font-size:14px;line-height:1.5">
      We'll contact you shortly to confirm the delivery time. You pay ${esc(o.paymentMethodLabel.toLowerCase())} — nothing has been charged yet.
      <div style="margin-top:18px"><a href="${link}" style="display:inline-block;background:#171816;color:#f5f3ee;text-decoration:none;padding:12px 20px;border-radius:6px;font-weight:600">View your order</a></div>
    </td></tr>
    <tr><td style="padding:16px 24px;border-top:1px solid #d6d2c7;font-size:12px;color:#64655f">${esc(contactLine)}</td></tr>
  </table></td></tr></table></body></html>`;
}

async function logEvent(orderId: string, message: string) {
  await db.orderEvent.create({ data: { orderId, type: "note", message, actorName: "System" } }).catch(() => {});
}

/** Send the receipt email and WhatsApp confirmation for a new order. Never throws. */
export async function notifyOrderPlaced(order: OrderWithLines) {
  const { store } = await getSettings();
  const contactBits = [store.contact.phone && `Call ${store.contact.phone}`, store.contact.whatsapp && `WhatsApp ${store.contact.whatsapp}`, store.contact.email].filter(Boolean);
  const contactLine = contactBits.length ? `Questions? ${contactBits.join(" · ")}` : `Questions? Reply to this email.`;
  const text = orderConfirmationText({ ...order, storeName: store.name });

  // 1) Receipt email to the customer (+ copy to the store if configured)
  if (emailConfigured) {
    try {
      await sendEmail({ to: order.email, subject: `Your ${store.name} receipt — order ${order.ref}`, text, html: receiptHtml(order, store.name, contactLine), replyTo: store.contact.email ?? undefined });
      await logEvent(order.id, `Receipt emailed to ${order.email}`);
      if (store.orderNotificationEmail) await sendEmail({ to: store.orderNotificationEmail, subject: `New order ${order.ref} — ${usd(order.subtotalCents + (order.deliveryFeeCents ?? 0))}`, text });
    } catch (e) {
      console.error("[notify] email failed", e);
      await logEvent(order.id, `Receipt email failed: ${(e as Error).message.slice(0, 200)}`);
    }
  }

  // 2) WhatsApp confirmation via an approved template
  if (whatsappConfigured) {
    const to = toWhatsAppNumber(order.phone);
    if (!to) return logEvent(order.id, "WhatsApp not sent: phone number not recognised");
    const items = order.lines.map((l) => `${l.quantity}× ${l.name}`).join(", ").slice(0, 900);
    const total = usd(order.subtotalCents + (order.deliveryFeeCents ?? 0));
    try {
      const res = await fetch(`https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "template",
          template: {
            name: process.env.WHATSAPP_TEMPLATE ?? "order_confirmation",
            language: { code: process.env.WHATSAPP_TEMPLATE_LANG ?? "en" },
            components: [
              {
                type: "body",
                parameters: [order.firstName, order.ref, items, total].map((t) => ({ type: "text", text: t.replace(/\s+/g, " ").trim() })),
              },
            ],
          },
        }),
      });
      if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 200)}`);
      await logEvent(order.id, `WhatsApp confirmation sent to +${to}`);
    } catch (e) {
      console.error("[notify] whatsapp failed", e);
      await logEvent(order.id, `WhatsApp confirmation failed: ${(e as Error).message}`);
    }
  }
}

/** Re-send the receipt email for an existing order (admin action). */
export async function resendReceipt(order: OrderWithLines) {
  const { store } = await getSettings();
  const contactBits = [store.contact.phone && `Call ${store.contact.phone}`, store.contact.whatsapp && `WhatsApp ${store.contact.whatsapp}`, store.contact.email].filter(Boolean);
  const contactLine = contactBits.length ? `Questions? ${contactBits.join(" · ")}` : `Questions? Reply to this email.`;
  await sendEmail({
    to: order.email,
    subject: `Your ${store.name} receipt — order ${order.ref}`,
    text: orderConfirmationText({ ...order, storeName: store.name }),
    html: receiptHtml(order, store.name, contactLine),
    replyTo: store.contact.email ?? undefined,
  });
  await logEvent(order.id, `Receipt re-sent to ${order.email}`);
}

export async function receiptPreview(order: OrderWithLines) {
  const { store } = await getSettings();
  return receiptHtml(order, store.name, "Questions? Reply to this email.");
}
