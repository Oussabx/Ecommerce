import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser, toPublic } from "@/server/auth";
import { orderTotal, ordersForUser, statusLabel } from "@/server/orders";
import { Addresses, PasswordForm, ProfileForm, SignOutButton } from "@/components/account/AccountDashboard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Icon } from "@/components/ui/Icon";
import { formatDate, formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your account", robots: { index: false } };

export default async function AccountPage() {
  const user = await currentUser();
  if (!user) redirect("/account/login");
  const orders = await ordersForUser(user.id);
  const pub = toPublic(user);

  return (
    <div className="container-x pb-20 pt-6">
      <Breadcrumbs items={[{ label: "Account" }]} />
      <div className="mt-8 flex flex-wrap items-end justify-between gap-4 border-t border-ink pt-4">
        <div>
          <p className="label text-muted">Member since {formatDate(user.createdAt.toISOString())}</p>
          <h1 className="display mt-3 text-[clamp(3.2rem,8vw,7rem)]">Hello, {user.name.split(" ")[0]}.</h1>
        </div>
        <div className="flex items-center gap-4">
          {(user.role === "STAFF" || user.role === "ADMIN") && (
            <Link href="/admin" className="btn btn-lime">
              Open admin
            </Link>
          )}
          <SignOutButton />
        </div>
      </div>

      <nav aria-label="Account sections" className="mt-8 flex flex-wrap gap-1">
        {[
          ["#orders", "Orders"],
          ["#profile", "Profile"],
          ["#addresses", "Addresses"],
          ["/wishlist", "Wishlist"],
        ].map(([href, label]) => (
          <Link key={href} href={href} className="label inline-flex h-9 items-center border border-rule px-3 hover:border-ink">
            {label}
          </Link>
        ))}
      </nav>

      <div className="mt-12 grid gap-16 lg:grid-cols-12">
        <section id="orders" className="lg:col-span-7" aria-labelledby="orders-title">
          <h2 id="orders-title" className="display border-t border-ink pt-4 text-4xl md:text-5xl">
            Order history
          </h2>
          {orders.length ? (
            <ul className="mt-6 divide-y divide-rule border-y border-rule">
              {orders.map((o) => (
                <li key={o.ref}>
                  <Link href={`/order/${o.ref}`} className="group grid grid-cols-[1fr_auto] items-center gap-2 py-4 sm:grid-cols-[140px_1fr_120px_32px]">
                    <span className="font-mono text-sm">{o.ref}</span>
                    <span className="text-sm text-muted sm:order-none">
                      {formatDate(o.createdAt.toISOString())} · {o.lines.reduce((s, l) => s + l.quantity, 0)} items · {statusLabel[o.status]}
                    </span>
                    <span className="font-mono text-sm tabular-nums sm:text-right">{formatPrice(orderTotal(o))}</span>
                    <Icon name="arrow" size={16} className="hidden transition-transform group-hover:translate-x-1 sm:block" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-6 border border-rule p-6">
              <p className="font-semibold">No orders yet.</p>
              <p className="mt-1 text-sm text-muted">Orders you place while signed in appear here.</p>
              <Link href="/shop" className="btn btn-outline mt-4">
                Start shopping
              </Link>
            </div>
          )}
        </section>

        <div className="space-y-16 lg:col-span-5">
          <section id="profile" aria-labelledby="profile-title">
            <h2 id="profile-title" className="display border-t border-ink pt-4 text-4xl md:text-5xl">
              Profile
            </h2>
            <div className="mt-6">
              <ProfileForm user={pub} />
            </div>
          </section>
          <section id="password" aria-labelledby="password-title">
            <h2 id="password-title" className="display border-t border-ink pt-4 text-4xl md:text-5xl">
              Password
            </h2>
            <div className="mt-6">
              <PasswordForm />
            </div>
          </section>
          <section id="addresses" aria-labelledby="addresses-title">
            <h2 id="addresses-title" className="display border-t border-ink pt-4 text-4xl md:text-5xl">
              Addresses
            </h2>
            <div className="mt-6">
              <Addresses user={pub} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
