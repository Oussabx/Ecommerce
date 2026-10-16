import type { Metadata } from "next";
import Link from "next/link";
import { faqs } from "@/content/pages";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = {
  title: "FAQs",
  description: "Answers about ordering, payment, delivery across Lebanon and returns at OSA Techstore.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  const ld = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return (
    <div className="container-x pb-20 pt-6 md:pb-28">
      <Breadcrumbs items={[{ label: "FAQs" }]} />
      <div className="mx-auto mt-8 max-w-3xl md:mt-12">
        <header className="text-center">
          <h1 className="display text-[clamp(2rem,4.5vw,3.5rem)]">Questions, answered.</h1>
          <p className="mt-3 text-lg text-muted">Ordering, payment, delivery across Lebanon and returns.</p>
        </header>
        <div className="mt-10 space-y-3">
          {faqs.map((f) => (
            <details key={f.q} className="group rounded-2xl bg-paper-2 ring-1 ring-transparent transition-colors open:ring-rule">
              <summary className="flex list-none items-center gap-4 px-5 py-4 md:px-6 md:py-5 [&::-webkit-details-marker]:hidden">
                <span className="flex-1 text-[17px] font-semibold leading-snug">{f.q}</span>
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-paper-3 text-ink-2 transition-transform duration-300 group-open:rotate-45">
                  <Icon name="plus" size={16} />
                </span>
              </summary>
              <p className="max-w-2xl px-5 pb-5 text-[15px] leading-relaxed text-ink-2 md:px-6 md:pb-6">{f.a}</p>
            </details>
          ))}
        </div>
        <div className="mt-10 rounded-3xl bg-paper-2 flex flex-col items-center gap-4 p-8 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="text-xl font-semibold tracking-tight">Still not sure?</p>
            <p className="mt-1 text-[15px] text-muted">A person who knows the product will reply.</p>
          </div>
          <Link href="/contact" className="btn btn-primary">
            Contact us
          </Link>
        </div>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </div>
  );
}
