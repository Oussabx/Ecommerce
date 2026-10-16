import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default function CheckoutPage() {
  return (
    <div className="container-x pb-20 pt-6">
      <nav aria-label="Checkout progress" className="label flex flex-wrap items-center gap-2 text-muted">
        <Link href="/cart" className="hover:text-ink">
          01 Cart
        </Link>
        <span aria-hidden>—</span>
        <span className="text-ink" aria-current="step">
          02 Details
        </span>
        <span aria-hidden>—</span>
        <span>03 Confirmation</span>
      </nav>
      <h1 className="display mt-8 border-t border-ink pt-4 text-[clamp(3.2rem,9vw,8rem)]">Checkout</h1>
      <div className="mt-8">
        <CheckoutForm />
      </div>
    </div>
  );
}
