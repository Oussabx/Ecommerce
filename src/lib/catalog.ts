// Pure catalogue helpers — safe on server and client. Data is loaded on the
// server by src/server/catalog.ts and passed to the client via ShopDataProvider.
import type { Category, Product } from "@/data/types";

export const PLACEHOLDER_IMAGE = "/placeholder-product.svg";

export interface ProductImage {
  src: string;
  alt: string;
  label: string;
}

/** Gallery images for a product colour (colour-specific first, then shared images). */
export function productImages(product: Product, colorId?: string): ProductImage[] {
  const color = product.colors.find((c) => c.id === colorId) ?? product.colors[0];
  const own = [...(product.images?.[color?.id ?? ""] ?? []), ...(product.images?.["*"] ?? [])];
  if (own.length) {
    return own.map((im, i) => ({
      src: im.src,
      alt: im.alt || `${product.brand} ${product.name}${color ? ` in ${color.name}` : ""}, image ${i + 1}`,
      label: im.label || `Image ${i + 1}`,
    }));
  }
  return [{ src: PLACEHOLDER_IMAGE, alt: `${product.brand} ${product.name}`, label: "No image yet" }];
}

export const primaryImage = (product: Product, colorId?: string): ProductImage =>
  productImages(product, colorId)[0] ?? { src: PLACEHOLDER_IMAGE, alt: product.name, label: "Image" };

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
export function relatedProducts(product: Product, all: Product[], limit = 4) {
  return all
    .filter((p) => p.slug !== product.slug)
    .map((p) => ({
      p,
      score: (p.category === product.category ? 3 : 0) + p.tags.filter((t) => product.tags.includes(t)).length + (p.brand === product.brand ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.p);
}

/** Minimal product shape for cards, rails and search. */
export interface ProductSummary {
  slug: string;
  brand: string;
  name: string;
  category: string;
  categoryName: string;
  categoryCode: string;
  price: number;
  compareAt?: number;
  image: string;
  hoverImage?: string;
  colors: { id: string; name: string; swatch: string }[];
  availability: Availability;
  isNew?: boolean;
  tags: string[];
  model: string;
  highlights: string[];
  releaseYear: number;
}

export function summarize(p: Product, categories: Pick<Category, "slug" | "name" | "code">[] = []): ProductSummary {
  const imgs = productImages(p);
  const { price, compareAt } = priceFor(p);
  const cat = categories.find((c) => c.slug === p.category);
  return {
    slug: p.slug,
    brand: p.brand,
    name: p.name,
    category: p.category,
    categoryName: cat?.name ?? p.category,
    categoryCode: cat?.code ?? "",
    price,
    compareAt,
    image: imgs[0]?.src ?? PLACEHOLDER_IMAGE,
    hoverImage: imgs[1]?.src,
    colors: p.colors.map(({ id, name, swatch }) => ({ id, name, swatch })),
    availability: availability(p),
    isNew: p.isNew,
    tags: p.tags,
    model: p.model,
    highlights: p.highlights.map((h) => h.value),
    releaseYear: p.releaseYear,
  };
}

/** Strip long-form fields before sending a product to the browser. */
export const toClientProduct = (p: Product): Product => ({ ...p, description: "", specs: [], inTheBox: undefined });
