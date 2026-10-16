import { z } from "zod";
import { db } from "@/server/db";
import { emailSchema } from "@/server/validation";
import { rateLimit } from "@/server/rate-limit";
import { fail, ok, parseBody, sameOrigin, noDatabase } from "@/server/http";

export async function POST(req: Request) {
  const offline = noDatabase();
  if (offline) return offline;
  if (!sameOrigin(req)) return fail("Forbidden.", 403);
  if (!(await rateLimit("newsletter", 5, 60_000))) return fail("Too many attempts. Try again in a minute.", 429);
  const parsed = await parseBody(req, z.object({ email: emailSchema }));
  if ("response" in parsed) return parsed.response;
  await db.subscriber.upsert({ where: { email: parsed.data.email }, create: { email: parsed.data.email }, update: {} });
  return ok({});
}
