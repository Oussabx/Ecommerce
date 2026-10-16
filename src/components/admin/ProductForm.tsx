"use client";
import Image from "next/image";
import Link from "next/link";
import { useId as useReactId, useRef, useState } from "react";
import { deleteProduct, saveProduct, uploadProductImage } from "@/app/admin/products/actions";
import type { ProductInput } from "@/lib/product-schema";
import { FormError } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { useAction } from "./useAction";
import { cn } from "@/lib/format";

type Color = ProductInput["colors"][number];
type Config = ProductInput["configs"][number];
type Spec = ProductInput["specs"][number];

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/["'’()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);

export const emptyProduct: ProductInput = {
  slug: "",
  name: "",
  brand: "",
  model: "",
  categorySlug: "",
  tagline: "",
  description: "",
  price: 0,
  compareAtPrice: "",
  stock: 0,
  published: false,
  isNew: false,
  releaseYear: new Date().getFullYear(),
  sortOrder: 100,
  warranty: "",
  configLabel: "",
  artKind: "phone",
  colors: [{ key: "default", name: "Standard", swatch: "#2B2C2E", soldOut: false }],
  configs: [],
  images: [],
  highlights: [],
  specs: [],
  inTheBox: [],
  tags: [],
  pairsWith: [],
};

function move<T>(arr: T[], i: number, d: -1 | 1) {
  const j = i + d;
  if (j < 0 || j >= arr.length) return arr;
  const out = [...arr];
  [out[i], out[j]] = [out[j], out[i]];
  return out;
}

export function ProductForm({
  id,
  initial,
  categories,
  allProducts,
  canDelete,
  publicHref,
}: {
  id: string | null;
  initial: ProductInput;
  categories: { slug: string; name: string }[];
  allProducts: { slug: string; name: string }[];
  canDelete: boolean;
  publicHref?: string;
}) {
  const [p, setP] = useState<ProductInput>(initial);
  const [slugTouched, setSlugTouched] = useState(!!id);
  const [dirty, setDirty] = useState(false);
  const save = useAction();
  const del = useAction();
  const up = useAction();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadColor, setUploadColor] = useState<string>("*");
  const [imageUrl, setImageUrl] = useState("");

  const set = <K extends keyof ProductInput>(k: K, v: ProductInput[K]) => {
    setP((x) => ({ ...x, [k]: v }));
    setDirty(true);
  };
  const err = (k: string) => save.fields[k] ?? Object.entries(save.fields).find(([f]) => f.startsWith(`${k}.`))?.[1];

  const addImage = (url: string) => set("images", [...p.images, { url, colorKey: uploadColor === "*" ? null : uploadColor, label: "", alt: "" }]);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("slug", p.slug || slugify(p.name) || "product");
      await up.exec(() => uploadProductImage(fd), {
        refresh: false,
        onOk: (r) => {
          const url = (r.ok && (r.data as { url: string } | undefined)?.url) || "";
          if (url) setP((x) => ({ ...x, images: [...x.images, { url, colorKey: uploadColor === "*" ? null : uploadColor, label: "", alt: "" }] }));
          setDirty(true);
        },
      });
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        save.exec(() => saveProduct(id, p), { onOk: () => setDirty(false) });
      }}
      className="grid gap-6 xl:grid-cols-3"
    >
      <div className="space-y-6 xl:col-span-2">
        {/* basics */}
        <Section title="Basics">
          <div className="grid gap-4 sm:grid-cols-2">
            <Text label="Product name" value={p.name} error={err("name")} onChange={(v) => { set("name", v); if (!slugTouched) set("slug", slugify(`${p.brand} ${v}`.trim())); }} />
            <Text label="Brand" value={p.brand} error={err("brand")} onChange={(v) => { set("brand", v); if (!slugTouched) set("slug", slugify(`${v} ${p.name}`.trim())); }} />
            <Text label="URL slug" value={p.slug} error={err("slug")} hint={`/product/${p.slug || "…"}`} onChange={(v) => { setSlugTouched(true); set("slug", slugify(v)); }} />
            <Text label="Model / part number" value={p.model} optional onChange={(v) => set("model", v)} />
            <Select label="Category" value={p.categorySlug} error={err("categorySlug")} onChange={(v) => set("categorySlug", v)}>
              <option value="">Choose…</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </Select>
            <Text label="Release year" type="number" value={String(p.releaseYear)} error={err("releaseYear")} onChange={(v) => set("releaseYear", v as unknown as number)} />
            <Text className="sm:col-span-2" label="Tagline" value={p.tagline} optional hint="One line shown under the product name." onChange={(v) => set("tagline", v)} />
            <Area className="sm:col-span-2" label="Description" value={p.description} rows={5} optional onChange={(v) => set("description", v)} />
          </div>
        </Section>

        {/* images */}
        <Section title="Images" note="The first image of each colour is the main one. Shared images show for every colour.">
          <div className="flex flex-wrap items-end gap-2">
            <Select label="Add images to" value={uploadColor} onChange={setUploadColor} className="w-48">
              <option value="*">All colours (shared)</option>
              {p.colors.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.name || c.key}
                </option>
              ))}
            </Select>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple className="sr-only" id="img-upload" onChange={(e) => upload(e.target.files)} />
            <label htmlFor="img-upload" className={cn("btn btn-primary !min-h-12 cursor-pointer text-xs", up.pending && "pointer-events-none opacity-50")}>
              <Icon name="plus" size={14} /> {up.pending ? "Uploading…" : "Upload images"}
            </label>
            <div className="flex min-w-[240px] flex-1 gap-2">
              <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="…or paste an image URL / /products/… path" className="field text-sm" aria-label="Image URL" />
              <button type="button" className="btn btn-outline !min-h-12 shrink-0 text-xs" onClick={() => { if (imageUrl.trim()) { addImage(imageUrl.trim()); setImageUrl(""); } }}>
                Add
              </button>
            </div>
          </div>
          <p className="mt-1 text-xs text-muted">JPEG, PNG, WebP or AVIF up to 5 MB. Square photos on a plain background look best.</p>
          <FormError message={up.error} />
          {err("images") && <p className="mt-2 text-sm text-danger">{err("images")}</p>}
          {p.images.length ? (
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {p.images.map((im, i) => (
                <li key={`${im.url}-${i}`} className="border border-rule bg-paper p-2">
                  <div className="relative aspect-square bg-paper-2">
                    <Image src={im.url} alt={im.alt || ""} fill sizes="200px" className="object-contain p-1" unoptimized={im.url.startsWith("/uploads/")} />
                  </div>
                  <select
                    value={im.colorKey ?? "*"}
                    onChange={(e) => set("images", p.images.map((x, j) => (j === i ? { ...x, colorKey: e.target.value === "*" ? null : e.target.value } : x)))}
                    className="field mt-2 !min-h-8 !py-1 text-xs"
                    aria-label="Image colour"
                  >
                    <option value="*">All colours</option>
                    {p.colors.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.name || c.key}
                      </option>
                    ))}
                  </select>
                  <input value={im.label} onChange={(e) => set("images", p.images.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} placeholder="Label (Front, Back…)" className="field mt-1 !min-h-8 !py-1 text-xs" aria-label="Image label" />
                  <div className="mt-1 flex justify-between">
                    <span className="flex">
                      <IconBtn label="Move earlier" onClick={() => set("images", move(p.images, i, -1))} icon="arrowLeft" />
                      <IconBtn label="Move later" onClick={() => set("images", move(p.images, i, 1))} icon="arrow" />
                    </span>
                    <IconBtn label="Remove image" onClick={() => set("images", p.images.filter((_, j) => j !== i))} icon="trash" danger />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 border border-dashed border-rule-strong p-6 text-center text-sm text-muted">No images yet — the store shows a neutral placeholder until you add some.</p>
          )}
        </Section>

        {/* colours & options */}
        <Section title="Colours & options">
          <h3 className="label mb-2">Colours / finishes</h3>
          {err("colors") && <p className="mb-2 text-sm text-danger">{err("colors")}</p>}
          <Rows<Color>
            items={p.colors}
            onChange={(v) => set("colors", v)}
            blank={{ key: "", name: "", swatch: "#888888", soldOut: false }}
            addLabel="Add colour"
            render={(c, upd) => (
              <div className="grid flex-1 grid-cols-[48px_1fr_1fr] items-center gap-2 sm:grid-cols-[48px_1fr_140px_120px_auto]">
                <input type="color" value={c.swatch} onChange={(e) => upd({ swatch: e.target.value })} className="h-10 w-12 cursor-pointer border border-rule-strong bg-transparent p-0.5" aria-label="Swatch colour" />
                <input value={c.name} onChange={(e) => upd({ name: e.target.value, ...(c.key ? {} : {}) })} onBlur={() => !c.key && upd({ key: slugify(c.name) })} placeholder="Name, e.g. Black Titanium" className="field !min-h-10 text-sm" aria-label="Colour name" />
                <input value={c.key} onChange={(e) => upd({ key: slugify(e.target.value) })} placeholder="id, e.g. black" className="field !min-h-10 font-mono text-xs" aria-label="Colour id" />
                <input value={c.swatch} onChange={(e) => upd({ swatch: e.target.value })} className="field !min-h-10 font-mono text-xs" aria-label="Swatch hex" />
                <label className="label flex items-center gap-1.5">
                  <input type="checkbox" checked={c.soldOut} onChange={(e) => upd({ soldOut: e.target.checked })} className="accent-ink" /> Sold out
                </label>
              </div>
            )}
          />
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Text label="Option name" value={p.configLabel} optional hint="e.g. Storage, Memory / SSD, Case size. Leave empty if there are no options." onChange={(v) => set("configLabel", v)} />
          </div>
          {err("configs") && <p className="mt-2 text-sm text-danger">{err("configs")}</p>}
          <div className="mt-3">
            <Rows<Config>
              items={p.configs}
              onChange={(v) => set("configs", v)}
              blank={{ key: "", label: "", priceDelta: 0 }}
              addLabel="Add option"
              render={(c, upd) => (
                <div className="grid flex-1 grid-cols-[1fr_1fr_120px] items-center gap-2">
                  <input value={c.label} onChange={(e) => upd({ label: e.target.value })} onBlur={() => !c.key && upd({ key: slugify(c.label) })} placeholder="Label, e.g. 256GB" className="field !min-h-10 text-sm" aria-label="Option label" />
                  <input value={c.key} onChange={(e) => upd({ key: slugify(e.target.value) })} placeholder="id, e.g. 256" className="field !min-h-10 font-mono text-xs" aria-label="Option id" />
                  <input value={String(c.priceDelta)} inputMode="decimal" onChange={(e) => upd({ priceDelta: e.target.value as unknown as number })} placeholder="+ price" className="field !min-h-10 text-sm" aria-label="Price difference in USD" />
                </div>
              )}
            />
            <p className="mt-1 text-xs text-muted">The last field is the price difference in USD added to the base price (e.g. 100 for +$100). The first option is the default.</p>
          </div>
        </Section>

        {/* details */}
        <Section title="Key specs & details">
          <h3 className="label mb-2">Highlights (up to 8, shown on the product page and in search)</h3>
          <Rows
            items={p.highlights}
            onChange={(v) => set("highlights", v)}
            blank={{ label: "", value: "" }}
            addLabel="Add highlight"
            max={8}
            render={(h, upd) => (
              <div className="grid flex-1 grid-cols-2 gap-2">
                <input value={h.label} onChange={(e) => upd({ label: e.target.value })} placeholder="Label, e.g. Battery" className="field !min-h-10 text-sm" aria-label="Highlight label" />
                <input value={h.value} onChange={(e) => upd({ value: e.target.value })} placeholder="Value, e.g. 5,000 mAh" className="field !min-h-10 text-sm" aria-label="Highlight value" />
              </div>
            )}
          />
          <h3 className="label mb-2 mt-6">Technical specifications</h3>
          <SpecsEditor specs={p.specs} onChange={(v) => set("specs", v)} error={err("specs")} />
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Area label="In the box" optional rows={4} value={p.inTheBox.join("\n")} hint="One item per line." onChange={(v) => set("inTheBox", v.split("\n").map((s) => s.trim()).filter(Boolean))} />
            <Area label="Search tags" optional rows={4} value={p.tags.join(", ")} hint="Comma-separated. Used by search and to find related products." onChange={(v) => set("tags", v.split(",").map((s) => s.trim()).filter(Boolean))} />
          </div>
        </Section>

        <Section title="Frequently bought together">
          <PairsPicker value={p.pairsWith} options={allProducts.filter((x) => x.slug !== p.slug)} onChange={(v) => set("pairsWith", v)} />
        </Section>
      </div>

      {/* sidebar */}
      <div className="space-y-6">
        <div className="sticky top-4 space-y-6">
          <Section title="Publish">
            <label className="flex items-start gap-3 text-sm">
              <input type="checkbox" checked={p.published} onChange={(e) => set("published", e.target.checked)} className="mt-0.5 size-4 accent-ink" />
              <span>
                <span className="font-semibold">Visible in the store</span>
                <span className="block text-muted">Unpublished products are hidden from customers.</span>
              </span>
            </label>
            <label className="mt-3 flex items-start gap-3 text-sm">
              <input type="checkbox" checked={p.isNew} onChange={(e) => set("isNew", e.target.checked)} className="mt-0.5 size-4 accent-ink" />
              <span>Show a “New” badge</span>
            </label>
            <div className="mt-4">
              <Text label="Sort order" type="number" value={String(p.sortOrder)} hint="Lower numbers appear first in listings." onChange={(v) => set("sortOrder", v as unknown as number)} />
            </div>
            <div className="mt-5 space-y-2">
              <FormError message={save.error} />
              {save.message && !save.error && !dirty && (
                <p className="label flex items-center gap-1.5 text-ok" role="status">
                  <Icon name="check" size={14} /> {save.message}
                </p>
              )}
              <button disabled={save.pending} className="btn btn-primary w-full">
                {save.pending ? "Saving…" : id ? "Save changes" : "Create product"}
              </button>
              {dirty && <p className="label text-center text-warn">Unsaved changes</p>}
              {publicHref && (
                <Link href={publicHref} target="_blank" className="label block text-center text-muted hover:text-ink">
                  View in store ↗
                </Link>
              )}
            </div>
          </Section>

          <Section title="Price & stock">
            <div className="grid gap-4">
              <Text label="Price (USD)" inputMode="decimal" value={String(p.price)} error={err("price")} onChange={(v) => set("price", v as unknown as number)} />
              <Text
                label="Previous price (USD)"
                inputMode="decimal"
                optional
                value={String(p.compareAtPrice ?? "")}
                error={err("compareAtPrice")}
                hint="Only for a genuine price drop. Shown struck through with the % saved."
                onChange={(v) => set("compareAtPrice", v as unknown as number)}
              />
              <Text label="Units in stock" inputMode="numeric" value={String(p.stock)} error={err("stock")} hint="Orders reserve stock automatically. Changes here are logged." onChange={(v) => set("stock", v as unknown as number)} />
              <Text label="Warranty" optional value={p.warranty} hint="e.g. 1-year warranty via official distributor" onChange={(v) => set("warranty", v)} />
            </div>
          </Section>

          {id && canDelete && (
            <Section title="Danger zone">
              <p className="text-sm text-muted">Deleting removes the product from the store. Past orders keep their own copy of the details. Unpublishing is usually better.</p>
              <button
                type="button"
                disabled={del.pending}
                onClick={() => confirm(`Delete “${p.name}” permanently?`) && del.exec(() => deleteProduct(id))}
                className="btn mt-3 w-full border-danger text-danger hover:bg-danger hover:text-paper"
              >
                Delete product
              </button>
              <FormError message={del.error} />
            </Section>
          )}
        </div>
      </div>
    </form>
  );
}

