"use client";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { cartStore, removeFromCart, resolveCart, setQuantity, stockLimit } from "@/lib/shop-state";
import { primaryImage } from "@/lib/catalog";
import { useShopData } from "@/components/layout/ShopData";
import { formatPrice } from "@/lib/format";

export function CartView() {
  const cart = cartStore.use();
  const hydrated = cartStore.useHydrated();
  const { getProduct, settings } = useShopData();
  const { store } = settings;
  const { lines, subtotal, count, hasUnavailable } = resolveCart(cart, getProduct);
  const delivery = store.deliveryMethods[0];

  if (!hydrated) {
    return (
      <div className="grid gap-8 lg:grid-cols-12" aria-busy="true">
        <div className="space-y-3 lg:col-span-8">
          {[0, 1].map((i) => (
            <div key={i} className="skeleton h-36 rounded-3xl" />
          ))}
        </div>
        <div className="skeleton h-72 rounded-3xl lg:col-span-4" />
      </div>
    );
  }

  if (!lines.length) {
    return (
      <div className="flex flex-col rounded-3xl bg-paper-2 items-center px-6 py-14 text-center md:py-20">
        <span className="grid size-16 place-items-center rounded-full bg-paper-3 text-muted">
          <Icon name="bag" size={28} />
        </span>
        <p className="mt-5 text-2xl font-semibold tracking-tight md:text-3xl">Your cart is empty.</p>
        <p className="mt-2 max-w-md text-muted">Nothing added yet. Start with the shortlist on the homepage or browse by category.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-2">
          <Link href="/shop" className="btn btn-primary">
            Explore the collection
          </Link>
          <Link href="/wishlist" className="btn btn-outline">
            View wishlist
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
      <div className="lg:col-span-8">
        <ul className="divide-y divide-rule rounded-3xl bg-paper-2 px-4 md:px-6">
          {lines.map((l) => (
            <li key={l.key} className="grid grid-cols-[88px_1fr] gap-4 py-5 md:grid-cols-[120px_1fr_auto] md:gap-6 md:py-6">
              <Link href={`/product/${l.product.slug}?color=${l.color.id}${l.config ? `&config=${l.config.id}` : ""}`} className="relative block aspect-square overflow-hidden rounded-2xl bg-paper-3 md:row-span-2">
                <Image src={primaryImage(l.product, l.color.id).src} alt={l.product.name} fill sizes="120px" className="object-contain p-2.5" />
              </Link>
              <div className="min-w-0">
                <p className="text-[13px] text-muted">{l.product.brand}</p>
                <Link href={`/product/${l.product.slug}`} className="text-[15px] font-semibold leading-snug hover:underline md:text-base">
                  {l.product.name}
                </Link>
                <dl className="mt-1 text-sm text-muted">
                  {l.product.colors.length > 1 && (
                    <div>
                      <dt className="inline">Colour: </dt>
                      <dd className="inline">{l.color.name}</dd>
                    </div>
                  )}
                  {l.config && (
                    <div>
                      <dt className="inline">{l.product.configLabel ?? "Option"}: </dt>
                      <dd className="inline">{l.config.label}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="inline">Unit price: </dt>
                    <dd className="inline tabular-nums">{formatPrice(l.unitPrice)}</dd>
                  </div>
                </dl>
                {!l.available && <p className="mt-1 text-sm text-danger">No longer available. Please remove it to continue.</p>}
              </div>
              <p className="col-start-2 text-lg font-semibold tabular-nums md:col-start-3 md:row-start-1 md:text-right">{formatPrice(l.lineTotal)}</p>
              <div className="col-start-2 flex flex-wrap items-center justify-between gap-3 md:col-span-2 md:col-start-2">
                <QuantityStepper value={l.item.quantity} max={stockLimit(l.product)} onChange={(n) => setQuantity(l.key, n, l.product)} label={`Quantity of ${l.product.name}`} />
                <button type="button" onClick={() => removeFromCart(l.key)} className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-muted transition-colors hover:bg-danger/10 hover:text-danger">
                  <Icon name="trash" size={14} /> Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
        <Link href="/shop" className="text-link mt-6 inline-flex items-center gap-1.5 text-[15px]">
          <Icon name="arrowLeft" size={14} /> Continue shopping
        </Link>
      </div>

      <aside className="lg:col-span-4" aria-label="Order summary">
        <div className="sticky top-24 rounded-3xl bg-paper-2 p-6 md:p-7">
          <h2 className="text-xl font-semibold tracking-tight">Order summary</h2>
          <dl className="mt-5 space-y-3 text-[15px]">
            <div className="flex justify-between">
              <dt className="text-ink-2">
                Subtotal ({count} {count === 1 ? "item" : "items"})
              </dt>
              <dd className="font-semibold tabular-nums">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-6">
              <dt className="text-ink-2">Delivery</dt>
              <dd className="text-right text-muted">{delivery.feeUSD === null ? "Confirmed by phone" : formatPrice(delivery.feeUSD)}</dd>
            </div>
            <div className="flex justify-between border-t border-rule-strong/60 pt-4 text-lg font-semibold">
              <dt>Total{delivery.feeUSD === null ? " (before delivery)" : ""}</dt>
              <dd className="tabular-nums">{formatPrice(subtotal + (delivery.feeUSD ?? 0))}</dd>
            </div>
          </dl>
          <p className="mt-4 text-[13px] leading-relaxed text-muted">{delivery.description}</p>
          {hasUnavailable && <p className="mt-3 text-sm text-danger">Remove unavailable items to check out.</p>}
          <Link
            href="/checkout"
            aria-disabled={hasUnavailable}
            className={`btn btn-primary mt-6 w-full ${hasUnavailable ? "pointer-events-none opacity-40" : ""}`}
          >
            Proceed to checkout
          </Link>
          <ul className="mt-6 space-y-2.5 border-t border-rule-strong/60 pt-5 text-[13px] text-muted">
            {store.paymentMethods.map((p) => (
              <li key={p.id} className="flex items-center gap-2.5">
                <Icon name="cash" size={16} className="text-ink-2" /> {p.label}
              </li>
            ))}
            <li className="flex items-center gap-2.5">
              <Icon name="truck" size={16} className="text-ink-2" /> Delivery across {store.country}
            </li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
