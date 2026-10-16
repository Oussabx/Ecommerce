import type { ProductSummary } from "@/lib/catalog";
import { ProductCard } from "./ProductCard";

/** Horizontally scrolling row of product cards (snaps on mobile). */
export function ProductRail({ items }: { items: ProductSummary[] }) {
  return (
    <div className="no-scrollbar -mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
      <ul className="grid auto-cols-[68%] grid-flow-col gap-px border border-rule bg-rule sm:auto-cols-[40%] md:auto-cols-[calc(25%-1px)] [scroll-snap-type:x_mandatory]">
        {items.map((p, i) => (
          <li key={p.slug} className="[scroll-snap-align:start]">
            <ProductCard p={p} index={i + 1} sizes="(min-width: 768px) 25vw, 70vw" />
          </li>
        ))}
      </ul>
    </div>
  );
}
