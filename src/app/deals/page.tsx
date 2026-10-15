import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ListingHeader, ListingSkeleton } from "@/components/listing/ListingHeader";
import { ListingView } from "@/components/listing/ListingView";
import { products, summarize } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Deals",
  description: "Current price drops at OSA Techstore. Only real, configured reductions are shown.",
  alternates: { canonical: "/deals" },
};

export default function DealsPage() {
  const items = products.filter((p) => p.compareAtPrice && p.compareAtPrice > p.price).map(summarize);
  return (
    <>
      <div className="bg-lime">
        <ListingHeader
          crumbs={[{ label: "Shop", href: "/shop" }, { label: "Deals" }]}
          index="% — Price drops"
          title="Deals"
          description="Products whose price has genuinely dropped. No countdowns, no inflated 'was' prices."
          count={items.length}
        />
      </div>
      <section className="container-x pb-20 pt-10">
        {items.length ? (
          <Suspense fallback={<ListingSkeleton />}>
            <ListingView items={items} facets={["category", "brand", "price", "stock"]} />
          </Suspense>
        ) : (
          <div className="border border-rule p-12 text-center">
            <p className="display text-5xl">No price drops right now.</p>
            <p className="mt-3 text-muted">When prices fall, they&apos;ll appear here. In the meantime, the full collection is a good place to start.</p>
            <Link href="/shop" className="btn btn-primary mt-6">
              Shop everything
            </Link>
          </div>
        )}
      </section>
    </>
  );
}
