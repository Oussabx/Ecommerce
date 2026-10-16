"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FormError, SelectField, TextAreaField, TextField } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { cartStore, clearCart, resolveCart } from "@/lib/shop-state";
import { primaryImage } from "@/lib/catalog";
import { api } from "@/lib/api";
import { isEmail, isPhone, required } from "@/lib/client-validation";
import { useShopData } from "@/components/layout/ShopData";
import { cn, formatPrice } from "@/lib/format";

type Form = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  area: string;
  notes: string;
  deliveryMethod: string;
  paymentMethod: string;
  acceptTerms: boolean;
};

const DRAFT_KEY = "osa.checkout.v1";

export function CheckoutForm() {
  const router = useRouter();
  const cart = cartStore.use();
  const hydrated = cartStore.useHydrated();
  const { getProduct, settings } = useShopData();
  const { store } = settings;
  const { lines, subtotal, count, hasUnavailable } = resolveCart(cart, getProduct);
  const [form, setForm] = useState<Form>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    area: "",
    notes: "",
    deliveryMethod: store.deliveryMethods[0].id,
    paymentMethod: store.paymentMethods[0].id,
    acceptTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState(false);
  const idempotencyKey = useRef<string>("");
  const formRef = useRef<HTMLFormElement>(null);

  // Restore a draft (contact + address only).
  useEffect(() => {
    idempotencyKey.current = crypto.randomUUID();
    try {
      const draft = JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? "null");
      if (draft && typeof draft === "object") setForm((f) => ({ ...f, ...draft, acceptTerms: false }));
    } catch {}
  }, []);

  useEffect(() => {
    const { acceptTerms: _a, ...draft } = form;
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {}
  }, [form]);

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const v = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!required(form.firstName)) e.firstName = "Enter your first name.";
    if (!required(form.lastName)) e.lastName = "Enter your last name.";
    if (!isEmail(form.email)) e.email = "Enter a valid email address.";
    if (!isPhone(form.phone)) e.phone = "Enter a valid phone number, e.g. +961 70 123 456.";
    if (form.line1.trim().length < 3) e.line1 = "Enter your street and building.";
    if (form.city.trim().length < 2) e.city = "Enter your city or town.";
    if (!store.deliveryAreas.includes(form.area)) e.area = "Choose a governorate.";
    if (!form.acceptTerms) e.acceptTerms = "Please accept the terms to place your order.";
    return e;
  };

  const focusFirstError = (errs: Record<string, string>) => {
    const first = Object.keys(errs).find((k) => errs[k]);
    if (!first) return;
    const el = formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`);
    el?.focus();
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) {
      setFormError("Please check the highlighted fields.");
      focusFirstError(errs);
      return;
    }
    setSubmitting(true);
    const res = await api<{ ref: string; token: string }>("/api/orders", {
      customer: { firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone },
      address: { line1: form.line1, line2: form.line2, city: form.city, area: form.area, notes: form.notes },
      deliveryMethod: form.deliveryMethod,
      paymentMethod: form.paymentMethod,
      items: cart.map(({ slug, colorId, configId, quantity }) => ({ slug, colorId, configId, quantity })),
      acceptTerms: form.acceptTerms,
      idempotencyKey: idempotencyKey.current,
    });
    if (!res.ok || !res.data) {
      setSubmitting(false);
      // Map nested server field names (customer.email → email).
      const mapped: Record<string, string> = {};
      for (const [k, v] of Object.entries(res.fields ?? {})) mapped[k.split(".").pop()!] = v;
      setErrors(mapped);
      setFormError(res.error ?? "We couldn't place your order.");
      focusFirstError(mapped);
      return;
    }
    // Only after the server has accepted the order:
    setPlaced(true);
    try {
      sessionStorage.removeItem(DRAFT_KEY);
    } catch {}
    clearCart();
    router.replace(`/order/${res.data.ref}?t=${res.data.token}`);
  }

  if (!hydrated) return <div className="skeleton h-[600px]" aria-busy="true" />;

  if (!lines.length && !placed) {
    return (
      <div className="border border-rule p-10 md:p-16">
        <p className="display text-5xl md:text-7xl">Nothing to check out.</p>
        <p className="mt-4 text-muted">Your cart is empty. Add something first.</p>
        <Link href="/shop" className="btn btn-primary mt-8">
          Explore the collection <Icon name="arrow" size={16} className="btn-arrow" />
        </Link>
      </div>
    );
  }
  if (placed) {
    return (
      <div className="flex min-h-[40vh] flex-col items-start justify-center gap-4" role="status">
        <p className="display text-5xl">Order received.</p>
        <p className="text-muted">Taking you to your confirmation…</p>
      </div>
    );
  }

  const delivery = store.deliveryMethods.find((d) => d.id === form.deliveryMethod)!;

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="grid gap-10 lg:grid-cols-12">
      <div className="space-y-10 lg:col-span-7">

        <Step n="01" title="Contact">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="First name" name="firstName" autoComplete="given-name" value={form.firstName} onChange={set("firstName")} error={errors.firstName} />
            <TextField label="Last name" name="lastName" autoComplete="family-name" value={form.lastName} onChange={set("lastName")} error={errors.lastName} />
            <TextField label="Email" name="email" type="email" inputMode="email" autoComplete="email" value={form.email} onChange={set("email")} error={errors.email} hint="We email your receipt here." />
            <TextField label="WhatsApp / phone number" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+961 70 123 456" value={form.phone} onChange={set("phone")} error={errors.phone} hint="We send your order confirmation here and call to arrange delivery." />
          </div>
        </Step>

        <Step n="02" title="Delivery address">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField className="sm:col-span-2" label="Street, building, floor" name="line1" autoComplete="address-line1" value={form.line1} onChange={set("line1")} error={errors.line1} />
            <TextField className="sm:col-span-2" label="Apartment, landmark" name="line2" optional autoComplete="address-line2" value={form.line2} onChange={set("line2")} error={errors.line2} hint="Landmarks help our drivers find you." />
            <TextField label="City / town" name="city" autoComplete="address-level2" value={form.city} onChange={set("city")} error={errors.city} />
            <SelectField label="Governorate" name="area" value={form.area} onChange={set("area")} error={errors.area}>
              <option value="">Select…</option>
              {store.deliveryAreas.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </SelectField>
            <TextAreaField className="sm:col-span-2" label="Delivery notes" name="notes" optional rows={3} value={form.notes} onChange={set("notes")} error={errors.notes} />
          </div>
        </Step>


        <Step n="03" title="Payment">
          <Radios name="paymentMethod" value={form.paymentMethod} onChange={set("paymentMethod")} options={store.paymentMethods.map((p) => ({ id: p.id, label: p.label, description: p.description }))} />
          <p className="mt-3 flex gap-2 text-xs text-muted">
            <Icon name="info" size={16} className="shrink-0" /> Online card payment isn&apos;t available yet. Nothing is charged when you place your order.
          </p>
        </Step>

        <Step n="04" title="Confirm">
          <label className="flex cursor-pointer items-start gap-3 text-sm">
            <input type="checkbox" name="acceptTerms" checked={form.acceptTerms} onChange={set("acceptTerms")} className="mt-0.5 size-4 accent-ink" aria-invalid={!!errors.acceptTerms} aria-describedby={errors.acceptTerms ? "acceptTerms-error" : undefined} />
            <span>
              I agree to the{" "}
              <Link href="/terms" target="_blank" className="underline underline-offset-4">
                terms &amp; conditions
              </Link>{" "}
              and{" "}
              <Link href="/privacy" target="_blank" className="underline underline-offset-4">
                privacy policy
              </Link>
              .
            </span>
          </label>
          {errors.acceptTerms && (
            <p id="acceptTerms-error" className="mt-1.5 text-sm text-danger">
              {errors.acceptTerms}
            </p>
          )}
          <div className="mt-6 space-y-4">
            <FormError message={formError} />
            <button type="submit" disabled={submitting || hasUnavailable} className="btn btn-primary w-full text-sm">
              {submitting ? "Placing order…" : `Place order · ${formatPrice(subtotal + (delivery.feeUSD ?? 0))}`}
              {!submitting && <Icon name="arrow" size={16} className="btn-arrow" />}
            </button>
            <p className="text-xs leading-relaxed text-muted">
              Your order is sent to our team, who will call you to confirm availability, delivery fee and timing before dispatch. You pay {store.paymentMethods.find((p) => p.id === form.paymentMethod)?.label.toLowerCase()}.
            </p>
          </div>
        </Step>
      </div>

      {/* summary */}
      <aside className="order-first lg:order-none lg:col-span-5" aria-label="Order summary">
        <div className="border border-ink bg-paper-2 lg:sticky lg:top-24">
          <details className="group" open>
            <summary className="flex list-none items-center justify-between p-5 lg:pointer-events-none [&::-webkit-details-marker]:hidden">
              <span className="display text-3xl">Order summary</span>
              <span className="flex items-center gap-2 font-mono text-sm">
                {count} {count === 1 ? "item" : "items"} <Icon name="chevronDown" size={16} className="transition-transform group-open:rotate-180 lg:hidden" />
              </span>
            </summary>
            <ul className="max-h-[360px] divide-y divide-rule overflow-y-auto border-t border-rule px-5">
              {lines.map((l) => (
                <li key={l.key} className="flex gap-3 py-3">
                  <span className="relative size-16 shrink-0 bg-paper">
                    <Image src={primaryImage(l.product, l.color.id).src} alt="" fill sizes="64px" className="object-contain p-1" />
                    <span className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center bg-ink font-mono text-[10px] text-paper">{l.item.quantity}</span>
                  </span>
                  <span className="min-w-0 flex-1 text-sm">
                    <span className="block font-semibold">{l.product.name}</span>
                    <span className="block text-muted">{[l.product.colors.length > 1 ? l.color.name : null, l.config?.label].filter(Boolean).join(" · ")}</span>
                    {!l.available && <span className="block text-danger">Unavailable — remove from cart</span>}
                  </span>
                  <span className="font-mono text-sm tabular-nums">{formatPrice(l.lineTotal)}</span>
                </li>
              ))}
            </ul>
          </details>
          <dl className="space-y-2 border-t border-rule p-5 text-sm">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd className="font-mono tabular-nums">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-6">
              <dt>Delivery</dt>
              <dd className="text-right text-muted">{delivery.feeUSD === null ? "Confirmed by phone" : formatPrice(delivery.feeUSD)}</dd>
            </div>
            <div className="flex justify-between border-t border-ink pt-3 text-base font-semibold">
              <dt>Total{delivery.feeUSD === null ? " before delivery" : ""}</dt>
              <dd className="font-mono tabular-nums">{formatPrice(subtotal + (delivery.feeUSD ?? 0))}</dd>
            </div>
          </dl>
          <div className="border-t border-rule px-5 py-3">
            <Link href="/cart" className="label text-muted hover:text-ink">
              Edit cart
            </Link>
          </div>
        </div>
      </aside>
    </form>
  );
}

function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-t border-ink pt-4">
      <legend className="contents">
        <span className="mb-5 flex items-baseline gap-4">
          <span className="label text-muted">{n}</span>
          <span className="display text-3xl md:text-4xl">{title}</span>
        </span>
      </legend>
      {children}
    </fieldset>
  );
}

function Radios({
  name,
  value,
  onChange,
  options,
}: {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  options: { id: string; label: string; description: string; aside?: string }[];
}) {
  return (
    <div className="grid gap-2">
      {options.map((o) => (
        <label key={o.id} className={cn("flex cursor-pointer items-start gap-3 border p-4 transition-colors", value === o.id ? "border-ink bg-paper-2" : "border-rule-strong hover:border-ink")}>
          <input type="radio" name={name} value={o.id} checked={value === o.id} onChange={onChange} className="mt-1 size-4 accent-ink" />
          <span className="flex-1">
            <span className="block font-semibold">{o.label}</span>
            <span className="mt-0.5 block text-sm text-muted">{o.description}</span>
          </span>
          {o.aside && <span className="label text-right text-muted">{o.aside}</span>}
        </label>
      ))}
    </div>
  );
}
