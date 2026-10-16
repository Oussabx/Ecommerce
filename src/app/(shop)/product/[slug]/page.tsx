import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
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
      <div className="container-x pb-16 pt-6">
        <Breadcrumbs items={[{ label: "Shop", href: "/shop" }, { label: category.name, href: `/category/${category.slug}` }, { label: product.name }]} />
        <div className="mt-6 md:mt-8">
          <ProductExperience product={product} />
        </div>
      </div>

      {/* overview + specs */}
      <section className="border-t border-ink bg-paper-2" aria-labelledby="specs-title">
        <div className="container-x grid gap-10 py-14 md:py-20 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="display text-5xl md:text-6xl">In short</h2>
            <p className="mt-5 leading-relaxed text-ink-2">{product.description}</p>
            {product.inTheBox && (
              <div className="mt-8">
                <h3 className="label">In the box</h3>
                <ul className="mt-2 divide-y divide-rule border-y border-rule text-sm">
                  {product.inTheBox.map((x) => (
                    <li key={x} className="py-2">
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="lg:col-span-8">
            <h2 id="specs-title" className="display text-5xl md:text-6xl">
              The details
            </h2>
            <div className="mt-6 border-t border-ink">
              {product.specs.map((g, gi) => (
                <details key={g.group} open={gi < 3} className="group border-b border-rule">
                  <summary className="flex list-none items-center justify-between py-4 [&::-webkit-details-marker]:hidden">
                    <span className="flex items-baseline gap-4">
                      <span className="label text-muted">{String(gi + 1).padStart(2, "0")}</span>
                      <span className="text-lg font-semibold">{g.group}</span>
                    </span>
                    <span className="label text-muted group-open:hidden">Show</span>
                    <span className="label hidden text-muted group-open:inline">Hide</span>
                  </summary>
                  <table className="mb-4 w-full text-sm">
                    <tbody>
                      {g.rows.map(([k, v]) => (
                        <tr key={k} className="border-t border-rule/70">
                          <th scope="row" className="w-2/5 py-2.5 pr-4 text-left font-normal text-muted">
                            {k}
                          </th>
                          <td className="py-2.5">{v}</td>
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

      <div className="container-x space-y-16 py-16 md:py-20">
        {product.pairsWith?.length ? <FrequentlyBought slug={product.slug} pairs={product.pairsWith} /> : null}
        <section aria-labelledby="related-title">
          <div className="border-t border-ink pt-5">
            <h2 id="related-title" className="display text-5xl md:text-6xl">
              Related products
            </h2>
          </div>
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
