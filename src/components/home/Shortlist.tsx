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
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0" role="tablist" aria-label="Filter by category">
          {[{ slug: "all", name: "All" }, ...categories].map((c) => (
            <button
              key={c.slug}
              role="tab"
              aria-selected={cat === c.slug}
              onClick={() => setCat(c.slug)}
              className={cn("chip shrink-0", cat === c.slug && "is-active")}
            >
              {c.name}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="sl-brand">Brand</label>
          <select id="sl-brand" value={brand} onChange={(e) => setBrand(e.target.value)} className="field !min-h-9 w-auto !rounded-full !border-transparent !bg-paper-2 !py-1.5 text-sm font-medium">
            <option value="all">All brands</option>
            {brands.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
          <label className="sr-only" htmlFor="sl-price">Price</label>
          <select id="sl-price" value={price} onChange={(e) => setPrice(e.target.value)} className="field !min-h-9 w-auto !rounded-full !border-transparent !bg-paper-2 !py-1.5 text-sm font-medium">
            {PRICE.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          <label className="chip cursor-pointer">
            <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} className="size-3.5 accent-[#0066cc]" />
            In stock
          </label>
        </div>
      </div>
      <p className="mt-4 text-sm text-muted" aria-live="polite">
        Showing {shown.length} of {filtered.length}
      </p>
      {shown.length ? (
        <div className="mt-4 grid animate-[fade_.4s_ease] grid-cols-2 gap-x-3 gap-y-8 md:gap-x-5 md:gap-y-10 lg:grid-cols-4" key={`${cat}${brand}${price}${inStock}`}>
          {shown.map((p) => (
            <ProductCard key={p.slug} p={p} sizes="(min-width: 1024px) 25vw, 50vw" />
          ))}
        </div>
      ) : (
        <div className="tile mt-4 p-10 text-center">
          <p className="display text-2xl">Nothing matches that combination.</p>
          <button onClick={reset} className="btn btn-outline mt-6">
            Reset filters
          </button>
        </div>
      )}
      <div className="mt-10 flex justify-center">
        <Link href={shopHref} className="btn btn-outline">
          {filtered.length > shown.length ? `See all ${filtered.length}` : "Browse the full collection"} <Icon name="arrow" size={16} className="btn-arrow" />
        </Link>
      </div>
    </div>
  );
}
