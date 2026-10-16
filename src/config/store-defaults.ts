/**
 * Default store settings. On first run these are copied into the database
 * (Setting "store"); after that they are edited in Admin → Settings.
 * Anything left null / empty is hidden on the site rather than invented.
 */
export interface DeliveryMethod {
  id: string;
  label: string;
  description: string;
  /** null = fee confirmed by phone */
  feeUSD: number | null;
}
export interface PaymentMethod {
  id: string;
  label: string;
  description: string;
}
export interface StoreSettings {
  name: string;
  legalName: string;
  tagline: string;
  description: string;
  country: string;
  sampleCatalog: boolean;
  contact: { phone: string | null; whatsapp: string | null; email: string | null; address: string | null; hours: string | null };
  social: { instagram: string; facebook: string; tiktok: string; youtube: string };
  deliveryAreas: string[];
  deliveryMethods: DeliveryMethod[];
  paymentMethods: PaymentMethod[];
  advantages: { id: string; title: string; body: string }[];
  /** Email that receives new-order notifications (when email is connected). */
  orderNotificationEmail: string | null;
}

export const storeDefaults: StoreSettings = {
  name: "OSA Techstore",
  legalName: "OSA Techstore",
  tagline: "Good tech. No guesswork.",
  description: "OSA Techstore is a technology retailer in Lebanon offering smartphones, laptops, gaming, audio and accessories.",
  country: "Lebanon",
  sampleCatalog: true,
  contact: { phone: null, whatsapp: null, email: null, address: null, hours: null },
  social: { instagram: "", facebook: "", tiktok: "", youtube: "" },
  deliveryAreas: ["Beirut", "Mount Lebanon", "North", "Akkar", "Bekaa", "Baalbek-Hermel", "South", "Nabatieh"],
  deliveryMethods: [
    {
      id: "home-delivery",
      label: "Home delivery",
      description: "Delivered to your address anywhere in Lebanon. Fee and timing are confirmed when we call you.",
      feeUSD: null,
    },
  ],
  paymentMethods: [{ id: "cod", label: "Cash on delivery", description: "Pay in cash (USD) when your order arrives." }],
  advantages: [
    { id: "authentic", title: "Authentic products", body: "Genuine devices from established brands — no grey-market guesswork." },
    { id: "warranty", title: "Warranty support", body: "Warranty terms are listed on each product. We help you use them." },
    { id: "delivery", title: "Delivery across Lebanon", body: "From Beirut to the Bekaa, we deliver to every governorate." },
    { id: "support", title: "Real assistance", body: "Questions before or after you buy? Talk to a person who knows the product." },
  ],
  orderNotificationEmail: null,
};

export interface Campaign {
  enabled: boolean;
  eyebrow: string;
  headline: [string, string];
  body: string;
  heroProduct: string;
  heroColor: string;
  supporting: string[];
  cta: { label: string; href: string };
}

export interface SiteSettings {
  store: StoreSettings;
  announcements: string[];
  campaign: Campaign;
}
