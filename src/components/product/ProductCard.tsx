import Image from "next/image";
import Link from "next/link";
import type { ProductSummary } from "@/lib/catalog";
import { Price } from "@/components/ui/Price";
import { Stock } from "@/components/ui/Stock";
import { WishlistButton } from "./WishlistButton";
import { QuickAdd } from "./QuickAdd";
import { cn } from "@/lib/format";

export function ProductCard({
  p,
  index,
  view = "grid",
  priority = false,
  sizes = "(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw",
}: {
  p: ProductSummary;
  index?: number;
  view?: "grid" | "list";
  priority?: boolean;
  sizes?: string;
}) {
  const href = `/product/${p.slug}`;
  const badge = p.isNew && !p.compareAt ? "New" : null;

  if (view === "list") {
    return (
      <article className="group relative grid grid-cols-[112px_1fr] gap-4 rounded-3xl bg-white p-3 ring-1 ring-rule sm:grid-cols-[168px_1fr_auto] sm:gap-6 sm:p-4">
        <Link href={href} className="relative block aspect-square overflow-hidden rounded-2xl bg-paper-2" tabIndex={-1} aria-hidden>
          <Image src={p.image} alt="" fill sizes="180px" className="object-contain p-3 transition-transform duration-500 group-hover:scale-[1.04]" />
        </Link>
        <div className="min-w-0 py-1">
          <p className="text-[13px] text-muted">{p.brand}</p>
          <h3 className="mt-0.5 text-lg font-semibold leading-tight">
            <Link href={href} className="after:absolute after:inset-0 sm:after:content-none">
              {p.name}
            </Link>
          </h3>
          <p className="mt-2 hidden text-sm text-muted sm:block">{p.highlights.slice(0, 3).join(" · ")}</p>
          <div className="mt-3">
            <Stock value={p.availability} />
          </div>
          <Price price={p.price} compareAt={p.compareAt} className="mt-3 sm:hidden" />
        </div>
        <div className="relative z-10 col-span-2 flex items-center justify-between gap-3 sm:col-span-1 sm:flex-col sm:items-end sm:justify-between sm:py-1">
          <Price price={p.price} compareAt={p.compareAt} className="hidden sm:flex" size="lg" />
          <div className="flex items-center gap-2">
            <WishlistButton slug={p.slug} name={p.name} className="bg-paper-2" />
            <QuickAdd slug={p.slug} />
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group relative flex h-full flex-col">
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-paper-2 transition-colors duration-300 group-hover:bg-paper-3/70">
        <Image
          src={p.image}
          alt={`${p.brand} ${p.name}`}
          fill
          sizes={sizes}
          priority={priority}
          className={cn("object-contain p-[12%] transition-all duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.04]", p.hoverImage && "group-hover:opacity-0")}
        />
        {p.hoverImage && (
          <Image
            src={p.hoverImage}
            alt=""
            aria-hidden
            fill
            sizes={sizes}
            className="scale-[0.97] object-contain p-[12%] opacity-0 transition-all duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.04] group-hover:opacity-100"
          />
        )}
        {badge && <span className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-accent shadow-sm">{badge}</span>}
        <div className="absolute right-2 top-2 z-10">
          <WishlistButton slug={p.slug} name={p.name} />
        </div>
        {p.colors.length > 1 && (
          <div className="absolute bottom-3 left-3 flex gap-1 rounded-full bg-white/80 px-2 py-1.5 backdrop-blur-sm" aria-label={`${p.colors.length} colours`}>
            {p.colors.slice(0, 5).map((c) => (
              <span key={c.id} title={c.name} className="size-2.5 rounded-full ring-1 ring-black/15" style={{ background: c.swatch }} />
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col px-1 pt-3.5">
        <p className="text-[13px] text-muted">{p.brand}</p>
        <h3 className="mt-0.5 text-[15px] font-semibold leading-snug md:text-base">
          <Link href={href} className="after:absolute after:inset-0">
            {p.name}
          </Link>
        </h3>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2.5">
          <div className="min-w-0">
            <Price price={p.price} compareAt={p.compareAt} />
            {p.availability !== "in-stock" && <Stock value={p.availability} className="mt-1" />}
          </div>
          <div className="relative z-10 shrink-0">
            <QuickAdd slug={p.slug} compact />
          </div>
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ items, columns = 4 }: { items: ProductSummary[]; columns?: 3 | 4; startIndex?: number }) {
  return (
    <div className={cn("grid grid-cols-2 gap-x-3 gap-y-8 md:gap-x-5 md:gap-y-10", columns === 4 ? "lg:grid-cols-3 xl:grid-cols-4" : "lg:grid-cols-3")}>
      {items.map((p) => (
        <ProductCard key={p.slug} p={p} />
      ))}
    </div>
  );
}
