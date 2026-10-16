# OSA Techstore

Storefront, backend and admin dashboard for **OSA Techstore**, a technology retailer in Lebanon. Built with Next.js 15 (App Router), TypeScript, Tailwind CSS 4, PostgreSQL and Prisma.

The design system is called the **OSA Signal System**: warm off-white paper (`#F5F3EE`), near-black ink (`#171816`), an electric chartreuse signal colour (`#D5FF45`) and cobalt (`#2340E8`) used sparingly for interaction. Type is condensed Archivo for display, Inter for the interface and JetBrains Mono for technical labels. Layouts use thin rules, index numbers and square corners.

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
| Customers | Accounts with order count and spend, saved addresses, order history (including guest orders with the same email) | Staff |
| Inbox | Contact-form messages (mark handled), newsletter subscribers, CSV export | Staff |
| Content | Announcement strip, homepage campaign, categories, shop-by-intention collections | Admin |
| Settings | Store details, contact details, social links, delivery areas, methods and fees, payment methods, "Why OSA", order-alert email, integration status | Admin |
| Team | Grant or remove staff and admin access. Removing access ends that person's sessions immediately. | Admin |
| Activity log | Every admin change: who, what and when | Admin |

**Stock rules:** placing an order reserves stock atomically, so overselling isn't possible. Cancelling an order returns the stock. Every change is recorded as a stock movement.

**Giving someone access:** they create a normal account on the store, then an admin grants them a role under **Team**.

## Deploying to Vercel + Postgres

1. **Database:** create a Postgres database on [Neon](https://neon.tech) (or Supabase, or Vercel → Storage → Neon). Copy the **pooled** connection string into `DATABASE_URL` and the **direct** one into `DIRECT_URL`.
2. **Images:** in Vercel → Storage, create a **Blob** store and connect it to the project. This sets `BLOB_READ_WRITE_TOKEN`.
3. **Environment variables:** in Vercel → Project → Settings → Environment Variables, add `SESSION_SECRET`, `NEXT_PUBLIC_SITE_URL`, `ADMIN_EMAIL` and `ADMIN_PASSWORD`. Optionally add `RESEND_API_KEY` and `EMAIL_FROM` for email.
4. **Deploy:** import the GitHub repo into Vercel. The `vercel-build` script (`scripts/vercel-build.mjs`) does the following:
   - Checks the environment variables. If something is missing, the build log says exactly which variable to add.
   - Runs the database migrations (`prisma migrate deploy`).
   - Seeds empty tables and creates the admin account.
   - Builds the site.

   The database variables set by Vercel's Neon and Supabase integrations are recognised automatically.
5. **Sign in:** go to `/account/login` with the admin email and change the password via "Forgot password" once email is connected. Then, in the admin:
   - Settings: fill in your contact details and delivery fees, and turn off the sample-catalogue notice.
   - Products: replace the sample products and upload real photos.
   - Team: invite your staff.

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
