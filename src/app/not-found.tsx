import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { getCatalog } from "@/server/catalog";
import { ShopChrome } from "@/components/layout/ShopChrome";

export default async function NotFound() {
  const { categories } = await getCatalog();
  return (
    <ShopChrome>
    <div className="container-x py-16 md:py-24">
      <p className="label text-muted">Error 404 — Signal lost</p>
      <h1 className="display mt-4 text-[clamp(5rem,22vw,20rem)]">
        4<span className="bg-lime px-[0.04em]">0</span>4
      </h1>
      <p className="mt-6 max-w-lg text-lg text-ink-2">This page doesn&apos;t exist — it may have moved, or the product is no longer listed.</p>
      <div className="mt-8 flex flex-wrap gap-2">
        <Link href="/" className="btn btn-primary">
          Back to home <Icon name="arrow" size={16} className="btn-arrow" />
        </Link>
        <Link href="/shop" className="btn btn-outline">
          Shop everything
        </Link>
      </div>
      <ul className="mt-12 flex flex-wrap gap-2">
        {categories.map((c) => (
          <li key={c.slug}>
            <Link href={`/category/${c.slug}`} className="label inline-flex h-9 items-center border border-rule px-3 hover:border-ink">
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
    </ShopChrome>
  );
}