// ─── small building blocks ───────────────────────────────────────────────────

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
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

function useId(label: string) {
  return `f-${label.replace(/\W+/g, "-").toLowerCase()}${useReactId()}`;
}

function Text({ label, value, onChange, error, hint, optional, className, type = "text", inputMode }: { label: string; value: string; onChange: (v: string) => void; error?: string; hint?: string; optional?: boolean; className?: string; type?: string; inputMode?: "decimal" | "numeric" }) {
  const id = useId(label);
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 flex justify-between text-sm font-medium">
        {label} {optional && <span className="label text-subtle">Optional</span>}
      </label>
      <input id={id} type={type} inputMode={inputMode} value={value} onChange={(e) => onChange(e.target.value)} className="field text-sm" aria-invalid={!!error} />
      {error ? <p className="mt-1 text-sm text-danger">{error}</p> : hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

function Area({ label, value, onChange, hint, optional, rows = 3, className }: { label: string; value: string; onChange: (v: string) => void; hint?: string; optional?: boolean; rows?: number; className?: string }) {
  const id = useId(label);
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 flex justify-between text-sm font-medium">
        {label} {optional && <span className="label text-subtle">Optional</span>}
      </label>
      <textarea id={id} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} className="field min-h-0 text-sm" />
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

function Select({ label, value, onChange, error, children, className }: { label: string; value: string; onChange: (v: string) => void; error?: string; children: React.ReactNode; className?: string }) {
  const id = useId(label);
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="field text-sm" aria-invalid={!!error}>
        {children}
      </select>
      {error && <p className="mt-1 text-sm text-danger">{error}</p>}
    </div>
  );
}

function IconBtn({ label, onClick, icon, danger }: { label: string; onClick: () => void; icon: "arrowLeft" | "arrow" | "trash" | "chevronDown" | "close"; danger?: boolean }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} className={cn("grid size-8 place-items-center hover:bg-paper-2", danger && "text-danger")}>
      <Icon name={icon} size={14} />
    </button>
  );
}

