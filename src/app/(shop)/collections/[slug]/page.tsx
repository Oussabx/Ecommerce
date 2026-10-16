import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ListingSkeleton } from "@/components/listing/ListingHeader";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Icon } from "@/components/ui/Icon";
import { ListingView } from "@/components/listing/ListingView";
import { toneClass } from "@/components/home/Intentions";
import { primaryImage, summarize } from "@/lib/catalog";
import { bySlugs, getCatalog } from "@/server/catalog";
import { cn } from "@/lib/format";

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
      <div className="container-x pt-5 md:pt-6">
        <Breadcrumbs items={[{ label: "Shop", href: "/shop" }, { label: "Collections", href: "/collections" }, { label: c.title }]} />
        <header className={cn("relative mt-5 overflow-hidden rounded-[28px] px-6 py-10 md:mt-8 md:rounded-[32px] md:px-12 md:py-16", toneClass[c.tone] ?? toneClass.paper)}>
          <div className="relative z-10 max-w-xl lg:max-w-[52%]">
            <h1 className="display animate-[rise_.8s_var(--ease-out-expo)_both] text-[clamp(2rem,4.5vw,3.5rem)]">{c.title}</h1>
            {c.description && <p className="mt-3 text-[17px] leading-relaxed opacity-70 md:text-lg">{c.description}</p>}
            <p className="mt-6 text-sm font-medium opacity-60">
              {items.length} {items.length === 1 ? "product" : "products"}
            </p>
          </div>
          {cover && (
            <div className="pointer-events-none absolute -bottom-6 right-[4%] hidden aspect-square w-[280px] lg:block xl:w-[340px]" aria-hidden>
              <Image src={primaryImage(cover).src} alt="" fill sizes="340px" className="object-contain drop-shadow-[0_24px_40px_rgb(0_0_0/0.12)]" priority />
            </div>
          )}
        </header>
      </div>
      <section className="container-x pb-16 pt-10 md:pb-24 md:pt-12">
        <Suspense fallback={<ListingSkeleton />}>
          <ListingView items={items} />
        </Suspense>
        <nav aria-label="Other collections" className="mt-16 md:mt-24">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">More collections</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
            {collections
              .filter((o) => o.slug !== c.slug)
              .map((o) => (
                <li key={o.slug}>
                  <Link href={`/collections/${o.slug}`} className={cn("group flex h-full min-h-28 flex-col justify-between gap-4 rounded-3xl p-5 transition-transform hover:-translate-y-0.5", toneClass[o.tone] ?? toneClass.paper)}>
                    <span className="font-semibold leading-snug">{o.title}</span>
                    <span className="inline-flex items-center gap-1 text-sm font-medium opacity-70">
                      Explore <Icon name="chevronRight" size={14} className="transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </li>
              ))}
          </ul>
        </nav>
      </section>
    </>
  );
}
