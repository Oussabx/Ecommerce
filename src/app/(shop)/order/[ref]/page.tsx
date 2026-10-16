import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getOrder, orderTotal, statusLabel } from "@/server/orders";
import { currentUser } from "@/server/auth";
import { orderAccessToken, safeEqual } from "@/server/crypto";
import { Icon } from "@/components/ui/Icon";
import { getSettings } from "@/server/settings";
import { fromCents, hasDatabase } from "@/server/db";
import { formatDate, formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Order confirmation", robots: { index: false } };

export default async function OrderPage({ params, searchParams }: { params: Promise<{ ref: string }>; searchParams: Promise<{ t?: string }> }) {
  const { ref } = await params;
  const { t } = await searchParams;
  const order = hasDatabase && /^OSA-[A-Z0-9]{6}$/.test(ref) ? await getOrder(ref) : undefined;
  const user = order ? await currentUser() : null;
  const allowed = !!order && ((t && safeEqual(t, orderAccessToken(order.ref))) || (user && order.userId === user.id));
  const { store } = await getSettings();

  if (!order || !allowed) {
    return (
      <div className="container-x py-20 md:py-28">
        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
          <span className="grid size-14 place-items-center rounded-full bg-paper-2 text-muted">
            <Icon name="info" size={26} />
          </span>
          <p className="mt-5 text-sm font-medium text-muted">Order lookup</p>
          <h1 className="display mt-2 text-[clamp(2rem,4.5vw,3rem)]">We can&apos;t show this order.</h1>
          <p className="mt-3 text-muted">The link may be incomplete. Use the link from your confirmation page, or contact us with your order reference.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            <Link href="/contact" className="btn btn-primary">
              Contact us
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const steps = [
    { title: "We call to confirm", body: `Our team will call ${order.phone} to confirm stock and a delivery time.` },
    { title: "We prepare and dispatch", body: "Your devices are checked and packed once the order is confirmed." },
    { title: "Delivery & payment", body: `You receive your order and pay ${order.paymentMethodLabel.toLowerCase()}.` },
  ];

  return (
    <div className="container-x pb-20 pt-6 md:pb-24">
      <nav aria-label="Checkout progress" className="flex flex-wrap items-center gap-2 text-sm text-muted">
        <span>Cart</span>
        <Icon name="chevronRight" size={14} className="text-subtle" />
        <span>Details</span>
        <Icon name="chevronRight" size={14} className="text-subtle" />
        <span className="font-medium text-ink" aria-current="step">
          Confirmation
        </span>
      </nav>

      <section className="mt-8 flex flex-col items-center text-center md:mt-12">
        <span className="grid size-16 place-items-center rounded-full bg-ok/15 text-ok">
          <Icon name="check" size={32} />
        </span>
        <p className="mt-5 text-sm font-medium text-ok">Order request received</p>
        <h1 className="display mt-2 text-[clamp(2rem,4.5vw,3.5rem)]">Thank you, {order.firstName}.</h1>
        <p className="mt-3 max-w-lg text-muted">We&apos;ve got your order. Our team will call you shortly to confirm the details.</p>
        <dl className="mt-8 rounded-3xl bg-paper-2 grid w-full max-w-3xl gap-5 p-5 text-left sm:grid-cols-3 sm:gap-6 md:p-6">
          <div>
            <dt className="text-sm text-muted">Order number</dt>
            <dd className="mt-1 text-xl font-semibold tracking-tight tabular-nums">{order.ref}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Placed</dt>
            <dd className="mt-1 font-semibold">{formatDate(order.createdAt.toISOString())}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Status</dt>
            <dd className="mt-1">
              <span className="badge">{statusLabel[order.status]}</span>
            </dd>
          </div>
        </dl>
      </section>

      <div className="mt-12 grid gap-8 md:mt-16 lg:grid-cols-12 lg:gap-10">
        <div className="space-y-6 lg:col-span-7">
          <section className="rounded-3xl bg-paper-2 p-5 md:p-7" aria-labelledby="next-title">
            <h2 id="next-title" className="text-xl font-semibold tracking-tight">
              What happens next
            </h2>
            <ol className="mt-5 space-y-5">
              {steps.map((s, i) => (
                <li key={s.title} className="flex gap-4">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent/15 text-sm font-semibold text-accent" aria-hidden>
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold">{s.title}</h3>
                    <p className="mt-0.5 text-[15px] text-muted">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="grid rounded-3xl bg-paper-2 gap-6 p-5 sm:grid-cols-2 md:p-7" aria-label="Delivery and contact details">
            <div>
              <h3 className="text-sm font-medium text-muted">Delivery to</h3>
              <address className="mt-2 not-italic leading-relaxed">
                {order.firstName} {order.lastName}
                <br />
                {order.line1}
                {order.line2 && (
                  <>
                    <br />
                    {order.line2}
                  </>
                )}
                <br />
                {order.city}, {order.area}
                <br />
                {store.country}
              </address>
              {order.notes && <p className="mt-2 text-sm text-muted">Notes: {order.notes}</p>}
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted">Contact</h3>
              <p className="mt-2">{order.email}</p>
              <p>{order.phone}</p>
              <h3 className="mt-5 text-sm font-medium text-muted">Delivery · Payment</h3>
              <p className="mt-2">{order.deliveryMethodLabel}</p>
              <p>{order.paymentMethodLabel}</p>
            </div>
          </section>
        </div>

        <aside className="lg:col-span-5" aria-labelledby="items-title">
          <div className="rounded-3xl bg-paper-2 lg:sticky lg:top-24">
            <h2 id="items-title" className="p-5 pb-4 text-xl font-semibold tracking-tight md:px-6">
              Items
            </h2>
            <ul className="space-y-3 px-5 pb-5 md:px-6">
              {order.lines.map((l) => (
                <li key={l.id} className="flex items-center gap-3.5">
                  <span className="relative size-16 shrink-0 overflow-hidden rounded-2xl bg-paper-3">
                    <Image src={l.image} alt="" fill sizes="64px" className="object-contain p-1.5" />
                  </span>
                  <span className="min-w-0 flex-1 text-sm">
                    <Link href={`/product/${l.slug}`} className="block font-semibold hover:underline">
                      {l.name}
                    </Link>
                    <span className="block text-muted">{[l.colorName, l.configLabel].filter(Boolean).join(" · ")}</span>
                    <span className="block text-muted">Qty {l.quantity} × {formatPrice(fromCents(l.unitPriceCents))}</span>
                  </span>
                  <span className="text-sm font-semibold tabular-nums">{formatPrice(fromCents(l.unitPriceCents * l.quantity))}</span>
                </li>
              ))}
            </ul>
            <dl className="mx-5 space-y-2.5 border-t border-rule-strong/60 py-5 text-[15px] md:mx-6">
              <div className="flex justify-between">
                <dt className="text-ink-2">Subtotal</dt>
                <dd className="font-semibold tabular-nums">{formatPrice(fromCents(order.subtotalCents))}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-2">Delivery</dt>
                <dd className="text-muted">{order.deliveryFeeCents === null ? "Confirmed by phone" : formatPrice(fromCents(order.deliveryFeeCents))}</dd>
              </div>
              <div className="flex justify-between border-t border-rule-strong/60 pt-4 text-lg font-semibold">
                <dt>Total{order.deliveryFeeCents === null ? " before delivery" : ""}</dt>
                <dd className="tabular-nums">{formatPrice(orderTotal(order))}</dd>
              </div>
            </dl>
          </div>
          <p className="mt-4 px-1 text-[13px] leading-relaxed text-muted">Keep this page&apos;s link or your order reference — you&apos;ll need it if you contact us. No payment has been taken.</p>
          <Link href="/shop" className="btn btn-outline mt-5 w-full">
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
