import "server-only";
import { PrismaClient } from "@prisma/client";

// Reuse one client across hot reloads in development.
// Accept the variable names set by Vercel's Neon / Supabase integrations too.
const datasourceUrl = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL;

const g = globalThis as unknown as { prisma?: PrismaClient };
export const db =
  g.prisma ?? new PrismaClient({ datasourceUrl, log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"] });
if (process.env.NODE_ENV !== "production") g.prisma = db;

/** False when no database is configured: the site then runs read-only on the built-in sample catalogue. */
export const hasDatabase = Boolean(datasourceUrl);

export const toCents = (usd: number) => Math.round(usd * 100);
export const fromCents = (cents: number) => cents / 100;
