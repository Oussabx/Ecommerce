import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { WishlistView } from "@/components/product/WishlistView";

export const metadata: Metadata = { title: "Wishlist", robots: { index: false } };

export default function WishlistPage() {
  return (
    <div className="container-x pb-20 pt-6">
      <Breadcrumbs items={[{ label: "Wishlist" }]} />
      <h1 className="display mt-8 border-t border-rule pt-4 text-[clamp(3.2rem,9vw,8rem)]">Wishlist</h1>
      <p className="mt-3 max-w-lg text-muted">Saved on this device. Products you save stay here until you remove them.</p>
      <div className="mt-8">
        <WishlistView />
      </div>
    </div>
  );
}
