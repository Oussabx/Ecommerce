import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ListingHeader, ListingSkeleton } from "@/components/listing/ListingHeader";
import { ListingView } from "@/components/listing/ListingView";
import { SearchBox } from "@/components/listing/SearchBox";
import { summarize } from "@/lib/catalog";
import { getCatalog } from "@/server/catalog";
import { searchProducts } from "@/lib/search";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string }> }): Promise<Metadata> {
  const q = (await searchParams).q?.trim();
  return { title: q ? `Search: ${q}` : "Search", robots: { index: false, follow: true } };
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").trim().slice(0, 100);
  const { products, categories } = await getCatalog();
  const items = q ? searchProducts(products.map((p) => summarize(p, categories)), q) : [];
  return (
    <>
      <ListingHeader
        crumbs={[{ label: "Search" }]}
        title={q ? <>“{q}”</> : "Search"}
        description={q ? undefined : "Search across product names, brands, categories and key specs."}
        count={items.length}
        aside={<SearchBox initial={q} />}
      />
      <section className="container-x pb-20">
        {q && items.length === 0 ? (
          <div className="border border-rule p-8 md:p-14">
            <p className="display text-4xl md:text-6xl">No results for “{q}”.</p>
            <p className="mt-4 max-w-lg text-muted">Check the spelling or try something broader — a brand like Apple or Samsung, or a product type like laptop or earbuds.</p>
            <p className="label mt-8 text-muted">Or browse a category</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link href={`/category/${c.slug}`} className="label inline-flex h-9 items-center border border-rule px-3 hover:bg-lime">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : q ? (
          <Suspense fallback={<ListingSkeleton />}>
            <ListingView key={q} items={items} />
          </Suspense>
        ) : null}
      </section>
    </>
  );
}
