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
      className="flex border-b-2 border-current"
    >
      <label htmlFor="search-page-q" className="sr-only">
        Search products
      </label>
      <input
        id="search-page-q"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search products"
        className="min-w-0 flex-1 bg-transparent py-2 placeholder:text-subtle focus:outline-none"
        enterKeyHint="search"
      />
      {q && (
        <button type="button" onClick={() => setQ("")} className="label px-2 text-muted" aria-label="Clear search">
          Clear
        </button>
      )}
      <button type="submit" className="px-2" aria-label="Search">
        <Icon name="search" size={18} />
      </button>
    </form>
  );
}
