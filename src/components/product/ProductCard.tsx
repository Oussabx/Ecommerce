import Image from "next/image";
import Link from "next/link";
import type { ProductSummary } from "@/lib/catalog";
import { Price } from "@/components/ui/Price";
import { Stock } from "@/components/ui/Stock";
import { Icon } from "@/components/ui/Icon";
import { WishlistButton } from "./WishlistButton";
import { QuickAdd } from "./QuickAdd";
import { cn, discountLabel, pad2 } from "@/lib/format";

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
  const code = p.categoryCode;
  const href = `/product/${p.slug}`;
  const badge = p.compareAt ? discountLabel(p.price, p.compareAt) : p.isNew ? "New" : null;

  if (view === "list") {
    return (
      <article className="group relative grid grid-cols-[112px_1fr] gap-4 bg-paper p-4 sm:grid-cols-[180px_1fr_auto] sm:gap-6 sm:p-5">
        <Link href={href} className="relative block aspect-square overflow-hidden bg-paper-2" tabIndex={-1} aria-hidden>
          <Image src={p.image} alt="" fill sizes="180px" className="object-contain p-2 transition-transform duration-500 group-hover:scale-[1.04]" />
        </Link>
        <div className="min-w-0">
          <p className="label text-muted">
            {p.brand} · {p.categoryName}
          </p>
          <h3 className="mt-1 text-lg font-semibold leading-tight">
            <Link href={href} className="after:absolute after:inset-0 sm:after:content-none">
              {p.name}
            </Link>
          </h3>
          <p className="mt-2 hidden text-sm text-muted sm:block">{p.highlights.slice(0, 3).join(" · ")}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
            <Stock value={p.availability} />
          </div>
          <Price price={p.price} compareAt={p.compareAt} className="mt-3 sm:hidden" />
        </div>
        <div className="relative z-10 col-span-2 flex items-center justify-between gap-3 sm:col-span-1 sm:flex-col sm:items-end sm:justify-between">
          <Price price={p.price} compareAt={p.compareAt} className="hidden sm:flex" />
          <div className="flex items-center gap-2">
            <WishlistButton slug={p.slug} name={p.name} className="border border-rule" />
            <QuickAdd slug={p.slug} />
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group relative flex h-full flex-col bg-paper">
      <div className="relative aspect-square overflow-hidden bg-paper-2">
        <Image
          src={p.image}
          alt={`${p.brand} ${p.name}`}
          fill
          sizes={sizes}
          priority={priority}
          className={cn("object-contain p-[8%] transition-all duration-700 ease-[var(--ease-out-expo)]", p.hoverImage && "group-hover:opacity-0 group-hover:scale-[1.03]")}
        />
        {p.hoverImage && (
          <Image
            src={p.hoverImage}
            alt=""
            aria-hidden
            fill
            sizes={sizes}
            className="scale-[0.97] object-contain p-[8%] opacity-0 transition-all duration-700 ease-[var(--ease-out-expo)] group-hover:scale-100 group-hover:opacity-100"
          />
        )}
        <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between">
          <span className="label text-muted">
            {index !== undefined ? `${pad2(index)} / ` : ""}
            {code}
          </span>
        </div>
        {badge && <span className="label absolute left-3 top-9 bg-lime px-1.5 py-0.5 text-ink">{badge}</span>}
        <div className="absolute right-2 top-2 z-10">
          <WishlistButton slug={p.slug} name={p.name} />
        </div>
        {/* colour dots */}
        {p.colors.length > 1 && (
          <div className="absolute bottom-3 left-3 flex gap-1" aria-label={`${p.colors.length} colours`}>
            {p.colors.slice(0, 5).map((c) => (
              <span key={c.id} title={c.name} className="size-2.5 rounded-full ring-1 ring-ink/20" style={{ background: c.swatch }} />
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 border-t border-rule p-4">
        <p className="label flex justify-between gap-2 text-muted">
          <span>{p.brand}</span>
          <span>{p.categoryName}</span>
        </p>
        <h3 className="text-[15px] font-semibold leading-snug md:text-base">
          <Link href={href} className="after:absolute after:inset-0">
            {p.name}
          </Link>
        </h3>
        <Price price={p.price} compareAt={p.compareAt} />
        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
          <Stock value={p.availability} />
        </div>
        <div className="relative z-10 mt-2 flex items-center justify-between gap-2 border-t border-rule pt-3">
          <QuickAdd slug={p.slug} compact />
          <Link href={href} className="label inline-flex items-center gap-1.5 text-muted transition-colors hover:text-ink" tabIndex={-1}>
            Details <Icon name="arrowUpRight" size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ items, columns = 4, startIndex = 1 }: { items: ProductSummary[]; columns?: 3 | 4; startIndex?: number }) {
  return (
    <div className={cn("grid grid-cols-2 gap-px border border-rule bg-rule", columns === 4 ? "lg:grid-cols-3 xl:grid-cols-4" : "lg:grid-cols-3")}>
      {items.map((p, i) => (
        <ProductCard key={p.slug} p={p} index={startIndex + i} />
      ))}
    </div>
  );
}
