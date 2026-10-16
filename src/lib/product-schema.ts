import { z } from "zod";

const key = z
  .string()
  .trim()
  .min(1, "Required.")
  .max(40)
  .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and dashes.");
const hex = z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "Use a hex colour like #3B3B3D.");
const text = (max: number) => z.string().trim().max(max);

export const productSchema = z
  .object({
    slug: z.string().trim().min(2, "Required.").max(120).regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and dashes."),
    name: text(160).min(1, "Enter a product name."),
    brand: text(80).min(1, "Enter a brand."),
    model: text(80),
    categorySlug: text(60).min(1, "Choose a category."),
    tagline: text(240),
    description: text(5000),
    price: z.coerce.number({ invalid_type_error: "Enter a price." }).min(0, "Price can't be negative.").max(100000),
    compareAtPrice: z.union([z.literal(""), z.coerce.number().min(0)]).transform((v) => (v === "" ? null : v)),
    stock: z.coerce.number().int("Whole units only.").min(0, "Stock can't be negative.").max(100000),
    published: z.boolean(),
    isNew: z.boolean(),
    releaseYear: z.coerce.number().int().min(1990).max(2100),
    sortOrder: z.coerce.number().int().min(0).max(100000),
    configLabel: text(60),
    artKind: text(30),
    colors: z
      .array(z.object({ key, name: text(80).min(1, "Name the colour."), swatch: hex, soldOut: z.boolean() }))
      .min(1, "Add at least one colour or finish."),
    configs: z.array(z.object({ key, label: text(80).min(1, "Label required."), priceDelta: z.coerce.number().min(-100000).max(100000) })),
    images: z.array(z.object({ url: text(1000).min(1), colorKey: z.string().nullable(), label: text(80), alt: text(240) })),
    highlights: z.array(z.object({ label: text(60).min(1), value: text(120).min(1) })).max(8),
    specs: z.array(z.object({ group: text(80).min(1, "Name the group."), rows: z.array(z.tuple([text(80).min(1), text(400).min(1)])) })),
    inTheBox: z.array(text(160).min(1)),
    tags: z.array(text(40).min(1)),
    pairsWith: z.array(text(120).min(1)).max(8),
  })
  .superRefine((p, ctx) => {
    if (p.compareAtPrice !== null && p.compareAtPrice <= p.price)
      ctx.addIssue({ code: "custom", path: ["compareAtPrice"], message: "The previous price must be higher than the current price — or leave it empty." });
    const dup = (arr: { key: string }[]) => arr.find((x, i) => arr.findIndex((y) => y.key === x.key) !== i);
    if (dup(p.colors)) ctx.addIssue({ code: "custom", path: ["colors"], message: "Each colour needs a unique id." });
    if (dup(p.configs)) ctx.addIssue({ code: "custom", path: ["configs"], message: "Each option needs a unique id." });
    for (const im of p.images)
      if (im.colorKey && !p.colors.some((c) => c.key === im.colorKey))
        ctx.addIssue({ code: "custom", path: ["images"], message: "An image is assigned to a colour that no longer exists." });
  });
export type ProductInput = z.input<typeof productSchema>;
