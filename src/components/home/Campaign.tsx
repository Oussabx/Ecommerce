import Image from "next/image";
import Link from "next/link";
import { priceFor, productImages, primaryImage } from "@/lib/catalog";
import { bySlugs, getCatalog } from "@/server/catalog";
import { getSettings } from "@/server/settings";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { formatPrice } from "@/lib/format";

export async function Campaign() {
  const [{ campaign }, { products }] = await Promise.all([getSettings(), getCatalog()]);
  const hero = products.find((p) => p.slug === campaign.heroProduct);
  if (!campaign.enabled || !hero) return null;
  const heroImg = productImages(hero, campaign.heroColor)[0];
  const heroPrice = priceFor(hero);
  const supporting = bySlugs(products, campaign.supporting);

  return (
    <section className="container-x py-8 md:py-12" aria-labelledby="campaign-title">
      <div className="overflow-hidden rounded-[32px] bg-accent text-on-accent">
        <div className="grid items-center gap-6 px-6 pt-12 md:px-12 md:pt-16 lg:grid-cols-2 lg:gap-12 lg:py-16">
          <Reveal className="text-center lg:text-left">
            <p className="text-sm font-semibold opacity-70">Featured · {hero.brand}</p>
            <h2 id="campaign-title" className="display mt-3 text-[clamp(2.4rem,5.5vw,4.5rem)]">
              {campaign.headline[0]} <span className="opacity-55">{campaign.headline[1]}</span>
            </h2>
            <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed opacity-75 lg:mx-0">{campaign.body}</p>
            <p className="mt-5 opacity-80">
              {hero.name} from <span className="font-semibold">{formatPrice(heroPrice.price)}</span>
            </p>
            <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link href={`/product/${hero.slug}`} className="btn bg-on-accent text-accent hover:bg-black">
                Buy {hero.name}
              </Link>
              <Link href={campaign.cta.href} className="group inline-flex items-center gap-1 px-3 font-semibold">
                {campaign.cta.label} <Icon name="chevronRight" size={16} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </Reveal>
          <Reveal className="relative mx-auto aspect-square w-full max-w-[520px]">
            <Image src={heroImg.src} alt={heroImg.alt} fill sizes="(min-width: 1024px) 45vw, 90vw" className="object-contain" />
          </Reveal>
        </div>
        {supporting.length > 0 && (
          <ul className={`grid gap-px border-t border-black/10 bg-black/10 sm:grid-cols-2 ${supporting.length % 3 === 0 ? "lg:grid-cols-3" : ""}`}>
            {supporting.map((p) => {
              const { price } = priceFor(p);
              return (
                <li key={p.slug}>
                  <Link href={`/product/${p.slug}`} className="group flex h-full items-center gap-4 bg-accent p-5 transition-colors hover:bg-accent-hover md:px-8">
                    <span className="relative size-16 shrink-0">
                      <Image src={primaryImage(p).src} alt="" fill sizes="64px" className="object-contain transition-transform duration-500 group-hover:scale-105" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] opacity-60">{p.brand}</span>
                      <span className="block font-semibold">{p.name}</span>
                      <span className="block text-sm opacity-75">{formatPrice(price)}</span>
                    </span>
                    <Icon name="chevronRight" size={18} className="shrink-0 opacity-50 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
