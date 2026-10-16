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
}: {
  value: number;
  onChange: (n: number) => void;
  max: number;
  min?: number;
  size?: "sm" | "md";
  label?: string;
}) {
  const h = size === "sm" ? "h-9" : "h-12";
  const what = label.charAt(0).toLowerCase() + label.slice(1);
  return (
    <div className={cn("inline-flex items-stretch border border-rule-strong bg-[#fbfaf7]", h)} role="group" aria-label={label}>
      <button
        type="button"
        className="grid w-10 place-items-center transition-colors hover:bg-paper-2 disabled:opacity-30"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label={`Decrease ${what}`}
      >
        <Icon name="minus" size={16} />
      </button>
      <output className="grid w-10 place-items-center font-mono text-sm tabular-nums" aria-live="polite">
        {value}
      </output>
      <button
        type="button"
        className="grid w-10 place-items-center transition-colors hover:bg-paper-2 disabled:opacity-30"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label={`Increase ${what}`}
      >
        <Icon name="plus" size={16} />
      </button>
    </div>
  );
}
