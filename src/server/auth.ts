import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Address, Role, User } from "@prisma/client";
import { db, hasDatabase } from "./db";
import { hashPassword, randomToken, safeEqual, sha256, sign, verifyPassword } from "./crypto";

export type SavedAddress = Pick<Address, "id" | "label" | "line1" | "line2" | "city" | "area" | "notes">;
export type UserWithAddresses = User & { addresses: Address[] };

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: Role;
  createdAt: string;
  addresses: SavedAddress[];
}

export const toPublic = (u: UserWithAddresses): PublicUser => ({
  id: u.id,
  email: u.email,
  name: u.name,
  phone: u.phone,
  role: u.role,
  createdAt: u.createdAt.toISOString(),
  addresses: u.addresses.map(({ id, label, line1, line2, city, area, notes }) => ({ id, label, line1, line2, city, area, notes })),
});

const COOKIE = "osa_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function createSession(user: Pick<User, "id" | "sessionVersion">) {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  const payload = `${user.id}.${user.sessionVersion}.${exp}`;
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function currentUser(): Promise<UserWithAddresses | null> {
  if (!hasDatabase) return null;
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const parts = raw.split(".");
  if (parts.length !== 4) return null;
  const [id, version, exp, sig] = parts;
  if (!safeEqual(sig, sign(`${id}.${version}.${exp}`))) return null;
  if (Number(exp) < Date.now() / 1000) return null;
  const user = await db.user.findUnique({ where: { id }, include: { addresses: { orderBy: { createdAt: "asc" } } } });
  if (!user || String(user.sessionVersion) !== version) return null;
  return user;
}

export const isStaff = (u: Pick<User, "role"> | null | undefined) => u?.role === "STAFF" || u?.role === "ADMIN";

/** For admin pages: redirect to sign-in unless the user is staff (or admin when required). */
export async function requireStaff(opts: { admin?: boolean } = {}) {
  const user = await currentUser();
  if (!user) redirect("/account/login?next=/admin");
  if (!isStaff(user) || (opts.admin && user.role !== "ADMIN")) redirect("/admin/forbidden");
  return user;
}

export async function registerUser(input: { name: string; email: string; password: string }) {
  const passwordHash = await hashPassword(input.password);
  try {
    return await db.user.create({ data: { email: input.email, name: input.name, passwordHash }, include: { addresses: true } });
  } catch {
    return null; // unique email violation
  }
}

export async function authenticate(email: string, password: string) {
  const user = await db.user.findUnique({ where: { email }, include: { addresses: true } });
  // Always run a hash comparison to keep timing similar for unknown emails.
  const ok = await verifyPassword(password, user?.passwordHash ?? "scrypt$AAAAAAAAAAAAAAAAAAAAAA==$AAAA");
  return ok && user ? user : null;
}

// ─── password reset ──────────────────────────────────────────────────────────

/** Returns the raw token (to be emailed) or null when no such user exists. */
export async function createResetToken(email: string) {
  const user = await db.user.findUnique({ where: { email } });
  if (!user) return null;
  const token = randomToken();
  await db.$transaction([
    db.passwordReset.deleteMany({ where: { OR: [{ userId: user.id }, { expiresAt: { lt: new Date() } }] } }),
    db.passwordReset.create({ data: { tokenHash: sha256(token), userId: user.id, expiresAt: new Date(Date.now() + 60 * 60 * 1000) } }),
  ]);
  return token;
}

export async function resetPassword(token: string, password: string) {
  const row = await db.passwordReset.findUnique({ where: { tokenHash: sha256(token) } });
  if (!row || row.used || row.expiresAt < new Date()) return false;
  const passwordHash = await hashPassword(password);
  const claimed = await db.passwordReset.updateMany({ where: { tokenHash: row.tokenHash, used: false }, data: { used: true } });
  if (!claimed.count) return false;
  await db.user.update({ where: { id: row.userId }, data: { passwordHash, sessionVersion: { increment: 1 } } });
  return true;
}
