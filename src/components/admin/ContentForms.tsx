"use client";
import { useState } from "react";
import type { Campaign } from "@/config/store-defaults";
import type { Category, Collection } from "@/data/types";
import { deleteCategory, deleteCollection, saveAnnouncements, saveCampaign, saveCategory, saveCollection } from "@/app/admin/content/actions";
import { FormError } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { useAction } from "./useAction";

type Opt = { slug: string; name: string; colors: { id: string; name: string }[] };

function Status({ a }: { a: ReturnType<typeof useAction> }) {
  return (
    <>
      <FormError message={a.error} />
      {a.message && !a.error && <p className="text-sm font-medium text-ok">{a.message}</p>}
    </>
  );
}
const field = "field text-sm";
function L({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

export function AnnouncementsForm({ initial }: { initial: string[] }) {
  const [text, setText] = useState(initial.join("\n"));
  const a = useAction();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        a.exec(() => saveAnnouncements(text.split("\n")));
      }}
      className="space-y-3"
    >
      <L label="Messages (one per line, rotate every few seconds)">
        <textarea rows={4} value={text} onChange={(e) => setText(e.target.value)} className={field} />
      </L>
      <p className="text-xs text-muted">Keep them factual — no invented promises or countdowns.</p>
      <Status a={a} />
      <button disabled={a.pending} className="btn btn-primary !min-h-10 text-sm">
        Save announcements
      </button>
    </form>
  );
}

export function CampaignForm({ initial, products }: { initial: Campaign; products: Opt[] }) {
  const [c, setC] = useState<Campaign>(initial);
  const a = useAction();
  const hero = products.find((p) => p.slug === c.heroProduct);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        a.exec(() => saveCampaign(c));
      }}
      className="grid gap-4 sm:grid-cols-2"
    >
      <label className="flex items-center gap-2 text-sm sm:col-span-2">
        <input type="checkbox" checked={c.enabled} onChange={(e) => setC({ ...c, enabled: e.target.checked })} className="size-4 accent-accent" /> Show the campaign section on the homepage
      </label>
      <L label="Headline line 1">
        <input value={c.headline[0]} onChange={(e) => setC({ ...c, headline: [e.target.value, c.headline[1]] })} className={field} />
      </L>
      <L label="Headline line 2 (highlighted)">
        <input value={c.headline[1]} onChange={(e) => setC({ ...c, headline: [c.headline[0], e.target.value] })} className={field} />
      </L>
      <L label="Text" className="sm:col-span-2">
        <textarea rows={3} value={c.body} onChange={(e) => setC({ ...c, body: e.target.value })} className={field} />
      </L>
      <L label="Featured product">
        <select value={c.heroProduct} onChange={(e) => setC({ ...c, heroProduct: e.target.value, heroColor: products.find((p) => p.slug === e.target.value)?.colors[0]?.id ?? "" })} className={field}>
          {products.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.name}
            </option>
          ))}
        </select>
      </L>
      <L label="Featured colour">
        <select value={c.heroColor} onChange={(e) => setC({ ...c, heroColor: e.target.value })} className={field}>
          {hero?.colors.map((col) => (
            <option key={col.id} value={col.id}>
              {col.name}
            </option>
          ))}
        </select>
      </L>
      {[0, 1].map((i) => (
        <L key={i} label={`Supporting product ${i + 1}`}>
          <select
            value={c.supporting[i] ?? ""}
            onChange={(e) => {
              const s = [...c.supporting];
              s[i] = e.target.value;
              setC({ ...c, supporting: s.filter(Boolean) });
            }}
            className={field}
          >
            <option value="">None</option>
            {products.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
        </L>
      ))}
      <L label="Button label">
        <input value={c.cta.label} onChange={(e) => setC({ ...c, cta: { ...c.cta, label: e.target.value } })} className={field} />
      </L>
      <L label="Button link (site path)">
        <input value={c.cta.href} onChange={(e) => setC({ ...c, cta: { ...c.cta, href: e.target.value } })} className={field} placeholder="/shop" />
      </L>
      <div className="space-y-2 sm:col-span-2">
        <Status a={a} />
        <button disabled={a.pending} className="btn btn-primary !min-h-10 text-sm">
          Save campaign
        </button>
      </div>
    </form>
  );
}

