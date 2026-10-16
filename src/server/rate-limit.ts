import "server-only";
import { headers } from "next/headers";

/**
 * Fixed-window, in-memory rate limiter. Good enough for a single instance;
 * use a shared store (e.g. Redis) when running multiple instances.
 */
const hits = new Map<string, { count: number; reset: number }>();

export async function rateLimit(bucket: string, limit: number, windowMs: number) {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || entry.reset < now) {
    hits.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  entry.count += 1;
  return entry.count <= limit;
}
