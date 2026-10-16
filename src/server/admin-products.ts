import "server-only";
import type { ProductInput } from "@/lib/product-schema";
import type { DbProduct } from "./catalog";
import { fromCents } from "./db";

/** Database product → editable form values. */
export function toProductInput(p: DbProduct): ProductInput {
  return {
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    model: p.model,
    categorySlug: p.categorySlug,
    tagline: p.tagline,
    description: p.description,
    price: fromCents(p.priceCents),
    compareAtPrice: p.compareAtCents === null ? "" : fromCents(p.compareAtCents),
    stock: p.stock,
    published: p.published,
    isNew: p.isNew,
    releaseYear: p.releaseYear,
    sortOrder: p.sortOrder,
    configLabel: p.configLabel ?? "",
    artKind: p.artKind,
    colors: p.colors.map((c) => ({ key: c.key, name: c.name, swatch: c.swatch, soldOut: c.soldOut })),
    configs: p.configs.map((c) => ({ key: c.key, label: c.label, priceDelta: fromCents(c.priceDeltaCents) })),
    // Group by colour (shared first, then in colour order) so the editor reads naturally.
    images: [...p.images]
      .sort((a, b) => (a.colorKey ? p.colors.findIndex((c) => c.key === a.colorKey) + 1 : 0) - (b.colorKey ? p.colors.findIndex((c) => c.key === b.colorKey) + 1 : 0) || a.position - b.position)
      .map((im) => ({ url: im.url, colorKey: im.colorKey, label: im.label, alt: im.alt })),
    highlights: (p.highlights as ProductInput["highlights"]) ?? [],
    specs: (p.specs as ProductInput["specs"]) ?? [],
    inTheBox: p.inTheBox,
    tags: p.tags,
    pairsWith: p.pairsWith,
  };
}
