import "server-only";
import { NextResponse } from "next/server";
import type { z, ZodTypeAny } from "zod";
import { fieldErrors } from "./validation";

export const ok = <T extends object>(data: T, status = 200) => NextResponse.json({ ok: true, ...data }, { status });
export const fail = (error: string, status = 400, fields?: Record<string, string>) =>
  NextResponse.json({ ok: false, error, fields }, { status });

/** Parse a JSON body against a schema, returning data or a ready error response. */
export async function parseBody<S extends ZodTypeAny>(req: Request, schema: S): Promise<{ data: z.output<S> } | { response: NextResponse }> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return { response: fail("Invalid request.", 400) };
  }
  const result = schema.safeParse(body);
  if (!result.success) return { response: fail("Please check the highlighted fields.", 422, fieldErrors(result.error)) };
  return { data: result.data };
}

/** Rejects cross-site form posts: the Origin header must match the Host. */
export function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}
