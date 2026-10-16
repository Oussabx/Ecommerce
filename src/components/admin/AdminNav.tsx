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
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-paper/10 bg-ink px-4 text-paper lg:hidden print:hidden">
        <button type="button" onClick={() => setOpen(true)} className="-ml-2 grid size-11 place-items-center" aria-label="Open admin menu">
          <Icon name="menu" />
        </button>
        <Link href="/admin" className="flex items-center gap-2">
          <Logo compact className="w-16" />
          <span className="label text-lime">Admin</span>
        </Link>
        <Link href="/" className="label text-paper/60">
          Store
        </Link>
      </div>
      {open && <button type="button" aria-label="Close admin menu" className="fixed inset-0 z-40 bg-ink/50 lg:hidden" onClick={() => setOpen(false)} />}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-ink text-paper transition-transform duration-300 lg:sticky lg:top-0 lg:h-dvh lg:translate-x-0 print:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        aria-label="Admin"
      >
        <div className="flex items-center justify-between border-b border-paper/10 px-5 py-5">
          <Link href="/admin" className="block">
            <Logo className="w-24" />
            <span className="label mt-2 block text-lime">Admin console</span>
          </Link>
          <button type="button" onClick={() => setOpen(false)} className="grid size-10 place-items-center lg:hidden" aria-label="Close admin menu">
            <Icon name="close" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-0.5">
            {items.map((n) => {
              const count = n.badgeKey ? badges[n.badgeKey] : 0;
              return (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    aria-current={active(n.href) ? "page" : undefined}
                    className={cn(
                      "flex h-10 items-center gap-3 px-3 text-sm transition-colors",
                      active(n.href) ? "bg-lime font-semibold text-ink" : "text-paper/75 hover:bg-paper/10 hover:text-paper",
                    )}
                  >
                    <Icon name={n.icon} size={17} />
                    <span className="flex-1">{n.label}</span>
                    {count > 0 && (
                      <span className={cn("grid h-5 min-w-5 place-items-center px-1 font-mono text-[10px]", active(n.href) ? "bg-ink text-lime" : "bg-lime text-ink")}>{count}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t border-paper/10 p-4 text-sm">
          <p className="font-semibold">{user.name}</p>
          <p className="label text-paper/50">{user.role.toLowerCase()}</p>
          <div className="mt-3 flex gap-4">
            <Link href="/" className="label text-paper/60 hover:text-lime">
              View store ↗
            </Link>
            <Link href="/admin/account" className="label text-paper/60 hover:text-lime">
              My account
            </Link>
            <SignOutButton />
          </div>
        </div>
      </aside>
    </>
  );
}
