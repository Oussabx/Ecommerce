# OSA Techstore

Storefront for **OSA Techstore**, a technology retailer in Lebanon. Built with Next.js 15 (App Router), TypeScript and Tailwind CSS 4.

The design system is called the **OSA Signal System**: warm off-white paper (`#F5F3EE`), near-black ink (`#171816`), an electric chartreuse signal colour (`#D5FF45`) and cobalt (`#2340E8`) used sparingly for interaction. Type is condensed Archivo for display, Inter for the interface and JetBrains Mono for technical labels. Layouts use thin rules, index numbers and square corners.

> **Status: demo-ready, not launch-ready.** The catalogue is sample data and the data store is a local JSON file. See [Going live](#going-live).

## Quick start

```bash
npm install
cp .env.example .env.local   # set SESSION_SECRET (openssl rand -hex 32)
npm run dev                  # http://localhost:3000
```

| Script | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server (needs `SESSION_SECRET`) |
| `npm run typecheck` / `npm run lint` | Static checks |
| `npm run art` | Regenerate the product renders in `public/products` |

## What's included

- **Home:** announcement strip, sticky nav with live cart count, the editorial hero ("Good tech. No guesswork."), the category index, the Shortlist with working filters, the chartreuse campaign, shop-by-intention edits, Why OSA, recently viewed with complementary products, and a newsletter with validation.
- **Listings:** `/shop`, `/category/[slug]`, `/collections/[slug]`, `/deals` and `/search`. Filters for category, brand, price, availability and offers are synced to the URL. Also: sorting, grid/list view, load more, active-filter chips, empty states and a mobile filter sheet.
- **Search:** overlay opened with ⌘K, Ctrl+K or `/`. Suggests products, brands and categories, remembers recent searches, supports arrow-key navigation and has a no-results state.
- **Product page:** gallery with thumbnails, hover zoom and a lightbox. Colour and storage variants update the price, the images and the URL. Also: availability, quantity capped at stock, warranty, delivery and payment info, key and full specs, frequently bought together, related products, recently viewed, a sticky mobile buy bar, and Product JSON-LD.
- **Cart and checkout:** cart drawer and `/cart` page, persisted in `localStorage`. The five-step checkout validates on both client and server. Orders are re-priced and stock-checked on the server. Retries are idempotent. The confirmation page is protected by a signed token or by the owning account.
- **Accounts:** register, sign in, sign out, password reset, profile, saved addresses (used at checkout) and order history. Guest checkout always works.
- **Content:** About, Contact (working form), FAQ (with FAQPage JSON-LD), Delivery, Returns, Warranty, Privacy and Terms.
- **Platform:** metadata, canonical URLs, `sitemap.xml`, `robots.txt`, breadcrumb JSON-LD, 404 and error pages, loading skeletons, reduced-motion support, a skip link and keyboard-accessible overlays.

## Where things live

```
src/config/store.ts        Business facts: contact, delivery areas & methods, payment methods, advantages
src/config/navigation.ts   Header & footer links
src/config/announcements.ts
src/data/products.ts       Product catalogue (SAMPLE)
src/data/categories.ts     Categories
src/data/collections.ts    Shop-by-intention edits
src/data/promotions.ts     Homepage campaign
src/content/pages.ts       Policy / info page copy and FAQs
src/server/*               Order handling, auth, validation, data store (server-only)
src/app/api/*              Route handlers
scripts/generate-product-art.mts  Studio-render generator
```

Product data is never hard-coded in components. Everything reads from `src/data` through `src/lib/catalog.ts`.

## Honesty rules built into the code

- **No invented commerce facts.** Contact details and social links are empty in `store.ts` and stay hidden until you fill them in. Delivery fees are `null` and show as "confirmed by phone". Reviews and ratings are not shown anywhere, because none exist.
- **No fake payments.** Cash on delivery is the only configured method. Checkout places an order *request*, and the confirmation says no payment was taken.
- **Placeholders are marked.** Policy text written as `[[...]]` in `src/content/pages.ts` renders highlighted on the page with a notice.
- **Sample data is labelled.** While `store.sampleCatalog` is `true`, the announcement bar and footer say so.
- **No made-up discounts.** A price drop only appears when a product has a `compareAtPrice`.

## Going live

1. **Catalogue:** replace `src/data/products.ts` with real inventory, prices, stock and warranty terms, then set `store.sampleCatalog = false`. For a larger catalogue, move it into a database or CMS behind the same helpers in `src/lib/catalog.ts`.
2. **Product photography:** the images in `public/products` are generated vector studio renders. This build environment could not reach image hosts, so they stand in for photos. Add real photos per colour through the `images` field on each product, e.g. `images: { black: ["/photos/iphone-16-pro-black-1.webp", ...] }`. If photos are served from a CDN, list its host in `next.config.ts` → `images.remotePatterns`.
3. **Database:** `src/server/store.ts` is a JSON-file store that writes to `DATA_DIR`. It is fine for a single server but **not** for serverless or multi-instance hosting. Swap its three functions (`readAll`, `mutate`, `findOne`) for Postgres or another database. Every other server module goes through them.
4. **Inventory:** stock is checked against the catalogue at checkout but not decremented. Connect it to your inventory system in `src/server/orders.ts`.
5. **Order operations:** new orders land in the `orders` collection with status `received`. Connect order notifications (email, WhatsApp or an admin tool) and status updates.
6. **Email:** connect a provider in `src/server/email.ts` for password resets and order emails. Until then, reset links go to the server log and the UI says so.
7. **Payments:** to add online payment, add a method in `store.paymentMethods` and integrate the provider server-side. Only confirm orders after the provider's webhook confirms payment.
8. **Business details:** fill `store.contact` and `store.social`, set delivery fees and areas, review `store.advantages`, and replace every `[[placeholder]]` in `src/content/pages.ts`.
9. **Logo:** `src/components/layout/Logo.tsx` is a vector recreation of the supplied OSA TECHSTORE wordmark. Replace it with the original artwork file.
10. **Environment:** set `SESSION_SECRET` (32+ characters, required in production) and `NEXT_PUBLIC_SITE_URL`. Rate limiting is in-memory; use a shared store such as Redis if you run more than one instance.
