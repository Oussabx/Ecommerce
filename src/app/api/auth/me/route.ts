import { currentUser, toPublic } from "@/server/auth";
import { ok } from "@/server/http";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await currentUser();
  return ok({ user: user ? toPublic(user) : null });
}
