import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Icon } from "@/components/ui/Icon";
import { ProductExperience } from "@/components/product/ProductExperience";
import { FrequentlyBought } from "@/components/product/FrequentlyBought";
import { ProductRail } from "@/components/product/ProductRail";
import { PersonalRails } from "@/components/product/PersonalRails";
import { availability, priceFor, productImages, relatedProducts, summarize } from "@/lib/catalog";
import { siteUrl } from "@/config/store";
import { getCatalog } from "@/server/catalog";
import { getSettings } from "@/server/settings";

export const generateStaticParams = async () => (await getCatalog()).products.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = (await getCatalog()).products.find((x) => x.slug === slug);
  if (!p) return {};
  const title = `${p.brand} ${p.name}`;
  return {
    title,
    description: `${p.tagline} ${p.description}`.slice(0, 160),
    alternates: { canonical: `/product/${p.slug}` },
    openGraph: { title, description: p.tagline, type: "website", images: [] },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [{ products, categories }, { store }] = await Promise.all([getCatalog(), getSettings()]);
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();
  const category = categories.find((c) => c.slug === product.category) ?? { slug: product.category, name: product.category };
  const related = relatedProducts(product, products, 8).map((p) => summarize(p, categories));
  const prices = (product.configs?.length ? product.configs.map((c) => priceFor(product, c.id).price) : [product.price]).sort((a, b) => a - b);
  const avail = availability(product);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${product.brand} ${product.name}`,
    description: product.description,
    sku: product.model,
    mpn: product.model,
    brand: { "@type": "Brand", name: product.brand },
    category: category.name,
    image: productImages(product).map((i) => `${siteUrl}${i.src}`),
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: prices[0],
      highPrice: prices[prices.length - 1],
      offerCount: prices.length,
      availability: avail === "out-of-stock" ? "https://schema.org/OutOfStock" : avail === "low-stock" ? "https://schema.org/LimitedAvailability" : "https://schema.org/InStock",
      seller: { "@type": "Organization", name: store.name },
      url: `${siteUrl}/product/${product.slug}`,
    },
  };

  return (
    <>
      <div className="container-x pb-12 pt-5 md:pb-20 md:pt-6">
        <Breadcrumbs items={[{ label: "Shop", href: "/shop" }, { label: category.name, href: `/category/${category.slug}` }, { label: product.name }]} />
        <div className="mt-6 md:mt-8">
          <ProductExperience product={product} />
        </div>
      </div>

      {/* overview + specs */}
      <section aria-labelledby="specs-title">
        <div className="container-x grid gap-8 pb-12 md:pb-20 lg:grid-cols-12 lg:gap-10">
          <div className="space-y-5 lg:col-span-5">
            <div className="rounded-3xl bg-paper-2 p-6 md:p-8">
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">In short</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-muted md:text-base">{product.description}</p>
            </div>
            {product.inTheBox && (
              <div className="rounded-3xl bg-paper-2 p-6 md:p-8">
                <h3 className="text-lg font-semibold">In the box</h3>
                <ul className="mt-3 divide-y divide-rule text-[15px]">
                  {product.inTheBox.map((x) => (
                    <li key={x} className="py-3 first:pt-0 last:pb-0">
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="lg:col-span-7">
            <h2 id="specs-title" className="text-2xl font-semibold tracking-tight md:text-3xl">
              Tech specs
            </h2>
            <div className="mt-5 space-y-3">
              {product.specs.map((g, gi) => (
                <details key={g.group} open={gi < 3} className="group overflow-hidden rounded-3xl bg-paper-2">
                  <summary className="flex list-none items-center justify-between gap-4 px-5 py-4 md:px-6 [&::-webkit-details-marker]:hidden">
                    <span className="text-[17px] font-semibold">{g.group}</span>
                    <span className="grid size-8 place-items-center rounded-full bg-paper-3 text-muted transition-transform group-open:rotate-180" aria-hidden>
                      <Icon name="chevronDown" size={16} />
                    </span>
                  </summary>
                  <table className="w-full text-sm md:text-[15px]">
                    <tbody className="divide-y divide-rule border-t border-rule">
                      {g.rows.map(([k, v]) => (
                        <tr key={k}>
                          <th scope="row" className="w-2/5 py-3 pl-5 pr-4 text-left align-top font-normal text-muted md:pl-6">
                            {k}
                          </th>
                          <td className="py-3 pr-5 md:pr-6">{v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </details>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted">Specifications are provided by the manufacturer and may vary by region. Check with us if a detail matters to your purchase.</p>
          </div>
        </div>
      </section>

      <div className="container-x space-y-16 py-12 md:space-y-20 md:py-20">
        {product.pairsWith?.length ? <FrequentlyBought slug={product.slug} pairs={product.pairsWith} /> : null}
        <section aria-labelledby="related-title">
          <h2 id="related-title" className="text-2xl font-semibold tracking-tight md:text-3xl">
            Related products
          </h2>
          <div className="mt-6">
            <ProductRail items={related} />
          </div>
        </section>
      </div>
      <PersonalRails exclude={product.slug} showPairs={false} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
