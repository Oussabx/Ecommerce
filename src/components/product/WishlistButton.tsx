"use client";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useUI } from "@/components/layout/UIProvider";
import { toggleWishlist, wishlistStore } from "@/lib/shop-state";
import { cn } from "@/lib/format";

export function WishlistButton({ slug, name, className, withLabel = false }: { slug: string; name: string; className?: string; withLabel?: boolean }) {
  const list = wishlistStore.use();
  const { toast } = useUI();
  const [pop, setPop] = useState(false);
  const active = list.includes(slug);
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? `Remove ${name} from wishlist` : `Save ${name} to wishlist`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const added = toggleWishlist(slug);
        setPop(true);
        toast(added ? `Saved ${name} to your wishlist.` : `Removed ${name} from your wishlist.`, added ? { label: "View wishlist", href: "/wishlist" } : undefined);
      }}
      onAnimationEnd={() => setPop(false)}
      className={cn(
        "inline-flex items-center justify-center gap-2 transition-colors",
        withLabel ? "btn btn-outline h-12 w-full sm:w-auto" : "size-10 rounded-full bg-paper/60 backdrop-blur-sm hover:bg-paper",
        className,
      )}
    >
      <Icon name="heart" size={18} fill={active ? "currentColor" : "none"} className={cn(active && "text-accent", pop && "animate-[pop_.35s_ease]")} />
      {withLabel && <span>{active ? "Saved" : "Save"}</span>}
    </button>
  );
}
