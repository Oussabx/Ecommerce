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

  const isActive = (href: string) => (href === "/shop" ? pathname === "/shop" : pathname.startsWith(href));

  return (
    <header className={cn("sticky top-0 z-40 border-b bg-paper/92 backdrop-blur-md transition-[border-color] duration-300", scrolled ? "border-ink/15" : "border-transparent")}>
      <div className={cn("container-x flex items-center gap-4 transition-[height] duration-300", scrolled ? "h-14 lg:h-16" : "h-16 lg:h-20")}>
        {/* mobile: menu */}
        <button
          type="button"
          className="-ml-2 grid size-11 place-items-center lg:hidden"
          aria-label="Open menu"
          aria-expanded={panel === "menu"}
          onClick={() => open("menu")}
        >
          <Icon name="menu" size={22} />
        </button>

        <Link href="/" className="mx-auto shrink-0 lg:mx-0" aria-label="OSA Techstore — home">
          <Logo className={cn("transition-[width] duration-300", scrolled ? "w-[92px] lg:w-[104px]" : "w-[100px] lg:w-[118px]")} />
        </Link>

        <nav aria-label="Main" className="ml-8 hidden flex-1 lg:block xl:ml-14">
          <ul className="flex items-center">
            {mainNav.map((item, i) => (
              <li key={item.href} className="flex items-center">
                {i > 0 && <span className="mx-1 h-3.5 w-px bg-rule-strong xl:mx-2" aria-hidden />}
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "relative px-2 py-2 text-[13px] font-medium tracking-tight transition-colors xl:px-3",
                    isActive(item.href) ? "text-ink" : "text-ink/70 hover:text-ink",
                    item.href === "/deals" && "text-ink",
                  )}
                >
                  {item.href === "/deals" && <span className="mr-1.5 inline-block size-1.5 bg-lime align-middle ring-1 ring-ink" aria-hidden />}
                  {item.label}
                  <span
                    className={cn(
                      "absolute inset-x-2 -bottom-px h-[2px] origin-left bg-ink transition-transform duration-300 xl:inset-x-3",
                      isActive(item.href) ? "scale-x-100" : "scale-x-0",
                    )}
                  />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="-mr-2 flex items-center lg:mr-0 lg:gap-1">
          <button
            type="button"
            onClick={() => open("search")}
            className="group hidden h-10 items-center gap-3 border border-rule-strong px-3 text-sm text-muted transition-colors hover:border-ink hover:text-ink lg:flex xl:w-56"
            aria-label="Search products"
          >
            <Icon name="search" size={17} />
            <span className="hidden xl:inline">Search</span>
            <kbd className="label ml-auto hidden border border-rule px-1 text-[10px] text-subtle xl:inline">⌘K</kbd>
          </button>
          <button type="button" onClick={() => open("search")} className="grid size-11 place-items-center lg:hidden" aria-label="Search products">
            <Icon name="search" size={21} />
          </button>
          <Link href="/account" className="hidden size-11 place-items-center lg:grid" aria-label="Account">
            <Icon name="user" size={21} />
          </Link>
          <Link href="/wishlist" className="relative hidden size-11 place-items-center sm:grid" aria-label={`Wishlist, ${wishlist.length} items`}>
            <Icon name="heart" size={21} />
            {wishlist.length > 0 && <span className="absolute right-1.5 top-2 size-2 rounded-full bg-ink" aria-hidden />}
          </Link>
          <button
            type="button"
            onClick={() => open("cart")}
            className="relative grid size-11 place-items-center"
            aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`}
            aria-expanded={panel === "cart"}
          >
            <Icon name="bag" size={21} />
            <span
              key={count}
              className={cn(
                "absolute right-0.5 top-1 grid h-[18px] min-w-[18px] place-items-center px-1 font-mono text-[10px] font-semibold tabular-nums",
                count > 0 ? "animate-[pop_.35s_ease] bg-lime text-ink ring-1 ring-ink" : "bg-transparent text-transparent",
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
