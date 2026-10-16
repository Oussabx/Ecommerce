import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default function CheckoutPage() {
  return (
    <div className="container-x pb-20 pt-6 md:pb-24">
      <nav aria-label="Checkout progress" className="flex flex-wrap items-center gap-2 text-sm text-muted">
        <Link href="/cart" className="text-link">
          Cart
        </Link>
        <Icon name="chevronRight" size={14} className="text-subtle" />
        <span className="font-medium text-ink" aria-current="step">
          Details
        </span>
        <Icon name="chevronRight" size={14} className="text-subtle" />
        <span>Confirmation</span>
      </nav>
      <h1 className="display mt-6 text-[clamp(2rem,4.5vw,3.5rem)]">Checkout</h1>
      <div className="mt-8">
        <CheckoutForm />
      </div>
    </div>
  );
}
