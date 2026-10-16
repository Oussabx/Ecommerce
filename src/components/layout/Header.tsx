"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { useUI } from "./UIProvider";
import { Icon } from "@/components/ui/Icon";
import { mainNav } from "@/config/navigation";
import { cartStore, resolveCart, wishlistStore } from "@/lib/shop-state";
import { useShopData } from "./ShopData";
import { ShopMenu } from "./ShopMenu";
import { cn } from "@/lib/format";

export function Header() {
  const pathname = usePathname();
  const { open, panel } = useUI();
  const cart = cartStore.use();
  const wishlist = wishlistStore.use();
  const { getProduct } = useShopData();
  const count = resolveCart(cart, getProduct).count;
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ⌘K / Ctrl+K / "/" opens search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing =
        !!t &&
        (t.isContentEditable ||
          t.tagName === "TEXTAREA" ||
          t.tagName === "SELECT" ||
          (t.tagName === "INPUT" && !["checkbox", "radio", "button", "submit"].includes((t as HTMLInputElement).type)));
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        open("search");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <header className={cn("sticky top-0 z-40 border-b bg-paper/80 backdrop-blur-xl backdrop-saturate-150 transition-colors duration-300", scrolled ? "border-rule" : "border-transparent")}>
      <div className="container-x flex h-16 items-center gap-4">
        {/* mobile: menu */}
        <button
          type="button"
          className="-ml-2 grid size-11 place-items-center rounded-full hover:bg-paper-2 lg:hidden"
          aria-label="Open menu"
          aria-expanded={panel === "menu"}
          onClick={() => open("menu")}
        >
          <Icon name="menu" size={22} />
        </button>

        <Link href="/" className="mx-auto shrink-0 lg:mx-0" aria-label="OSA Techstore — home">
          <Logo className="w-[132px] lg:w-[156px]" />
        </Link>

        <nav aria-label="Main" className="ml-6 hidden flex-1 lg:block xl:ml-10">
          <ul className="flex items-center gap-1">
            <li>
              <ShopMenu />
            </li>
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn("block rounded-full px-4 py-2 text-sm font-medium transition-colors", isActive(item.href) ? "bg-paper-2 text-ink" : "text-ink/75 hover:bg-paper-2 hover:text-ink")}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="-mr-2 flex items-center gap-0.5 lg:mr-0 lg:gap-1">
          <button
            type="button"
            onClick={() => open("search")}
            className="hidden h-10 items-center gap-2.5 rounded-full bg-paper-2 px-4 text-sm text-muted transition-colors hover:bg-paper-3 hover:text-ink lg:flex xl:w-60"
            aria-label="Search products"
          >
            <Icon name="search" size={16} />
            <span className="hidden xl:inline">Search products</span>
            <kbd className="ml-auto hidden rounded-md bg-paper px-1.5 py-0.5 text-[11px] font-medium text-subtle xl:inline">⌘K</kbd>
          </button>
          <button type="button" onClick={() => open("search")} className="grid size-11 place-items-center rounded-full hover:bg-paper-2 lg:hidden" aria-label="Search products">
            <Icon name="search" size={21} />
          </button>
          <Link href="/wishlist" className="relative hidden size-11 place-items-center rounded-full hover:bg-paper-2 sm:grid" aria-label={`Wishlist, ${wishlist.length} items`}>
            <Icon name="heart" size={21} />
            {wishlist.length > 0 && <span className="absolute right-2 top-2 size-2 rounded-full bg-accent ring-2 ring-paper" aria-hidden />}
          </Link>
          <button
            type="button"
            onClick={() => open("cart")}
            className="relative grid size-11 place-items-center rounded-full hover:bg-paper-2"
            aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`}
            aria-expanded={panel === "cart"}
          >
            <Icon name="bag" size={21} />
            <span
              key={count}
              className={cn(
                "absolute right-0.5 top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full px-1 text-[10px] font-semibold tabular-nums",
                count > 0 ? "animate-[pop_.35s_ease] bg-accent text-on-accent ring-2 ring-paper" : "bg-transparent text-transparent",
              )}
              aria-hidden
            >
              {count}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
