import { z } from "zod";
import { currentUser, toPublic } from "@/server/auth";
import { db } from "@/server/db";
import { getSettings } from "@/server/settings";
import { savedAddressSchema } from "@/server/validation";
import { fail, ok, parseBody, sameOrigin } from "@/server/http";

const reload = (id: string) => db.user.findUniqueOrThrow({ where: { id }, include: { addresses: { orderBy: { createdAt: "asc" } } } });

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail("Forbidden.", 403);
  const user = await currentUser();
  if (!user) return fail("Please sign in.", 401);
  if (user.addresses.length >= 10) return fail("You can save up to 10 addresses.", 400);
  const parsed = await parseBody(req, savedAddressSchema);
  if ("response" in parsed) return parsed.response;
  const { store } = await getSettings();
  if (!store.deliveryAreas.includes(parsed.data.area)) return fail("Please check the highlighted fields.", 422, { area: "Choose a governorate." });
  await db.address.create({ data: { userId: user.id, ...parsed.data } });
  return ok({ user: toPublic(await reload(user.id)) }, 201);
}

export async function DELETE(req: Request) {
  if (!sameOrigin(req)) return fail("Forbidden.", 403);
  const user = await currentUser();
  if (!user) return fail("Please sign in.", 401);
  const parsed = await parseBody(req, z.object({ id: z.string().uuid() }));
  if ("response" in parsed) return parsed.response;
  await db.address.deleteMany({ where: { id: parsed.data.id, userId: user.id } });
  return ok({ user: toPublic(await reload(user.id)) });
}
