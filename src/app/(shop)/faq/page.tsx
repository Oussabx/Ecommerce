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
    <div className="container-x pb-20 pt-6">
      <Breadcrumbs items={[{ label: "FAQs" }]} />
      <header className="mt-8 grid gap-6 border-t border-rule pt-4 md:grid-cols-12">
        <div className="md:col-span-12">
          <h1 className="display text-[clamp(3.2rem,9vw,8.5rem)]">Questions, answered.</h1>
        </div>
      </header>
      <div className="mt-12 grid gap-10 md:grid-cols-12">
        <div className="md:col-span-10 md:col-start-3">
          <div className="border-t border-rule">
            {faqs.map((f, i) => (
              <details key={f.q} className="group border-b border-rule">
                <summary className="flex list-none items-baseline gap-4 py-5 [&::-webkit-details-marker]:hidden">
                  <span className="label w-8 shrink-0 text-muted">{String(i + 1).padStart(2, "0")}</span>
                  <span className="flex-1 text-lg font-semibold md:text-xl">{f.q}</span>
                  <Icon name="plus" size={20} className="shrink-0 transition-transform duration-300 group-open:rotate-45" />
                </summary>
                <p className="max-w-2xl pb-6 pl-12 leading-relaxed text-ink-2">{f.a}</p>
              </details>
            ))}
          </div>
          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 bg-lime p-6">
            <p className="display text-3xl">Still not sure?</p>
            <Link href="/contact" className="btn btn-primary">
              Contact us <Icon name="arrow" size={16} className="btn-arrow" />
            </Link>
          </div>
        </div>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </div>
  );
}
