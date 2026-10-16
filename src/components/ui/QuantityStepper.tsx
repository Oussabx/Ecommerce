"use client";
import { Icon } from "./Icon";
import { cn } from "@/lib/format";

export function QuantityStepper({
  value,
  onChange,
  max,
  min = 1,
  size = "md",
  label = "Quantity",
  onRemove,
}: {
  value: number;
  onChange: (n: number) => void;
  max: number;
  min?: number;
  size?: "sm" | "md";
  label?: string;
  /** When set, the minus button turns into a remove (trash) button at the minimum quantity. */
  onRemove?: () => void;
}) {
  const what = label.charAt(0).toLowerCase() + label.slice(1);
  const btn = size === "sm" ? "size-8" : "size-10";
  const atMin = value <= min;
  const showRemove = atMin && !!onRemove;
  return (
    <div className={cn("inline-flex items-center gap-0.5 rounded-full bg-paper-2 p-1 ring-1 ring-inset ring-rule", size === "sm" ? "h-10" : "h-12")} role="group" aria-label={label}>
      <button
        type="button"
        className={cn(
          "grid place-items-center rounded-full transition-colors disabled:opacity-30",
          btn,
          showRemove ? "text-muted hover:bg-danger/10 hover:text-danger" : "hover:bg-paper",
        )}
        onClick={() => (showRemove ? onRemove!() : onChange(value - 1))}
        disabled={atMin && !onRemove}
        aria-label={showRemove ? `Remove ${what.replace(/^quantity of /, "")}` : `Decrease ${what}`}
      >
        <Icon name={showRemove ? "trash" : "minus"} size={15} />
      </button>
      <output className={cn("grid place-items-center text-sm font-semibold tabular-nums", size === "sm" ? "w-7" : "w-9")} aria-live="polite">
        {value}
      </output>
      <button
        type="button"
        className={cn("grid place-items-center rounded-full transition-colors hover:bg-paper disabled:opacity-30", btn)}
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label={`Increase ${what}`}
        title={value >= max ? "No more in stock" : undefined}
      >
        <Icon name="plus" size={15} />
      </button>
    </div>
  );
}
