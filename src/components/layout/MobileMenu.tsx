"use client";
import Link from "next/link";
import { useUI } from "./UIProvider";
import { Logo } from "./Logo";
import { Icon } from "@/components/ui/Icon";
import { useShopData } from "./ShopData";
import { pad2 } from "@/lib/format";

export function MobileMenu() {
  const { panel, close, open } = useUI();
  const { categories } = useShopData();
  if (panel !== "menu") return null;
  return (
    <div className="fixed inset-0 z-50 flex animate-[fade_.2s_ease] flex-col bg-paper lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
      <div className="container-x flex h-16 items-center justify-between border-b border-ink">
        <button type="button" onClick={close} className="-ml-2 grid size-11 place-items-center" aria-label="Close menu">
          <Icon name="close" size={22} />
        </button>
        <Logo className="w-[100px]" />
        <button type="button" onClick={() => open("search")} className="-mr-2 grid size-11 place-items-center" aria-label="Search">
          <Icon name="search" size={21} />
        </button>
      </div>
      <nav className="container-x flex-1 overflow-y-auto py-4" aria-label="Mobile">
        <Link href="/shop" onClick={close} className="flex items-baseline justify-between border-b border-rule py-3">
          <span className="display text-5xl">Shop all</span>
          <Icon name="arrow" />
        </Link>
        <ul>
          {categories.map((c, i) => (
            <li key={c.slug} className="animate-[rise_.5s_var(--ease-out-expo)_both]" style={{ animationDelay: `${60 + i * 40}ms` }}>
              <Link href={`/category/${c.slug}`} onClick={close} className="flex items-baseline gap-4 border-b border-rule py-3">
                <span className="label w-6 text-muted">{pad2(c.index)}</span>
                <span className="display flex-1 text-[2.4rem]">{c.name}</span>
                <Icon name="arrowUpRight" size={18} />
              </Link>
            </li>
          ))}
          <li>
            <Link href="/deals" onClick={close} className="flex items-baseline gap-4 border-b border-rule py-3">
              <span className="label w-6 text-muted">%</span>
              <span className="display flex-1 bg-lime text-[2.4rem]">Deals</span>
            </Link>
          </li>
        </ul>
        <ul className="mt-6 grid grid-cols-2 gap-px border border-rule bg-rule text-sm">
          {[
            ["/wishlist", "Wishlist", "heart"],
            ["/cart", "Cart", "bag"],
            ["/contact", "Contact", "chat"],
          ].map(([href, label, icon]) => (
            <li key={href}>
              <Link href={href} onClick={close} className="flex items-center gap-3 bg-paper p-4">
                <Icon name={icon as "user"} size={18} /> {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
