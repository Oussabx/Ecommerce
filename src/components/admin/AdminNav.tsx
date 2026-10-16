"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/layout/Logo";
import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/format";
import { SignOutButton } from "./StaffAccount";

const NAV: { href: string; label: string; icon: IconName; adminOnly?: boolean; badgeKey?: "orders" | "messages" }[] = [
  { href: "/admin", label: "Overview", icon: "grid" },
  { href: "/admin/orders", label: "Orders", icon: "box", badgeKey: "orders" },
  { href: "/admin/products", label: "Products", icon: "bag" },
  { href: "/admin/inventory", label: "Inventory", icon: "list" },
  { href: "/admin/customers", label: "Customers", icon: "user" },
  { href: "/admin/messages", label: "Inbox", icon: "chat", badgeKey: "messages" },
  { href: "/admin/content", label: "Content", icon: "filter", adminOnly: true },
  { href: "/admin/settings", label: "Settings", icon: "info", adminOnly: true },
  { href: "/admin/team", label: "Team", icon: "shield", adminOnly: true },
  { href: "/admin/activity", label: "Activity log", icon: "clock", adminOnly: true },
];

export function AdminNav({ user, badges }: { user: { name: string; role: string }; badges: { orders: number; messages: number } }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  const active = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));
  const items = NAV.filter((n) => !n.adminOnly || user.role === "ADMIN");

  return (
    <>
      {/* mobile top bar */}
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-rule bg-paper/85 px-4 text-ink backdrop-blur-xl lg:hidden print:hidden">
        <button type="button" onClick={() => setOpen(true)} className="-ml-2 grid size-11 place-items-center rounded-full hover:bg-paper-3" aria-label="Open admin menu">
          <Icon name="menu" />
        </button>
        <Link href="/admin" className="flex items-center gap-2">
          <Logo className="w-32" />
          <span className="text-sm font-medium text-muted">Admin</span>
        </Link>
        <Link href="/" className="text-sm font-medium text-accent">
          Store
        </Link>
      </div>
      {open && <button type="button" aria-label="Close admin menu" className="fixed inset-0 z-40 bg-paper/70 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-rule bg-paper text-ink transition-transform duration-300 lg:sticky lg:top-0 lg:h-dvh lg:translate-x-0 print:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        aria-label="Admin"
      >
        <div className="flex items-center justify-between px-6 pb-4 pt-6">
          <Link href="/admin" className="block">
            <Logo className="w-32" />
            <span className="mt-2 block text-xs font-medium text-muted">Admin console</span>
          </Link>
          <button type="button" onClick={() => setOpen(false)} className="grid size-10 place-items-center rounded-full hover:bg-paper-3 lg:hidden" aria-label="Close admin menu">
            <Icon name="close" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          <ul className="space-y-1">
            {items.map((n) => {
              const count = n.badgeKey ? badges[n.badgeKey] : 0;
              const on = active(n.href);
              return (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    aria-current={on ? "page" : undefined}
                    className={cn(
                      "flex h-10 items-center gap-3 rounded-xl px-3 text-sm transition-colors",
                      on ? "bg-paper-3 font-semibold text-ink" : "text-ink-2 hover:bg-paper-3 hover:text-ink",
                    )}
                  >
                    <Icon name={n.icon} size={17} className={on ? "text-accent" : "text-muted"} />
                    <span className="flex-1">{n.label}</span>
                    {count > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1.5 text-[11px] font-semibold tabular-nums text-on-accent">{count}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="m-3 rounded-2xl bg-paper-2 p-4 text-sm">
          <div className="flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent/15 text-sm font-semibold text-accent" aria-hidden>
              {user.name.trim().charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold">{user.name}</p>
              <p className="text-xs capitalize text-muted">{user.role.toLowerCase()}</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-rule pt-3">
            <Link href="/" className="text-[13px] font-medium text-muted hover:text-accent">
              View store ↗
            </Link>
            <Link href="/admin/account" className="text-[13px] font-medium text-muted hover:text-accent">
              My account
            </Link>
            <SignOutButton />
          </div>
        </div>
      </aside>
    </>
  );
}
