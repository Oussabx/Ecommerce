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
  { href: "/faq", label: "FAQs" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function InfoPageView({ page, children }: { page: InfoPage; children?: ReactNode }) {
  const hasPlaceholders = JSON.stringify(page).includes("[[");
  return (
    <div className="container-x pb-20 pt-6 md:pb-28">
      <Breadcrumbs items={[{ label: page.title }]} />
      <div className="mt-8 grid gap-10 md:mt-12 md:grid-cols-12">
        <nav aria-label="Help pages" className="order-last md:order-none md:col-span-3">
          <ul className="flex flex-wrap gap-2 md:sticky md:top-24 md:block md:space-y-0.5">
            {helpLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} aria-current={l.href === `/${page.slug}` ? "page" : undefined} className="chip md:flex md:min-h-0 md:rounded-xl md:bg-transparent md:px-3 md:py-2 md:text-[15px] md:font-normal md:text-muted md:hover:bg-paper-2 md:hover:text-ink md:aria-[current=page]:bg-paper-2 md:aria-[current=page]:font-medium md:aria-[current=page]:text-ink">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <article className="prose-osa max-w-3xl text-[17px] md:col-span-9 lg:col-span-8">
          <header className="mb-10">
            <h1 className="display text-[clamp(2rem,4.5vw,3.5rem)]">{page.title}</h1>
            <p className="mt-4 !text-lg leading-relaxed !text-muted md:!text-xl">{page.intro}</p>
            {page.updated && <p className="mt-4 !text-sm !text-subtle">Last updated: {rich(page.updated)}</p>}
          </header>
          {hasPlaceholders && (
            <p className="!mb-8 rounded-2xl bg-paper-2 p-4 !text-sm">
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
