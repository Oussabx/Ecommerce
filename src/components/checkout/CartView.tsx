"use client";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { cartStore, removeFromCart, resolveCart, setQuantity, stockLimit } from "@/lib/shop-state";
import { primaryImage } from "@/lib/catalog";
import { store } from "@/config/store";
import { formatPrice } from "@/lib/format";

export function CartView() {
  const cart = cartStore.use();
  const hydrated = cartStore.useHydrated();
  const { lines, subtotal, count, hasUnavailable } = resolveCart(cart);
  const delivery = store.deliveryMethods[0];

  if (!hydrated) {
    return (
      <div className="grid gap-10 lg:grid-cols-12" aria-busy="true">
        <div className="space-y-3 lg:col-span-8">
          {[0, 1].map((i) => (
            <div key={i} className="skeleton h-32" />
          ))}
        </div>
        <div className="skeleton h-64 lg:col-span-4" />
      </div>
    );
  }

  if (!lines.length) {
    return (
      <div className="border border-rule p-10 md:p-16">
        <p className="display text-5xl md:text-7xl">Your cart is empty.</p>
        <p className="mt-4 max-w-md text-muted">Nothing added yet. Start with the shortlist on the homepage or browse by category.</p>
        <div className="mt-8 flex flex-wrap gap-2">
          <Link href="/shop" className="btn btn-primary">
            Explore the collection <Icon name="arrow" size={16} className="btn-arrow" />
          </Link>
          <Link href="/wishlist" className="btn btn-outline">
            View wishlist
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <div className="lg:col-span-8">
        <div className="label hidden grid-cols-[1fr_140px_120px] gap-4 border-b border-ink pb-2 text-muted md:grid">
          <span>Product</span>
          <span>Quantity</span>
          <span className="text-right">Total</span>
        </div>
        <ul className="divide-y divide-rule border-b border-rule">
          {lines.map((l) => (
            <li key={l.key} className="grid grid-cols-[96px_1fr] gap-4 py-5 md:grid-cols-[120px_1fr_140px_120px] md:items-center">
              <Link href={`/product/${l.product.slug}?color=${l.color.id}${l.config ? `&config=${l.config.id}` : ""}`} className="relative block aspect-square bg-paper-2">
                <Image src={primaryImage(l.product, l.color.id).src} alt={l.product.name} fill sizes="120px" className="object-contain p-2" />
              </Link>
              <div className="min-w-0">
                <p className="label text-muted">{l.product.brand}</p>
                <Link href={`/product/${l.product.slug}`} className="font-semibold hover:underline">
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
                    <dd className="inline font-mono tabular-nums">{formatPrice(l.unitPrice)}</dd>
                  </div>
                </dl>
                {!l.available && <p className="mt-1 text-sm text-danger">No longer available. Please remove it to continue.</p>}
                <button type="button" onClick={() => removeFromCart(l.key)} className="label mt-2 inline-flex items-center gap-1 text-muted hover:text-danger">
                  <Icon name="trash" size={14} /> Remove
                </button>
              </div>
              <div className="col-start-2 md:col-start-auto">
                <QuantityStepper value={l.item.quantity} max={stockLimit(l.product.slug)} onChange={(n) => setQuantity(l.key, n)} label={`Quantity of ${l.product.name}`} />
              </div>
              <p className="col-start-2 font-mono tabular-nums md:col-start-auto md:text-right">{formatPrice(l.lineTotal)}</p>
            </li>
          ))}
        </ul>
        <Link href="/shop" className="label mt-6 inline-flex items-center gap-2 hover:text-cobalt">
          <Icon name="arrowLeft" size={14} /> Continue shopping
        </Link>
      </div>

      <aside className="lg:col-span-4" aria-label="Order summary">
        <div className="sticky top-24 border border-ink bg-paper-2 p-5 md:p-6">
          <h2 className="display text-4xl">Summary</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt>
                Subtotal ({count} {count === 1 ? "item" : "items"})
              </dt>
              <dd className="font-mono tabular-nums">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-6">
              <dt>Delivery</dt>
              <dd className="text-right text-muted">{delivery.feeUSD === null ? "Confirmed by phone" : formatPrice(delivery.feeUSD)}</dd>
            </div>
            <div className="flex justify-between border-t border-ink pt-3 text-base font-semibold">
              <dt>Total{delivery.feeUSD === null ? " (before delivery)" : ""}</dt>
              <dd className="font-mono tabular-nums">{formatPrice(subtotal + (delivery.feeUSD ?? 0))}</dd>
            </div>
          </dl>
          <p className="mt-4 text-xs leading-relaxed text-muted">{delivery.description}</p>
          {hasUnavailable && <p className="mt-3 text-sm text-danger">Remove unavailable items to check out.</p>}
          <Link
            href="/checkout"
            aria-disabled={hasUnavailable}
            className={`btn btn-primary mt-5 w-full ${hasUnavailable ? "pointer-events-none opacity-40" : ""}`}
          >
            Proceed to checkout <Icon name="arrow" size={16} className="btn-arrow" />
          </Link>
          <ul className="mt-5 space-y-2 text-xs text-muted">
            {store.paymentMethods.map((p) => (
              <li key={p.id} className="flex items-center gap-2">
                <Icon name="cash" size={14} /> {p.label}
              </li>
            ))}
            <li className="flex items-center gap-2">
              <Icon name="truck" size={14} /> Delivery across {store.country}
            </li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
