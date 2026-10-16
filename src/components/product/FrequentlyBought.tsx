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
    <section aria-labelledby="fbt-title" className="border-t border-rule pt-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="fbt-title" className="display text-5xl md:text-6xl">
            Frequently bought together
          </h2>
        </div>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        <ul className="grid grid-cols-2 gap-px border border-rule bg-rule sm:grid-cols-4 lg:col-span-9">
          {all.map((p, i) => {
            const on = selected.includes(p.slug);
            return (
              <li key={p.slug} className={cn("relative bg-paper p-3 transition-opacity", !on && "opacity-50")}>
                {i > 0 && <span className="absolute -left-3 top-1/3 z-10 hidden size-6 place-items-center bg-ink text-paper sm:grid" aria-hidden><Icon name="plus" size={14} /></span>}
                <label className="flex cursor-pointer items-start gap-2">
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => setSelected((s) => (on ? s.filter((x) => x !== p.slug) : [...s, p.slug]))}
                    className="mt-1 size-4 accent-ink"
                  />
                  <span className="label text-muted">{i === 0 ? "This item" : `Add-on ${i}`}</span>
                </label>
                <Link href={`/product/${p.slug}`} className="relative mt-2 block aspect-square bg-paper-2">
                  <Image src={primaryImage(p).src} alt={p.name} fill sizes="200px" className="object-contain p-3" />
                </Link>
                <p className="mt-2 text-sm font-semibold leading-snug">{p.name}</p>
                <p className="font-mono text-sm tabular-nums">{formatPrice(priceFor(p).price)}</p>
              </li>
            );
          })}
        </ul>
        <div className="flex flex-col justify-end gap-3 lg:col-span-3">
          <p className="label text-muted">{chosen.length} selected</p>
          <p className="display-wide text-4xl tabular-nums">{formatPrice(total)}</p>
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
