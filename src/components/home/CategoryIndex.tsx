import Image from "next/image";
import Link from "next/link";
import { primaryImage } from "@/lib/catalog";
import { getCatalog } from "@/server/catalog";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";

export async function CategoryIndex() {
  const { categories, products } = await getCatalog();
  return (
    <section className="container-x py-14 md:py-20" aria-labelledby="index-title">
      <SectionHeader title={<span id="index-title">Shop by category</span>} intro="A focused range, so choosing is easy." />
      <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:mt-10 lg:grid-cols-6 lg:gap-4">
        {categories.map((c, i) => {
          const inCat = products.filter((p) => p.category === c.slug);
          const cover = products.find((p) => p.slug === c.coverProduct) ?? inCat[0];
          const img = cover ? primaryImage(cover) : null;
          return (
            <Reveal as="li" key={c.slug} delay={i * 50}>
              <Link href={`/category/${c.slug}`} className="tile group flex h-full flex-col items-center p-4 pb-5 text-center transition-colors hover:bg-paper-3 md:p-5">
                <span className="relative aspect-square w-full">
                  {img && <Image src={img.src} alt="" fill sizes="(min-width: 1024px) 15vw, 40vw" className="object-contain transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-105" />}
                </span>
                <span className="mt-3 font-semibold">{c.name}</span>
                <span className="mt-0.5 text-sm text-muted">
                  {inCat.length} {inCat.length === 1 ? "product" : "products"}
                </span>
              </Link>
            </Reveal>
          );
        })}
      </ul>
    </section>
  );
}
