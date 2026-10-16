import "server-only";
import { PrismaClient } from "@prisma/client";

// Reuse one client across hot reloads in development.
const g = globalThis as unknown as { prisma?: PrismaClient };
export const db = g.prisma ?? new PrismaClient({ log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"] });
if (process.env.NODE_ENV !== "production") g.prisma = db;

export const toCents = (usd: number) => Math.round(usd * 100);
export const fromCents = (cents: number) => cents / 100;
