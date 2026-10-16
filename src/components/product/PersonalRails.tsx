"use client";
import { summarize, type ProductSummary } from "@/lib/catalog";
import { useShopData } from "@/components/layout/ShopData";
import { viewedStore } from "@/lib/shop-state";
import { ProductRail } from "./ProductRail";

/**
 * Recently viewed + complementary products, derived from this browser's
 * viewing history. Renders nothing when there is no history.
 */
export function PersonalRails({ exclude, showPairs = true }: { exclude?: string; showPairs?: boolean }) {
  const viewed = viewedStore.use();
  const { getProduct, categories } = useShopData();
  const recent = viewed
    .filter((s) => s !== exclude)
    .map(getProduct)
    .filter((p): p is NonNullable<typeof p> => !!p)
    .slice(0, 8);
  if (!recent.length) return null;

  const seen = new Set([...viewed, exclude]);
  const pairs: ProductSummary[] = [];
  if (showPairs) {
    for (const p of recent.slice(0, 3))
      for (const q of (p.pairsWith ?? []).map(getProduct).filter((x): x is NonNullable<typeof x> => !!x))
        if (!seen.has(q.slug)) {
          seen.add(q.slug);
          pairs.push(summarize(q, categories));
        }
  }

  return (
    <section className="container-x pb-12 md:pb-20" aria-label="Based on your browsing">
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Recently viewed</h2>
        <button type="button" onClick={() => viewedStore.set([])} className="text-link text-sm">
          Clear
        </button>
      </div>
      <div className="mt-6">
        <ProductRail items={recent.map((p) => summarize(p, categories))} />
      </div>
      {pairs.length > 0 && (
        <>
          <h2 className="mt-16 text-2xl font-semibold tracking-tight md:mt-20 md:text-3xl">Pairs well with</h2>
          <div className="mt-6">
            <ProductRail items={pairs.slice(0, 8)} />
          </div>
        </>
      )}
    </section>
  );
}
