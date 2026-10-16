"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useUI } from "./UIProvider";
import { Icon } from "@/components/ui/Icon";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { cartStore, removeFromCart, resolveCart, setQuantity, stockLimit } from "@/lib/shop-state";
import { primaryImage } from "@/lib/catalog";
import { useShopData } from "./ShopData";
import { formatPrice } from "@/lib/format";

export function CartDrawer() {
  const { panel, close } = useUI();
  const isOpen = panel === "cart";
  const cart = cartStore.use();
  const { getProduct, settings } = useShopData();
  const { store } = settings;
  const { lines, subtotal, count, hasUnavailable } = resolveCart(cart, getProduct);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  if (!isOpen) return null;
  const delivery = store.deliveryMethods[0];

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="cart-title">
      <button type="button" aria-label="Close cart" className="absolute inset-0 animate-[fade_.25s_ease] bg-ink/40" onClick={close} />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-[460px] animate-slide-in-right flex-col bg-paper shadow-2xl">
        <div className="flex items-center justify-between border-b border-ink px-5 py-4">
          <h2 id="cart-title" className="display text-3xl">
            Cart <span className="font-mono text-base font-normal tracking-normal text-muted">({count})</span>
          </h2>
          <button ref={closeRef} type="button" onClick={close} className="grid size-10 place-items-center hover:bg-paper-2" aria-label="Close cart">
            <Icon name="close" />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-start justify-center gap-5 px-6">
            <p className="display text-5xl">Nothing here yet.</p>
            <p className="text-muted">Start with the shortlist — the products we&apos;d recommend first.</p>
            <Link href="/shop" onClick={close} className="btn btn-primary">
              Explore the collection <Icon name="arrow" size={16} className="btn-arrow" />
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-rule overflow-y-auto px-5">
              {lines.map((l) => {
                const options = [l.product.colors.length > 1 ? l.color.name : null, l.config?.label].filter(Boolean).join(" · ");
                return (
                  <li key={l.key} className="flex gap-4 py-4">
                    <Link href={`/product/${l.product.slug}`} onClick={close} className="relative size-[88px] shrink-0 overflow-hidden rounded-lg bg-paper-2">
                      <Image src={primaryImage(l.product, l.color.id).src} alt={l.product.name} fill sizes="88px" className="object-contain p-2" />
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link href={`/product/${l.product.slug}`} onClick={close} className="block font-semibold leading-snug hover:underline">
                            {l.product.name}
                          </Link>
                          <p className="mt-0.5 text-sm text-muted">{[l.product.brand, options].filter(Boolean).join(" · ")}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="font-semibold tabular-nums">{formatPrice(l.lineTotal)}</p>
                          {l.item.quantity > 1 && <p className="text-xs text-muted tabular-nums">{formatPrice(l.unitPrice)} each</p>}
                        </div>
                      </div>
                      {!l.available && <p className="mt-1 text-sm text-danger">No longer available. Please remove it.</p>}
                      <div className="mt-auto flex items-center justify-between pt-3">
                        <QuantityStepper
                          size="sm"
                          value={l.item.quantity}
                          max={stockLimit(l.product)}
                          onChange={(n) => setQuantity(l.key, n, l.product)}
                          label={`Quantity of ${l.product.name}`}
                        />
                        <button
                          type="button"
                          onClick={() => removeFromCart(l.key)}
                          className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                        >
                          <Icon name="trash" size={15} /> Remove
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="border-t border-ink bg-paper-2 px-5 py-5">
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt>Subtotal</dt>
                  <dd className="font-mono tabular-nums">{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex justify-between gap-6 text-muted">
                  <dt>Delivery</dt>
                  <dd className="text-right">{delivery.feeUSD === null ? "Confirmed by phone" : formatPrice(delivery.feeUSD)}</dd>
                </div>
              </dl>
              {hasUnavailable && <p className="mt-3 text-sm text-danger">Remove unavailable items to continue.</p>}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Link href="/cart" onClick={close} className="btn btn-outline">
                  View cart
                </Link>
                <Link
                  href="/checkout"
                  onClick={(e) => {
                    if (hasUnavailable) e.preventDefault();
                    else close();
                  }}
                  aria-disabled={hasUnavailable}
                  className={`btn btn-primary ${hasUnavailable ? "pointer-events-none opacity-40" : ""}`}
                >
                  Checkout <Icon name="arrow" size={16} className="btn-arrow" />
                </Link>
              </div>
              <button type="button" onClick={close} className="mt-4 w-full text-center text-sm font-medium text-muted hover:text-ink">
                Continue shopping
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