export function CategoryEditor({ category, products }: { category: Category | null; products: Opt[] }) {
  const blank = { slug: "", index: 7, code: "", name: "", indexName: "", description: "", coverProduct: "" };
  const [c, setC] = useState(category ? { ...category, coverProduct: category.coverProduct ?? "" } : blank);
  const [open, setOpen] = useState(!category);
  const a = useAction();
  const del = useAction();
  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)} className="flex w-full items-center justify-between rounded-2xl bg-paper px-4 py-3.5 text-left transition-colors hover:bg-paper-3">
        <span>
          <span className="font-semibold">{c.name}</span>
          <span className="ml-2 text-sm text-muted">/category/{c.slug}</span>
        </span>
        <span className="text-sm font-medium text-accent">Edit</span>
      </button>
    );
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        a.exec(() => saveCategory(category?.slug ?? null, c), { onOk: () => !category && setC(blank) });
      }}
      className="grid gap-3 rounded-2xl bg-paper p-4 ring-1 ring-rule sm:grid-cols-4 md:p-5"
    >
      <L label="Name">
        <input value={c.name} onChange={(e) => setC({ ...c, name: e.target.value })} className={field} />
      </L>
      <L label="Long name (homepage index)">
        <input value={c.indexName} onChange={(e) => setC({ ...c, indexName: e.target.value })} className={field} />
      </L>
      <L label="URL slug">
        <input value={c.slug} disabled={!!category} onChange={(e) => setC({ ...c, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} className={field} />
      </L>
      <div className="grid grid-cols-2 gap-2">
        <L label="Order">
          <input value={String(c.index)} inputMode="numeric" onChange={(e) => setC({ ...c, index: Number(e.target.value) || 0 })} className={field} />
        </L>
        <L label="Code">
          <input value={c.code} maxLength={4} onChange={(e) => setC({ ...c, code: e.target.value })} className={field} />
        </L>
      </div>
      <L label="Description" className="sm:col-span-3">
        <textarea rows={2} value={c.description} onChange={(e) => setC({ ...c, description: e.target.value })} className={field} />
      </L>
      <L label="Cover product">
        <select value={c.coverProduct} onChange={(e) => setC({ ...c, coverProduct: e.target.value })} className={field}>
          <option value="">First product</option>
          {products.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.name}
            </option>
          ))}
        </select>
      </L>
      <div className="flex flex-wrap items-center gap-2 sm:col-span-4">
        <button disabled={a.pending} className="btn btn-primary !min-h-10 text-sm">
          {category ? "Save category" : "Add category"}
        </button>
        {category && (
          <>
            <button type="button" onClick={() => setOpen(false)} className="btn btn-outline !min-h-10 text-sm">
              Close
            </button>
            <button type="button" onClick={() => confirm(`Delete the “${c.name}” category?`) && del.exec(() => deleteCategory(category.slug))} className="ml-auto text-sm font-medium text-danger hover:underline">
              Delete
            </button>
          </>
        )}
        <div className="w-full">
          <Status a={a} />
          <FormError message={del.error} />
        </div>
      </div>
    </form>
  );
}

const TONES = ["paper", "lime", "ink", "cobalt", "stone", "sand"] as const;

