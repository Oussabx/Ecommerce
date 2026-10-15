import Image from "next/image";
import Link from "next/link";
import { collections, getProduct, primaryImage } from "@/lib/catalog";
import type { Collection } from "@/data/types";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { cn, pad2 } from "@/lib/format";

export const toneClass: Record<Collection["tone"], string> = {
  lime: "bg-lime text-ink",
  ink: "bg-ink text-paper",
  paper: "bg-paper-2 text-ink",
  cobalt: "bg-cobalt text-paper",
  stone: "bg-[#d9d6cc] text-ink",
  sand: "bg-[#e9dcc6] text-ink",
};

const layout = [
  "lg:col-span-4 lg:row-span-2 min-h-[440px] lg:min-h-0",
  "lg:col-span-8 min-h-[300px]",
  "lg:col-span-4 min-h-[300px]",
  "lg:col-span-4 min-h-[300px]",
  "lg:col-span-6 min-h-[300px]",
  "lg:col-span-6 min-h-[300px]",
];

export function Intentions() {
  return (
    <section id="intentions" className="container-x py-16 md:py-24" aria-labelledby="intentions-title">
      <SectionHeader
        index="§ 04 — Shop by intention"
        title={<span id="intentions-title">Find your next device.</span>}
        intro="Start with what you want to do, not with a spec sheet. Each edit is a short, considered list."
      />
      <div className="mt-10 grid auto-rows-[minmax(300px,auto)] gap-2 md:grid-cols-2 lg:grid-cols-12">
        {collections.map((c, i) => {
          const cover = getProduct(c.coverProduct)!;
          return (
            <Reveal key={c.slug} delay={(i % 3) * 80} className={cn("relative", layout[i])}>
              <Link href={`/collections/${c.slug}`} className={cn("group relative flex h-full flex-col justify-between overflow-hidden p-5 md:p-6", toneClass[c.tone])}>
                <div className="relative z-10 flex items-start justify-between">
                  <span className="label opacity-70">
                    {pad2(c.index)} / {pad2(collections.length)}
                  </span>
                  <span className="grid size-11 place-items-center border border-current transition-transform duration-500 group-hover:rotate-45">
                    <Icon name="arrowUpRight" size={20} />
                  </span>
                </div>
                <div className={cn("relative z-10", i === 0 ? "max-w-[85%]" : "max-w-[56%]")}>
                  <p className="label opacity-70">{c.kicker}</p>
                  <h3 className="display mt-2 text-[clamp(2.2rem,4vw,3.75rem)]">{c.title}</h3>
                  <p className="mt-3 hidden max-w-xs text-sm opacity-80 md:block">{c.description}</p>
                </div>
                <div
                  className={cn(
                    "pointer-events-none absolute aspect-square transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:-translate-y-2 group-hover:scale-105",
                    i === 0 ? "right-[-6%] top-[14%] w-[78%]" : "bottom-[4%] right-[3%] w-[40%] max-w-[300px]",
                  )}
                >
                  <Image src={primaryImage(cover).src} alt="" fill sizes="(min-width: 1024px) 30vw, 60vw" className="object-contain" />
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
