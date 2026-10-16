"use client";
import Link from "next/link";
import { summarize } from "@/lib/catalog";
import { useShopData } from "@/components/layout/ShopData";
import { wishlistStore } from "@/lib/shop-state";
import { ProductCard } from "./ProductCard";
import { Icon } from "@/components/ui/Icon";

export function WishlistView() {
  const list = wishlistStore.use();
  const { getProduct, categories } = useShopData();
  const hydrated = wishlistStore.useHydrated();
  const items = list.map(getProduct).filter((p): p is NonNullable<typeof p> => !!p).map((p) => summarize(p, categories));

  if (!hydrated) return <div className="skeleton h-80 rounded-3xl" aria-busy="true" />;
  if (!items.length)
    return (
      <div className="tile flex flex-col items-center px-6 py-14 text-center md:py-20">
        <span className="grid size-14 place-items-center rounded-full bg-paper text-accent">
          <Icon name="heart" size={24} />
        </span>
        <p className="mt-5 text-2xl font-semibold tracking-tight">Nothing saved yet.</p>
        <p className="mt-2 text-muted">Tap the heart on any product to keep it here for later.</p>
        <Link href="/shop" className="btn btn-primary mt-6">
          Explore the collection <Icon name="arrow" size={16} className="btn-arrow" />
        </Link>
      </div>
    );
  return (
    <>
      <p className="mb-5 text-sm text-muted">
        {items.length} saved {items.length === 1 ? "product" : "products"}
      </p>
      <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-5 md:gap-y-10 xl:grid-cols-4">
        {items.map((p) => (
          <ProductCard key={p.slug} p={p} />
        ))}
      </div>
    </>
  );
}
