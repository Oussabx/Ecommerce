"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { audit, requireStaffAction, run } from "@/server/admin";

export async function setHandled(id: string, handled: boolean) {
  return run(async () => {
    const user = await requireStaffAction();
    await db.message.update({ where: { id }, data: { handled } });
    await audit(user, handled ? "message.handled" : "message.reopened", "message", id);
    revalidatePath("/admin/messages");
    return { ok: true, message: handled ? "Marked as handled." : "Moved back to inbox." } as const;
  });
}

export async function removeSubscriber(email: string) {
  return run(async () => {
    const user = await requireStaffAction();
    await db.subscriber.delete({ where: { email } });
    await audit(user, "subscriber.remove", "subscriber", email);
    revalidatePath("/admin/messages");
    return { ok: true, message: "Subscriber removed." } as const;
  });
}
