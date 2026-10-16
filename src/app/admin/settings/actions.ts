"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { audit, parse, refreshSettings, requireStaffAction, run } from "@/server/admin";
import { saveSetting } from "@/server/settings";
import type { StoreSettings } from "@/config/store-defaults";

const t = (max: number) => z.string().trim().max(max);
const blank = (v: unknown) => (v === null || v === undefined ? "" : v);
const optional = (max: number) => z.preprocess(blank, t(max)).transform((v) => (v === "" ? null : v));
const id = t(40).min(1, "Required.").regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and dashes.");
const url = z.preprocess(blank, z.union([z.literal(""), z.string().trim().url("Enter a full URL starting with https://")]));

const schema = z.object({
  name: t(80).min(1, "Required."),
  legalName: t(160).min(1, "Required."),
  tagline: t(120),
  description: t(400),
  country: t(60).min(1),
  sampleCatalog: z.boolean(),
  contact: z.object({ phone: optional(40), whatsapp: optional(40), email: z.preprocess(blank, z.union([z.literal(""), z.string().trim().email("Enter a valid email.")])).transform((v) => v || null), address: optional(300), hours: optional(120) }),
  social: z.object({ instagram: url, facebook: url, tiktok: url, youtube: url }),
  deliveryAreas: z.array(t(60).min(1)).min(1, "Add at least one delivery area."),
  deliveryMethods: z
    .array(z.object({ id, label: t(60).min(1, "Required."), description: t(300), feeUSD: z.union([z.literal(""), z.null(), z.coerce.number().min(0).max(1000)]).transform((v) => (v === "" || v === null ? null : v)) }))
    .min(1, "Keep at least one delivery method."),
  paymentMethods: z.array(z.object({ id, label: t(60).min(1, "Required."), description: t(300) })).min(1, "Keep at least one payment method."),
  advantages: z.array(z.object({ id, title: t(80).min(1), body: t(300) })).max(6),
  orderNotificationEmail: z.union([z.literal(""), z.null(), z.string().trim().email("Enter a valid email.")]).transform((v) => v || null),
});

export async function saveStoreSettings(input: unknown) {
  return run(async () => {
    const user = await requireStaffAction({ admin: true });
    const value: StoreSettings = parse(schema, input);
    await saveSetting("store", value);
    await audit(user, "settings.store", "setting", "store");
    refreshSettings();
    revalidatePath("/admin/settings");
    return { ok: true, message: "Settings saved. The store is updated." } as const;
  });
}
