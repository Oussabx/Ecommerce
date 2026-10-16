/**
 * Production build used by Vercel (`npm run vercel-build`):
 *   1. resolves database variables (the site also builds without a database)
 *   2. applies database migrations
 *   3. seeds empty tables (sample catalogue, settings, first admin)
 *   4. builds Next.js
 */
import { spawnSync } from "node:child_process";
import { resolveDatabaseEnv } from "./resolve-env.mjs";

const { databaseUrl, directUrl } = resolveDatabaseEnv();
const env = { ...process.env, DATABASE_URL: databaseUrl, DIRECT_URL: directUrl };

if (databaseUrl && !/^postgres(ql)?:\/\//.test(databaseUrl)) {
  console.error("\n✖ DATABASE_URL must start with postgresql:// or postgres://\n");
  process.exit(1);
}

const run = (cmd, args) => {
  console.log(`\n▶ ${cmd} ${args.join(" ")}`);
  const r = spawnSync(cmd, args, { stdio: "inherit", env, shell: process.platform === "win32" });
  if (r.status !== 0) process.exit(r.status ?? 1);
};

if (databaseUrl) {
  run("npx", ["prisma", "migrate", "deploy"]);
  run("node", ["--no-warnings", "scripts/seed.mts"]);
} else {
  console.warn("\n⚠ No database connected — deploying the read-only storefront with the built-in sample catalogue.");
  console.warn("  Orders, accounts and the admin switch on once you connect one:");
  console.warn("  Vercel → Storage → Create Database → Neon → Connect (leave the prefix empty) → Redeploy.\n");
}
run("npx", ["next", "build"]);
