import { z } from "zod";
import { mutate } from "@/server/store";
import { emailSchema } from "@/server/validation";
import { rateLimit } from "@/server/rate-limit";
import { fail, ok, parseBody, sameOrigin } from "@/server/http";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail("Forbidden.", 403);
  if (!(await rateLimit("newsletter", 5, 60_000))) return fail("Too many attempts. Try again in a minute.", 429);
  const parsed = await parseBody(req, z.object({ email: emailSchema }));
  if ("response" in parsed) return parsed.response;
  const { email } = parsed.data;
  await mutate<{ email: string; createdAt: string }, void>("subscribers", (rows) => {
    if (!rows.some((r) => r.email === email)) rows.push({ email, createdAt: new Date().toISOString() });
  });
  return ok({});
}
