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

  if (!hydrated) return <div className="skeleton h-[600px] rounded-3xl" aria-busy="true" />;

  if (!lines.length && !placed) {
    return (
      <div className="flex flex-col rounded-3xl bg-paper-2 items-center px-6 py-14 text-center md:py-20">
        <span className="grid size-16 place-items-center rounded-full bg-paper-3 text-muted">
          <Icon name="bag" size={28} />
        </span>
        <p className="mt-5 text-2xl font-semibold tracking-tight md:text-3xl">Nothing to check out.</p>
        <p className="mt-2 text-muted">Your cart is empty. Add something first.</p>
        <Link href="/shop" className="btn btn-primary mt-7">
          Explore the collection
        </Link>
      </div>
    );
  }
  if (placed) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center" role="status">
        <span className="grid size-14 place-items-center rounded-full bg-ok/15 text-ok">
          <Icon name="check" size={28} />
        </span>
        <p className="text-2xl font-semibold tracking-tight md:text-3xl">Order received.</p>
        <p className="text-muted">Taking you to your confirmation…</p>
      </div>
    );
  }

  const delivery = store.deliveryMethods.find((d) => d.id === form.deliveryMethod)!;

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="grid gap-6 lg:grid-cols-12 lg:gap-10">
      <div className="space-y-4 md:space-y-5 lg:col-span-7">
        <Step n={1} title="Contact">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="First name" name="firstName" autoComplete="given-name" value={form.firstName} onChange={set("firstName")} error={errors.firstName} />
            <TextField label="Last name" name="lastName" autoComplete="family-name" value={form.lastName} onChange={set("lastName")} error={errors.lastName} />
            <TextField label="Email" name="email" type="email" inputMode="email" autoComplete="email" value={form.email} onChange={set("email")} error={errors.email} hint="We email your receipt here." />
            <TextField label="WhatsApp / phone number" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+961 70 123 456" value={form.phone} onChange={set("phone")} error={errors.phone} hint="We send your order confirmation here and call to arrange delivery." />
          </div>
        </Step>

        <Step n={2} title="Delivery address">
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

        <Step n={3} title="Payment">
          <Radios name="paymentMethod" value={form.paymentMethod} onChange={set("paymentMethod")} options={store.paymentMethods.map((p) => ({ id: p.id, label: p.label, description: p.description }))} />
          <p className="mt-4 flex gap-2 text-[13px] leading-relaxed text-muted">
            <Icon name="info" size={16} className="shrink-0" /> Online card payment isn&apos;t available yet. Nothing is charged when you place your order.
          </p>
        </Step>

        <Step n={4} title="Confirm">
          <label className="flex cursor-pointer items-start gap-3 text-[15px]">
            <input type="checkbox" name="acceptTerms" checked={form.acceptTerms} onChange={set("acceptTerms")} className="mt-0.5 size-[18px] shrink-0 accent-accent" aria-invalid={!!errors.acceptTerms} aria-describedby={errors.acceptTerms ? "acceptTerms-error" : undefined} />
            <span>
              I agree to the{" "}
              <Link href="/terms" target="_blank" className="text-link">
                terms &amp; conditions
              </Link>{" "}
              and{" "}
              <Link href="/privacy" target="_blank" className="text-link">
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
            <button type="submit" disabled={submitting || hasUnavailable} className="btn btn-primary h-14 w-full text-base">
              {submitting ? "Placing order…" : `Place order · ${formatPrice(subtotal + (delivery.feeUSD ?? 0))}`}
            </button>
            <p className="text-[13px] leading-relaxed text-muted">
              Your order is sent to our team, who will call you to confirm availability, delivery fee and timing before dispatch. You pay {store.paymentMethods.find((p) => p.id === form.paymentMethod)?.label.toLowerCase()}.
            </p>
          </div>
        </Step>
      </div>

      {/* summary */}
      <aside className="order-first lg:order-none lg:col-span-5" aria-label="Order summary">
        <div className="rounded-3xl bg-paper-2 lg:sticky lg:top-24">
          <details className="group" open>
            <summary className="flex list-none items-center justify-between p-5 md:px-6 lg:pointer-events-none [&::-webkit-details-marker]:hidden">
              <span className="text-xl font-semibold tracking-tight">Order summary</span>
              <span className="flex items-center gap-2 text-sm text-muted">
                {count} {count === 1 ? "item" : "items"} <Icon name="chevronDown" size={16} className="transition-transform group-open:rotate-180 lg:hidden" />
              </span>
            </summary>
            <ul className="max-h-[360px] space-y-3 overflow-y-auto px-5 pb-5 pt-1.5 md:px-6">
              {lines.map((l) => (
                <li key={l.key} className="flex items-center gap-3.5">
                  <span className="relative size-16 shrink-0 rounded-2xl bg-paper-3">
                    <Image src={primaryImage(l.product, l.color.id).src} alt="" fill sizes="64px" className="rounded-2xl object-contain p-1.5" />
                    <span className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-ink text-[11px] font-semibold text-paper ring-2 ring-paper-2">{l.item.quantity}</span>
                  </span>
                  <span className="min-w-0 flex-1 text-sm">
                    <span className="block font-semibold">{l.product.name}</span>
                    <span className="block text-muted">{[l.product.colors.length > 1 ? l.color.name : null, l.config?.label].filter(Boolean).join(" · ")}</span>
                    {!l.available && <span className="block text-danger">Unavailable — remove from cart</span>}
                  </span>
                  <span className="text-sm font-semibold tabular-nums">{formatPrice(l.lineTotal)}</span>
                </li>
              ))}
            </ul>
          </details>
          <dl className="mx-5 space-y-2.5 border-t border-rule-strong/60 py-5 text-[15px] md:mx-6">
            <div className="flex justify-between">
              <dt className="text-ink-2">Subtotal</dt>
              <dd className="font-semibold tabular-nums">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-6">
              <dt className="text-ink-2">Delivery</dt>
              <dd className="text-right text-muted">{delivery.feeUSD === null ? "Confirmed by phone" : formatPrice(delivery.feeUSD)}</dd>
            </div>
            <div className="flex justify-between border-t border-rule-strong/60 pt-4 text-lg font-semibold">
              <dt>Total{delivery.feeUSD === null ? " before delivery" : ""}</dt>
              <dd className="tabular-nums">{formatPrice(subtotal + (delivery.feeUSD ?? 0))}</dd>
            </div>
          </dl>
          <div className="px-5 pb-5 md:px-6">
            <Link href="/cart" className="text-link text-sm">
              Edit cart
            </Link>
          </div>
        </div>
      </aside>
    </form>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-3xl bg-paper-2 p-5 md:p-7">
      <legend className="contents">
        <span className="mb-5 flex items-center gap-3">
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-ink text-[13px] font-semibold text-paper" aria-hidden>
            {n}
          </span>
          <span className="text-xl font-semibold tracking-tight">{title}</span>
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
    <div className="grid gap-2.5">
      {options.map((o) => (
        <label
          key={o.id}
          className={cn(
            "flex cursor-pointer items-start gap-3 rounded-2xl p-4 transition-all",
            value === o.id ? "bg-accent/10 ring-2 ring-accent" : "bg-paper ring-1 ring-rule-strong hover:ring-subtle",
          )}
        >
          <input type="radio" name={name} value={o.id} checked={value === o.id} onChange={onChange} className="mt-1 size-[18px] shrink-0 accent-accent" />
          <span className="flex-1">
            <span className="block font-semibold">{o.label}</span>
            <span className="mt-0.5 block text-sm text-muted">{o.description}</span>
          </span>
          {o.aside && <span className="text-right text-sm text-muted">{o.aside}</span>}
        </label>
      ))}
    </div>
  );
}
