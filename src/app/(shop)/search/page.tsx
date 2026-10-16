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
      <section className="container-x pb-16 md:pb-24">
        {q && items.length === 0 ? (
          <div className="tile flex flex-col items-center px-6 py-14 text-center md:py-20">
            <p className="text-2xl font-semibold tracking-tight md:text-3xl">No results for “{q}”.</p>
            <p className="mt-3 max-w-lg text-muted">Check the spelling or try something broader — a brand like Apple or Samsung, or a product type like laptop or earbuds.</p>
            <p className="mt-8 text-sm font-medium text-muted">Or browse a category</p>
            <ul className="mt-3 flex flex-wrap justify-center gap-2">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link href={`/category/${c.slug}`} className="chip bg-paper hover:bg-paper-3">
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