export function CollectionEditor({ collection, products }: { collection: Collection | null; products: Opt[] }) {
  const blank: Collection = { slug: "", index: 7, title: "", kicker: "", description: "", tone: "paper", coverProduct: products[0]?.slug ?? "", products: [] };
  const [c, setC] = useState<Collection>(collection ?? blank);
  const [open, setOpen] = useState(!collection);
  const [add, setAdd] = useState("");
  const a = useAction();
  const del = useAction();
  const name = (s: string) => products.find((p) => p.slug === s)?.name ?? s;
  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)} className="flex w-full items-center justify-between rounded-2xl bg-paper px-4 py-3.5 text-left transition-colors hover:bg-paper-3">
        <span>
          <span className="font-semibold">{c.title}</span>
          <span className="ml-2 text-sm text-muted">{c.products.length} products</span>
        </span>
        <span className="text-sm font-medium text-accent">Edit</span>
      </button>
    );
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        a.exec(() => saveCollection(collection?.slug ?? null, c), { onOk: () => !collection && setC(blank) });
      }}
      className="grid gap-3 rounded-2xl bg-paper p-4 ring-1 ring-rule sm:grid-cols-4 md:p-5"
    >
      <L label="Title">
        <input value={c.title} onChange={(e) => setC({ ...c, title: e.target.value })} className={field} />
      </L>
      <L label="Small label">
        <input value={c.kicker} onChange={(e) => setC({ ...c, kicker: e.target.value })} className={field} />
      </L>
      <L label="URL slug">
        <input value={c.slug} disabled={!!collection} onChange={(e) => setC({ ...c, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} className={field} />
      </L>
      <div className="grid grid-cols-2 gap-2">
        <L label="Order">
          <input value={String(c.index)} inputMode="numeric" onChange={(e) => setC({ ...c, index: Number(e.target.value) || 0 })} className={field} />
        </L>
        <L label="Colour">
          <select value={c.tone} onChange={(e) => setC({ ...c, tone: e.target.value as Collection["tone"] })} className={field}>
            {TONES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </L>
      </div>
      <L label="Description" className="sm:col-span-3">
        <textarea rows={2} value={c.description} onChange={(e) => setC({ ...c, description: e.target.value })} className={field} />
      </L>
      <L label="Cover product">
        <select value={c.coverProduct} onChange={(e) => setC({ ...c, coverProduct: e.target.value })} className={field}>
          {products.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.name}
            </option>
          ))}
        </select>
      </L>
      <div className="sm:col-span-4">
        <p className="mb-1.5 text-sm font-medium">Products in this edit (in order)</p>
        <ol className="space-y-1">
          {c.products.map((s, i) => (
            <li key={s} className="flex items-center gap-2 rounded-xl bg-paper px-3 py-2 text-sm">
              <span className="w-6 text-xs tabular-nums text-muted">{i + 1}</span>
              <span className="flex-1">{name(s)}</span>
              <button type="button" aria-label="Move up" onClick={() => i > 0 && setC({ ...c, products: c.products.map((x, j) => (j === i - 1 ? s : j === i ? c.products[i - 1] : x)) })} className="px-1 text-muted hover:text-ink">
                ↑
              </button>
              <button type="button" aria-label={`Remove ${name(s)}`} onClick={() => setC({ ...c, products: c.products.filter((x) => x !== s) })} className="px-1 text-danger">
                <Icon name="close" size={14} />
              </button>
            </li>
          ))}
        </ol>
        <div className="mt-2 flex gap-2">
          <select value={add} onChange={(e) => setAdd(e.target.value)} className="field !min-h-10 text-sm" aria-label="Add product">
            <option value="">Add a product…</option>
            {products
              .filter((p) => !c.products.includes(p.slug))
              .map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name}
                </option>
              ))}
          </select>
          <button type="button" disabled={!add} onClick={() => { setC({ ...c, products: [...c.products, add] }); setAdd(""); }} className="btn btn-outline !min-h-10 text-sm">
            Add
          </button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:col-span-4">
        <button disabled={a.pending} className="btn btn-primary !min-h-10 text-sm">
          {collection ? "Save collection" : "Add collection"}
        </button>
        {collection && (
          <>
            <button type="button" onClick={() => setOpen(false)} className="btn btn-outline !min-h-10 text-sm">
              Close
            </button>
            <button type="button" onClick={() => confirm(`Delete “${c.title}”?`) && del.exec(() => deleteCollection(collection.slug))} className="ml-auto text-sm font-medium text-danger hover:underline">
              Delete
            </button>
          </>
        )}
        <div className="w-full">
          <Status a={a} />
          <FormError message={del.error} />
        </div>
      </div>
    </form>
  );
}
