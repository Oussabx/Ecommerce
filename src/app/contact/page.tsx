import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ContactForm } from "@/components/layout/ContactForm";
import { store } from "@/config/store";

export const metadata: Metadata = {
  title: "Contact",
  description: "Questions about a product, an order or a warranty claim? Send OSA Techstore a message.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const c = store.contact;
  const rows = [
    c.phone && { label: "Phone", value: c.phone, href: `tel:${c.phone.replace(/\s/g, "")}` },
    c.whatsapp && { label: "WhatsApp", value: c.whatsapp, href: `https://wa.me/${c.whatsapp.replace(/\D/g, "")}` },
    c.email && { label: "Email", value: c.email, href: `mailto:${c.email}` },
    c.address && { label: "Address", value: c.address },
    c.hours && { label: "Hours", value: c.hours },
  ].filter(Boolean) as { label: string; value: string; href?: string }[];

  return (
    <div className="container-x pb-20 pt-6">
      <Breadcrumbs items={[{ label: "Contact" }]} />
      <div className="mt-8 grid gap-12 border-t border-ink pt-4 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="label text-muted">Help — Contact</p>
          <h1 className="display mt-3 text-[clamp(3.2rem,9vw,8rem)]">Talk to us.</h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-2">
            Not sure which device fits? Have a question about an order or warranty? Send a message and a person who knows the product will reply.
          </p>
          {rows.length > 0 && (
            <dl className="mt-10 divide-y divide-rule border-y border-rule">
              {rows.map((r) => (
                <div key={r.label} className="grid grid-cols-[110px_1fr] py-3">
                  <dt className="label pt-0.5 text-muted">{r.label}</dt>
                  <dd>{r.href ? <a href={r.href} className="underline underline-offset-4">{r.value}</a> : r.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
