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

  if (!hydrated) return <div className="skeleton h-80" aria-busy="true" />;
  if (!items.length)
    return (
      <div className="border border-rule p-10 md:p-16">
        <p className="display text-5xl">Nothing saved yet.</p>
        <p className="mt-3 text-muted">Tap the heart on any product to keep it here for later.</p>
        <Link href="/shop" className="btn btn-primary mt-6">
          Explore the collection <Icon name="arrow" size={16} className="btn-arrow" />
        </Link>
      </div>
    );
  return (
    <>
      <p className="label mb-3 text-muted">
        {items.length} saved {items.length === 1 ? "product" : "products"}
      </p>
      <div className="grid grid-cols-2 gap-px border border-rule bg-rule md:grid-cols-3 xl:grid-cols-4">
        {items.map((p, i) => (
          <ProductCard key={p.slug} p={p} index={i + 1} />
        ))}
      </div>
    </>
  );
}
