import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ListingHeader, ListingSkeleton } from "@/components/listing/ListingHeader";
import { ListingView } from "@/components/listing/ListingView";
import { toneClass } from "@/components/home/Intentions";
import { primaryImage, summarize } from "@/lib/catalog";
import { bySlugs, getCatalog } from "@/server/catalog";
import { cn, pad2 } from "@/lib/format";

export const generateStaticParams = async () => (await getCatalog()).collections.map((c) => ({ slug: c.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = (await getCatalog()).collections.find((x) => x.slug === slug);
  if (!c) return {};
  return { title: c.title, description: c.description, alternates: { canonical: `/collections/${c.slug}` } };
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { collections, products, categories } = await getCatalog();
  const c = collections.find((x) => x.slug === slug);
  if (!c) notFound();
  const items = bySlugs(products, c.products).map((p) => summarize(p, categories));
  const cover = products.find((p) => p.slug === c.coverProduct);
  return (
    <>
      <div className={cn("relative overflow-hidden", toneClass[c.tone] ?? toneClass.paper)}>
        <ListingHeader
          crumbs={[{ label: "Shop", href: "/shop" }, { label: "Collections", href: "/collections" }, { label: c.title }]}
          title={c.title}
          description={c.description}
          count={items.length}
          className="relative z-10 pb-16"
        />
        {cover && (
          <div className="pointer-events-none absolute -bottom-10 right-[4%] hidden aspect-square w-[300px] opacity-90 lg:block xl:w-[360px]" aria-hidden>
            <Image src={primaryImage(cover).src} alt="" fill sizes="360px" className="object-contain" priority />
          </div>
        )}
      </div>
      <section className="container-x pb-20 pt-10">
        <Suspense fallback={<ListingSkeleton />}>
          <ListingView items={items} />
        </Suspense>
        <nav aria-label="Other collections" className="mt-16 border-t border-ink pt-5">
          <p className="label text-muted">More edits</p>
          <ul className="mt-4 grid gap-px border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-5">
            {collections
              .filter((o) => o.slug !== c.slug)
              .map((o) => (
                <li key={o.slug}>
                  <Link href={`/collections/${o.slug}`} className="flex h-full flex-col gap-1 bg-paper p-4 transition-colors hover:bg-lime">
                    <span className="label text-muted">{pad2(o.index)}</span>
                    <span className="font-semibold">{o.title}</span>
                  </Link>
                </li>
              ))}
          </ul>
        </nav>
      </section>
    </>
  );
}
