"use server";
import { z } from "zod";
import type { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { hashPassword } from "@/server/crypto";
import { ActionError, audit, parse, requireStaffAction, run } from "@/server/admin";

const memberSchema = z.object({
  name: z.string().trim().min(1, "Enter a name.").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email."),
  password: z.string().min(10, "Use at least 10 characters.").max(200),
  role: z.enum(["STAFF", "ADMIN"]),
});

/** Create a staff login (or give an existing one a new password and role). */
export async function addMember(input: z.input<typeof memberSchema>) {
  return run(async () => {
    const actor = await requireStaffAction({ admin: true });
    const m = parse(memberSchema, input);
    const passwordHash = await hashPassword(m.password);
    const existing = await db.user.findUnique({ where: { email: m.email } });
    const user = existing
      ? await db.user.update({ where: { id: existing.id }, data: { name: m.name, role: m.role, passwordHash, sessionVersion: { increment: 1 } } })
      : await db.user.create({ data: { name: m.name, email: m.email, role: m.role, passwordHash } });
    await audit(actor, "team.add", "user", user.id, { email: m.email, role: m.role });
    revalidatePath("/admin/team");
    return { ok: true, message: `${m.name} can now sign in at /admin/login with that password.` } as const;
  });
}

export async function setRole(email: string, role: Role) {
  return run(async () => {
    const actor = await requireStaffAction({ admin: true });
    const r = parse(z.enum(["CUSTOMER", "STAFF", "ADMIN"]), role);
    const user = await db.user.findUnique({ where: { email } });
    if (!user) throw new ActionError("Account not found.");
    if (user.id === actor.id && r !== "ADMIN") throw new ActionError("You can't remove your own admin access.");
    if (user.role === "ADMIN" && r !== "ADMIN" && (await db.user.count({ where: { role: "ADMIN" } })) <= 1) throw new ActionError("There must always be at least one admin.");
    // Bump sessionVersion so a demoted user's existing sessions end immediately.
    await db.user.update({ where: { id: user.id }, data: { role: r, sessionVersion: { increment: user.role === r ? 0 : 1 } } });
    await audit(actor, "team.role", "user", user.id, { email, from: user.role, to: r });
    revalidatePath("/admin/team");
    return { ok: true, message: r === "CUSTOMER" ? `${user.name} no longer has access.` : `${user.name} is now ${r.toLowerCase()}.` } as const;
  });
}

export async function resetMemberPassword(email: string, password: string) {
  return run(async () => {
    const actor = await requireStaffAction({ admin: true });
    const pw = parse(z.string().min(10, "Use at least 10 characters.").max(200), password);
    const user = await db.user.findUnique({ where: { email } });
    if (!user) throw new ActionError("Account not found.");
    await db.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(pw), sessionVersion: { increment: 1 } } });
    await audit(actor, "team.password", "user", user.id, { email });
    return { ok: true, message: "Password reset. Share it with them privately." } as const;
  });
}
