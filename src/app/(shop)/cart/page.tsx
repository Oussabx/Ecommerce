import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CartView } from "@/components/checkout/CartView";
import { PersonalRails } from "@/components/product/PersonalRails";

export const metadata: Metadata = { title: "Cart", robots: { index: false } };

export default function CartPage() {
  return (
    <>
      <div className="container-x pb-16 pt-6">
        <Breadcrumbs items={[{ label: "Cart" }]} />
        <h1 className="display mt-8 border-t border-ink pt-4 text-[clamp(3.2rem,9vw,8rem)]">Your cart</h1>
        <div className="mt-8">
          <CartView />
        </div>
      </div>
      <PersonalRails />
    </>
  );
}
