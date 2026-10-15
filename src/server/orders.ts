import "server-only";
import { randomInt } from "node:crypto";
import { getProduct, priceFor, availability, primaryImage } from "@/lib/catalog";
import { store } from "@/config/store";
import { mutate, readAll, findOne } from "./store";
import type { OrderInput } from "./validation";

export type OrderStatus = "received" | "confirmed" | "out-for-delivery" | "delivered" | "cancelled";

export interface OrderLine {
  slug: string;
  name: string;
  brand: string;
  colorId: string;
  colorName: string;
  configId?: string;
  configLabel?: string;
  unitPrice: number;
  quantity: number;
  image: string;
}

export interface Order {
  ref: string;
  idempotencyKey: string;
  userId: string | null;
  status: OrderStatus;
  createdAt: string;
  customer: OrderInput["customer"];
  address: OrderInput["address"];
  deliveryMethod: { id: string; label: string; feeUSD: number | null };
  paymentMethod: { id: string; label: string };
  lines: OrderLine[];
  subtotal: number;
  /** null when the delivery fee is confirmed by phone. */
  deliveryFee: number | null;
  total: number;
}

export class OrderError extends Error {
  constructor(
    message: string,
    public field?: string,
  ) {
    super(message);
  }
}

const REF_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const newRef = () => "OSA-" + Array.from({ length: 6 }, () => REF_ALPHABET[randomInt(REF_ALPHABET.length)]).join("");

/**
 * Price and validate an order entirely from server-side catalog data.
 * Client-sent prices are never trusted.
 */
export function priceOrder(input: OrderInput) {
  const lines: OrderLine[] = input.items.map((item, i) => {
    const product = getProduct(item.slug);
    if (!product) throw new OrderError("One of the products in your cart is no longer available.", `items.${i}`);
    const color = product.colors.find((c) => c.id === item.colorId);
    if (!color) throw new OrderError(`Choose an available colour for ${product.name}.`, `items.${i}`);
    const config = product.configs?.length ? product.configs.find((c) => c.id === item.configId) : undefined;
    if (product.configs?.length && !config) throw new OrderError(`Choose an available option for ${product.name}.`, `items.${i}`);
    if (availability(product, color.id) === "out-of-stock") {
      throw new OrderError(`${product.name} (${color.name}) is out of stock. Please remove it from your cart.`, `items.${i}`);
    }
    return {
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      colorId: color.id,
      colorName: color.name,
      configId: config?.id,
      configLabel: config?.label,
      unitPrice: priceFor(product, config?.id).price,
      quantity: item.quantity,
      image: primaryImage(product, color.id).src,
    };
  });

  // Inventory check across lines for the same product.
  const qty = new Map<string, number>();
  for (const l of lines) qty.set(l.slug, (qty.get(l.slug) ?? 0) + l.quantity);
  for (const [slug, q] of qty) {
    const p = getProduct(slug)!;
    if (q > p.stock) throw new OrderError(`Only ${p.stock} × ${p.name} available. Please reduce the quantity.`);
  }

  const delivery = store.deliveryMethods.find((d) => d.id === input.deliveryMethod)!;
  const payment = store.paymentMethods.find((p) => p.id === input.paymentMethod)!;
  const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
  const deliveryFee = delivery.feeUSD;
  return {
    lines,
    subtotal,
    deliveryFee,
    total: subtotal + (deliveryFee ?? 0),
    deliveryMethod: { id: delivery.id, label: delivery.label, feeUSD: delivery.feeUSD },
    paymentMethod: { id: payment.id, label: payment.label },
  };
}

export async function createOrder(input: OrderInput, userId: string | null): Promise<Order> {
  if (input.discountCode && !store.features.discountCodes) {
    throw new OrderError("Discount codes are not available right now.", "discountCode");
  }
  const priced = priceOrder(input);
  return mutate<Order, Order>("orders", (orders) => {
    const existing = orders.find((o) => o.idempotencyKey === input.idempotencyKey);
    if (existing) return existing;
    let ref = newRef();
    while (orders.some((o) => o.ref === ref)) ref = newRef();
    const order: Order = {
      ref,
      idempotencyKey: input.idempotencyKey,
      userId,
      status: "received",
      createdAt: new Date().toISOString(),
      customer: input.customer,
      address: input.address,
      ...priced,
    };
    orders.push(order);
    return order;
  });
}

export const getOrder = (ref: string) => findOne<Order>("orders", (o) => o.ref === ref);
export const ordersForUser = async (userId: string) =>
  (await readAll<Order>("orders"))
    .filter((o) => o.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

export const statusLabel: Record<OrderStatus, string> = {
  received: "Received — awaiting confirmation",
  confirmed: "Confirmed",
  "out-for-delivery": "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};
