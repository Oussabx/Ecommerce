import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getOrder, statusLabel } from "@/server/orders";
import { currentUser } from "@/server/auth";
import { orderAccessToken, safeEqual } from "@/server/crypto";
import { Icon } from "@/components/ui/Icon";
import { store } from "@/config/store";
import { formatDate, formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Order confirmation", robots: { index: false } };

export default async function OrderPage({ params, searchParams }: { params: Promise<{ ref: string }>; searchParams: Promise<{ t?: string }> }) {
  const { ref } = await params;
  const { t } = await searchParams;
  const order = /^OSA-[A-Z0-9]{6}$/.test(ref) ? await getOrder(ref) : undefined;
  const user = order ? await currentUser() : null;
  const allowed = !!order && ((t && safeEqual(t, orderAccessToken(order.ref))) || (user && order.userId === user.id));

  if (!order || !allowed) {
    return (
      <div className="container-x py-20">
        <p className="label text-muted">Order lookup</p>
        <h1 className="display mt-4 text-6xl md:text-8xl">We can&apos;t show this order.</h1>
        <p className="mt-4 max-w-lg text-muted">The link may be incomplete, or the order belongs to another account. Sign in to see your order history, or contact us with your order reference.</p>
        <div className="mt-8 flex flex-wrap gap-2">
          <Link href="/account/login" className="btn btn-primary">
            Sign in
          </Link>
          <Link href="/contact" className="btn btn-outline">
            Contact us
          </Link>
        </div>
      </div>
    );
  }

  const steps = [
    { title: "We call to confirm", body: `Our team will call ${order.customer.phone} to confirm stock, the delivery fee and a delivery window.` },
    { title: "We prepare and dispatch", body: "Your devices are checked and packed once the order is confirmed." },
    { title: "Delivery & payment", body: `You receive your order and pay ${order.paymentMethod.label.toLowerCase()}.` },
  ];

  return (
    <div className="container-x pb-20 pt-6">
      <nav aria-label="Checkout progress" className="label flex flex-wrap items-center gap-2 text-muted">
        <span>01 Cart</span>
        <span aria-hidden>—</span>
        <span>02 Details</span>
        <span aria-hidden>—</span>
        <span className="text-ink" aria-current="step">
          03 Confirmation
        </span>
      </nav>

      <section className="mt-8 bg-lime p-6 md:p-10">
        <p className="label flex items-center gap-2">
          <Icon name="check" size={16} /> Order request received
        </p>
        <h1 className="display mt-4 text-[clamp(3rem,9vw,8rem)]">Thank you, {order.customer.firstName}.</h1>
        <div className="mt-6 grid gap-6 border-t border-ink pt-4 sm:grid-cols-3">
          <div>
            <p className="label">Order reference</p>
            <p className="display-wide mt-1 text-3xl">{order.ref}</p>
          </div>
          <div>
            <p className="label">Placed</p>
            <p className="mt-1 font-semibold">{formatDate(order.createdAt)}</p>
          </div>
          <div>
            <p className="label">Status</p>
            <p className="mt-1 font-semibold">{statusLabel[order.status]}</p>
          </div>
        </div>
      </section>

      <div className="mt-12 grid gap-12 lg:grid-cols-12">
        <section className="lg:col-span-7" aria-labelledby="next-title">
          <h2 id="next-title" className="display border-t border-ink pt-4 text-4xl md:text-5xl">
            What happens next
          </h2>
          <ol className="mt-6 grid gap-px border border-rule bg-rule md:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title} className="bg-paper p-5">
                <p className="display text-5xl text-ink/20">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-3 font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted">{s.body}</p>
              </li>
            ))}
          </ol>

          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            <div>
              <h3 className="label text-muted">Delivery to</h3>
              <address className="mt-2 not-italic leading-relaxed">
                {order.customer.firstName} {order.customer.lastName}
                <br />
                {order.address.line1}
                {order.address.line2 && (
                  <>
                    <br />
                    {order.address.line2}
                  </>
                )}
                <br />
                {order.address.city}, {order.address.area}
                <br />
                {store.country}
              </address>
              {order.address.notes && <p className="mt-2 text-sm text-muted">Notes: {order.address.notes}</p>}
            </div>
            <div>
              <h3 className="label text-muted">Contact</h3>
              <p className="mt-2">{order.customer.email}</p>
              <p>{order.customer.phone}</p>
              <h3 className="label mt-5 text-muted">Delivery · Payment</h3>
              <p className="mt-2">{order.deliveryMethod.label}</p>
              <p>{order.paymentMethod.label}</p>
            </div>
          </div>
        </section>

        <aside className="lg:col-span-5" aria-labelledby="items-title">
          <div className="border border-ink">
            <h2 id="items-title" className="display border-b border-ink p-5 text-3xl">
              Items
            </h2>
            <ul className="divide-y divide-rule px-5">
              {order.lines.map((l) => (
                <li key={`${l.slug}-${l.colorId}-${l.configId}`} className="flex gap-3 py-3">
                  <span className="relative size-16 shrink-0 bg-paper-2">
                    <Image src={l.image} alt="" fill sizes="64px" className="object-contain p-1" />
                  </span>
                  <span className="min-w-0 flex-1 text-sm">
                    <Link href={`/product/${l.slug}`} className="block font-semibold hover:underline">
                      {l.name}
                    </Link>
                    <span className="block text-muted">{[l.colorName, l.configLabel].filter(Boolean).join(" · ")}</span>
                    <span className="block text-muted">Qty {l.quantity} × {formatPrice(l.unitPrice)}</span>
                  </span>
                  <span className="font-mono text-sm tabular-nums">{formatPrice(l.unitPrice * l.quantity)}</span>
                </li>
              ))}
            </ul>
            <dl className="space-y-2 border-t border-rule p-5 text-sm">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd className="font-mono tabular-nums">{formatPrice(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Delivery</dt>
                <dd className="text-muted">{order.deliveryFee === null ? "Confirmed by phone" : formatPrice(order.deliveryFee)}</dd>
              </div>
              <div className="flex justify-between border-t border-ink pt-3 text-base font-semibold">
                <dt>Total{order.deliveryFee === null ? " before delivery" : ""}</dt>
                <dd className="font-mono tabular-nums">{formatPrice(order.total)}</dd>
              </div>
            </dl>
          </div>
          <p className="mt-4 text-xs text-muted">Keep this page&apos;s link or your order reference — you&apos;ll need it if you contact us. No payment has been taken.</p>
          <Link href="/shop" className="btn btn-outline mt-6 w-full">
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
