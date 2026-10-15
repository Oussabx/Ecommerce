import { randomUUID } from "node:crypto";
import { mutate } from "@/server/store";
import { contactSchema } from "@/server/validation";
import { rateLimit } from "@/server/rate-limit";
import { fail, ok, parseBody, sameOrigin } from "@/server/http";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail("Forbidden.", 403);
  if (!(await rateLimit("contact", 5, 10 * 60_000))) return fail("Too many messages. Please try again later.", 429);
  const parsed = await parseBody(req, contactSchema);
  if ("response" in parsed) return parsed.response;
  await mutate<object, void>("messages", (rows) => {
    rows.push({ id: randomUUID(), ...parsed.data, createdAt: new Date().toISOString() });
  });
  return ok({});
}
