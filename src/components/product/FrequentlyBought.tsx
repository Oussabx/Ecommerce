"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { availability, primaryImage, priceFor } from "@/lib/catalog";
import { useShopData } from "@/components/layout/ShopData";
import { addToCart } from "@/lib/shop-state";
import { useUI } from "@/components/layout/UIProvider";
import { Icon } from "@/components/ui/Icon";
import { cn, formatPrice } from "@/lib/format";

/** Bundle builder: the product plus its configured companions. Uses each item's default option. */
export function FrequentlyBought({ slug, pairs }: { slug: string; pairs: string[] }) {
  const { getProduct } = useShopData();
  const all = [slug, ...pairs]
    .map(getProduct)
    .filter((p): p is NonNullable<typeof p> => !!p && p.colors.some((c) => availability(p, c.id) !== "out-of-stock"));
  const [selected, setSelected] = useState<string[]>(all.map((p) => p.slug));
  const { toast, open } = useUI();
  if (all.length < 2) return null;

  const chosen = all.filter((p) => selected.includes(p.slug));
  const total = chosen.reduce((s, p) => s + priceFor(p).price, 0);

  return (
    <section aria-labelledby="fbt-title">
      <h2 id="fbt-title" className="text-2xl font-semibold tracking-tight md:text-3xl">
        Frequently bought together
      </h2>
      <div className="mt-6 grid gap-4 lg:grid-cols-12 lg:gap-5">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4 lg:col-span-9">
          {all.map((p, i) => {
            const on = selected.includes(p.slug);
            return (
              <li key={p.slug} className={cn("relative rounded-3xl bg-paper p-3 ring-1 ring-rule transition md:p-4", on ? "" : "opacity-50")}>
                {i > 0 && (
                  <span className="absolute -left-[20px] top-[38%] z-10 hidden size-7 place-items-center rounded-full bg-paper-2 text-muted ring-1 ring-rule sm:grid md:-left-[22px]" aria-hidden>
                    <Icon name="plus" size={14} />
                  </span>
                )}
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => setSelected((s) => (on ? s.filter((x) => x !== p.slug) : [...s, p.slug]))}
                    className="size-4 rounded accent-[var(--color-accent)]"
                  />
                  <span className="text-[13px] text-muted">{i === 0 ? "This item" : `Add-on ${i}`}</span>
                </label>
                <Link href={`/product/${p.slug}`} className="relative mt-3 block aspect-square overflow-hidden rounded-2xl bg-paper-2">
                  <Image src={primaryImage(p).src} alt={p.name} fill sizes="200px" className="object-contain p-4" />
                </Link>
                <p className="mt-3 text-sm font-semibold leading-snug">{p.name}</p>
                <p className="mt-0.5 text-sm tabular-nums text-muted">{formatPrice(priceFor(p).price)}</p>
              </li>
            );
          })}
        </ul>
        <div className="tile flex flex-col justify-end gap-3 p-6 lg:col-span-3">
          <p className="text-sm text-muted">{chosen.length} selected</p>
          <p className="text-3xl font-semibold tracking-tight tabular-nums">{formatPrice(total)}</p>
          <p className="text-xs text-muted">Default options for each item. Change colour or storage on each product page.</p>
          <button
            type="button"
            disabled={!chosen.length}
            onClick={() => {
              for (const p of chosen) {
                const color = p.colors.find((c) => availability(p, c.id) !== "out-of-stock")!;
                addToCart({ slug: p.slug, colorId: color.id, configId: p.configs?.[0]?.id, quantity: 1 }, p);
              }
              toast(`Added ${chosen.length} ${chosen.length === 1 ? "item" : "items"} to your cart`, { label: "View cart", onClick: () => open("cart") });
            }}
            className="btn btn-primary"
          >
            Add {chosen.length > 1 ? `all ${chosen.length}` : "selected"} to cart
          </button>
        </div>
      </div>
    </section>
  );
}
