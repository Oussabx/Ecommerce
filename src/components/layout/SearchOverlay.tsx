"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useUI } from "./UIProvider";
import { Icon } from "@/components/ui/Icon";
import { allSummaries, categories } from "@/lib/catalog";
import { searchProducts, suggestTerms } from "@/lib/search";
import { recordSearch, searchesStore } from "@/lib/shop-state";
import { cn, formatPrice } from "@/lib/format";

const index = allSummaries();

type Option = { id: string; href: string; onSelect?: () => void };

export function SearchOverlay() {
  const { panel, close } = useUI();
  const isOpen = panel === "search";
  const router = useRouter();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const recent = searchesStore.use();
  const listId = useId();

  useEffect(() => {
    if (isOpen) {
      setActive(-1);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  const results = useMemo(() => searchProducts(index, q).slice(0, 6), [q]);
  const terms = useMemo(() => suggestTerms(index, q), [q]);
  const trimmed = q.trim();

  // Flattened, keyboard-navigable options.
  const options: Option[] = useMemo(() => {
    if (!trimmed) return recent.map((r) => ({ id: `recent-${r}`, href: `/search?q=${encodeURIComponent(r)}` }));
    return [
      ...terms.brands.map((b) => ({ id: `brand-${b}`, href: `/shop?brand=${encodeURIComponent(b)}` })),
      ...terms.categories.map((c) => ({ id: `cat-${c.slug}`, href: `/category/${c.slug}` })),
      ...results.map((p) => ({ id: `p-${p.slug}`, href: `/product/${p.slug}` })),
    ];
  }, [trimmed, recent, terms, results]);

  if (!isOpen) return null;

  const go = (href: string) => {
    if (trimmed) recordSearch(trimmed);
    close();
    router.push(href);
  };
  const submit = () => {
    if (!trimmed) return;
    go(`/search?q=${encodeURIComponent(trimmed)}`);
  };
  const optId = (i: number) => `${listId}-${i}`;
  const indexOf = (id: string) => options.findIndex((o) => o.id === id);

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Search">
      <button type="button" aria-label="Close search" className="absolute inset-0 animate-[fade_.25s_ease] bg-ink/40 backdrop-blur-[2px]" onClick={close} />
      <div className="relative max-h-[100dvh] animate-[rise_.45s_var(--ease-out-expo)_both] overflow-y-auto border-b border-ink bg-paper">
        <div className="container-x py-5 md:py-8">
          <div className="flex items-center justify-between">
            <span className="label text-muted">Search the catalogue</span>
            <button type="button" onClick={close} className="label inline-flex h-10 items-center gap-2 hover:text-cobalt" aria-label="Close search">
              Esc <Icon name="close" size={18} />
            </button>
          </div>
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              const opt = options[active];
              if (opt && active >= 0) go(opt.href);
              else submit();
            }}
            className="mt-3 flex items-center gap-3 border-b-2 border-ink pb-2"
          >
            <Icon name="search" size={28} className="shrink-0" />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setActive(-1);
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.preventDefault();
                  if (q) setQ("");
                  else close();
                } else if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setActive((a) => Math.min(options.length - 1, a + 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setActive((a) => Math.max(-1, a - 1));
                } else if (e.key === "Enter" && active >= 0 && options[active]) {
                  e.preventDefault();
                  go(options[active].href);
                }
              }}
              placeholder="iPhone, headphones, Samsung…"
              className="display-wide min-w-0 flex-1 bg-transparent text-2xl placeholder:text-subtle focus:outline-none md:text-5xl"
              role="combobox"
              aria-expanded={options.length > 0}
              aria-controls={listId}
              aria-activedescendant={active >= 0 && options[active] ? optId(active) : undefined}
              aria-autocomplete="list"
              autoComplete="off"
              spellCheck={false}
              enterKeyHint="search"
            />
            {q && (
              <button type="button" onClick={() => { setQ(""); inputRef.current?.focus(); }} className="label inline-flex h-10 items-center gap-1 text-muted hover:text-ink">
                Clear
              </button>
            )}
          </form>

          <div id={listId} role="listbox" aria-label="Search suggestions" className="mt-6 grid gap-8 md:grid-cols-12">
            {!trimmed ? (
              <>
                <div className="md:col-span-4">
                  <h3 className="label mb-3 text-muted">Recent searches</h3>
                  {recent.length ? (
                    <ul>
                      {recent.map((r) => {
                        const i = indexOf(`recent-${r}`);
                        return (
                          <li key={r}>
                            <button
                              type="button"
                              id={optId(i)}
                              role="option"
                              aria-selected={active === i}
                              onMouseEnter={() => setActive(i)}
                              onClick={() => go(`/search?q=${encodeURIComponent(r)}`)}
                              className={cn("flex w-full items-center gap-3 border-t border-rule py-2.5 text-left", active === i && "bg-paper-2")}
                            >
                              <Icon name="clock" size={16} className="text-muted" /> {r}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted">Your recent searches will appear here.</p>
                  )}
                  {recent.length > 0 && (
                    <button type="button" onClick={() => searchesStore.set([])} className="label mt-3 text-muted underline-offset-4 hover:underline">
                      Clear history
                    </button>
                  )}
                </div>
                <div className="md:col-span-8">
                  <h3 className="label mb-3 text-muted">Browse categories</h3>
                  <ul className="grid grid-cols-2 gap-px border border-rule bg-rule sm:grid-cols-3">
                    {categories.map((c) => (
                      <li key={c.slug}>
                        <Link href={`/category/${c.slug}`} onClick={close} className="flex h-full items-center justify-between gap-2 bg-paper p-4 transition-colors hover:bg-lime">
                          <span>
                            <span className="label block text-muted">{String(c.index).padStart(2, "0")}</span>
                            <span className="font-semibold">{c.name}</span>
                          </span>
                          <Icon name="arrowUpRight" size={16} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : options.length === 0 ? (
              <div className="md:col-span-12">
                <p className="display text-4xl md:text-6xl">No matches for “{trimmed}”.</p>
                <p className="mt-3 text-muted">Check the spelling, try a brand (Apple, Samsung, Sony) or a product type (laptop, earbuds).</p>
              </div>
            ) : (
              <>
                <div className="md:col-span-4">
                  {(terms.brands.length > 0 || terms.categories.length > 0) && (
                    <>
                      <h3 className="label mb-3 text-muted">Suggestions</h3>
                      <ul>
                        {terms.brands.map((b) => {
                          const i = indexOf(`brand-${b}`);
                          return (
                            <li key={b}>
                              <button type="button" id={optId(i)} role="option" aria-selected={active === i} onMouseEnter={() => setActive(i)} onClick={() => go(`/shop?brand=${encodeURIComponent(b)}`)} className={cn("flex w-full items-center justify-between border-t border-rule py-2.5 text-left", active === i && "bg-paper-2")}>
                                <span>All <strong>{b}</strong></span>
                                <span className="label text-muted">Brand</span>
                              </button>
                            </li>
                          );
                        })}
                        {terms.categories.map((c) => {
                          const i = indexOf(`cat-${c.slug}`);
                          return (
                            <li key={c.slug}>
                              <button type="button" id={optId(i)} role="option" aria-selected={active === i} onMouseEnter={() => setActive(i)} onClick={() => go(`/category/${c.slug}`)} className={cn("flex w-full items-center justify-between border-t border-rule py-2.5 text-left", active === i && "bg-paper-2")}>
                                <strong>{c.name}</strong>
                                <span className="label text-muted">Category</span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </>
                  )}
                  <button type="button" onClick={submit} className="btn btn-outline mt-5 w-full">
                    See all results for “{trimmed}” <Icon name="arrow" size={16} className="btn-arrow" />
                  </button>
                </div>
                <div className="md:col-span-8">
                  <h3 className="label mb-3 text-muted">Products</h3>
                  {results.length ? (
                    <ul className="grid gap-px border border-rule bg-rule sm:grid-cols-2">
                      {results.map((p) => {
                        const i = indexOf(`p-${p.slug}`);
                        return (
                          <li key={p.slug}>
                            <button type="button" id={optId(i)} role="option" aria-selected={active === i} onMouseEnter={() => setActive(i)} onClick={() => go(`/product/${p.slug}`)} className={cn("flex w-full items-center gap-4 p-3 text-left transition-colors", active === i ? "bg-lime" : "bg-paper")}>
                              <span className="relative size-16 shrink-0 bg-paper-2">
                                <Image src={p.image} alt="" fill sizes="64px" className="object-contain p-1" />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="label block text-muted">{p.brand}</span>
                                <span className="block truncate font-semibold">{p.name}</span>
                              </span>
                              <span className="font-mono text-sm tabular-nums">{formatPrice(p.price)}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted">No products match yet — try the suggestions.</p>
                  )}
                </div>
              </>
            )}
          </div>
          <p className="label mt-8 hidden text-subtle md:block">↑ ↓ to move · Enter to open · Esc to close</p>
        </div>
      </div>
    </div>
  );
}
