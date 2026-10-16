import { Body, PageHeader, Panel } from "@/components/admin/ui";
import { AnnouncementsForm, CampaignForm, CategoryEditor, CollectionEditor } from "@/components/admin/ContentForms";
import { requireStaff } from "@/server/auth";
import { db } from "@/server/db";
import { getSettings } from "@/server/settings";
import type { Collection } from "@/data/types";

export const metadata = { title: "Content" };

export default async function ContentPage() {
  await requireStaff({ admin: true });
  const [settings, categories, collections, products] = await Promise.all([
    getSettings(),
    db.category.findMany({ orderBy: { index: "asc" } }),
    db.collection.findMany({ orderBy: { index: "asc" }, include: { products: { orderBy: { position: "asc" }, include: { product: { select: { slug: true } } } } } }),
    db.product.findMany({ orderBy: { name: "asc" }, select: { slug: true, name: true, colors: { orderBy: { position: "asc" }, select: { key: true, name: true } } } }),
  ]);
  const opts = products.map((p) => ({ slug: p.slug, name: p.name, colors: p.colors.map((c) => ({ id: c.key, name: c.name })) }));
  const cols: Collection[] = collections.map((c) => ({ ...c, tone: c.tone as Collection["tone"], products: c.products.map((p) => p.product.slug) }));

  return (
    <>
      <PageHeader title="Content" kicker="Homepage and navigation content" />
      <Body className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-2">
          <Panel title="Announcement strip">
            <AnnouncementsForm initial={settings.announcements} />
          </Panel>
          <Panel title="Homepage campaign">
            <CampaignForm initial={settings.campaign} products={opts} />
          </Panel>
        </div>
        <Panel title="Categories">
          <div className="space-y-2">
            {categories.map((c) => (
              <CategoryEditor key={c.slug} category={{ ...c, coverProduct: c.coverProduct ?? "" }} products={opts} />
            ))}
            <details className="pt-2">
              <summary className="label cursor-pointer">+ New category</summary>
              <div className="mt-2">
                <CategoryEditor category={null} products={opts} />
              </div>
            </details>
          </div>
        </Panel>
        <Panel title="Shop by intention (collections)">
          <div className="space-y-2">
            {cols.map((c) => (
              <CollectionEditor key={c.slug} collection={c} products={opts} />
            ))}
            <details className="pt-2">
              <summary className="label cursor-pointer">+ New collection</summary>
              <div className="mt-2">
                <CollectionEditor collection={null} products={opts} />
              </div>
            </details>
          </div>
        </Panel>
      </Body>
    </>
  );
}
