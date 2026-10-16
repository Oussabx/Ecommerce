import { discountPercent } from "@/lib/catalog";
import { cn, formatPrice } from "@/lib/format";

export function Price({
  price,
  compareAt,
  size = "md",
  className,
  onLime = false,
}: {
  price: number;
  compareAt?: number;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  /** Use on lime backgrounds so the discount tag stays visible. */
  onLime?: boolean;
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
          size === "xl" && "display-wide text-4xl md:text-5xl",
        )}
      >
        {formatPrice(price)}
      </span>
      {off > 0 && compareAt && (
        <>
          <span className={cn(onLime ? "text-ink/60" : "text-muted", "line-through tabular-nums", size === "xl" || size === "lg" ? "text-base" : "text-sm")}>
            <span className="sr-only">Was </span>
            {formatPrice(compareAt)}
          </span>
          <span className={cn("label px-1.5 py-0.5", onLime ? "bg-ink text-lime" : "bg-lime text-ink")}>−{off}%</span>
        </>
      )}
    </div>
  );
}
