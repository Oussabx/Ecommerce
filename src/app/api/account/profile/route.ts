import { currentUser, toPublic } from "@/server/auth";
import { db } from "@/server/db";
import { profileSchema } from "@/server/validation";
import { fail, ok, parseBody, sameOrigin, noDatabase } from "@/server/http";

export async function PUT(req: Request) {
  const offline = noDatabase();
  if (offline) return offline;
  if (!sameOrigin(req)) return fail("Forbidden.", 403);
  const user = await currentUser();
  if (!user) return fail("Please sign in.", 401);
  const parsed = await parseBody(req, profileSchema);
  if ("response" in parsed) return parsed.response;
  const updated = await db.user.update({ where: { id: user.id }, data: { name: parsed.data.name, phone: parsed.data.phone }, include: { addresses: true } });
  return ok({ user: toPublic(updated) });
}
