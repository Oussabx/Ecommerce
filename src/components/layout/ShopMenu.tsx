"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { primaryImage } from "@/lib/catalog";
import { cn } from "@/lib/format";
import { useShopData } from "./ShopData";

/** "Shop" dropdown in the desktop navbar: all categories in one tab. */
export function ShopMenu() {
  const { categories, products } = useShopData();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const active = pathname === "/shop" || pathname.startsWith("/category") || pathname.startsWith("/collections");

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const enter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const leave = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  };

return (
    <div ref={ref} className="relative" onMouseEnter={enter} onMouseLeave={leave}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
        className={cn("flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors", active || open ? "bg-paper-2 text-ink" : "text-ink/75 hover:bg-paper-2 hover:text-ink")}
      >
        Shop <Icon name="chevronDown" size={14} className={cn("transition-transform duration-200", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 w-[600px] animate-[rise_.25s_var(--ease-out-expo)_both] pt-3">
          <div className="rounded-3xl bg-white p-3 shadow-[var(--shadow-lift)] ring-1 ring-black/5">
            <div className="grid grid-cols-3 gap-2">
              {categories.map((c) => {
                const cover = products.find((p) => p.slug === c.coverProduct) ?? products.find((p) => p.category === c.slug);
                return (
                  <Link key={c.slug} href={`/category/${c.slug}`} className="group flex flex-col items-center gap-2 rounded-2xl p-3 text-center transition-colors hover:bg-paper-2">
                    <span className="relative size-20 shrink-0">
                      {cover && <Image src={primaryImage(cover).src} alt="" fill sizes="80px" className="object-contain transition-transform duration-300 group-hover:scale-105" />}
                    </span>
                    <span className="text-sm font-medium">{c.name}</span>
                  </Link>
                );
              })}
            </div>
            <Link href="/shop" className="mt-2 flex items-center justify-between rounded-2xl bg-paper-2 px-4 py-3 text-sm font-semibold transition-colors hover:bg-paper-3">
              View all products <Icon name="arrow" size={16} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
