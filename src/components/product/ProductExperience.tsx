"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Gallery } from "./Gallery";
import { WishlistButton } from "./WishlistButton";
import { Icon } from "@/components/ui/Icon";
import { Price } from "@/components/ui/Price";
import { Stock } from "@/components/ui/Stock";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { useUI } from "@/components/layout/UIProvider";
import { availability, priceFor, productImages, LOW_STOCK_THRESHOLD } from "@/lib/catalog";
import type { Product } from "@/data/types";
import { useSettings } from "@/components/layout/ShopData";
import { addToCart, cartStore, recordView, stockLimit } from "@/lib/shop-state";
import { cn, formatPrice } from "@/lib/format";

export function ProductExperience({ product }: { product: Product }) {
  const slug = product.slug;
  const { store } = useSettings();
  const firstAvailable = product.colors.find((c) => availability(product, c.id) !== "out-of-stock") ?? product.colors[0];
  const [colorId, setColorId] = useState(firstAvailable.id);
  const [configId, setConfigId] = useState(product.configs?.[0]?.id);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const buyRef = useRef<HTMLDivElement>(null);
  const { toast, open } = useUI();
  const cart = cartStore.use();

  // Apply ?color= / ?config= from the URL and record the view.
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const c = sp.get("color");
    const k = sp.get("config");
    if (c && product.colors.some((x) => x.id === c)) setColorId(c);
    if (k && product.configs?.some((x) => x.id === k)) setConfigId(k);
    recordView(slug);
  }, [slug, product]);

  // Keep the URL shareable as options change.
  const select = (patch: { color?: string; config?: string }) => {
    if (patch.color) setColorId(patch.color);
    if (patch.config) setConfigId(patch.config);
    const sp = new URLSearchParams(window.location.search);
    if (patch.color) sp.set("color", patch.color);
    if (patch.config) sp.set("config", patch.config);
    window.history.replaceState(null, "", `${window.location.pathname}?${sp}`);
  };

  // Sticky mobile purchase bar when the main buy box scrolls out of view.
  useEffect(() => {
    const el = buyRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setShowSticky(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const color = product.colors.find((c) => c.id === colorId)!;
  const config = product.configs?.find((c) => c.id === configId);
  const { price, compareAt } = priceFor(product, configId);
  const avail = availability(product, colorId);
  const inCart = cart.filter((c) => c.slug === slug).reduce((s, c) => s + c.quantity, 0);
  const maxQty = Math.max(0, stockLimit(product) - inCart);
  const soldOut = avail === "out-of-stock";
  const images = productImages(product, colorId);
  const delivery = store.deliveryMethods[0];

  const add = () => {
    if (soldOut || maxQty <= 0) return;
    const q = Math.min(qty, maxQty);
    addToCart({ slug, colorId, configId, quantity: q }, product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
    setQty(1);
    toast(`Added ${q} × ${product.name}${product.colors.length > 1 ? ` · ${color.name}` : ""}${config ? ` · ${config.label}` : ""}`, { label: "View cart", onClick: () => open("cart") });
  };

  const buyLabel = soldOut ? "Out of stock" : maxQty <= 0 ? "Maximum in cart" : added ? "Added to cart" : "Add to cart";

  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-7">
        <div className="lg:sticky lg:top-24">
          <Gallery images={images} name={product.name} />
        </div>
      </div>

      <div className="lg:col-span-5">
        <p className="label flex flex-wrap gap-x-3 text-muted">
          <span>{product.brand}</span>
          <span aria-hidden>/</span>
          <span>Model {product.model}</span>
          {product.isNew && <span className="bg-lime px-1.5 text-ink">New</span>}
        </p>
        <h1 className="display mt-3 text-[clamp(2.8rem,5.6vw,5.25rem)]">{product.name}</h1>
        <p className="mt-4 text-[17px] leading-relaxed text-ink-2">{product.tagline}</p>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-t border-ink pt-5">
          <div>
            <Price price={price} compareAt={compareAt} size="xl" />
            <p className="label mt-2 text-muted">Price in USD{config ? ` · ${config.label}` : ""}</p>
          </div>
          <div className="text-right">
            <Stock value={avail} />
            {avail === "low-stock" && <p className="mt-1 text-sm text-warn">Only {product.stock} left</p>}
            {avail === "in-stock" && product.stock > LOW_STOCK_THRESHOLD && <p className="mt-1 text-sm text-muted">Ready to order</p>}
          </div>
        </div>

        {/* colour */}
        {product.colors.length > 1 && (
          <fieldset className="mt-7">
            <legend className="label mb-3 flex w-full justify-between">
              <span>Colour</span>
              <span className="text-muted">{color.name}</span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((c) => {
                const out = availability(product, c.id) === "out-of-stock";
                return (
                  <label key={c.id} className="relative cursor-pointer" title={`${c.name}${out ? " — out of stock" : ""}`}>
                    <input type="radio" name="color" value={c.id} checked={c.id === colorId} onChange={() => select({ color: c.id })} className="peer sr-only" />
                    <span className="block size-11 border border-rule-strong p-1 transition-colors peer-checked:border-ink peer-checked:ring-1 peer-checked:ring-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-cobalt">
                      <span className="block size-full" style={{ background: c.swatch }} />
                    </span>
                    {out && <span className="pointer-events-none absolute left-1/2 top-1/2 h-px w-12 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-ink" aria-hidden />}
                    <span className="sr-only">
                      {c.name}
                      {out ? " (out of stock)" : ""}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        )}

        {/* configuration */}
        {product.configs && product.configs.length > 1 && (
          <fieldset className="mt-7">
            <legend className="label mb-3">{product.configLabel ?? "Option"}</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {product.configs.map((c) => (
                <label key={c.id} className="cursor-pointer">
                  <input type="radio" name="config" value={c.id} checked={c.id === configId} onChange={() => select({ config: c.id })} className="peer sr-only" />
                  <span className="flex h-full flex-col border border-rule-strong px-3 py-2.5 transition-colors hover:border-ink peer-checked:border-ink peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-cobalt">
                    <span className="text-sm font-semibold">{c.label}</span>
                    <span className="label mt-0.5 opacity-70">{formatPrice(product.price + c.priceDelta)}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        )}
        {product.configs?.length === 1 && (
          <p className="mt-6 text-sm">
            <span className="label text-muted">{product.configLabel ?? "Configuration"}: </span>
            {product.configs[0].label}
          </p>
        )}

        {/* buy */}
        <div ref={buyRef} className="mt-8 flex flex-wrap gap-2">
          <QuantityStepper value={Math.min(qty, Math.max(1, maxQty))} max={Math.max(1, maxQty)} onChange={setQty} />
          <button type="button" onClick={add} disabled={soldOut || maxQty <= 0} className={cn("btn flex-1", added ? "btn-lime" : "btn-primary")}>
            {added && <Icon name="check" size={16} />} {buyLabel}
          </button>
          <WishlistButton slug={slug} name={product.name} withLabel className="flex-none" />
        </div>
        {inCart > 0 && (
          <p className="mt-2 text-sm text-muted">
            {inCart} already in your cart ·{" "}
            <button type="button" onClick={() => open("cart")} className="underline underline-offset-4">
              View cart
            </button>
          </p>
        )}

        {/* service info */}
        <dl className="mt-8 divide-y divide-rule border-y border-rule text-sm">
          <InfoRow icon="shield" title="Warranty">
            {product.warranty ?? "Warranty terms are confirmed with your order."}{" "}
            <Link href="/warranty" className="underline underline-offset-4">
              How warranty works
            </Link>
          </InfoRow>
          <InfoRow icon="truck" title="Delivery">
            {delivery.description}{" "}
            <Link href="/delivery" className="underline underline-offset-4">
              Details
            </Link>
          </InfoRow>
          <InfoRow icon="cash" title="Payment">
            {store.paymentMethods.map((p) => p.label).join(" · ")}
          </InfoRow>
        </dl>

        {/* highlights */}
        <ul className="mt-8 grid grid-cols-2 gap-px border border-rule bg-rule">
          {product.highlights.map((h, i) => (
            <li key={h.label} className="bg-paper p-4">
              <p className="label text-muted">
                {String(i + 1).padStart(2, "0")} — {h.label}
              </p>
              <p className="mt-1 font-semibold">{h.value}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* sticky mobile purchase bar */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-30 border-t border-ink bg-paper/95 px-4 py-3 backdrop-blur transition-transform duration-300 lg:hidden",
          showSticky ? "translate-y-0" : "translate-y-full",
        )}
        aria-hidden={!showSticky}
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{product.name}</p>
            <p className="font-mono text-sm tabular-nums">{formatPrice(price)}</p>
          </div>
          <button type="button" onClick={add} disabled={soldOut || maxQty <= 0} tabIndex={showSticky ? 0 : -1} className={cn("btn", added ? "btn-lime" : "btn-primary")}>
            {buyLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, title, children }: { icon: "shield" | "truck" | "cash"; title: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[24px_88px_1fr] items-start gap-3 py-3.5">
      <Icon name={icon} size={20} />
      <dt className="label pt-0.5">{title}</dt>
      <dd className="text-ink-2">{children}</dd>
    </div>
  );
}
