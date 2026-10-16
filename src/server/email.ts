import "server-only";

/**
 * Transactional email via Resend's HTTP API (https://resend.com), enabled when
 * RESEND_API_KEY and EMAIL_FROM are set. Without them, emails are skipped.
 */
export const emailConfigured = Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);

export async function sendEmail({ to, subject, text, html, replyTo }: { to: string; subject: string; text: string; html?: string; replyTo?: string }) {
  if (!emailConfigured) {
    console.info(`[email] not configured — skipped "${subject}" to ${to}`);
    return false;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.EMAIL_FROM, to, subject, text, html, ...(replyTo ? { reply_to: replyTo } : {}) }),
  });
  if (!res.ok) throw new Error(`Email failed: ${res.status} ${await res.text()}`);
  return true;
}
