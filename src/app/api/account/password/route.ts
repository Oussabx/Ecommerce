import { z } from "zod";
import { createSession, currentUser } from "@/server/auth";
import { hashPassword, verifyPassword } from "@/server/crypto";
import { db } from "@/server/db";
import { passwordSchema } from "@/server/validation";
import { rateLimit } from "@/server/rate-limit";
import { fail, ok, parseBody, sameOrigin, noDatabase } from "@/server/http";

export async function POST(req: Request) {
  const offline = noDatabase();
  if (offline) return offline;
  if (!sameOrigin(req)) return fail("Forbidden.", 403);
  if (!(await rateLimit("password", 10, 15 * 60_000))) return fail("Too many attempts. Please try again later.", 429);
  const user = await currentUser();
  if (!user) return fail("Please sign in.", 401);
  const parsed = await parseBody(req, z.object({ current: z.string().min(1, "Enter your current password.").max(200), next: passwordSchema }));
  if ("response" in parsed) return parsed.response;
  if (!(await verifyPassword(parsed.data.current, user.passwordHash))) return fail("Your current password is incorrect.", 400, { current: "Incorrect password." });
  // Changing the password signs out every other session; keep this one.
  const updated = await db.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(parsed.data.next), sessionVersion: { increment: 1 } } });
  await createSession(updated);
  return ok({});
}
