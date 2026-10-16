import Link from "next/link";
import { notFound } from "next/navigation";
import { Body, PageHeader } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/ProductForm";
import { requireStaff } from "@/server/auth";
import { db } from "@/server/db";
import { productInclude } from "@/server/catalog";
import { toProductInput } from "@/server/admin-products";

export const metadata = { title: "Edit product" };

export default async function EditProductPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  const user = await requireStaff();
  const { id } = await params;
  const { created } = await searchParams;
  const [product, categories, all] = await Promise.all([
    /^[0-9a-f-]{36}$/.test(id) ? db.product.findUnique({ where: { id }, include: productInclude }) : null,
    db.category.findMany({ orderBy: { index: "asc" }, select: { slug: true, name: true } }),
    db.product.findMany({ orderBy: { name: "asc" }, select: { slug: true, name: true } }),
  ]);
  if (!product) notFound();
  return (
    <>
      <PageHeader
        kicker={`${product.brand} · ${product.published ? "Published" : "Hidden from store"}`}
        title={product.name}
        actions={
          <Link href="/admin/products" className="label text-muted hover:text-ink">
            ← All products
          </Link>
        }
      >
        {created && <p className="label mt-3 inline-block bg-lime px-2 py-1">Product created — add images and publish when ready.</p>}
      </PageHeader>
      <Body>
        <ProductForm id={product.id} initial={toProductInput(product)} categories={categories} allProducts={all} canDelete={user.role === "ADMIN"} publicHref={product.published ? `/product/${product.slug}` : undefined} />
      </Body>
    </>
  );
}
