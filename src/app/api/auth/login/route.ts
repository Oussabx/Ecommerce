import { authenticate, createSession, isStaff, toPublic } from "@/server/auth";
import { loginSchema } from "@/server/validation";
import { rateLimit } from "@/server/rate-limit";
import { fail, ok, parseBody, sameOrigin, noDatabase } from "@/server/http";

export async function POST(req: Request) {
  const offline = noDatabase();
  if (offline) return offline;
  if (!sameOrigin(req)) return fail("Forbidden.", 403);
  if (!(await rateLimit("login", 10, 10 * 60_000))) return fail("Too many sign-in attempts. Please wait and try again.", 429);
  const parsed = await parseBody(req, loginSchema);
  if ("response" in parsed) return parsed.response;
  const user = await authenticate(parsed.data.email, parsed.data.password);
  if (!user || !isStaff(user)) return fail("Email or password is incorrect.", 401);
  await createSession(user);
  return ok({ user: toPublic(user) });
}
