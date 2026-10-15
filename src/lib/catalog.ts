import { products } from "@/data/products";
import { categories } from "@/data/categories";
import { collections } from "@/data/collections";
import { artViews, viewLabels } from "@/data/art-views";
import type { CategorySlug, Product } from "@/data/types";

export { products, categories, collections };

const bySlug = new Map(products.map((p) => [p.slug, p]));

export const getProduct = (slug: string) => bySlug.get(slug);
export const getCategory = (slug: string) => categories.find((c) => c.slug === slug);
export const getCollection = (slug: string) => collections.find((c) => c.slug === slug);
export const productsInCategory = (slug: CategorySlug) => products.filter((p) => p.category === slug);
export const productsBySlugs = (slugs: string[]) => slugs.map((s) => bySlug.get(s)).filter((p): p is Product => !!p);
export const brands = Array.from(new Set(products.map((p) => p.brand))).sort();

export interface ProductImage {
  src: string;
  alt: string;
  label: string;
}

/** Gallery images for a product colour (real photography if configured, else generated renders). */
export function productImages(product: Product, colorId?: string): ProductImage[] {
  const color = product.colors.find((c) => c.id === colorId) ?? product.colors[0];
  const override = product.images?.[color.id];
  if (override?.length) {
    return override.map((src, i) => ({ src, alt: `${product.brand} ${product.name} in ${color.name}, image ${i + 1}`, label: `Image ${i + 1}` }));
  }
  return artViews[product.art.kind].map((view) => ({
    src: `/products/${product.slug}/${color.id}-${view}.svg`,
    alt: `${product.brand} ${product.name} in ${color.name} — ${viewLabels[view]?.toLowerCase() ?? view} view`,
    label: viewLabels[view] ?? view,
  }));
}

export const primaryImage = (product: Product, colorId?: string) => productImages(product, colorId)[0];

export function priceFor(product: Product, configId?: string) {
  const cfg = product.configs?.find((c) => c.id === configId) ?? product.configs?.[0];
  const delta = cfg?.priceDelta ?? 0;
  return {
    price: product.price + delta,
    compareAt: product.compareAtPrice ? product.compareAtPrice + delta : undefined,
  };
}

export const discountPercent = (price: number, compareAt?: number) =>
  compareAt && compareAt > price ? Math.round(((compareAt - price) / compareAt) * 100) : 0;

export type Availability = "in-stock" | "low-stock" | "out-of-stock";
export const LOW_STOCK_THRESHOLD = 3;
export function availability(product: Product, colorId?: string): Availability {
  if (product.stock <= 0) return "out-of-stock";
  if (colorId && product.soldOutColors?.includes(colorId)) return "out-of-stock";
  if (product.stock <= LOW_STOCK_THRESHOLD) return "low-stock";
  return "in-stock";
}

/** Products related by category and shared tags, excluding the product itself. */
export function relatedProducts(product: Product, limit = 4) {
  return products
    .filter((p) => p.slug !== product.slug)
    .map((p) => ({
      p,
      score: (p.category === product.category ? 3 : 0) + p.tags.filter((t) => product.tags.includes(t)).length + (p.brand === product.brand ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.p);
}

export const pairsWith = (product: Product) => productsBySlugs(product.pairsWith ?? []);

/** Minimal product shape sent to client components (search, rails). */
export interface ProductSummary {
  slug: string;
  brand: string;
  name: string;
  category: CategorySlug;
  categoryName: string;
  price: number;
  compareAt?: number;
  image: string;
  hoverImage?: string;
  colors: { id: string; name: string; swatch: string }[];
  availability: Availability;
  warranty: string | null;
  isNew?: boolean;
  tags: string[];
  model: string;
  highlights: string[];
  releaseYear: number;
}

export function summarize(p: Product): ProductSummary {
  const imgs = productImages(p);
  const { price, compareAt } = priceFor(p);
  return {
    slug: p.slug,
    brand: p.brand,
    name: p.name,
    category: p.category,
    categoryName: getCategory(p.category)?.name ?? p.category,
    price,
    compareAt,
    image: imgs[0].src,
    hoverImage: imgs[1]?.src,
    colors: p.colors.map(({ id, name, swatch }) => ({ id, name, swatch })),
    availability: availability(p),
    warranty: p.warranty,
    isNew: p.isNew,
    tags: p.tags,
    model: p.model,
    highlights: p.highlights.map((h) => h.value),
    releaseYear: p.releaseYear,
  };
}

export const allSummaries = () => products.map(summarize);
