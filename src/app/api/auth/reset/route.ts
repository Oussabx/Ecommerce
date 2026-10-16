import { z } from "zod";
import { resetPassword } from "@/server/auth";
import { passwordSchema } from "@/server/validation";
import { rateLimit } from "@/server/rate-limit";
import { fail, ok, parseBody, sameOrigin } from "@/server/http";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail("Forbidden.", 403);
  if (!(await rateLimit("reset", 10, 15 * 60_000))) return fail("Too many attempts. Please try again later.", 429);
  const parsed = await parseBody(req, z.object({ token: z.string().min(10).max(200), password: passwordSchema }));
  if ("response" in parsed) return parsed.response;
  const done = await resetPassword(parsed.data.token, parsed.data.password);
  if (!done) return fail("This reset link is invalid or has expired. Request a new one.", 400);
  return ok({});
}
