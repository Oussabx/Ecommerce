import type { OrderStatus } from "@prisma/client";

/** Allowed order status changes. Cancelling returns reserved stock. */
export const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  RECEIVED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["OUT_FOR_DELIVERY", "CANCELLED"],
  OUT_FOR_DELIVERY: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};

export const transitionLabel: Record<OrderStatus, string> = {
  RECEIVED: "Reopen",
  CONFIRMED: "Confirm order",
  OUT_FOR_DELIVERY: "Mark out for delivery",
  DELIVERED: "Mark delivered",
  CANCELLED: "Cancel order",
};
