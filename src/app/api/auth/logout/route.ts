import { destroySession } from "@/server/auth";
import { fail, ok, sameOrigin } from "@/server/http";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail("Forbidden.", 403);
  await destroySession();
  return ok({});
}
