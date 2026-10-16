"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, toCents } from "@/server/db";
import { ActionError, audit, parse, refreshCatalog, requireStaffAction, run } from "@/server/admin";
import { storeImage } from "@/server/uploads";
import { productSchema, type ProductInput } from "@/lib/product-schema";



/** Derive render tones from the swatch so generated art and UI stay consistent. */
const tone = (hexColor: string) => hexColor.toUpperCase();

export async function saveProduct(id: string | null, input: ProductInput) {
  return run(async () => {
    const user = await requireStaffAction();
    const p = parse(productSchema, input);
    if (!(await db.category.findUnique({ where: { slug: p.categorySlug } }))) throw new ActionError("Choose a category.", { categorySlug: "Choose a category." });
    const before = id ? await db.product.findUnique({ where: { id }, select: { stock: true, slug: true } }) : null;
    if (id && !before) throw new ActionError("This product no longer exists.");

    const data = {
      slug: p.slug,
      name: p.name,
      brand: p.brand,
      model: p.model,
      categorySlug: p.categorySlug,
      tagline: p.tagline,
      description: p.description,
      priceCents: toCents(p.price),
      compareAtCents: p.compareAtPrice === null ? null : toCents(p.compareAtPrice),
      stock: p.stock,
      published: p.published,
      isNew: p.isNew,
      releaseYear: p.releaseYear,
      sortOrder: p.sortOrder,
      configLabel: p.configLabel || null,
      artKind: p.artKind || "phone",
      highlights: p.highlights,
      specs: p.specs,
      inTheBox: p.inTheBox,
      tags: p.tags.map((t) => t.toLowerCase()),
      pairsWith: p.pairsWith.filter((s) => s !== p.slug),
    };
    const children = {
      colors: { create: p.colors.map((c, i) => ({ key: c.key, name: c.name, swatch: tone(c.swatch), body: tone(c.swatch), soldOut: c.soldOut, position: i })) },
      configs: { create: p.configs.map((c, i) => ({ key: c.key, label: c.label, priceDeltaCents: toCents(c.priceDelta), position: i })) },
      images: { create: p.images.map((im, i) => ({ url: im.url, colorKey: im.colorKey, label: im.label, alt: im.alt, position: i })) },
    };

    const saved = await db.$transaction(async (tx) => {
      if (id) {
        await tx.productColor.deleteMany({ where: { productId: id } });
        await tx.productConfig.deleteMany({ where: { productId: id } });
        await tx.productImage.deleteMany({ where: { productId: id } });
        const prod = await tx.product.update({ where: { id }, data: { ...data, ...children } });
        if (before && before.stock !== p.stock) {
          await tx.stockMovement.create({ data: { productId: id, delta: p.stock - before.stock, reason: "Edited on product page", actorName: user.name } });
        }
        return prod;
      }
      const prod = await tx.product.create({ data: { ...data, ...children } });
      if (p.stock) await tx.stockMovement.create({ data: { productId: prod.id, delta: p.stock, reason: "Initial stock", actorName: user.name } });
      return prod;
    });

    // Keep references in categories/collections/other products in sync if the slug changed.
    if (before && before.slug !== saved.slug) {
      await db.category.updateMany({ where: { coverProduct: before.slug }, data: { coverProduct: saved.slug } });
      await db.collection.updateMany({ where: { coverProduct: before.slug }, data: { coverProduct: saved.slug } });
      const referencing = await db.product.findMany({ where: { pairsWith: { has: before.slug } }, select: { id: true, pairsWith: true } });
      for (const r of referencing) await db.product.update({ where: { id: r.id }, data: { pairsWith: r.pairsWith.map((s) => (s === before.slug ? saved.slug : s)) } });
    }

    await audit(user, id ? "product.update" : "product.create", "product", saved.id, { slug: saved.slug, name: saved.name });
    refreshCatalog();
    revalidatePath("/admin/products");
    if (!id) redirect(`/admin/products/${saved.id}?created=1`);
    revalidatePath(`/admin/products/${saved.id}`);
    return { ok: true, message: "Product saved. The store is updated." } as const;
  });
}

export async function deleteProduct(id: string) {
  return run(async () => {
    const user = await requireStaffAction({ admin: true });
    const p = await db.product.findUnique({ where: { id }, select: { slug: true, name: true } });
    if (!p) throw new ActionError("Product not found.");
    await db.product.delete({ where: { id } });
    await audit(user, "product.delete", "product", id, { slug: p.slug, name: p.name });
    refreshCatalog();
    redirect("/admin/products?deleted=1");
  });
}

export async function uploadProductImage(form: FormData) {
  return run(async () => {
    await requireStaffAction();
    const file = form.get("file");
    const slug = String(form.get("slug") ?? "product");
    if (!(file instanceof File) || file.size === 0) throw new ActionError("Choose an image to upload.");
    try {
      return { url: await storeImage(file, slug) };
    } catch (e) {
      throw new ActionError((e as Error).message);
    }
  });
}
