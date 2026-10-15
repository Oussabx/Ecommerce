import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { ListingHeader, ListingSkeleton } from "@/components/listing/ListingHeader";
import { ListingView } from "@/components/listing/ListingView";
import { categories, getCategory, productsInCategory, summarize } from "@/lib/catalog";
import { cn, pad2 } from "@/lib/format";

export const dynamicParams = false;
export const generateStaticParams = () => categories.map((c) => ({ slug: c.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const c = getCategory((await params).slug);
  if (!c) return {};
  return { title: c.indexName, description: c.description, alternates: { canonical: `/category/${c.slug}` } };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const category = getCategory((await params).slug);
  if (!category) notFound();
  const items = productsInCategory(category.slug).map(summarize);
  return (
    <>
      <ListingHeader
        crumbs={[{ label: "Shop", href: "/shop" }, { label: category.name }]}
        index={`${pad2(category.index)} — ${category.code}`}
        title={category.indexName}
        description={category.description}
        count={items.length}
      />
      <nav aria-label="Categories" className="container-x mb-6">
        <ul className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 md:mx-0 md:px-0">
          {categories.map((c) => (
            <li key={c.slug} className="shrink-0">
              <Link
                href={`/category/${c.slug}`}
                aria-current={c.slug === category.slug ? "page" : undefined}
                className={cn("label inline-flex h-9 items-center gap-2 border px-3 transition-colors", c.slug === category.slug ? "border-ink bg-ink text-paper" : "border-rule hover:border-ink")}
              >
                <span className="opacity-60">{pad2(c.index)}</span> {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <section className="container-x pb-20">
        <Suspense fallback={<ListingSkeleton />}>
          <ListingView items={items} facets={["brand", "price", "stock", "offer"]} />
        </Suspense>
      </section>
    </>
  );
}
