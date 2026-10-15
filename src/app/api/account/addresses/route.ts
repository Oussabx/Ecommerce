import { randomUUID } from "node:crypto";
import { z } from "zod";
import { currentUser, toPublic, updateUser } from "@/server/auth";
import { savedAddressSchema } from "@/server/validation";
import { fail, ok, parseBody, sameOrigin } from "@/server/http";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail("Forbidden.", 403);
  const user = await currentUser();
  if (!user) return fail("Please sign in.", 401);
  if (user.addresses.length >= 10) return fail("You can save up to 10 addresses.", 400);
  const parsed = await parseBody(req, savedAddressSchema);
  if ("response" in parsed) return parsed.response;
  const updated = await updateUser(user.id, (u) => {
    u.addresses.push({ id: randomUUID(), ...parsed.data });
  });
  return ok({ user: updated ? toPublic(updated) : null }, 201);
}

export async function DELETE(req: Request) {
  if (!sameOrigin(req)) return fail("Forbidden.", 403);
  const user = await currentUser();
  if (!user) return fail("Please sign in.", 401);
  const parsed = await parseBody(req, z.object({ id: z.string().uuid() }));
  if ("response" in parsed) return parsed.response;
  const updated = await updateUser(user.id, (u) => {
    u.addresses = u.addresses.filter((a) => a.id !== parsed.data.id);
  });
  return ok({ user: updated ? toPublic(updated) : null });
}
