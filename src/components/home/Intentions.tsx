import Image from "next/image";
import Link from "next/link";
import { primaryImage } from "@/lib/catalog";
import { getCatalog } from "@/server/catalog";
import type { Collection } from "@/data/types";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { cn } from "@/lib/format";

export const toneClass: Record<Collection["tone"], string> = {
  lime: "bg-[#eef4ff] text-ink",
  ink: "bg-[#111113] text-white",
  paper: "bg-paper-2 text-ink",
  cobalt: "bg-[#0a3d91] text-white",
  stone: "bg-[#f0eeea] text-ink",
  sand: "bg-[#f6efe6] text-ink",
};

const layout = [
  "lg:col-span-4 lg:row-span-2 min-h-[440px] lg:min-h-0",
  "lg:col-span-8 min-h-[300px]",
  "lg:col-span-4 min-h-[300px]",
  "lg:col-span-4 min-h-[300px]",
  "lg:col-span-6 min-h-[300px]",
  "lg:col-span-6 min-h-[300px]",
];

export async function Intentions() {
  const { collections, products } = await getCatalog();
  return (
    <section id="intentions" className="container-x py-16 md:py-24" aria-labelledby="intentions-title">
      <SectionHeader
        title={<span id="intentions-title">Help me choose</span>}
        intro="Start with what you want to do. Each list is short and considered."
      />
      <div className="mt-8 grid auto-rows-[minmax(280px,auto)] gap-3 md:mt-10 md:grid-cols-2 lg:grid-cols-12 lg:gap-4">
        {collections.map((c, i) => {
          const cover = products.find((p) => p.slug === c.coverProduct) ?? products.find((p) => p.slug === c.products[0]);
          return (
            <Reveal key={c.slug} delay={(i % 3) * 80} className={cn("relative", layout[i])}>
              <Link href={`/collections/${c.slug}`} className={cn("group relative flex h-full flex-col justify-between overflow-hidden rounded-[28px] p-6 md:p-8", toneClass[c.tone] ?? toneClass.paper)}>
                <div className={cn("relative z-10", i === 0 ? "max-w-[85%]" : "max-w-[56%]")}>
                  <h3 className="display text-[clamp(1.6rem,2.6vw,2.25rem)]">{c.title}</h3>
                  <p className="mt-2 hidden max-w-xs text-[15px] opacity-70 md:block">{c.description}</p>
                </div>
                <span className="relative z-10 inline-flex items-center gap-1 text-sm font-semibold">
                  Explore <Icon name="chevronRight" size={16} className="transition-transform group-hover:translate-x-0.5" />
                </span>
                <div
                  className={cn(
                    "pointer-events-none absolute aspect-square transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:-translate-y-2 group-hover:scale-105",
                    i === 0 ? "bottom-[-4%] right-[-6%] w-[78%]" : "bottom-[6%] right-[4%] w-[40%] max-w-[280px]",
                  )}
                >
                  {cover && <Image src={primaryImage(cover).src} alt="" fill sizes="(min-width: 1024px) 30vw, 60vw" className="object-contain" />}
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
