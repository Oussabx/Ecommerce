import type { ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "@/components/ui/Breadcrumbs";
import { cn } from "@/lib/format";

export function ListingHeader({
  crumbs,
  index,
  title,
  description,
  count,
  className,
  aside,
}: {
  crumbs: Crumb[];
  index: string;
  title: ReactNode;
  description?: ReactNode;
  count: number;
  className?: string;
  aside?: ReactNode;
}) {
  return (
    <header className={cn("container-x pb-8 pt-6 md:pb-12 md:pt-8", className)}>
      <Breadcrumbs items={crumbs} />
      <div className="mt-8 grid gap-6 border-t border-current pt-4 md:mt-12 md:grid-cols-12">
        <p className="label md:col-span-2">{index}</p>
        <h1 className="display animate-[rise_.8s_var(--ease-out-expo)_both] text-[clamp(3.2rem,10vw,9.5rem)] md:col-span-7">{title}</h1>
        <div className="flex flex-col justify-end gap-3 md:col-span-3">
          {description && <p className="text-[15px] leading-relaxed opacity-75">{description}</p>}
          <p className="label">
            {String(count).padStart(2, "0")} {count === 1 ? "product" : "products"}
          </p>
          {aside}
        </div>
      </div>
    </header>
  );
}

export function ListingSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[264px_1fr]" aria-busy="true" aria-label="Loading products">
      <div className="hidden space-y-3 lg:block">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-8" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-px border border-rule bg-rule md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-paper">
            <div className="skeleton aspect-square" />
            <div className="space-y-2 p-4">
              <div className="skeleton h-3 w-1/3" />
              <div className="skeleton h-4 w-3/4" />
              <div className="skeleton h-4 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
