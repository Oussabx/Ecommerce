"use client";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useUI } from "@/components/layout/UIProvider";
import { addToCart } from "@/lib/shop-state";
import { getProduct, availability } from "@/lib/catalog";
import { cn } from "@/lib/format";

/** Adds the default (first available) configuration of a product to the cart. */
export function QuickAdd({ slug, className, compact }: { slug: string; className?: string; compact?: boolean }) {
  const { toast, open } = useUI();
  const [done, setDone] = useState(false);
  const product = getProduct(slug);
  if (!product) return null;
  const color = product.colors.find((c) => availability(product, c.id) !== "out-of-stock");
  const soldOut = !color;
  const config = product.configs?.[0];
  return (
    <button
      type="button"
      disabled={soldOut}
      onClick={(e) => {
        e.preventDefault();
        if (!color) return;
        addToCart({ slug, colorId: color.id, configId: config?.id, quantity: 1 });
        setDone(true);
        setTimeout(() => setDone(false), 1600);
        toast(`Added ${product.name}${product.colors.length > 1 ? ` · ${color.name}` : ""}${config ? ` · ${config.label}` : ""}`, {
          label: "View cart",
          onClick: () => open("cart"),
        });
      }}
      className={cn("label inline-flex h-10 items-center gap-2 px-3 transition-colors", soldOut ? "text-subtle" : "bg-ink text-paper hover:bg-cobalt", className)}
      aria-label={soldOut ? `${product.name} is out of stock` : `Quick add ${product.name} to cart`}
    >
      {soldOut ? "Sold out" : done ? <><Icon name="check" size={14} /> Added</> : <><Icon name="plus" size={14} /> {compact ? "Add" : "Quick add"}</>}
    </button>
  );
}
