import { discountPercent } from "@/lib/catalog";
import { cn, formatPrice } from "@/lib/format";

export function Price({
  price,
  compareAt,
  size = "md",
  className,
}: {
  price: number;
  compareAt?: number;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const off = discountPercent(price, compareAt);
  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2.5 gap-y-1", className)}>
      <span
        className={cn(
          "font-semibold tabular-nums tracking-tight",
          size === "sm" && "text-sm",
          size === "md" && "text-base",
          size === "lg" && "text-2xl",
          size === "xl" && "display-wide text-3xl md:text-4xl",
        )}
      >
        {formatPrice(price)}
      </span>
      {off > 0 && compareAt && (
        <>
          <span className={cn("text-muted", "line-through tabular-nums", size === "xl" || size === "lg" ? "text-base" : "text-sm")}>
            <span className="sr-only">Was </span>
            {formatPrice(compareAt)}
          </span>
          <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-on-accent">−{off}%</span>
        </>
      )}
    </div>
  );
}
