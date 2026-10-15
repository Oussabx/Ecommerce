import type { Availability } from "@/lib/catalog";
import { cn } from "@/lib/format";

const map: Record<Availability, { text: string; dot: string }> = {
  "in-stock": { text: "In stock", dot: "bg-ok" },
  "low-stock": { text: "Low stock", dot: "bg-warn" },
  "out-of-stock": { text: "Out of stock", dot: "bg-danger" },
};

export function Stock({ value, className }: { value: Availability; className?: string }) {
  const m = map[value];
  return (
    <span className={cn("label inline-flex items-center gap-1.5 text-muted", className)}>
      <span className={cn("size-1.5 rounded-full", m.dot)} aria-hidden />
      {m.text}
    </span>
  );
}
