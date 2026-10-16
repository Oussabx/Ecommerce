import type { ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "@/components/ui/Breadcrumbs";
import { cn } from "@/lib/format";

export function ListingHeader({
  crumbs,
  title,
  description,
  count,
  className,
  aside,
}: {
  crumbs: Crumb[];
  title: ReactNode;
  description?: ReactNode;
  count: number;
  className?: string;
  aside?: ReactNode;
}) {
  return (
    <header className={cn("container-x pb-8 pt-5 md:pb-10 md:pt-6", className)}>
      <Breadcrumbs items={crumbs} />
      <div className="mt-6 flex flex-col gap-5 md:mt-10 md:flex-row md:items-end md:justify-between md:gap-10">
        <div className="max-w-2xl">
          <h1 className="display animate-[rise_.8s_var(--ease-out-expo)_both] text-[clamp(2rem,4.5vw,3.5rem)]">{title}</h1>
          {description && <p className="mt-3 text-[17px] leading-relaxed text-muted md:text-lg">{description}</p>}
        </div>
        <div className={cn("flex flex-col gap-3", aside ? "w-full md:max-w-sm" : "md:items-end")}>
          <p className="text-sm text-muted">
            {count} {count === 1 ? "product" : "products"}
          </p>
          {aside}
        </div>
      </div>
    </header>
  );
}

export function ListingSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr] xl:grid-cols-[264px_1fr]" aria-busy="true" aria-label="Loading products">
      <div className="hidden space-y-3 lg:block">
        <div className="skeleton h-80 rounded-3xl" />
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-5 md:gap-y-10">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}>
            <div className="skeleton aspect-square rounded-3xl" />
            <div className="space-y-2 px-1 pt-3.5">
              <div className="skeleton h-3 w-1/3 rounded-full" />
              <div className="skeleton h-4 w-3/4 rounded-full" />
              <div className="skeleton h-4 w-1/4 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
