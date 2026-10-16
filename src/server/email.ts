import "server-only";

/**
 * Transactional email via Resend's HTTP API (https://resend.com), enabled when
 * RESEND_API_KEY and EMAIL_FROM are set. Without them, emails are skipped and
 * the UI says so where it matters (password reset).
 */
export const emailConfigured = Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);

export async function sendEmail({ to, subject, text }: { to: string; subject: string; text: string }) {
  if (!emailConfigured) {
    console.info(`[email] not configured — skipped "${subject}" to ${to}`);
    return false;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.EMAIL_FROM, to, subject, text }),
  });
  if (!res.ok) throw new Error(`Email failed: ${res.status} ${await res.text()}`);
  return true;
}

/** Customer confirmation + staff alert for a new order. */
export async function notifyNewOrder(order: {
  ref: string;
  firstName: string;
  email: string;
  phone: string;
  subtotalCents: number;
  lines: { name: string; quantity: number }[];
}) {
  if (!emailConfigured) return;
  const { getSettings } = await import("./settings");
  const { store } = await getSettings();
  const items = order.lines.map((l) => `• ${l.quantity} × ${l.name}`).join("\n");
  const subtotal = `$${(order.subtotalCents / 100).toFixed(2)}`;
  await sendEmail({
    to: order.email,
    subject: `${store.name} — order ${order.ref} received`,
    text: `Hi ${order.firstName},\n\nThanks for your order ${order.ref}.\n\n${items}\n\nSubtotal: ${subtotal}\n\nWe'll call you on ${order.phone} to confirm stock, the delivery fee and timing. No payment has been taken.\n\n${store.name}`,
  });
  if (store.orderNotificationEmail) {
    await sendEmail({ to: store.orderNotificationEmail, subject: `New order ${order.ref} (${subtotal})`, text: `${items}\n\nCustomer: ${order.firstName}, ${order.phone}` });
  }
}
