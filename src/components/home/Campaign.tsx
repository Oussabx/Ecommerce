import Image from "next/image";
import Link from "next/link";
import { priceFor, productImages, primaryImage } from "@/lib/catalog";
import { bySlugs, getCatalog } from "@/server/catalog";
import { getSettings } from "@/server/settings";
import { Icon } from "@/components/ui/Icon";
import { Price } from "@/components/ui/Price";
import { Reveal } from "@/components/ui/Reveal";

export async function Campaign() {
  const [{ campaign }, { products }] = await Promise.all([getSettings(), getCatalog()]);
  const hero = products.find((p) => p.slug === campaign.heroProduct);
  if (!campaign.enabled || !hero) return null;
  const heroImg = productImages(hero, campaign.heroColor)[0];
  const heroPrice = priceFor(hero);
  const supporting = bySlugs(products, campaign.supporting);

  return (
    <section className="relative overflow-hidden bg-lime text-ink" aria-labelledby="campaign-title">
      <div className="container-x relative grid gap-8 py-14 md:py-20 lg:grid-cols-12">

        <div className="relative z-10 lg:col-span-7">
          <Reveal>
            <h2 id="campaign-title" className="display text-[clamp(3.6rem,11.5vw,12rem)]">
              {campaign.headline[0]}
              <br />
              <span className="inline-block bg-ink px-[0.08em] text-lime">{campaign.headline[1]}</span>
            </h2>
          </Reveal>
          <Reveal delay={120} className="mt-8 grid gap-6 md:grid-cols-2">
            <p className="max-w-sm text-[17px] leading-relaxed">{campaign.body}</p>
            <div className="flex flex-col items-start gap-3">
              <Link href={`/product/${hero.slug}`} className="btn btn-primary">
                Shop {hero.name} <Icon name="arrow" size={16} className="btn-arrow" />
              </Link>
              <Link href={campaign.cta.href} className="label link-underline inline-flex items-center gap-2">
                {campaign.cta.label} <Icon name="arrowUpRight" size={14} />
              </Link>
            </div>
          </Reveal>
        </div>

        <div className="relative lg:col-span-5">
          <Reveal className="relative mx-auto aspect-square w-full max-w-[560px] lg:absolute lg:-right-[12%] lg:-top-[12%] lg:w-[125%] lg:max-w-none">
            <Image src={heroImg.src} alt={heroImg.alt} fill sizes="(min-width: 1024px) 50vw, 90vw" className="object-contain" />
          </Reveal>
          <div className="relative z-10 border-t border-ink pt-3 lg:absolute lg:bottom-0 lg:left-0 lg:right-0">
            <p className="label">01 — Featured</p>
            <div className="mt-1 flex items-end justify-between gap-4">
              <p className="display-wide text-2xl">
                {hero.brand} {hero.name}
              </p>
              <Price price={heroPrice.price} compareAt={heroPrice.compareAt} onLime />
            </div>
          </div>
        </div>

        <ul className="grid gap-px border border-ink bg-ink sm:grid-cols-2 lg:col-span-7">
          {supporting.map((p, i) => {
            const { price, compareAt } = priceFor(p);
            return (
              <li key={p.slug}>
                <Link href={`/product/${p.slug}`} className="group flex h-full items-center gap-4 bg-lime p-4 transition-colors hover:bg-[#e3ff7d]">
                  <span className="relative size-24 shrink-0">
                    <Image src={primaryImage(p).src} alt="" fill sizes="96px" className="object-contain transition-transform duration-500 group-hover:scale-105" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="label block">0{i + 2} — {p.brand}</span>
                    <span className="block font-semibold">{p.name}</span>
                    <Price price={price} compareAt={compareAt} size="sm" className="mt-1" onLime />
                  </span>
                  <Icon name="arrowUpRight" size={20} className="shrink-0 transition-transform group-hover:rotate-45" />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
