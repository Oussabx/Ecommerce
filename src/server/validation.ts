import { z } from "zod";

const phoneRe = /^\+?[0-9 ()-]{7,20}$/;
const trimmed = (max: number) => z.string().trim().max(max);

export const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email address.").max(200);
export const phoneSchema = z
  .string()
  .trim()
  .regex(phoneRe, "Enter a valid phone number, e.g. +961 70 123 456.")
  .refine((v) => v.replace(/\D/g, "").length >= 7, "Enter a valid phone number.");
export const passwordSchema = z.string().min(8, "Use at least 8 characters.").max(200);

export const addressSchema = z.object({
  line1: trimmed(200).min(3, "Enter your street and building."),
  line2: trimmed(200).optional().default(""),
  city: trimmed(100).min(2, "Enter your city or town."),
  /** Checked against the configured delivery areas in the handler. */
  area: trimmed(60).min(1, "Choose a governorate."),
  notes: trimmed(500).optional().default(""),
});

export const orderSchema = z.object({
  customer: z.object({
    firstName: trimmed(80).min(1, "Enter your first name."),
    lastName: trimmed(80).min(1, "Enter your last name."),
    email: emailSchema,
    phone: phoneSchema,
  }),
  address: addressSchema,
  deliveryMethod: trimmed(60).min(1),
  paymentMethod: trimmed(60).min(1),
  items: z
    .array(
      z.object({
        slug: trimmed(120),
        colorId: trimmed(60),
        configId: trimmed(60).optional(),
        quantity: z.number().int().min(1).max(10),
      }),
    )
    .min(1, "Your cart is empty.")
    .max(30),
  discountCode: trimmed(40).optional(),
  acceptTerms: z.literal(true, { errorMap: () => ({ message: "Please accept the terms to place your order." }) }),
  /** Client-generated id so a retried submission does not create a duplicate order. */
  idempotencyKey: z.string().uuid(),
});
export type OrderInput = z.infer<typeof orderSchema>;

export const loginSchema = z.object({ email: emailSchema, password: z.string().min(1, "Enter your password.").max(200) });
export const contactSchema = z.object({
  name: trimmed(120).min(1, "Enter your name."),
  email: emailSchema,
  phone: z.union([phoneSchema, z.literal("")]).optional(),
  topic: z.enum(["product", "order", "warranty", "other"]),
  message: trimmed(3000).min(10, "Tell us a little more (10+ characters)."),
});

/** Flatten zod errors to { "customer.email": "message" } for forms. */
export function fieldErrors(err: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
