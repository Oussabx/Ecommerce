"use server";
import { z } from "zod";
import type { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { ActionError, audit, parse, requireStaffAction, run } from "@/server/admin";

export async function setRole(email: string, role: Role) {
  return run(async () => {
    const actor = await requireStaffAction({ admin: true });
    const target = parse(z.string().trim().toLowerCase().email("Enter the email of an existing account."), email);
    const r = parse(z.enum(["CUSTOMER", "STAFF", "ADMIN"]), role);
    const user = await db.user.findUnique({ where: { email: target } });
    if (!user) throw new ActionError("No account with that email. Ask them to create an account on the store first.", { email: "No account with that email." });
    if (user.id === actor.id && r !== "ADMIN") throw new ActionError("You can't remove your own admin access.");
    if (user.role === "ADMIN" && r !== "ADMIN" && (await db.user.count({ where: { role: "ADMIN" } })) <= 1) throw new ActionError("There must always be at least one admin.");
    // Bump sessionVersion so a demoted user's existing sessions end immediately.
    await db.user.update({ where: { id: user.id }, data: { role: r, sessionVersion: { increment: user.role === r ? 0 : 1 } } });
    await audit(actor, "team.role", "user", user.id, { email: target, from: user.role, to: r });
    revalidatePath("/admin/team");
    return { ok: true, message: `${user.name} is now ${r.toLowerCase()}.` } as const;
  });
}
