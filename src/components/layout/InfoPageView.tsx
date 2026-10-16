import Link from "next/link";
import type { ReactNode } from "react";
import type { Block, InfoPage } from "@/content/pages";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

/** Renders [[placeholder]] text as a highlighted "to be confirmed" mark. */
function rich(text: string): ReactNode[] {
  return text.split(/(\[\[.*?\]\])/g).map((part, i) =>
    part.startsWith("[[") ? (
      <mark key={i} title="Placeholder — to be confirmed by OSA Techstore">
        {part.slice(2, -2)}
      </mark>
    ) : (
      part
    ),
  );
}

function renderBlock(b: Block, i: number) {
  if ("p" in b) return <p key={i}>{rich(b.p)}</p>;
  if ("h" in b) return <h3 key={i}>{rich(b.h)}</h3>;
  return (
    <ul key={i}>
      {b.ul.map((li, j) => (
        <li key={j}>{rich(li)}</li>
      ))}
    </ul>
  );
}

const helpLinks = [
  { href: "/delivery", label: "Delivery" },
  { href: "/returns", label: "Returns & exchanges" },
  { href: "/warranty", label: "Warranty" },
  { href: "/faq", label: "FAQs" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function InfoPageView({ page, children }: { page: InfoPage; children?: ReactNode }) {
  const hasPlaceholders = JSON.stringify(page).includes("[[");
  return (
    <div className="container-x pb-20 pt-6">
      <Breadcrumbs items={[{ label: page.title }]} />
      <header className="mt-8 grid gap-6 border-t border-ink pt-4 md:grid-cols-12">
        <p className="label text-muted md:col-span-2">{page.index}</p>
        <div className="md:col-span-10">
          <p className="label text-muted">{page.kicker}</p>
          <h1 className="display mt-3 text-[clamp(3.2rem,9vw,8.5rem)]">{page.title}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-2">{page.intro}</p>
          {page.updated && <p className="label mt-4 text-muted">Last updated: {rich(page.updated)}</p>}
        </div>
      </header>
      <div className="mt-12 grid gap-10 md:grid-cols-12">
        <nav aria-label="Help pages" className="md:col-span-3">
          <ul className="sticky top-24 space-y-1 text-sm">
            {helpLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} aria-current={l.href === `/${page.slug}` ? "page" : undefined} className="block border-l-2 border-transparent py-1.5 pl-3 text-muted hover:text-ink aria-[current=page]:border-ink aria-[current=page]:text-ink">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <article className="prose-osa max-w-3xl md:col-span-9">
          {hasPlaceholders && (
            <p className="!mb-8 border border-ink bg-paper-2 p-4 text-sm">
              <mark>Highlighted text</mark> is placeholder content awaiting confirmation from OSA Techstore.
            </p>
          )}
          {page.sections.map((s) => (
            <section key={s.heading}>
              <h2>{s.heading}</h2>
              {s.blocks.map(renderBlock)}
            </section>
          ))}
          {children}
        </article>
      </div>
    </div>
  );
}
