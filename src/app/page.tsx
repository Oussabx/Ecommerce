import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { CategoryIndex } from "@/components/home/CategoryIndex";
import { Shortlist } from "@/components/home/Shortlist";
import { Campaign } from "@/components/home/Campaign";
import { Intentions } from "@/components/home/Intentions";
import { WhyOsa } from "@/components/home/WhyOsa";
import { PersonalRails } from "@/components/product/PersonalRails";
import { Newsletter } from "@/components/layout/Newsletter";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { allSummaries, categories, products } from "@/lib/catalog";
import { siteUrl, store } from "@/config/store";

export const metadata: Metadata = { alternates: { canonical: "/" } };

/** Products featured in "The Shortlist", in editorial order. */
const SHORTLIST = [
  "iphone-16-pro",
  "macbook-air-13-m4",
  "sony-wh-1000xm5",
  "playstation-5-slim",
  "samsung-galaxy-s25-ultra",
  "airpods-pro-2",
  "nintendo-switch-2",
  "apple-watch-series-10",
  "dell-xps-13-9350",
  "google-pixel-9-pro",
  "jbl-flip-6",
  "anker-maggo-power-bank-10k",
];

export default function HomePage() {
  const all = allSummaries();
  const order = new Map(SHORTLIST.map((s, i) => [s, i]));
  const shortlist = [...all].sort((a, b) => (order.get(a.slug) ?? 99) - (order.get(b.slug) ?? 99));
  const org = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: store.name,
    url: siteUrl,
    description: store.description,
    address: { "@type": "PostalAddress", addressCountry: "LB" },
    currenciesAccepted: "USD",
    paymentAccepted: store.paymentMethods.map((p) => p.label).join(", "),
  };

  return (
    <>
      <Hero productCount={products.length} categoryCount={categories.length} />
      <CategoryIndex />
      <section className="container-x pb-16 md:pb-24" aria-labelledby="shortlist-title">
        <SectionHeader
          index="§ 02 — Featured"
          title={<span id="shortlist-title">The shortlist</span>}
          intro="Good choices, without the endless scrolling."
          link={{ href: "/shop", label: "Shop everything" }}
        />
        <Shortlist items={shortlist} categories={categories.map((c) => ({ slug: c.slug, name: c.name }))} />
      </section>
      <Campaign />
      <Intentions />
      <WhyOsa />
      <PersonalRails />
      <Newsletter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }} />
    </>
  );
}
