/**
 * STORE CONFIGURATION
 * -------------------
 * Business facts that drive the storefront. Anything left as null / empty is
 * hidden from the UI rather than invented. Fill these in with OSA Techstore's
 * real details before launch.
 */
export const store = {
  name: "OSA Techstore",
  legalName: "OSA Techstore",
  tagline: "Good tech. No guesswork.",
  description:
    "OSA Techstore is a technology retailer in Lebanon offering smartphones, laptops, gaming, audio and accessories.",
  country: "Lebanon",
  currency: "USD" as const,

  /** True while src/data/products.ts holds sample data. Shows a visible notice. */
  sampleCatalog: true,

  // Contact details — shown only when set.
  contact: {
    phone: null as string | null, // e.g. "+961 1 234 567"
    whatsapp: null as string | null, // e.g. "+96170123456"
    email: null as string | null, // e.g. "hello@osatechstore.com"
    address: null as string | null,
    hours: null as string | null, // e.g. "Mon–Sat, 10:00–19:00"
  },

  // Social links — only configured networks are rendered.
  social: {
    instagram: "",
    facebook: "",
    tiktok: "",
    youtube: "",
  },

  /** Lebanese governorates offered at checkout. */
  deliveryAreas: [
    "Beirut",
    "Mount Lebanon",
    "North",
    "Akkar",
    "Bekaa",
    "Baalbek-Hermel",
    "South",
    "Nabatieh",
  ],

  /**
   * Delivery methods. `feeUSD: null` means the fee is confirmed with the
   * customer when the order is confirmed by phone — no fee is invented.
   */
  deliveryMethods: [
    {
      id: "home-delivery",
      label: "Home delivery",
      description: "Delivered to your address anywhere in Lebanon. Fee and timing are confirmed when we call you.",
      feeUSD: null as number | null,
    },
  ],

  /**
   * Payment methods actually offered. Online card payment is NOT enabled:
   * no payment processor is connected, so orders are placed as requests.
   */
  paymentMethods: [
    {
      id: "cod",
      label: "Cash on delivery",
      description: "Pay in cash (USD) when your order arrives.",
    },
  ],

  features: {
    accounts: true,
    newsletter: true,
    /** Discount codes are validated server-side in src/server/discounts.ts. */
    discountCodes: false,
  },

  /**
   * Store advantages shown in "Why OSA?". Each item must be true for the
   * business — remove any that are not.
   */
  advantages: [
    { id: "authentic", title: "Authentic products", body: "Genuine devices from established brands — no grey-market guesswork." },
    { id: "warranty", title: "Warranty support", body: "Warranty terms are listed on each product. We help you use them." },
    { id: "delivery", title: "Delivery across Lebanon", body: "From Beirut to the Bekaa, we deliver to every governorate." },
    { id: "support", title: "Real assistance", body: "Questions before or after you buy? Talk to a person who knows the product." },
  ],
};

export type DeliveryMethodId = (typeof store.deliveryMethods)[number]["id"];
export type PaymentMethodId = (typeof store.paymentMethods)[number]["id"];

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
