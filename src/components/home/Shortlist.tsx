"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { ProductSummary } from "@/lib/catalog";
import { ProductCard } from "@/components/product/ProductCard";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/format";

const PRICE = [
  { id: "all", label: "Any price", test: () => true },
  { id: "u500", label: "Under $500", test: (p: number) => p < 500 },
  { id: "500-1000", label: "$500–$1,000", test: (p: number) => p >= 500 && p <= 1000 },
  { id: "1000+", label: "$1,000+", test: (p: number) => p > 1000 },
];

export function Shortlist({ items, categories }: { items: ProductSummary[]; categories: { slug: string; name: string }[] }) {
  const [cat, setCat] = useState("all");
  const [brand, setBrand] = useState("all");
  const [price, setPrice] = useState("all");
  const [inStock, setInStock] = useState(false);
  const brands = useMemo(() => Array.from(new Set(items.map((i) => i.brand))).sort(), [items]);

  const filtered = useMemo(() => {
    const pt = PRICE.find((p) => p.id === price)!.test;
    return items.filter(
      (p) => (cat === "all" || p.category === cat) && (brand === "all" || p.brand === brand) && pt(p.price) && (!inStock || p.availability !== "out-of-stock"),
    );
  }, [items, cat, brand, price, inStock]);
  const shown = filtered.slice(0, 8);
  const reset = () => {
    setCat("all");
    setBrand("all");
    setPrice("all");
    setInStock(false);
  };

  const shopHref = `/shop?${new URLSearchParams({
    ...(cat !== "all" && { category: cat }),
    ...(brand !== "all" && { brand }),
    ...(inStock && { stock: "in" }),
  }).toString()}`;

  return (
    <div className="mt-10">
      <div className="flex flex-col gap-4 border-y border-rule py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:px-0" role="tablist" aria-label="Filter by category">
          {[{ slug: "all", name: "All" }, ...categories].map((c) => (
            <button
              key={c.slug}
              role="tab"
              aria-selected={cat === c.slug}
              onClick={() => setCat(c.slug)}
              className={cn("label h-9 shrink-0 border px-3 transition-colors", cat === c.slug ? "border-ink bg-ink text-paper" : "border-rule hover:border-ink")}
            >
              {c.name}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="sl-brand">Brand</label>
          <select id="sl-brand" value={brand} onChange={(e) => setBrand(e.target.value)} className="field !min-h-9 w-auto !py-1.5 text-sm">
            <option value="all">All brands</option>
            {brands.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
          <label className="sr-only" htmlFor="sl-price">Price</label>
          <select id="sl-price" value={price} onChange={(e) => setPrice(e.target.value)} className="field !min-h-9 w-auto !py-1.5 text-sm">
            {PRICE.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          <label className="label flex h-9 cursor-pointer items-center gap-2 border border-rule px-3 hover:border-ink">
            <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} className="size-3.5 accent-ink" />
            In stock
          </label>
        </div>
      </div>
      <p className="label mt-3 text-muted" aria-live="polite">
        Showing {shown.length} of {filtered.length}
      </p>
      {shown.length ? (
        <div className="mt-3 grid animate-[fade_.4s_ease] grid-cols-2 gap-px border border-rule bg-rule lg:grid-cols-4" key={`${cat}${brand}${price}${inStock}`}>
          {shown.map((p, i) => (
            <ProductCard key={p.slug} p={p} index={i + 1} sizes="(min-width: 1024px) 25vw, 50vw" />
          ))}
        </div>
      ) : (
        <div className="mt-3 border border-rule p-10 text-center">
          <p className="display text-4xl">Nothing matches that combination.</p>
          <button onClick={reset} className="btn btn-outline mt-6">
            Reset filters
          </button>
        </div>
      )}
      <div className="mt-8 flex justify-center">
        <Link href={shopHref} className="btn btn-primary">
          {filtered.length > shown.length ? `See all ${filtered.length}` : "Browse the full collection"} <Icon name="arrow" size={16} className="btn-arrow" />
        </Link>
      </div>
    </div>
  );
}
