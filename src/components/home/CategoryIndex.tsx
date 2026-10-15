import Image from "next/image";
import Link from "next/link";
import { categories, getProduct, primaryImage, productsInCategory } from "@/lib/catalog";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { pad2 } from "@/lib/format";

export function CategoryIndex() {
  return (
    <section className="container-x py-16 md:py-24" aria-labelledby="index-title">
      <SectionHeader
        index="§ 01 — Index"
        title={<span id="index-title">What are you looking for?</span>}
        intro="Six departments, kept deliberately tight. Pick one and compare what's worth it."
      />
      <ol className="mt-10 border-b border-ink md:mt-14">
        {categories.map((c, i) => {
          const cover = getProduct(c.coverProduct)!;
          const img = primaryImage(cover);
          const count = productsInCategory(c.slug).length;
          return (
            <Reveal as="li" key={c.slug} delay={i * 60} className="border-t border-ink">
              <Link
                href={`/category/${c.slug}`}
                className="group relative grid grid-cols-[72px_1fr_auto] items-center gap-4 overflow-hidden py-4 md:grid-cols-[120px_1fr_220px_64px] md:gap-6 md:py-5"
              >
                {/* hover wash */}
                <span className="absolute inset-0 -z-10 origin-left scale-x-0 bg-lime transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-x-100 group-focus-visible:scale-x-100" aria-hidden />
                <span className="flex items-center gap-3">
                  <span className="relative size-14 shrink-0 bg-paper-2 md:hidden">
                    <Image src={img.src} alt="" fill sizes="56px" className="object-contain p-1" />
                  </span>
                  <span className="label hidden text-muted md:inline">
                    {pad2(c.index)} — {c.code}
                  </span>
                </span>
                <span className="min-w-0">
                  <span className="label block text-muted md:hidden">
                    {pad2(c.index)} — {count} products
                  </span>
                  <span className="display block break-words text-[clamp(1.9rem,8.4vw,5.25rem)] md:truncate md:text-[clamp(2.2rem,5.6vw,5.25rem)] transition-transform duration-500 ease-[var(--ease-out-expo)] md:group-hover:translate-x-4">
                    {c.indexName}
                  </span>
                </span>
                <span className="hidden text-sm text-muted md:block">
                  <span className="label block text-ink">{count} products</span>
                  <span className="line-clamp-2">{c.description}</span>
                </span>
                <span className="grid size-12 place-items-center border border-ink transition-colors group-hover:bg-ink group-hover:text-lime md:size-14">
                  <Icon name="arrowUpRight" size={22} className="transition-transform duration-300 group-hover:rotate-45" />
                </span>
                {/* reveal image on hover (desktop) */}
                <span
                  className="pointer-events-none absolute right-[300px] top-1/2 hidden aspect-square w-[260px] -translate-y-1/2 rotate-[-4deg] scale-90 opacity-0 transition-all duration-500 ease-[var(--ease-out-expo)] group-hover:rotate-0 group-hover:scale-100 group-hover:opacity-100 lg:block"
                  aria-hidden
                >
                  <Image src={img.src} alt="" fill sizes="260px" className="object-contain drop-shadow-xl" />
                </span>
              </Link>
            </Reveal>
          );
        })}
      </ol>
    </section>
  );
}
