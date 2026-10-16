"use client";
import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Category, Product } from "@/data/types";
import type { SiteSettings } from "@/config/store";
import { summarize, type ProductSummary } from "@/lib/catalog";

interface ShopData {
  products: Product[];
  categories: Category[];
  settings: SiteSettings;
  getProduct: (slug: string) => Product | undefined;
  summaries: ProductSummary[];
}

const Ctx = createContext<ShopData | null>(null);

/** Catalogue (trimmed) and public settings, loaded on the server in the root layout. */
export function ShopDataProvider({ products, categories, settings, children }: { products: Product[]; categories: Category[]; settings: SiteSettings; children: ReactNode }) {
  const value = useMemo<ShopData>(() => {
    const map = new Map(products.map((p) => [p.slug, p]));
    return { products, categories, settings, getProduct: (s) => map.get(s), summaries: products.map((p) => summarize(p, categories)) };
  }, [products, categories, settings]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useShopData() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useShopData must be used inside ShopDataProvider");
  return ctx;
}
export const useSettings = () => useShopData().settings;
