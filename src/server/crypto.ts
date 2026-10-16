import "server-only";
import { createHmac, randomBytes, scrypt as _scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(_scrypt) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 32) return s;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be set (32+ characters) in production.");
  }
  return "dev-only-insecure-secret-change-me-0000000000";
}

export const sign = (value: string) => createHmac("sha256", secret()).update(value).digest("base64url");

export function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export const randomToken = (bytes = 32) => randomBytes(bytes).toString("base64url");
export const sha256 = (v: string) => createHmac("sha256", "osa-token").update(v).digest("hex");

export async function hashPassword(pw: string) {
  const salt = randomBytes(16);
  const key = await scrypt(pw, salt, 64);
  return `scrypt$${salt.toString("base64")}$${key.toString("base64")}`;
}

export async function verifyPassword(pw: string, stored: string) {
  const [, saltB64, keyB64] = stored.split("$");
  if (!saltB64 || !keyB64) return false;
  const key = await scrypt(pw, Buffer.from(saltB64, "base64"), 64);
  const expected = Buffer.from(keyB64, "base64");
  return key.length === expected.length && timingSafeEqual(key, expected);
}

/** Token granting read access to one order (used in confirmation links for guests). */
export const orderAccessToken = (ref: string) => sign(`order:${ref}`).slice(0, 32);
