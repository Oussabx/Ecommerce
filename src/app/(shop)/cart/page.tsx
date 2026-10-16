import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CartView } from "@/components/checkout/CartView";
import { PersonalRails } from "@/components/product/PersonalRails";

export const metadata: Metadata = { title: "Cart", robots: { index: false } };

export default function CartPage() {
  return (
    <>
      <div className="container-x pb-16 pt-6 md:pb-24">
        <Breadcrumbs items={[{ label: "Cart" }]} />
        <h1 className="display mt-6 text-[clamp(2rem,4.5vw,3.5rem)]">Your cart</h1>
        <div className="mt-8">
          <CartView />
        </div>
      </div>
      <PersonalRails />
    </>
  );
}
