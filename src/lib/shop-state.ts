"use client";
import { createPersisted, isStringArray } from "./persisted";
import { priceFor, availability } from "./catalog";
import type { Product } from "@/data/types";

export interface CartItem {
  slug: string;
  colorId: string;
  configId?: string;
  quantity: number;
}

const isCart = (v: unknown): v is CartItem[] =>
  Array.isArray(v) &&
  v.every((i) => i && typeof i.slug === "string" && typeof i.colorId === "string" && Number.isInteger(i.quantity) && i.quantity > 0);

export const MAX_QTY = 10;
export const cartStore = createPersisted<CartItem[]>("osa.cart.v1", [], isCart);
export const wishlistStore = createPersisted<string[]>("osa.wishlist.v1", [], isStringArray);
export const viewedStore = createPersisted<string[]>("osa.viewed.v1", [], isStringArray);
export const searchesStore = createPersisted<string[]>("osa.searches.v1", [], isStringArray);

export const lineKey = (i: Pick<CartItem, "slug" | "colorId" | "configId">) => `${i.slug}|${i.colorId}|${i.configId ?? ""}`;

/** Max quantity allowed for a product, from configured stock. */
export const stockLimit = (product?: Pick<Product, "stock">) => Math.min(MAX_QTY, product?.stock ?? 0);

export function addToCart(item: CartItem, product: Pick<Product, "stock">) {
  cartStore.set((cart) => {
    const key = lineKey(item);
    const limit = stockLimit(product);
    const otherQty = cart.filter((c) => c.slug === item.slug && lineKey(c) !== key).reduce((s, c) => s + c.quantity, 0);
    const existing = cart.find((c) => lineKey(c) === key);
    const max = Math.max(0, limit - otherQty);
    if (existing) return cart.map((c) => (c === existing ? { ...c, quantity: Math.min(max, c.quantity + item.quantity) } : c));
    return [...cart, { ...item, quantity: Math.min(max, item.quantity) }].filter((c) => c.quantity > 0);
  });
}

export function setQuantity(key: string, quantity: number, product: Pick<Product, "stock">) {
  cartStore.set((cart) =>
    cart
      .map((c) => {
        if (lineKey(c) !== key) return c;
        const otherQty = cart.filter((o) => o.slug === c.slug && lineKey(o) !== key).reduce((s, o) => s + o.quantity, 0);
        return { ...c, quantity: Math.max(0, Math.min(stockLimit(product) - otherQty, quantity)) };
      })
      .filter((c) => c.quantity > 0),
  );
}

export const removeFromCart = (key: string) => cartStore.set((cart) => cart.filter((c) => lineKey(c) !== key));
export const clearCart = () => cartStore.set([]);

export function toggleWishlist(slug: string) {
  let added = false;
  wishlistStore.set((list) => {
    added = !list.includes(slug);
    return added ? [slug, ...list] : list.filter((s) => s !== slug);
  });
  return added;
}

export const recordView = (slug: string) => viewedStore.set((v) => [slug, ...v.filter((s) => s !== slug)].slice(0, 12));
export const recordSearch = (q: string) => {
  const t = q.trim();
  if (t.length < 2) return;
  searchesStore.set((v) => [t, ...v.filter((s) => s.toLowerCase() !== t.toLowerCase())].slice(0, 6));
};

/** Resolve cart items against the catalog (drops items whose product was removed). */
export function resolveCart(cart: CartItem[], getProduct: (slug: string) => Product | undefined) {
  const lines = cart
    .map((item) => {
      const product = getProduct(item.slug);
      if (!product) return null;
      const color = product.colors.find((c) => c.id === item.colorId) ?? product.colors[0];
      const config = product.configs?.find((c) => c.id === item.configId);
      const { price } = priceFor(product, config?.id);
      return {
        key: lineKey(item),
        item,
        product,
        color,
        config,
        unitPrice: price,
        lineTotal: price * item.quantity,
        available: availability(product, color.id) !== "out-of-stock",
      };
    })
    .filter((l): l is NonNullable<typeof l> => !!l);
  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const count = lines.reduce((s, l) => s + l.item.quantity, 0);
  return { lines, subtotal, count, hasUnavailable: lines.some((l) => !l.available) };
}
