import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { ListingHeader, ListingSkeleton } from "@/components/listing/ListingHeader";
import { ListingView } from "@/components/listing/ListingView";
import { summarize } from "@/lib/catalog";
import { getCatalog } from "@/server/catalog";
import { cn } from "@/lib/format";

export const generateStaticParams = async () => (await getCatalog()).categories.map((c) => ({ slug: c.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = (await getCatalog()).categories.find((x) => x.slug === slug);
  if (!c) return {};
  return { title: c.indexName, description: c.description, alternates: { canonical: `/category/${c.slug}` } };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { categories, products } = await getCatalog();
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();
  const items = products.filter((p) => p.category === category.slug).map((p) => summarize(p, categories));
  return (
    <>
      <ListingHeader
        crumbs={[{ label: "Shop", href: "/shop" }, { label: category.name }]}
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
                className={cn("inline-flex h-9 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors", c.slug === category.slug ? "border-rule bg-ink text-paper" : "border-rule-strong hover:border-ink")}
              >
                {c.name}
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
