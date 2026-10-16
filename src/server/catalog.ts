import "server-only";
import { unstable_cache } from "next/cache";
import type { Prisma } from "@prisma/client";
import { db, fromCents } from "./db";
import type { Category, Collection, Product, SpecGroup } from "@/data/types";

export const CATALOG_TAG = "catalog";

export const productInclude = {
  colors: { orderBy: { position: "asc" } },
  configs: { orderBy: { position: "asc" } },
  images: { orderBy: { position: "asc" } },
} satisfies Prisma.ProductInclude;
export type DbProduct = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

/** Map a database product to the storefront Product shape (USD numbers). */
export function mapProduct(p: DbProduct): Product {
  const images: Product["images"] = {};
  for (const im of p.images) (images[im.colorKey ?? "*"] ??= []).push({ src: im.url, label: im.label, alt: im.alt });
  return {
    id: p.id,
    published: p.published,
    slug: p.slug,
    brand: p.brand,
    name: p.name,
    model: p.model,
    category: p.categorySlug,
    tagline: p.tagline,
    description: p.description,
    price: fromCents(p.priceCents),
    compareAtPrice: p.compareAtCents ? fromCents(p.compareAtCents) : undefined,
    stock: p.stock,
    colors: p.colors.map((c) => ({ id: c.key, name: c.name, swatch: c.swatch, body: c.body, accent: c.accent ?? undefined })),
    soldOutColors: p.colors.filter((c) => c.soldOut).map((c) => c.key),
    configs: p.configs.length ? p.configs.map((c) => ({ id: c.key, label: c.label, priceDelta: fromCents(c.priceDeltaCents) })) : undefined,
    configLabel: p.configLabel ?? undefined,
    art: { kind: p.artKind as Product["art"]["kind"], variant: p.artVariant ?? undefined },
    images,
    highlights: (p.highlights as Product["highlights"]) ?? [],
    specs: (p.specs as unknown as SpecGroup[]) ?? [],
    warranty: p.warranty,
    inTheBox: p.inTheBox.length ? p.inTheBox : undefined,
    tags: p.tags,
    isNew: p.isNew,
    releaseYear: p.releaseYear,
    pairsWith: p.pairsWith,
  };
}

export interface Catalog {
  products: Product[];
  categories: Category[];
  collections: Collection[];
}

/** Published catalogue. Cached; invalidated by revalidateTag("catalog"). */
export const getCatalog = unstable_cache(
  async (): Promise<Catalog> => {
    const [products, categories, collections] = await Promise.all([
      db.product.findMany({ where: { published: true }, include: productInclude, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }),
      db.category.findMany({ orderBy: { index: "asc" } }),
      db.collection.findMany({ orderBy: { index: "asc" }, include: { products: { orderBy: { position: "asc" }, include: { product: { select: { slug: true, published: true } } } } } }),
    ]);
    return {
      products: products.map(mapProduct),
      categories: categories.map((c) => ({ ...c, coverProduct: c.coverProduct ?? "" })),
      collections: collections.map((c) => ({
        slug: c.slug,
        index: c.index,
        title: c.title,
        kicker: c.kicker,
        description: c.description,
        tone: c.tone as Collection["tone"],
        coverProduct: c.coverProduct,
        products: c.products.filter((cp) => cp.product.published).map((cp) => cp.product.slug),
      })),
    };
  },
  ["catalog"],
  { tags: [CATALOG_TAG], revalidate: 3600 },
);

// Convenience accessors over the cached catalogue.
export async function getProduct(slug: string) {
  return (await getCatalog()).products.find((p) => p.slug === slug);
}
export async function getCategory(slug: string) {
  return (await getCatalog()).categories.find((c) => c.slug === slug);
}
export async function getCollection(slug: string) {
  return (await getCatalog()).collections.find((c) => c.slug === slug);
}
export function bySlugs(products: Product[], slugs: string[]) {
  const m = new Map(products.map((p) => [p.slug, p]));
  return slugs.map((s) => m.get(s)).filter((p): p is Product => !!p);
}
