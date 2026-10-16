import type { ProductSummary } from "@/lib/catalog";
import { ProductCard } from "./ProductCard";

/** Horizontally scrolling row of product cards (snaps on mobile). */
export function ProductRail({ items }: { items: ProductSummary[] }) {
  return (
    <div className="no-scrollbar -mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
      <ul className="grid auto-cols-[64%] grid-flow-col gap-3 pb-2 sm:auto-cols-[40%] md:auto-cols-[calc((100%-3.75rem)/4)] md:gap-5 [scroll-padding-inline:1rem] md:[scroll-padding-inline:0] [scroll-snap-type:x_mandatory]">
        {items.map((p) => (
          <li key={p.slug} className="[scroll-snap-align:start]">
            <ProductCard p={p} sizes="(min-width: 768px) 25vw, 70vw" />
          </li>
        ))}
      </ul>
    </div>
  );
}
