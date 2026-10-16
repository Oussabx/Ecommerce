export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
export type { StoreSettings, SiteSettings, Campaign, DeliveryMethod, PaymentMethod } from "./store-defaults";
