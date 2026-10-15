// Catalog types. All product, category and collection data lives in src/data
// and is consumed through the helpers in src/lib/catalog.ts.

export type CategorySlug =
  | "smartphones"
  | "computers"
  | "gaming"
  | "audio"
  | "accessories"
  | "smart-devices";

export interface Category {
  slug: CategorySlug;
  /** Index number shown in the editorial category index (01, 02, …). */
  index: number;
  /** Short technical code used as a graphic label, e.g. "SP". */
  code: string;
  name: string;
  /** Long name used in the homepage index. */
  indexName: string;
  description: string;
  /** Product whose image represents the category. */
  coverProduct: string;
}

/** Drawing template used by scripts/generate-product-art.ts. */
export type ArtKind =
  | "phone"
  | "laptop"
  | "headphones"
  | "earbuds"
  | "controller"
  | "console"
  | "handheld"
  | "watch"
  | "tablet"
  | "speaker"
  | "charger"
  | "powerbank"
  | "cable"
  | "puck"
  | "mouse"
  | "keyboard";

export interface ColorOption {
  id: string;
  name: string;
  /** Swatch colour shown in the variant picker. */
  swatch: string;
  /** Base material colour used for the product render. */
  body: string;
  /** Secondary colour (screen wallpaper, trim, second tone). */
  accent?: string;
}

export interface ConfigOption {
  id: string;
  label: string;
  /** Added to the product base price, in USD. */
  priceDelta: number;
}

export interface SpecGroup {
  group: string;
  rows: [label: string, value: string][];
}

export interface Product {
  slug: string;
  brand: string;
  name: string;
  /** Manufacturer model / part reference shown in the technical header. */
  model: string;
  category: CategorySlug;
  tagline: string;
  description: string;
  /** Base price in USD for the first configuration. */
  price: number;
  /** Previous price in USD. Only set when a real, configured price drop exists. */
  compareAtPrice?: number;
  /** Units available. 0 = out of stock. */
  stock: number;
  colors: ColorOption[];
  /** Colour ids that are currently unavailable. */
  soldOutColors?: string[];
  configs?: ConfigOption[];
  /** Label for the configuration picker ("Storage", "Memory / SSD", "Case size"). */
  configLabel?: string;
  art: { kind: ArtKind; variant?: string };
  /**
   * Real photography overrides, keyed by colour id. When present these are used
   * instead of the generated renders in public/products.
   */
  images?: Record<string, string[]>;
  highlights: { label: string; value: string }[];
  specs: SpecGroup[];
  /** Warranty text. null = not yet confirmed; the UI will say so. */
  warranty: string | null;
  inTheBox?: string[];
  /** Free-form attributes used by search and curated collections. */
  tags: string[];
  isNew?: boolean;
  releaseYear: number;
  /** Product slugs suggested as "frequently bought together". */
  pairsWith?: string[];
}

export interface Collection {
  slug: string;
  index: number;
  title: string;
  kicker: string;
  description: string;
  tone: "lime" | "ink" | "paper" | "cobalt" | "stone" | "sand";
  coverProduct: string;
  products: string[];
}
