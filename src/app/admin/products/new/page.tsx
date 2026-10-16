import Link from "next/link";
import { Body, PageHeader } from "@/components/admin/ui";
import { ProductForm, emptyProduct } from "@/components/admin/ProductForm";
import { requireStaff } from "@/server/auth";
import { db } from "@/server/db";

export const metadata = { title: "New product" };

export default async function NewProductPage() {
  await requireStaff();
  const [categories, all] = await Promise.all([
    db.category.findMany({ orderBy: { index: "asc" }, select: { slug: true, name: true } }),
    db.product.findMany({ orderBy: { name: "asc" }, select: { slug: true, name: true } }),
  ]);
  return (
    <>
      <PageHeader
        kicker="Catalogue"
        title="New product"
        actions={
          <Link href="/admin/products" className="label text-muted hover:text-ink">
            ← All products
          </Link>
        }
      />
      <Body>
        <ProductForm id={null} initial={emptyProduct} categories={categories} allProducts={all} canDelete={false} />
      </Body>
    </>
  );
}
