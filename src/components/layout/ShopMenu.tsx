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
        className={cn("relative flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors", active || open ? "text-ink" : "text-ink/70 hover:text-ink")}
      >
        Shop <Icon name="chevronDown" size={14} className={cn("transition-transform duration-200", open && "rotate-180")} />
        <span className={cn("absolute inset-x-3 -bottom-px h-[2px] origin-left bg-ink transition-transform duration-300", active ? "scale-x-100" : "scale-x-0")} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 w-[560px] animate-[rise_.25s_var(--ease-out-expo)_both] pt-2">
          <div className="grid grid-cols-2 gap-px border border-ink bg-rule shadow-xl">
            {categories.map((c) => {
              const cover = products.find((p) => p.slug === c.coverProduct) ?? products.find((p) => p.category === c.slug);
              return (
                <Link key={c.slug} href={`/category/${c.slug}`} className="group flex items-center gap-3 bg-paper p-3 transition-colors hover:bg-lime">
                  <span className="relative size-12 shrink-0 bg-paper-2">{cover && <Image src={primaryImage(cover).src} alt="" fill sizes="48px" className="object-contain p-1" />}</span>
                  <span className="text-sm font-semibold">{c.name}</span>
                </Link>
              );
            })}
            <Link href="/shop" className="col-span-2 flex items-center justify-between bg-ink px-4 py-3 text-sm font-semibold text-paper hover:bg-cobalt">
              View all products <Icon name="arrow" size={16} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
