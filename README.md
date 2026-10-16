# OSA Techstore

Storefront, backend and admin dashboard for **OSA Techstore**, a technology retailer in Lebanon. Built with Next.js 15 (App Router), TypeScript, Tailwind CSS 4, PostgreSQL and Prisma.

The look follows the OSA brand: a near-black background (`#101114`), lime (`#D7FF3F`) for buttons and highlights, chalk text (`#F2F0E8`) and cobalt (`#435CFF`) as a secondary colour. Type is Inter throughout. Surfaces are rounded cards with plenty of space. The logo is the lime "S" mark beside the OSA TECHSTORE wordmark (`src/components/layout/Logo.tsx`). On a visitor's first page load of a session, a short intro draws the rounded square and twists it into the S (`BrandIntro.tsx`); it is skipped for people who prefer reduced motion. All colours are tokens in `src/app/globals.css`, so the palette can be changed in one place.

> **Status:** the backend and admin are production-ready. The catalogue is still **sample data**; see [Still to do before launch](#still-to-do-before-launch).

## Architecture

- **Storefront:** `src/app/(shop)` contains the public pages. It reads the catalogue and settings from the database through cached loaders (`src/server/catalog.ts` and `src/server/settings.ts`).
- **Backend:** PostgreSQL through **Prisma** (`prisma/schema.prisma`).
  - Orders, accounts, messages and subscribers go through the API routes in `src/app/api/*`.
  - Admin changes go through **server actions**. Every action checks the user's role on the server and writes an audit-log entry.
- **Admin:** `/admin`, inside the same Next.js app. It has its own layout and is only reachable by `STAFF` and `ADMIN` accounts.
- **Caching:** when the catalogue or settings change in the admin, the store updates immediately through `revalidateTag` on the `catalog` and `settings` cache tags.

## Quick start (local)

```bash
npm install
cp .env.example .env                 # fill DATABASE_URL, DIRECT_URL, SESSION_SECRET, ADMIN_EMAIL/PASSWORD
npm run db:migrate                   # create the tables
npm run db:seed                      # sample catalogue + your admin account
npm run dev                          # http://localhost:3000  ·  admin at /admin
```

| Script | Purpose |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js |
| `npm run db:migrate` | Create or apply migrations in development |
| `npm run db:deploy` | Apply migrations in production |
| `npm run db:seed` | Fill **empty** tables with the sample catalogue and default settings, and create the admin from `ADMIN_EMAIL`/`ADMIN_PASSWORD`. Add `-- --reset` to wipe and reload the catalogue. |
| `npm run db:studio` | Prisma Studio, a raw database browser |
| `npm run typecheck` / `lint` | Static checks |
| `npm run art` | Regenerate the sample product renders |

## Admin dashboard (`/admin`)

| Section | What it does | Who |
| --- | --- | --- |
| Overview | Orders waiting for a call, today's orders, confirmed sales over 30 days, a 14-day order chart, recent orders, low stock | Staff |
| Orders | Filter by status and search. Detail page with the status workflow (Received → Confirmed → Out for delivery → Delivered, or Cancelled), delivery fee agreed by phone, internal notes, timeline, call/WhatsApp links, printable delivery slip | Staff |
| Products | Create, edit, publish/hide and delete products. Manage colours, options with price differences, image upload per colour, highlights, specs, in-the-box list, tags and "frequently bought together" | Staff (delete: Admin) |
| Inventory | Stock levels, units in open orders, quick adjustments with a reason, movement history | Staff |
| Customers | Grouped from orders by email, with order count, spend, contact details and last address | Staff |
| Inbox | Contact-form messages (mark handled), newsletter subscribers, CSV export | Staff |
| Content | Announcement strip, homepage campaign, categories, shop-by-intention collections | Admin |
| Settings | Store details, contact details, social links, delivery areas, methods and fees, payment methods, "Why OSA", order-alert email, integration status | Admin |
| Team | Create staff and admin logins, reset passwords, remove access. Removing access ends that person's sessions immediately. | Admin |
| Activity log | Every admin change: who, what and when | Admin |

**Stock rules:** placing an order reserves stock atomically, so overselling isn't possible. Cancelling an order returns the stock. Every change is recorded as a stock movement.

**Customers don't have accounts.** Checkout is guest-only. Customers are grouped from their orders by email. Staff sign in at `/admin/login`, and admins create staff logins under **Team**.

## Deploying to Vercel + Postgres

The only thing you need is a database.

1. Import the GitHub repo into Vercel.
2. In the project, go to **Storage → Create Database → Neon**. Leave the environment variable **prefix empty**, then **Connect**.
3. Click **Redeploy**.

The build (`scripts/vercel-build.mjs`) does the rest:
- It picks up the database settings that Neon adds.
- It creates the tables and loads the sample catalogue.
- On the first deploy it creates an admin account and prints its login in the **Build Logs**, between "ADMIN LOGIN" lines. Sign in at `/admin/login`, then change the password under My account.

**Optional settings** (Settings → Environment Variables):
- `SESSION_SECRET`: your own signing key. Without it, a key is derived from the database URL.
- `ADMIN_EMAIL` / `ADMIN_PASSWORD`: your admin login. It is applied on every deploy; if the password differs, it is reset to this value. This is also the way back in if you lose the password.
- `NEXT_PUBLIC_SITE_URL`: your public address, used in links and the sitemap.
- `BLOB_READ_WRITE_TOKEN`: needed to upload product photos. Set it up under Storage → Blob.
- `RESEND_API_KEY` + `EMAIL_FROM`: email the customer a receipt when they order (a copy goes to the order-alert email).
- `WHATSAPP_TOKEN` + `WHATSAPP_PHONE_NUMBER_ID` (+ optional `WHATSAPP_TEMPLATE`, `WHATSAPP_TEMPLATE_LANG`): send an automatic WhatsApp confirmation through the WhatsApp Cloud API, using an approved message template. Without these, each admin order page has a one-click **Send WhatsApp confirmation** button that opens WhatsApp with the message already written.

## Honesty rules built into the code

- **Nothing about the business is invented.** Contact details and social links stay hidden until they're set in **Admin → Settings**. Delivery fees are "confirmed by phone" until a fee is set. Reviews and ratings aren't shown anywhere, because none exist.
- **No fake payments.** Cash on delivery is the only payment method. Checkout places an order *request*, and the confirmation says no payment was taken.
- **Policy placeholders are marked.** Text written as `[[...]]` in `src/content/pages.ts` is highlighted on the page as needing confirmation.
- **No made-up discounts.** A price drop only shows when a product has a previous price higher than its current price, and the admin enforces that.

## Still to do before launch

- Replace the sample catalogue (Admin → Products) and turn off the sample notice (Admin → Settings).
- Fill in the policy pages (`src/content/pages.ts`) and swap the vector logo in `src/components/layout/Logo.tsx` for the original artwork.
- Online card payments need a payment provider integration. Only mark orders as paid after the provider's webhook confirms payment.
- Rate limiting is in-memory per server instance. Move it to a shared store (e.g. Upstash Redis) if traffic grows.
