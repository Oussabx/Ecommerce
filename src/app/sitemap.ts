import type { MetadataRoute } from "next";
import { getCatalog } from "@/server/catalog";
import { siteUrl } from "@/config/store";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { categories, collections, products } = await getCatalog();
  const now = new Date();
  const staticPaths = ["", "/shop", "/deals", "/collections", "/about", "/contact", "/faq", "/delivery", "/returns", "/warranty", "/privacy", "/terms"];
  return [
    ...staticPaths.map((p) => ({ url: `${siteUrl}${p}`, lastModified: now, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.6 })),
    ...categories.map((c) => ({ url: `${siteUrl}/category/${c.slug}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.8 })),
    ...collections.map((c) => ({ url: `${siteUrl}/collections/${c.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.6 })),
    ...products.map((p) => ({ url: `${siteUrl}/product/${p.slug}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.9 })),
  ];
}
