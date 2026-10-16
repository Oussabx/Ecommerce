import Link from "next/link";
import { getCatalog } from "@/server/catalog";
import { ShopChrome } from "@/components/layout/ShopChrome";

export default async function NotFound() {
  const { categories } = await getCatalog();
  return (
    <ShopChrome>
    <div className="container-x flex flex-col items-center py-20 text-center md:py-32">
      <p className="text-sm font-medium text-muted">Error 404</p>
      <h1 className="display mt-2 text-[clamp(2rem,4.5vw,3.5rem)]">Page not found.</h1>
      <p className="mt-4 max-w-lg text-lg text-muted">This page doesn&apos;t exist — it may have moved, or the product is no longer listed.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <Link href="/" className="btn btn-primary">
          Back to home
        </Link>
        <Link href="/shop" className="btn btn-outline">
          Shop everything
        </Link>
      </div>
      <ul className="mt-12 flex max-w-2xl flex-wrap justify-center gap-2">
        {categories.map((c) => (
          <li key={c.slug}>
            <Link href={`/category/${c.slug}`} className="chip">
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
    </ShopChrome>
  );
}
