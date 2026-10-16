"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { ProductSummary } from "@/lib/catalog";
import { ProductCard } from "@/components/product/ProductCard";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/format";

const PAGE_SIZE = 12;

const PRICE_RANGES = [
  { id: "0-250", label: "Under $250", min: 0, max: 250 },
  { id: "250-500", label: "$250 – $500", min: 250, max: 500 },
  { id: "500-1000", label: "$500 – $1,000", min: 500, max: 1000 },
  { id: "1000-1500", label: "$1,000 – $1,500", min: 1000, max: 1500 },
  { id: "1500-", label: "$1,500 and up", min: 1500, max: Infinity },
];

const SORTS = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "newest", label: "Newest" },
  { id: "name", label: "Name A–Z" },
];

type Facet = "category" | "brand" | "price" | "stock" | "offer";

export function ListingView({
  items,
  facets = ["category", "brand", "price", "stock", "offer"],
  emptyTitle = "Nothing matches these filters.",
}: {
  items: ProductSummary[];
  facets?: Facet[];
  emptyTitle?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [drawer, setDrawer] = useState(false);

  const list = (k: string) => params.get(k)?.split(",").filter(Boolean) ?? [];
  const sel = {
    category: list("category"),
    brand: list("brand"),
    price: list("price"),
    stock: params.get("stock") === "in",
    offer: list("offer"),
  };
  const sort = params.get("sort") ?? "featured";
  const view = params.get("view") === "list" ? "list" : "grid";
  const page = Math.max(1, Number(params.get("page")) || 1);

  const update = (patch: Record<string, string | string[] | null>, resetPage = true) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      const val = Array.isArray(v) ? v.join(",") : v;
      if (val) next.set(k, val);
      else next.delete(k);
    }
    if (resetPage) next.delete("page");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };
  const toggle = (k: "category" | "brand" | "price" | "offer", v: string) => {
    const cur = sel[k];
    update({ [k]: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v] });
  };

  // Facet options with counts based on the unfiltered list.
  const options = useMemo(() => {
    const count = (fn: (p: ProductSummary) => string) => {
      const m = new Map<string, { label: string; n: number }>();
      for (const p of items) {
        const key = fn(p);
        m.set(key, { label: key, n: (m.get(key)?.n ?? 0) + 1 });
      }
      return m;
    };
    const cats = new Map<string, { label: string; n: number }>();
    for (const p of items) cats.set(p.category, { label: p.categoryName, n: (cats.get(p.category)?.n ?? 0) + 1 });
    return {
      category: [...cats].map(([id, v]) => ({ id, ...v })),
      brand: [...count((p) => p.brand)].map(([id, v]) => ({ id, ...v })).sort((a, b) => a.label.localeCompare(b.label)),
      price: PRICE_RANGES.map((r) => ({ id: r.id, label: r.label, n: items.filter((p) => p.price >= r.min && p.price < r.max).length })).filter((r) => r.n),
      offer: [
        { id: "sale", label: "Price drop", n: items.filter((p) => p.compareAt).length },
        { id: "new", label: "New arrivals", n: items.filter((p) => p.isNew).length },
      ].filter((o) => o.n),
    };
  }, [items]);

  const filtered = useMemo(() => {
    const ranges = PRICE_RANGES.filter((r) => sel.price.includes(r.id));
    const out = items.filter(
      (p) =>
        (!sel.category.length || sel.category.includes(p.category)) &&
        (!sel.brand.length || sel.brand.includes(p.brand)) &&
        (!ranges.length || ranges.some((r) => p.price >= r.min && p.price < r.max)) &&
        (!sel.stock || p.availability !== "out-of-stock") &&
        (!sel.offer.includes("sale") || !!p.compareAt) &&
        (!sel.offer.includes("new") || !!p.isNew),
    );
    const sorted = [...out];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    else if (sort === "newest") sorted.sort((a, b) => b.releaseYear - a.releaseYear || Number(!!b.isNew) - Number(!!a.isNew));
    else if (sort === "name") sorted.sort((a, b) => `${a.brand} ${a.name}`.localeCompare(`${b.brand} ${b.name}`));
    else sorted.sort((a, b) => Number(a.availability === "out-of-stock") - Number(b.availability === "out-of-stock"));
    return sorted;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, params]);

  const shown = filtered.slice(0, page * PAGE_SIZE);
  const chips = [
    ...sel.category.map((v) => ({ k: "category" as const, v, label: options.category.find((o) => o.id === v)?.label ?? v })),
    ...sel.brand.map((v) => ({ k: "brand" as const, v, label: v })),
    ...sel.price.map((v) => ({ k: "price" as const, v, label: PRICE_RANGES.find((r) => r.id === v)?.label ?? v })),
    ...sel.offer.map((v) => ({ k: "offer" as const, v, label: v === "sale" ? "Price drop" : "New arrivals" })),
  ];
  const activeCount = chips.length + (sel.stock ? 1 : 0);
  const clearAll = () => update({ category: null, brand: null, price: null, offer: null, stock: null });

  useEffect(() => {
    if (!drawer) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawer(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [drawer]);

  const filters = (
    <div className="divide-y divide-rule border-y border-rule">
      {facets.includes("category") && options.category.length > 1 && (
        <FacetGroup title="Category">
          {options.category.map((o) => (
            <Check key={o.id} label={o.label} count={o.n} checked={sel.category.includes(o.id)} onChange={() => toggle("category", o.id)} />
          ))}
        </FacetGroup>
      )}
      {facets.includes("brand") && options.brand.length > 1 && (
        <FacetGroup title="Brand">
          {options.brand.map((o) => (
            <Check key={o.id} label={o.label} count={o.n} checked={sel.brand.includes(o.id)} onChange={() => toggle("brand", o.id)} />
          ))}
        </FacetGroup>
      )}
      {facets.includes("price") && options.price.length > 0 && (
        <FacetGroup title="Price">
          {options.price.map((o) => (
            <Check key={o.id} label={o.label} count={o.n} checked={sel.price.includes(o.id)} onChange={() => toggle("price", o.id)} />
          ))}
        </FacetGroup>
      )}
      {facets.includes("stock") && (
        <FacetGroup title="Availability">
          <Check label="In stock only" checked={sel.stock} onChange={() => update({ stock: sel.stock ? null : "in" })} />
        </FacetGroup>
      )}
      {facets.includes("offer") && options.offer.length > 0 && (
        <FacetGroup title="Offers">
          {options.offer.map((o) => (
            <Check key={o.id} label={o.label} count={o.n} checked={sel.offer.includes(o.id)} onChange={() => toggle("offer", o.id)} />
          ))}
        </FacetGroup>
      )}
    </div>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr] xl:grid-cols-[264px_1fr]">
      {/* Desktop filters */}
      <aside className="hidden lg:block" aria-label="Filters">
        <div className="sticky top-24">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="label">Filter {activeCount > 0 && `(${activeCount})`}</h2>
            {activeCount > 0 && (
              <button type="button" onClick={clearAll} className="label text-muted underline-offset-4 hover:text-ink hover:underline">
                Clear all
              </button>
            )}
          </div>
          {filters}
        </div>
      </aside>

      <div className="min-w-0">
        {/* toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-y border-ink py-2.5 lg:border-t-0 lg:pt-0">
          <button type="button" onClick={() => setDrawer(true)} className="inline-flex h-10 items-center gap-2 rounded-md border-[1.5px] border-ink px-3.5 text-sm font-semibold lg:hidden">
            <Icon name="filter" size={16} /> Filters {activeCount > 0 && `(${activeCount})`}
          </button>
          <p className="label text-muted" aria-live="polite">
            {filtered.length} {filtered.length === 1 ? "product" : "products"}
          </p>
          <div className="ml-auto flex items-center gap-2">
            <label htmlFor="sort" className="label hidden text-muted sm:block">
              Sort
            </label>
            <select id="sort" value={sort} onChange={(e) => update({ sort: e.target.value === "featured" ? null : e.target.value }, false)} className="field !min-h-10 w-auto !py-1.5 text-sm">
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <div className="hidden border border-rule-strong sm:flex" role="group" aria-label="View">
              {(["grid", "list"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={view === v}
                  aria-label={`${v} view`}
                  onClick={() => update({ view: v === "grid" ? null : v }, false)}
                  className={cn("grid size-10 place-items-center transition-colors", view === v ? "bg-ink text-paper" : "hover:bg-paper-2")}
                >
                  <Icon name={v} size={16} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* active filter chips */}
        {activeCount > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {chips.map((c) => (
              <button key={`${c.k}-${c.v}`} type="button" onClick={() => toggle(c.k, c.v)} className="inline-flex h-8 items-center gap-1.5 rounded-full bg-ink px-3 text-xs font-semibold text-paper hover:bg-black" aria-label={`Remove filter ${c.label}`}>
                {c.label} <Icon name="close" size={12} />
              </button>
            ))}
            {sel.stock && (
              <button type="button" onClick={() => update({ stock: null })} className="inline-flex h-8 items-center gap-1.5 rounded-full bg-ink px-3 text-xs font-semibold text-paper hover:bg-black" aria-label="Remove filter In stock only">
                In stock <Icon name="close" size={12} />
              </button>
            )}
            <button type="button" onClick={clearAll} className="label h-8 px-2 text-muted underline-offset-4 hover:text-ink hover:underline">
              Clear all
            </button>
          </div>
        )}

        {/* results */}
        {filtered.length === 0 ? (
          <div className="mt-6 border border-rule p-10 text-center md:p-16">
            <p className="display text-4xl md:text-6xl">{emptyTitle}</p>
            <p className="mx-auto mt-3 max-w-md text-muted">Try removing a filter or two — or browse everything we stock.</p>
            {activeCount > 0 && (
              <button type="button" onClick={clearAll} className="btn btn-primary mt-6">
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div key={params.toString().replace(/&?page=\d+/, "")} className="mt-4 animate-[fade_.35s_ease]">
            {view === "grid" ? (
              <div className="grid grid-cols-2 gap-px border border-rule bg-rule md:grid-cols-3">
                {shown.map((p, i) => (
                  <ProductCard key={p.slug} p={p} index={i + 1} priority={i < 3} sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw" />
                ))}
              </div>
            ) : (
              <div className="grid gap-px border border-rule bg-rule">
                {shown.map((p, i) => (
                  <ProductCard key={p.slug} p={p} index={i + 1} view="list" />
                ))}
              </div>
            )}
            <div className="mt-8 flex flex-col items-center gap-3">
              <p className="label text-muted">
                Showing {shown.length} of {filtered.length}
              </p>
              <div className="h-px w-48 bg-rule">
                <div className="h-px bg-ink transition-[width] duration-500" style={{ width: `${(shown.length / filtered.length) * 100}%` }} />
              </div>
              {shown.length < filtered.length && (
                <button type="button" onClick={() => update({ page: String(page + 1) }, false)} className="btn btn-outline mt-2">
                  Load more
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile filter drawer */}
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <button type="button" aria-label="Close filters" className="absolute inset-0 animate-[fade_.2s_ease] bg-ink/40" onClick={() => setDrawer(false)} />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[88dvh] animate-[rise_.4s_var(--ease-out-expo)_both] flex-col bg-paper">
            <div className="flex items-center justify-between border-b border-ink px-4 py-3">
              <h2 className="display text-3xl">Filters</h2>
              <button type="button" onClick={() => setDrawer(false)} className="grid size-10 place-items-center" aria-label="Close filters">
                <Icon name="close" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4">{filters}</div>
            <div className="grid grid-cols-2 gap-2 border-t border-rule p-4">
              <button type="button" onClick={clearAll} className="btn btn-outline" disabled={!activeCount}>
                Clear all
              </button>
              <button type="button" onClick={() => setDrawer(false)} className="btn btn-primary">
                Show {filtered.length}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FacetGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details open className="group py-3">
      <summary className="label flex list-none items-center justify-between py-1 [&::-webkit-details-marker]:hidden">
        {title}
        <Icon name="chevronDown" size={14} className="transition-transform group-open:rotate-180" />
      </summary>
      <div className="mt-2 space-y-0.5">{children}</div>
    </details>
  );
}

function Check({ label, count, checked, onChange }: { label: string; count?: number; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex min-h-9 cursor-pointer items-center gap-3 text-sm">
      <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
      <span className="grid size-4 shrink-0 place-items-center border border-ink transition-colors peer-checked:bg-ink peer-checked:text-lime peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-cobalt">
        {checked && <Icon name="check" size={12} strokeWidth={2.5} />}
      </span>
      <span className="flex-1">{label}</span>
      {count !== undefined && <span className="font-mono text-xs text-muted tabular-nums">{count}</span>}
    </label>
  );
}
