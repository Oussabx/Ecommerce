import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/store";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/admin", "/cart", "/checkout", "/order/", "/search", "/wishlist"] }],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
