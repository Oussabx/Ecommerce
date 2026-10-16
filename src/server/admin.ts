import "server-only";
import { revalidatePath, revalidateTag } from "next/cache";
import type { Prisma } from "@prisma/client";
import { ZodError, type ZodTypeAny, type z } from "zod";
import { currentUser, isStaff } from "./auth";
import { db } from "./db";
import { CATALOG_TAG } from "./catalog";
import { SETTINGS_TAG } from "./settings";
import { fieldErrors } from "./validation";

export type ActionResult<T = unknown> = { ok: true; data?: T; message?: string } | { ok: false; error: string; fields?: Record<string, string> };

export class ActionError extends Error {
  constructor(
    message: string,
    public fields?: Record<string, string>,
  ) {
    super(message);
  }
}

/** Throws unless the caller is signed-in staff (or admin when required). Use at the top of every admin server action. */
export async function requireStaffAction(opts: { admin?: boolean } = {}) {
  const user = await currentUser();
  if (!user || !isStaff(user)) throw new ActionError("You need a staff account to do this. Please sign in again.");
  if (opts.admin && user.role !== "ADMIN") throw new ActionError("Only administrators can do this.");
  return user;
}

/** Wrap an action body: converts validation / action errors into a serialisable result. */
export async function run<T>(fn: () => Promise<T | ActionResult<T>>): Promise<ActionResult<T>> {
  try {
    const out = await fn();
    if (out && typeof out === "object" && "ok" in (out as object)) return out as ActionResult<T>;
    return { ok: true, data: out as T };
  } catch (e) {
    if (e instanceof ActionError) return { ok: false, error: e.message, fields: e.fields };
    if (e instanceof ZodError) return { ok: false, error: "Please check the highlighted fields.", fields: fieldErrors(e) };
    if ((e as { code?: string }).code === "P2002") return { ok: false, error: "That value is already in use (must be unique)." };
    // Let Next.js redirects/notFound propagate.
    if ((e as { digest?: string }).digest?.startsWith("NEXT_")) throw e;
    console.error("[admin action]", e);
    return { ok: false, error: "Something went wrong. Nothing was saved." };
  }
}

export const parse = <S extends ZodTypeAny>(schema: S, input: unknown): z.output<S> => schema.parse(input);

export async function audit(
  user: { id: string; name: string },
  action: string,
  entity: string,
  entityId: string,
  detail?: Prisma.InputJsonValue,
) {
  await db.auditLog.create({ data: { actorId: user.id, actorName: user.name, action, entity, entityId, detail } });
}

/** Refresh the public site after catalogue changes. */
export function refreshCatalog() {
  revalidateTag(CATALOG_TAG);
  revalidatePath("/", "layout");
}
export function refreshSettings() {
  revalidateTag(SETTINGS_TAG);
  revalidatePath("/", "layout");
}
