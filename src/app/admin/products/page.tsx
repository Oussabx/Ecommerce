import Image from "next/image";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { Body, Empty, PageHeader, td, th } from "@/components/admin/ui";
import { requireStaff } from "@/server/auth";
import { db, fromCents } from "@/server/db";
import { LOW_STOCK_THRESHOLD } from "@/lib/catalog";
import { cn, formatPrice } from "@/lib/format";

export const metadata = { title: "Products" };

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; status?: string; deleted?: string }> }) {
  await requireStaff();
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 100);
  const where: Prisma.ProductWhereInput = {
    ...(sp.category && { categorySlug: sp.category }),
    ...(sp.status === "hidden" && { published: false }),
    ...(sp.status === "live" && { published: true }),
    ...(q && { OR: [{ name: { contains: q, mode: "insensitive" } }, { brand: { contains: q, mode: "insensitive" } }, { slug: { contains: q } }, { model: { contains: q, mode: "insensitive" } }] }),
  };
  const [products, categories] = await Promise.all([
    db.product.findMany({ where, orderBy: [{ sortOrder: "asc" }, { name: "asc" }], include: { images: { take: 1, orderBy: { position: "asc" } }, category: { select: { name: true } }, _count: { select: { colors: true } } } }),
    db.category.findMany({ orderBy: { index: "asc" } }),
  ]);

  return (
    <>
      <PageHeader
        title="Products"
        kicker={`${products.length} shown`}
        actions={
          <Link href="/admin/products/new" className="btn btn-primary !min-h-10 text-xs">
            + New product
          </Link>
        }
      >
        <form className="mt-5 flex flex-wrap gap-2" action="/admin/products">
          <label className="sr-only" htmlFor="q">
            Search
          </label>
          <input id="q" name="q" defaultValue={q} placeholder="Search name, brand, model" className="field !min-h-9 w-64 !py-1.5 text-sm" />
          <label className="sr-only" htmlFor="category">
            Category
          </label>
          <select id="category" name="category" defaultValue={sp.category ?? ""} className="field !min-h-9 w-auto !py-1.5 text-sm">
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <label className="sr-only" htmlFor="status">
            Visibility
          </label>
          <select id="status" name="status" defaultValue={sp.status ?? ""} className="field !min-h-9 w-auto !py-1.5 text-sm">
            <option value="">Any visibility</option>
            <option value="live">Published</option>
            <option value="hidden">Hidden</option>
          </select>
          <button className="btn btn-outline !min-h-9 !px-3 text-xs">Filter</button>
        </form>
        {sp.deleted && <p className="label mt-3 inline-block bg-lime px-2 py-1">Product deleted.</p>}
      </PageHeader>
      <Body>
        {products.length ? (
          <div className="overflow-x-auto border border-rule bg-[#fbfaf7]">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr>
                  <th className={th}>Product</th>
                  <th className={th}>Category</th>
                  <th className={`${th} text-right`}>Price</th>
                  <th className={`${th} text-right`}>Stock</th>
                  <th className={th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-paper-2">
                    <td className={td}>
                      <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3">
                        <span className="relative size-11 shrink-0 bg-paper-2">
                          {p.images[0] && <Image src={p.images[0].url} alt="" fill sizes="44px" className="object-contain p-0.5" />}
                        </span>
                        <span>
                          <span className="label block text-muted">{p.brand}</span>
                          <span className="font-semibold hover:underline">{p.name}</span>
                        </span>
                      </Link>
                    </td>
                    <td className={`${td} text-muted`}>{p.category.name}</td>
                    <td className={`${td} text-right font-mono`}>
                      {formatPrice(fromCents(p.priceCents))}
                      {p.compareAtCents && <span className="block text-xs text-muted line-through">{formatPrice(fromCents(p.compareAtCents))}</span>}
                    </td>
                    <td className={cn(td, "text-right font-mono", p.stock === 0 ? "text-danger" : p.stock <= LOW_STOCK_THRESHOLD && "text-warn")}>{p.stock}</td>
                    <td className={td}>
                      <span className={cn("label inline-flex h-6 items-center px-2", p.published ? "bg-paper-3" : "border border-rule-strong text-muted")}>{p.published ? "Live" : "Hidden"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty title="No products match.">
            <Link href="/admin/products" className="underline">
              Clear filters
            </Link>
          </Empty>
        )}
      </Body>
    </>
  );
}
