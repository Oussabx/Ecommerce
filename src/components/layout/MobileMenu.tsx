"use client";
import Image from "next/image";
import Link from "next/link";
import { useUI } from "./UIProvider";
import { Logo } from "./Logo";
import { Icon, type IconName } from "@/components/ui/Icon";
import { primaryImage } from "@/lib/catalog";
import { useShopData } from "./ShopData";

export function MobileMenu() {
  const { panel, close, open } = useUI();
  const { categories, products } = useShopData();
  if (panel !== "menu") return null;

  const quick: [string, string, IconName][] = [
    ["/contact", "Contact", "chat"],
    ["/wishlist", "Wishlist", "heart"],
    ["/cart", "Cart", "bag"],
  ];

  return (
    <div className="fixed inset-0 z-50 flex animate-[fade_.2s_ease] flex-col bg-paper lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
      <div className="flex h-16 shrink-0 items-center justify-between px-4">
        <button type="button" onClick={close} className="-ml-2 grid size-11 place-items-center rounded-full hover:bg-paper-2" aria-label="Close menu">
          <Icon name="close" size={22} />
        </button>
        <Logo className="w-[96px]" />
        <button type="button" onClick={() => open("search")} className="-mr-2 grid size-11 place-items-center rounded-full hover:bg-paper-2" aria-label="Search">
          <Icon name="search" size={21} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 pb-8 pt-2" aria-label="Mobile">
        <p className="mb-3 px-1 text-2xl font-semibold tracking-tight">Shop</p>
        <ul className="grid grid-cols-2 gap-2">
          {categories.map((c, i) => {
            const cover = products.find((p) => p.slug === c.coverProduct) ?? products.find((p) => p.category === c.slug);
            return (
              <li key={c.slug} className="animate-[rise_.45s_var(--ease-out-expo)_both]" style={{ animationDelay: `${40 + i * 35}ms` }}>
                <Link href={`/category/${c.slug}`} onClick={close} className="flex flex-col items-center gap-2 rounded-2xl bg-paper-2 p-4 text-center transition-colors active:bg-paper-3">
                  <span className="relative size-20 shrink-0">
                    {cover && <Image src={primaryImage(cover).src} alt="" fill sizes="80px" className="object-contain" />}
                  </span>
                  <span className="text-[15px] font-semibold">{c.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link href="/shop" onClick={close} className="btn btn-primary">
            All products
          </Link>
          <Link href="/deals" onClick={close} className="btn btn-outline">
            Deals
          </Link>
        </div>

        <ul className="mt-8 grid grid-cols-3 gap-2">
          {quick.map(([href, label, icon]) => (
            <li key={href}>
              <Link href={href} onClick={close} className="flex flex-col items-center gap-2 rounded-2xl bg-paper-2 px-2 py-4 text-sm font-medium transition-colors active:bg-paper-3">
                <Icon name={icon} size={20} />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
