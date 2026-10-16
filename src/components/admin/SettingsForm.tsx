"use client";
import { useState } from "react";
import type { StoreSettings } from "@/config/store-defaults";
import { saveStoreSettings } from "@/app/admin/settings/actions";
import { FormError } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { useAction } from "./useAction";

type S = Omit<StoreSettings, "deliveryMethods"> & { deliveryMethods: (Omit<StoreSettings["deliveryMethods"][number], "feeUSD"> & { feeUSD: number | string | null })[] };

export function SettingsForm({ initial }: { initial: StoreSettings }) {
  const [s, setS] = useState<S>(initial);
  const a = useAction();
  const f = (k: string) => a.fields[k];
  const firstErr = (prefix: string) => Object.entries(a.fields).find(([k]) => k.startsWith(prefix))?.[1];
  const upd = (patch: Partial<S>) => setS((x) => ({ ...x, ...patch }));

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        a.exec(() => saveStoreSettings(s));
      }}
      className="grid gap-6 xl:grid-cols-3"
    >
      <div className="space-y-6 xl:col-span-2">
        <Box title="Store">
          <div className="grid gap-4 sm:grid-cols-2">
            <In label="Store name" value={s.name} error={f("name")} onChange={(v) => upd({ name: v })} />
            <In label="Legal / business name" value={s.legalName} error={f("legalName")} onChange={(v) => upd({ legalName: v })} />
            <In label="Tagline" value={s.tagline} onChange={(v) => upd({ tagline: v })} />
            <In label="Country" value={s.country} onChange={(v) => upd({ country: v })} />
            <Ta className="sm:col-span-2" label="Short description (footer & search engines)" value={s.description} onChange={(v) => upd({ description: v })} />
          </div>
          <label className="mt-4 flex items-start gap-3 text-sm">
            <input type="checkbox" checked={s.sampleCatalog} onChange={(e) => upd({ sampleCatalog: e.target.checked })} className="mt-0.5 size-4 accent-ink" />
            <span>
              <span className="font-semibold">Show “Sample catalogue” notice</span>
              <span className="block text-muted">Turn off once real products, prices and stock are entered.</span>
            </span>
          </label>
        </Box>

        <Box title="Contact details" note="Shown in the footer and on the contact page. Leave empty to hide.">
          <div className="grid gap-4 sm:grid-cols-2">
            <In label="Phone" value={s.contact.phone ?? ""} onChange={(v) => upd({ contact: { ...s.contact, phone: v } })} placeholder="+961 1 234 567" />
            <In label="WhatsApp number" value={s.contact.whatsapp ?? ""} onChange={(v) => upd({ contact: { ...s.contact, whatsapp: v } })} placeholder="+961 70 123 456" />
            <In label="Email" value={s.contact.email ?? ""} error={f("contact.email")} onChange={(v) => upd({ contact: { ...s.contact, email: v } })} />
            <In label="Opening hours" value={s.contact.hours ?? ""} onChange={(v) => upd({ contact: { ...s.contact, hours: v } })} placeholder="Mon–Sat, 10:00–19:00" />
            <Ta className="sm:col-span-2" label="Address" value={s.contact.address ?? ""} onChange={(v) => upd({ contact: { ...s.contact, address: v } })} />
          </div>
          <h3 className="label mb-2 mt-6">Social links</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {(["instagram", "facebook", "tiktok", "youtube"] as const).map((k) => (
              <In key={k} label={k[0].toUpperCase() + k.slice(1)} value={s.social[k]} error={f(`social.${k}`)} placeholder="https://" onChange={(v) => upd({ social: { ...s.social, [k]: v } })} />
            ))}
          </div>
        </Box>

        <Box title="Delivery" note="Fees left empty are shown as “confirmed by phone” to customers.">
          <Ta label="Delivery areas (one per line)" rows={5} value={s.deliveryAreas.join("\n")} error={f("deliveryAreas")} onChange={(v) => upd({ deliveryAreas: v.split("\n").map((x) => x.trim()).filter(Boolean) })} />
          {firstErr("deliveryMethods") && <p className="mt-3 text-sm text-danger">{firstErr("deliveryMethods")}</p>}
          <ul className="mt-4 space-y-3">
            {s.deliveryMethods.map((m, i) => (
              <li key={i} className="grid gap-2 border border-rule p-3 sm:grid-cols-[1fr_140px_120px_auto]">
                <In label="Name" value={m.label} onChange={(v) => upd({ deliveryMethods: s.deliveryMethods.map((x, j) => (j === i ? { ...x, label: v } : x)) })} />
                <In label="Id" value={m.id} onChange={(v) => upd({ deliveryMethods: s.deliveryMethods.map((x, j) => (j === i ? { ...x, id: v } : x)) })} />
                <In label="Fee (USD)" value={m.feeUSD === null ? "" : String(m.feeUSD)} placeholder="By phone" onChange={(v) => upd({ deliveryMethods: s.deliveryMethods.map((x, j) => (j === i ? { ...x, feeUSD: v } : x)) })} />
                <button type="button" onClick={() => upd({ deliveryMethods: s.deliveryMethods.filter((_, j) => j !== i) })} className="self-end pb-3 text-danger" aria-label="Remove delivery method">
                  <Icon name="trash" size={16} />
                </button>
                <Ta className="sm:col-span-4" label="Description shown at checkout" rows={2} value={m.description} onChange={(v) => upd({ deliveryMethods: s.deliveryMethods.map((x, j) => (j === i ? { ...x, description: v } : x)) })} />
              </li>
            ))}
          </ul>
          <AddBtn label="Add delivery method" onClick={() => upd({ deliveryMethods: [...s.deliveryMethods, { id: "", label: "", description: "", feeUSD: null }] })} />
        </Box>

        <Box title="Payment methods" note="Only list methods you actually accept. Online card payment needs a payment provider integration first.">
          {firstErr("paymentMethods") && <p className="mb-3 text-sm text-danger">{firstErr("paymentMethods")}</p>}
          <ul className="space-y-3">
            {s.paymentMethods.map((m, i) => (
              <li key={i} className="grid gap-2 border border-rule p-3 sm:grid-cols-[1fr_160px_auto]">
                <In label="Name" value={m.label} onChange={(v) => upd({ paymentMethods: s.paymentMethods.map((x, j) => (j === i ? { ...x, label: v } : x)) })} />
                <In label="Id" value={m.id} onChange={(v) => upd({ paymentMethods: s.paymentMethods.map((x, j) => (j === i ? { ...x, id: v } : x)) })} />
                <button type="button" onClick={() => upd({ paymentMethods: s.paymentMethods.filter((_, j) => j !== i) })} className="self-end pb-3 text-danger" aria-label="Remove payment method">
                  <Icon name="trash" size={16} />
                </button>
                <Ta className="sm:col-span-3" label="Description" rows={2} value={m.description} onChange={(v) => upd({ paymentMethods: s.paymentMethods.map((x, j) => (j === i ? { ...x, description: v } : x)) })} />
              </li>
            ))}
          </ul>
          <AddBtn label="Add payment method" onClick={() => upd({ paymentMethods: [...s.paymentMethods, { id: "", label: "", description: "" }] })} />
        </Box>

        <Box title="Why OSA? (homepage)" note="Only list advantages that are true for the business.">
          <ul className="space-y-3">
            {s.advantages.map((m, i) => (
              <li key={i} className="grid gap-2 border border-rule p-3 sm:grid-cols-[1fr_160px_auto]">
                <In label="Title" value={m.title} onChange={(v) => upd({ advantages: s.advantages.map((x, j) => (j === i ? { ...x, title: v } : x)) })} />
                <In label="Icon id" value={m.id} hint="authentic, warranty, delivery, support, payment" onChange={(v) => upd({ advantages: s.advantages.map((x, j) => (j === i ? { ...x, id: v } : x)) })} />
                <button type="button" onClick={() => upd({ advantages: s.advantages.filter((_, j) => j !== i) })} className="self-end pb-3 text-danger" aria-label="Remove advantage">
                  <Icon name="trash" size={16} />
                </button>
                <Ta className="sm:col-span-3" label="Text" rows={2} value={m.body} onChange={(v) => upd({ advantages: s.advantages.map((x, j) => (j === i ? { ...x, body: v } : x)) })} />
              </li>
            ))}
          </ul>
          {s.advantages.length < 6 && <AddBtn label="Add advantage" onClick={() => upd({ advantages: [...s.advantages, { id: "support", title: "", body: "" }] })} />}
        </Box>
      </div>

      <div>
        <div className="sticky top-4 space-y-6">
          <Box title="Notifications">
            <In label="Send new-order alerts to" value={s.orderNotificationEmail ?? ""} error={f("orderNotificationEmail")} placeholder="orders@yourstore.com" onChange={(v) => upd({ orderNotificationEmail: v })} hint="Requires email to be connected (RESEND_API_KEY)." />
          </Box>
          <Box title="Save">
            <FormError message={a.error} />
            {a.message && !a.error && <p className="label mb-2 text-ok">{a.message}</p>}
            <button disabled={a.pending} className="btn btn-primary w-full">
              {a.pending ? "Saving…" : "Save settings"}
            </button>
          </Box>
        </div>
      </div>
    </form>
  );
}

function Box({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="border border-rule bg-[#fbfaf7]">
      <div className="border-b border-rule px-4 py-3">
        <h2 className="label">{title}</h2>
        {note && <p className="mt-1 text-xs text-muted">{note}</p>}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}
function In({ label, value, onChange, error, hint, placeholder, className }: { label: string; value: string; onChange: (v: string) => void; error?: string; hint?: string; placeholder?: string; className?: string }) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="field text-sm" aria-invalid={!!error} />
      {error ? <span className="mt-1 block text-sm text-danger">{error}</span> : hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}
function Ta({ label, value, onChange, error, rows = 3, className }: { label: string; value: string; onChange: (v: string) => void; error?: string; rows?: number; className?: string }) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} className="field min-h-0 text-sm" aria-invalid={!!error} />
      {error && <span className="mt-1 block text-sm text-danger">{error}</span>}
    </label>
  );
}
function AddBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="label mt-3 inline-flex h-9 items-center gap-1.5 border border-dashed border-rule-strong px-3 hover:border-ink">
      <Icon name="plus" size={12} /> {label}
    </button>
  );
}
