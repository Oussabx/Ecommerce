import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ListingHeader, ListingSkeleton } from "@/components/listing/ListingHeader";
import { ListingView } from "@/components/listing/ListingView";
import { summarize } from "@/lib/catalog";
import { getCatalog } from "@/server/catalog";

export const metadata: Metadata = {
  title: "Deals",
  description: "Current price drops at OSA Techstore. Only real, configured reductions are shown.",
  alternates: { canonical: "/deals" },
};

export default async function DealsPage() {
  const { products, categories } = await getCatalog();
  const items = products.filter((p) => p.compareAtPrice && p.compareAtPrice > p.price).map((p) => summarize(p, categories));
  return (
    <>
      <ListingHeader
        crumbs={[{ label: "Shop", href: "/shop" }, { label: "Deals" }]}
        title="Deals"
        description="Products whose price has genuinely dropped. No countdowns, no inflated 'was' prices."
        count={items.length}
      />
      <section className="container-x pb-16 md:pb-24">
        {items.length ? (
          <Suspense fallback={<ListingSkeleton />}>
            <ListingView items={items} facets={["category", "brand", "price", "stock"]} />
          </Suspense>
        ) : (
          <div className="tile px-6 py-14 text-center md:py-20">
            <p className="text-2xl font-semibold tracking-tight md:text-3xl">No price drops right now.</p>
            <p className="mx-auto mt-3 max-w-md text-muted">When prices fall, they&apos;ll appear here. In the meantime, the full collection is a good place to start.</p>
            <Link href="/shop" className="btn btn-primary mt-6">
              Shop everything
            </Link>
          </div>
        )}
      </section>
    </>
  );
}
