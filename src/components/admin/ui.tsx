import Link from "next/link";
import type { ReactNode } from "react";
import type { OrderStatus } from "@prisma/client";
import { cn } from "@/lib/format";

export function PageHeader({ title, kicker, actions, children }: { title: string; kicker?: string; actions?: ReactNode; children?: ReactNode }) {
  return (
    <header className="border-b border-ink bg-paper px-4 pb-5 pt-6 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          {kicker && <p className="label text-muted">{kicker}</p>}
          <h1 className="display mt-1 text-4xl md:text-5xl">{title}</h1>
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
    <section className={cn("min-w-0 border border-rule bg-[#fbfaf7]", className)}>
      {title && (
        <div className="flex items-center justify-between gap-3 border-b border-rule px-4 py-3">
          <h2 className="label">{title}</h2>
          {actions}
        </div>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

const statusStyle: Record<OrderStatus, string> = {
  RECEIVED: "bg-lime text-ink",
  CONFIRMED: "bg-cobalt text-paper",
  OUT_FOR_DELIVERY: "bg-ink text-paper",
  DELIVERED: "bg-paper-3 text-ink",
  CANCELLED: "border border-danger text-danger",
};
export const statusShort: Record<OrderStatus, string> = {
  RECEIVED: "To confirm",
  CONFIRMED: "Confirmed",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};
export function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={cn("label inline-flex h-6 items-center whitespace-nowrap px-2", statusStyle[status])}>{statusShort[status]}</span>;
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="border border-dashed border-rule-strong p-10 text-center">
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
      <span className="label text-muted">
        Page {page} of {pages}
      </span>
      <div className="flex gap-1">
        {page > 1 && (
          <Link href={href(page - 1)} className="label inline-flex h-9 items-center border border-rule-strong px-3 hover:border-ink">
            Previous
          </Link>
        )}
        {page < pages && (
          <Link href={href(page + 1)} className="label inline-flex h-9 items-center border border-rule-strong px-3 hover:border-ink">
            Next
          </Link>
        )}
      </div>
    </nav>
  );
}

export const th = "label border-b border-ink px-3 py-2 text-left font-normal text-muted";
export const td = "border-b border-rule px-3 py-2.5 align-middle";
