/**
 * Seeds the database with the sample catalogue, categories, collections and
 * default settings — and creates the first admin from ADMIN_EMAIL /
 * ADMIN_PASSWORD when those are set.
 *
 *   npm run db:seed            (only fills empty tables)
 *   npm run db:seed -- --reset (deletes catalogue data first)
 */
import { PrismaClient } from "@prisma/client";
import { resolveDatabaseEnv } from "./resolve-env.mjs";
import { randomBytes, scrypt as _scrypt } from "node:crypto";
import { promisify } from "node:util";
import { products } from "../src/data/products.ts";
import { categories } from "../src/data/categories.ts";
import { collections } from "../src/data/collections.ts";
import { artViews, viewLabels } from "../src/data/art-views.ts";
import { campaign } from "../src/data/promotions.ts";
import { announcements } from "../src/config/announcements.ts";
import { storeDefaults } from "../src/config/store-defaults.ts";

const db = new PrismaClient({ datasourceUrl: resolveDatabaseEnv().databaseUrl || undefined });
const scrypt = promisify(_scrypt) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;
const cents = (n: number) => Math.round(n * 100);

async function main() {
  const reset = process.argv.includes("--reset");
  if (reset) {
    await db.collectionProduct.deleteMany();
    await db.collection.deleteMany();
    await db.product.deleteMany();
    await db.category.deleteMany();
    console.log("Cleared catalogue tables.");
  }

  if ((await db.category.count()) === 0) {
    await db.category.createMany({ data: categories.map((c) => ({ ...c })) });
    console.log(`Seeded ${categories.length} categories.`);
  }

  if ((await db.product.count()) === 0) {
    for (const [i, p] of products.entries()) {
      await db.product.create({
        data: {
          slug: p.slug,
          brand: p.brand,
          name: p.name,
          model: p.model,
          categorySlug: p.category,
          tagline: p.tagline,
          description: p.description,
          priceCents: cents(p.price),
          compareAtCents: p.compareAtPrice ? cents(p.compareAtPrice) : null,
          stock: p.stock,
          configLabel: p.configLabel ?? null,
          artKind: p.art.kind,
          artVariant: p.art.variant ?? null,
          highlights: p.highlights,
          specs: p.specs,
          warranty: p.warranty,
          inTheBox: p.inTheBox ?? [],
          tags: p.tags,
          isNew: !!p.isNew,
          releaseYear: p.releaseYear,
          pairsWith: p.pairsWith ?? [],
          sortOrder: i,
          colors: {
            create: p.colors.map((c, pos) => ({
              key: c.id,
              name: c.name,
              swatch: c.swatch,
              body: c.body,
              accent: c.accent ?? null,
              soldOut: !!p.soldOutColors?.includes(c.id),
              position: pos,
            })),
          },
          configs: { create: (p.configs ?? []).map((c, pos) => ({ key: c.id, label: c.label, priceDeltaCents: cents(c.priceDelta), position: pos })) },
          images: {
            create: p.colors.flatMap((c, ci) =>
              artViews[p.art.kind].map((view, vi) => ({
                colorKey: c.id,
                url: `/products/${p.slug}/${c.id}-${view}.svg`,
                label: viewLabels[view] ?? view,
                alt: `${p.brand} ${p.name} in ${c.name} — ${(viewLabels[view] ?? view).toLowerCase()} view`,
                position: ci * 100 + vi,
              })),
            ),
          },
        },
      });
    }
    console.log(`Seeded ${products.length} products.`);
  }

  if ((await db.collection.count()) === 0) {
    const ids = new Map((await db.product.findMany({ select: { id: true, slug: true } })).map((p) => [p.slug, p.id]));
    for (const c of collections) {
      await db.collection.create({
        data: {
          slug: c.slug,
          index: c.index,
          title: c.title,
          kicker: c.kicker,
          description: c.description,
          tone: c.tone,
          coverProduct: c.coverProduct,
          products: { create: c.products.filter((s) => ids.has(s)).map((s, pos) => ({ productId: ids.get(s)!, position: pos })) },
        },
      });
    }
    console.log(`Seeded ${collections.length} collections.`);
  }

  const settings: [string, unknown][] = [
    ["store", storeDefaults],
    ["announcements", announcements],
    ["campaign", campaign],
  ];
  for (const [key, value] of settings) {
    await db.setting.upsert({ where: { key }, create: { key, value: value as object }, update: {} });
  }

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    if (password.length < 10) {
      console.warn("⚠ ADMIN_PASSWORD must be at least 10 characters — admin account not created. Fix it and redeploy.");
      return;
    }
    const salt = randomBytes(16);
    const hash = `scrypt$${salt.toString("base64")}$${(await scrypt(password, salt, 64)).toString("base64")}`;
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      if (existing.role !== "ADMIN") await db.user.update({ where: { email }, data: { role: "ADMIN", sessionVersion: { increment: 1 } } });
      console.log(`Admin account ready: ${email} (existing password kept)`);
    } else {
      await db.user.create({ data: { email, name: "Store admin", passwordHash: hash, role: "ADMIN" } });
      console.log(`Created admin account: ${email}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
