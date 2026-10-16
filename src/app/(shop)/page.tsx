import type { Metadata } from "next";
import { Hero, HeroMarquee } from "@/components/home/Hero";
import { CategoryIndex } from "@/components/home/CategoryIndex";
import { Shortlist } from "@/components/home/Shortlist";
import { Campaign } from "@/components/home/Campaign";
import { Intentions } from "@/components/home/Intentions";
import { WhyOsa } from "@/components/home/WhyOsa";
import { PersonalRails } from "@/components/product/PersonalRails";
import { Newsletter } from "@/components/layout/Newsletter";
import { ContactSection } from "@/components/home/ContactSection";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { summarize } from "@/lib/catalog";
import { getCatalog } from "@/server/catalog";
import { getSettings } from "@/server/settings";
import { siteUrl } from "@/config/store";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default async function HomePage() {
  const [{ products, categories }, { store }] = await Promise.all([getCatalog(), getSettings()]);
  // Products appear in the order set in Admin → Products (sort order).
  const shortlist = products.map((p) => summarize(p, categories));
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
      <Hero categoryCount={categories.length} productCount={products.length} />
      <HeroMarquee words={[...categories.map((c) => c.name), ...Array.from(new Set(products.map((p) => p.brand))).slice(0, 8)]} />
      <CategoryIndex />
      <section className="container-x pb-16 md:pb-24" aria-labelledby="shortlist-title">
        <SectionHeader
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
      <ContactSection />
      <Newsletter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }} />
    </>
  );
}
