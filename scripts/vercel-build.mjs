/**
 * Production build used by Vercel (`npm run vercel-build`):
 *   1. checks required environment variables and explains what's missing
 *   2. applies database migrations
 *   3. seeds empty tables (sample catalogue, settings, first admin)
 *   4. builds Next.js
 */
import { spawnSync } from "node:child_process";
import { resolveDatabaseEnv } from "./resolve-env.mjs";

const { databaseUrl, directUrl } = resolveDatabaseEnv();
const env = { ...process.env, DATABASE_URL: databaseUrl, DIRECT_URL: directUrl };

const problems = [];
if (!databaseUrl) problems.push("DATABASE_URL — your Postgres connection string (Vercel → Storage → connect a Neon database sets this automatically).");
else if (!/^postgres(ql)?:\/\//.test(databaseUrl)) problems.push("DATABASE_URL must start with postgresql:// or postgres://");

if (problems.length) {
  console.error("\n✖ Build stopped: missing or invalid environment variables.\n");
  for (const p of problems) console.error("  • " + p);
  console.error("\nAdd them in Vercel → Project → Settings → Environment Variables (Production and Preview), then redeploy.\n");
  process.exit(1);
}

const run = (cmd, args) => {
  console.log(`\n▶ ${cmd} ${args.join(" ")}`);
  const r = spawnSync(cmd, args, { stdio: "inherit", env, shell: process.platform === "win32" });
  if (r.status !== 0) process.exit(r.status ?? 1);
};

run("npx", ["prisma", "migrate", "deploy"]);
run("node", ["--no-warnings", "scripts/seed.mts"]);
run("npx", ["next", "build"]);
