import { currentUser, toPublic, updateUser } from "@/server/auth";
import { profileSchema } from "@/server/validation";
import { fail, ok, parseBody, sameOrigin } from "@/server/http";

export async function PUT(req: Request) {
  if (!sameOrigin(req)) return fail("Forbidden.", 403);
  const user = await currentUser();
  if (!user) return fail("Please sign in.", 401);
  const parsed = await parseBody(req, profileSchema);
  if ("response" in parsed) return parsed.response;
  const updated = await updateUser(user.id, (u) => {
    u.name = parsed.data.name;
    u.phone = parsed.data.phone;
  });
  return ok({ user: updated ? toPublic(updated) : null });
}
