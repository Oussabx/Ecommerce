import Link from "next/link";
import type { ReactNode } from "react";
import type { OrderStatus } from "@prisma/client";
import { cn } from "@/lib/format";

export function PageHeader({ title, kicker, actions, children }: { title: string; kicker?: string; actions?: ReactNode; children?: ReactNode }) {
  return (
    <header className="px-4 pb-2 pt-6 md:px-8 md:pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[1.75rem] font-semibold leading-tight tracking-[-0.025em] md:text-3xl">{title}</h1>
          {kicker && <p className="mt-1 text-sm text-muted">{kicker}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children}
    </header>
  );
}

export const Body = ({ children, className }: { children: ReactNode; className?: string }) => <div className={cn("px-4 py-6 md:px-8", className)}>{children}</div>;

export function Panel({ title, children, actions, className }: { title?: string; children: ReactNode; actions?: ReactNode; className?: string }) {
  return (
    <section className={cn("min-w-0 overflow-hidden rounded-3xl bg-paper-2", className)}>
      {title && (
        <div className="flex items-center justify-between gap-3 px-5 pb-1 pt-5 md:px-6">
          <h2 className="text-[17px] font-semibold tracking-[-0.015em]">{title}</h2>
          {actions}
        </div>
      )}
      <div className="p-5 md:px-6">{children}</div>
    </section>
  );
}

const statusStyle: Record<OrderStatus, string> = {
  RECEIVED: "bg-warn/15 text-warn",
  CONFIRMED: "bg-accent/15 text-accent",
  OUT_FOR_DELIVERY: "bg-[#435CFF]/20 text-[#8c9bff]",
  DELIVERED: "bg-ok/15 text-ok",
  CANCELLED: "bg-paper-3 text-muted",
};
export const statusShort: Record<OrderStatus, string> = {
  RECEIVED: "To confirm",
  CONFIRMED: "Confirmed",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};
export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={cn("inline-flex h-6 items-center whitespace-nowrap rounded-full px-2.5 text-xs font-semibold", statusStyle[status])}>{statusShort[status]}</span>
  );
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-3xl bg-paper-2 p-10 text-center">
      <p className="font-semibold">{title}</p>
      {children && <div className="mt-2 text-sm text-muted">{children}</div>}
    </div>
  );
}

/** Simple numbered pagination using ?page=. */
export function Pager({ page, pages, href }: { page: number; pages: number; href: (p: number) => string }) {
  if (pages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="mt-4 flex items-center justify-between text-sm">
      <span className="text-muted">
        Page {page} of {pages}
      </span>
      <div className="flex gap-2">
        {page > 1 && (
          <Link href={href(page - 1)} className="inline-flex h-9 items-center rounded-full bg-paper-2 px-4 font-medium hover:bg-paper-3">
            Previous
          </Link>
        )}
        {page < pages && (
          <Link href={href(page + 1)} className="inline-flex h-9 items-center rounded-full bg-paper-2 px-4 font-medium hover:bg-paper-3">
            Next
          </Link>
        )}
      </div>
    </nav>
  );
}

/** Rounded card container for admin tables. */
export const tableWrap = "overflow-x-auto rounded-3xl bg-paper-2";
export const th = "border-b border-rule px-4 py-3 text-left text-xs font-medium text-muted first:pl-5 last:pr-5";
export const td = "border-b border-rule px-4 py-3 align-middle first:pl-5 last:pr-5";
/** Row hover for clickable table rows. */
export const tr = "transition-colors hover:bg-paper-3 [&:last-child>td]:border-b-0";
