import "server-only";
import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { findOne, mutate } from "./store";
import { hashPassword, randomToken, safeEqual, sha256, sign, verifyPassword } from "./crypto";

export interface SavedAddress {
  id: string;
  label: string;
  line1: string;
  line2: string;
  city: string;
  area: string;
  notes: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  passwordHash: string;
  addresses: SavedAddress[];
  createdAt: string;
  /** Incremented on password change to invalidate existing sessions. */
  sessionVersion: number;
}

export type PublicUser = Omit<User, "passwordHash" | "sessionVersion">;
export const toPublic = ({ passwordHash: _p, sessionVersion: _s, ...u }: User): PublicUser => u;

const COOKIE = "osa_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function createSession(user: User) {
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

export async function currentUser(): Promise<User | null> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const parts = raw.split(".");
  if (parts.length !== 4) return null;
  const [id, version, exp, sig] = parts;
  if (!safeEqual(sig, sign(`${id}.${version}.${exp}`))) return null;
  if (Number(exp) < Date.now() / 1000) return null;
  const user = await findOne<User>("users", (u) => u.id === id);
  if (!user || String(user.sessionVersion) !== version) return null;
  return user;
}

export async function registerUser(input: { name: string; email: string; password: string }) {
  const passwordHash = await hashPassword(input.password);
  return mutate<User, User | null>("users", (users) => {
    if (users.some((u) => u.email === input.email)) return null;
    const user: User = {
      id: randomUUID(),
      email: input.email,
      name: input.name,
      phone: "",
      passwordHash,
      addresses: [],
      createdAt: new Date().toISOString(),
      sessionVersion: 1,
    };
    users.push(user);
    return user;
  });
}

export async function authenticate(email: string, password: string) {
  const user = await findOne<User>("users", (u) => u.email === email);
  // Always run a hash comparison to keep timing similar for unknown emails.
  const ok = await verifyPassword(password, user?.passwordHash ?? "scrypt$AAAAAAAAAAAAAAAAAAAAAA==$AAAA");
  return ok && user ? user : null;
}

export async function updateUser(id: string, fn: (u: User) => void) {
  return mutate<User, User | null>("users", (users) => {
    const u = users.find((x) => x.id === id);
    if (!u) return null;
    fn(u);
    return u;
  });
}

// ─── password reset ──────────────────────────────────────────────────────────
interface ResetToken {
  tokenHash: string;
  userId: string;
  expiresAt: number;
  used: boolean;
}

/** Returns the raw token (to be emailed) or null when no such user exists. */
export async function createResetToken(email: string) {
  const user = await findOne<User>("users", (u) => u.email === email);
  if (!user) return null;
  const token = randomToken();
  await mutate<ResetToken, void>("password-resets", (rows) => {
    const now = Date.now();
    for (let i = rows.length - 1; i >= 0; i--) if (rows[i].expiresAt < now || rows[i].userId === user.id) rows.splice(i, 1);
    rows.push({ tokenHash: sha256(token), userId: user.id, expiresAt: now + 60 * 60 * 1000, used: false });
  });
  return token;
}

export async function resetPassword(token: string, password: string) {
  const hash = sha256(token);
  const userId = await mutate<ResetToken, string | null>("password-resets", (rows) => {
    const row = rows.find((r) => r.tokenHash === hash && !r.used && r.expiresAt > Date.now());
    if (!row) return null;
    row.used = true;
    return row.userId;
  });
  if (!userId) return false;
  const passwordHash = await hashPassword(password);
  await updateUser(userId, (u) => {
    u.passwordHash = passwordHash;
    u.sessionVersion += 1;
  });
  return true;
}
