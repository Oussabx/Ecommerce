import { z } from "zod";
import { createResetToken } from "@/server/auth";
import { emailSchema } from "@/server/validation";
import { rateLimit } from "@/server/rate-limit";
import { emailConfigured, sendEmail } from "@/server/email";
import { fail, ok, parseBody, sameOrigin, noDatabase } from "@/server/http";

export async function POST(req: Request) {
  const offline = noDatabase();
  if (offline) return offline;
  if (!sameOrigin(req)) return fail("Forbidden.", 403);
  if (!(await rateLimit("forgot", 5, 15 * 60_000))) return fail("Too many requests. Please try again later.", 429);
  const parsed = await parseBody(req, z.object({ email: emailSchema }));
  if ("response" in parsed) return parsed.response;
  const token = await createResetToken(parsed.data.email);
  if (token) {
    const link = `${new URL(req.url).origin}/account/reset-password?token=${token}`;
    if (emailConfigured) {
      await sendEmail({
        to: parsed.data.email,
        subject: "Reset your OSA Techstore password",
        text: `Use this link to choose a new password. It expires in one hour and works once:\n\n${link}\n\nIf you didn't ask for this, you can ignore this email.`,
      }).catch((e) => console.error("[password-reset] email failed", e));
    } else {
      // No email provider yet: surface the link in the server log for the store team only.
      console.info(`[password-reset] Email delivery is not configured. Reset link for ${parsed.data.email}: ${link}`);
    }
  }
  // Same response whether or not the account exists, to avoid leaking emails.
  return ok({ emailConfigured });
}
