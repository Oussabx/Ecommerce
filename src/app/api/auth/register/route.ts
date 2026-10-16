import { createSession, registerUser, toPublic } from "@/server/auth";
import { registerSchema } from "@/server/validation";
import { rateLimit } from "@/server/rate-limit";
import { fail, ok, parseBody, sameOrigin, noDatabase } from "@/server/http";

export async function POST(req: Request) {
  const offline = noDatabase();
  if (offline) return offline;
  if (!sameOrigin(req)) return fail("Forbidden.", 403);
  if (!(await rateLimit("register", 5, 10 * 60_000))) return fail("Too many attempts. Please try again later.", 429);
  const parsed = await parseBody(req, registerSchema);
  if ("response" in parsed) return parsed.response;
  const user = await registerUser(parsed.data);
  if (!user) return fail("An account with this email already exists.", 409, { email: "An account with this email already exists. Try signing in." });
  await createSession(user);
  return ok({ user: toPublic(user) }, 201);
}
