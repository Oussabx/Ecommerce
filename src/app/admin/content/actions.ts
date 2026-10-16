"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { ActionError, audit, parse, refreshCatalog, refreshSettings, requireStaffAction, run } from "@/server/admin";
import { saveSetting } from "@/server/settings";

const t = (max: number) => z.string().trim().max(max);
const slug = t(60).min(1, "Required.").regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and dashes.");

export async function saveAnnouncements(lines: string[]) {
  return run(async () => {
    const user = await requireStaffAction({ admin: true });
    const value = parse(z.array(t(120).min(1)).min(1, "Add at least one message.").max(6), lines.map((l) => l.trim()).filter(Boolean));
    await saveSetting("announcements", value);
    await audit(user, "content.announcements", "setting", "announcements");
    refreshSettings();
    return { ok: true, message: "Announcements saved." } as const;
  });
}

const campaignSchema = z.object({
  enabled: z.boolean(),
  eyebrow: t(80),
  headline: z.tuple([t(40).min(1, "Required."), t(40).min(1, "Required.")]),
  body: t(400),
  heroProduct: t(120).min(1, "Choose a product."),
  heroColor: t(40),
  supporting: z.array(t(120)).max(2),
  cta: z.object({ label: t(40).min(1), href: t(200).regex(/^\//, "Use a site path starting with /") }),
});
export async function saveCampaign(input: unknown) {
  return run(async () => {
    const user = await requireStaffAction({ admin: true });
    const value = parse(campaignSchema, input);
    await saveSetting("campaign", value);
    await audit(user, "content.campaign", "setting", "campaign");
    refreshSettings();
    return { ok: true, message: "Campaign saved." } as const;
  });
}

const categorySchema = z.object({
  slug,
  index: z.coerce.number().int().min(1).max(99),
  code: t(4).min(1, "Required."),
  name: t(60).min(1, "Required."),
  indexName: t(80).min(1, "Required."),
  description: t(400),
  coverProduct: t(120),
});
export async function saveCategory(originalSlug: string | null, input: unknown) {
  return run(async () => {
    const user = await requireStaffAction({ admin: true });
    const c = parse(categorySchema, input);
    const data = { ...c, code: c.code.toUpperCase(), coverProduct: c.coverProduct || null };
    if (originalSlug) {
      if (originalSlug !== c.slug) throw new ActionError("The URL of an existing category can't be changed.");
      await db.category.update({ where: { slug: originalSlug }, data });
    } else {
      await db.category.create({ data });
    }
    await audit(user, originalSlug ? "category.update" : "category.create", "category", c.slug);
    refreshCatalog();
    revalidatePath("/admin/content");
    return { ok: true, message: "Category saved." } as const;
  });
}
export async function deleteCategory(slugValue: string) {
  return run(async () => {
    const user = await requireStaffAction({ admin: true });
    const count = await db.product.count({ where: { categorySlug: slugValue } });
    if (count) throw new ActionError(`Move its ${count} products to another category first.`);
    await db.category.delete({ where: { slug: slugValue } });
    await audit(user, "category.delete", "category", slugValue);
    refreshCatalog();
    revalidatePath("/admin/content");
    return { ok: true, message: "Category deleted." } as const;
  });
}

const collectionSchema = z.object({
  slug,
  index: z.coerce.number().int().min(1).max(99),
  title: t(80).min(1, "Required."),
  kicker: t(80),
  description: t(400),
  tone: z.enum(["lime", "ink", "paper", "cobalt", "stone", "sand"]),
  coverProduct: t(120).min(1, "Choose a cover product."),
  products: z.array(t(120)).max(40),
});
export async function saveCollection(originalSlug: string | null, input: unknown) {
  return run(async () => {
    const user = await requireStaffAction({ admin: true });
    const c = parse(collectionSchema, input);
    if (originalSlug && originalSlug !== c.slug) throw new ActionError("The URL of an existing collection can't be changed.");
    const ids = await db.product.findMany({ where: { slug: { in: c.products } }, select: { id: true, slug: true } });
    const order = c.products.map((s) => ids.find((p) => p.slug === s)).filter((p): p is { id: string; slug: string } => !!p);
    const { products: _p, ...fields } = c;
    await db.$transaction(async (tx) => {
      if (originalSlug) {
        await tx.collection.update({ where: { slug: originalSlug }, data: fields });
        await tx.collectionProduct.deleteMany({ where: { collectionSlug: originalSlug } });
      } else {
        await tx.collection.create({ data: fields });
      }
      await tx.collectionProduct.createMany({ data: order.map((p, i) => ({ collectionSlug: c.slug, productId: p.id, position: i })) });
    });
    await audit(user, originalSlug ? "collection.update" : "collection.create", "collection", c.slug);
    refreshCatalog();
    revalidatePath("/admin/content");
    return { ok: true, message: "Collection saved." } as const;
  });
}
export async function deleteCollection(slugValue: string) {
  return run(async () => {
    const user = await requireStaffAction({ admin: true });
    await db.collection.delete({ where: { slug: slugValue } });
    await audit(user, "collection.delete", "collection", slugValue);
    refreshCatalog();
    revalidatePath("/admin/content");
    return { ok: true, message: "Collection deleted." } as const;
  });
}
