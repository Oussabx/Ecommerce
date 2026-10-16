/**
 * Resolve database URLs from whatever the hosting provider sets.
 * Vercel's Neon / Supabase integrations use different variable names than
 * Prisma expects, so map them onto DATABASE_URL / DIRECT_URL.
 */
export function resolveDatabaseEnv(env = process.env) {
  const databaseUrl = env.DATABASE_URL || env.POSTGRES_PRISMA_URL || env.POSTGRES_URL || "";
  const directUrl = env.DIRECT_URL || env.DATABASE_URL_UNPOOLED || env.POSTGRES_URL_NON_POOLING || databaseUrl;
  return { databaseUrl, directUrl };
}
