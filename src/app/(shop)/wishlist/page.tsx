import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { WishlistView } from "@/components/product/WishlistView";

export const metadata: Metadata = { title: "Wishlist", robots: { index: false } };

export default function WishlistPage() {
  return (
    <div className="container-x pb-16 pt-5 md:pb-24 md:pt-6">
      <Breadcrumbs items={[{ label: "Wishlist" }]} />
      <h1 className="display mt-6 text-[clamp(2rem,4.5vw,3.5rem)] md:mt-10">Wishlist</h1>
      <p className="mt-3 max-w-lg text-[17px] text-muted">Saved on this device. Products you save stay here until you remove them.</p>
      <div className="mt-8 md:mt-10">
        <WishlistView />
      </div>
    </div>
  );
}