function Rows<T>({ items, onChange, blank, render, addLabel, max }: { items: T[]; onChange: (v: T[]) => void; blank: T; render: (item: T, update: (patch: Partial<T>) => void) => React.ReactNode; addLabel: string; max?: number }) {
  return (
    <div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1">
            {render(item, (patch) => onChange(items.map((x, j) => (j === i ? { ...x, ...patch } : x))))}
            <span className="flex shrink-0">
              <IconBtn label="Move up" icon="chevronDown" onClick={() => onChange(move(items, i, -1))} />
              <IconBtn label="Remove" icon="close" danger onClick={() => onChange(items.filter((_, j) => j !== i))} />
            </span>
          </li>
        ))}
      </ul>
      {(!max || items.length < max) && (
        <button type="button" onClick={() => onChange([...items, { ...blank }])} className="label mt-2 inline-flex h-9 items-center gap-1.5 border border-dashed border-rule-strong px-3 hover:border-ink">
          <Icon name="plus" size={12} /> {addLabel}
        </button>
      )}
    </div>
  );
}

function SpecsEditor({ specs, onChange, error }: { specs: Spec[]; onChange: (v: Spec[]) => void; error?: string }) {
  const upd = (i: number, g: Spec) => onChange(specs.map((x, j) => (j === i ? g : x)));
  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-danger">{error}</p>}
      {specs.map((g, i) => (
        <div key={i} className="border border-rule p-3">
          <div className="flex items-center gap-2">
            <input value={g.group} onChange={(e) => upd(i, { ...g, group: e.target.value })} placeholder="Group, e.g. Display" className="field !min-h-10 text-sm font-semibold" aria-label="Spec group name" />
            <IconBtn label="Move group up" icon="chevronDown" onClick={() => onChange(move(specs, i, -1))} />
            <IconBtn label="Remove group" icon="close" danger onClick={() => onChange(specs.filter((_, j) => j !== i))} />
          </div>
          <ul className="mt-2 space-y-1.5">
            {g.rows.map((r, k) => (
              <li key={k} className="flex items-center gap-1">
                <input value={r[0]} onChange={(e) => upd(i, { ...g, rows: g.rows.map((x, m) => (m === k ? [e.target.value, x[1]] : x)) })} placeholder="Label" className="field !min-h-9 w-2/5 text-sm" aria-label="Spec label" />
                <input value={r[1]} onChange={(e) => upd(i, { ...g, rows: g.rows.map((x, m) => (m === k ? [x[0], e.target.value] : x)) })} placeholder="Value" className="field !min-h-9 text-sm" aria-label="Spec value" />
                <IconBtn label="Remove row" icon="close" danger onClick={() => upd(i, { ...g, rows: g.rows.filter((_, m) => m !== k) })} />
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => upd(i, { ...g, rows: [...g.rows, ["", ""]] })} className="label mt-2 text-muted hover:text-ink">
            + Add row
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...specs, { group: "", rows: [["", ""]] }])} className="label inline-flex h-9 items-center gap-1.5 border border-dashed border-rule-strong px-3 hover:border-ink">
        <Icon name="plus" size={12} /> Add spec group
      </button>
    </div>
  );
}

function PairsPicker({ value, options, onChange }: { value: string[]; options: { slug: string; name: string }[]; onChange: (v: string[]) => void }) {
  const [q, setQ] = useState("");
  const matches = q ? options.filter((o) => !value.includes(o.slug) && o.name.toLowerCase().includes(q.toLowerCase())).slice(0, 6) : [];
  const name = (s: string) => options.find((o) => o.slug === s)?.name ?? s;
  return (
    <div>
      <ul className="flex flex-wrap gap-2">
        {value.map((s) => (
          <li key={s}>
            <button type="button" onClick={() => onChange(value.filter((x) => x !== s))} className="label inline-flex h-8 items-center gap-1.5 bg-ink px-2.5 text-paper hover:bg-danger" aria-label={`Remove ${name(s)}`}>
              {name(s)} <Icon name="close" size={12} />
            </button>
          </li>
        ))}
        {!value.length && <li className="text-sm text-muted">No suggestions yet.</li>}
      </ul>
      {value.length < 8 && (
        <div className="relative mt-3 max-w-sm">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products to suggest…" className="field !min-h-10 text-sm" aria-label="Add a product suggestion" />
          {matches.length > 0 && (
            <ul className="absolute inset-x-0 top-full z-10 border border-ink bg-paper shadow-lg">
              {matches.map((m) => (
                <li key={m.slug}>
                  <button type="button" onClick={() => { onChange([...value, m.slug]); setQ(""); }} className="block w-full px-3 py-2 text-left text-sm hover:bg-lime">
                    {m.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
