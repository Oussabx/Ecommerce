import type { Metadata } from "next";
import { Suspense } from "react";
import { ListingHeader, ListingSkeleton } from "@/components/listing/ListingHeader";
import { ListingView } from "@/components/listing/ListingView";
import { summarize } from "@/lib/catalog";
import { getCatalog } from "@/server/catalog";

export const metadata: Metadata = {
  title: "Shop all technology",
  description: "Every smartphone, laptop, console, headphone and accessory in the OSA Techstore catalogue. Filter by brand, price and availability.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage() {
  const { products, categories } = await getCatalog();
  const items = products.map((p) => summarize(p, categories));
  return (
    <>
      <ListingHeader
        crumbs={[{ label: "Shop" }]}
        index="Index — All"
        title="The collection"
        description="Everything we stock, in one place. Narrow it down by what matters to you."
        count={items.length}
      />
      <section className="container-x pb-20">
        <Suspense fallback={<ListingSkeleton />}>
          <ListingView items={items} />
        </Suspense>
      </section>
    </>
  );
}
