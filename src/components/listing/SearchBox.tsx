"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { recordSearch } from "@/lib/shop-state";

export function SearchBox({ initial = "" }: { initial?: string }) {
  const [q, setQ] = useState(initial);
  const router = useRouter();
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const t = q.trim();
        if (!t) return;
        recordSearch(t);
        router.push(`/search?q=${encodeURIComponent(t)}`);
      }}
      className="relative flex items-center"
    >
      <label htmlFor="search-page-q" className="sr-only">
        Search products
      </label>
      <Icon name="search" size={18} className="pointer-events-none absolute left-4 text-muted" />
      <input
        id="search-page-q"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search products"
        className="field !rounded-full !border-transparent !bg-paper-2 pl-11 pr-28 focus:!border-accent focus:!bg-paper"
        enterKeyHint="search"
      />
      <div className="absolute right-1.5 flex items-center gap-1">
        {q && (
          <button type="button" onClick={() => setQ("")} className="grid size-9 place-items-center rounded-full text-muted transition-colors hover:bg-paper-3 hover:text-ink" aria-label="Clear search">
            <Icon name="close" size={16} />
          </button>
        )}
        <button type="submit" className="inline-flex h-9 items-center rounded-full bg-accent px-4 text-sm font-semibold text-on-accent transition-opacity hover:opacity-90" aria-label="Search">
          Search
        </button>
      </div>
    </form>
  );
}
