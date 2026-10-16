import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ContactForm } from "@/components/layout/ContactForm";
import { getSettings } from "@/server/settings";

export const metadata: Metadata = {
  title: "Contact",
  description: "Questions about a product or an order? Send OSA Techstore a message.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const { store } = await getSettings();
  const c = store.contact;
  const rows = [
    c.phone && { label: "Phone", value: c.phone, href: `tel:${c.phone.replace(/\s/g, "")}` },
    c.whatsapp && { label: "WhatsApp", value: c.whatsapp, href: `https://wa.me/${c.whatsapp.replace(/\D/g, "")}` },
    c.email && { label: "Email", value: c.email, href: `mailto:${c.email}` },
    c.address && { label: "Address", value: c.address },
    c.hours && { label: "Hours", value: c.hours },
  ].filter(Boolean) as { label: string; value: string; href?: string }[];

  return (
    <div className="container-x pb-20 pt-6 md:pb-28">
      <Breadcrumbs items={[{ label: "Contact" }]} />
      <div className="mt-8 grid gap-10 md:mt-12 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <h1 className="display text-[clamp(2rem,4.5vw,3.5rem)]">Talk to us.</h1>
          <p className="mt-4 max-w-md text-lg leading-relaxed text-muted">
            Not sure which device fits? Have a question about an order? Send a message and a person who knows the product will reply.
          </p>
          {rows.length > 0 && (
            <dl className="mt-8 rounded-3xl bg-paper-2 divide-y divide-rule px-5 md:px-6">
              {rows.map((r) => (
                <div key={r.label} className="grid grid-cols-[100px_1fr] gap-3 py-3.5 text-[15px]">
                  <dt className="text-muted">{r.label}</dt>
                  <dd className="min-w-0 break-words">{r.href ? <a href={r.href} className="text-link">{r.value}</a> : r.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
        <div className="rounded-3xl bg-paper-2 p-5 md:p-8 lg:col-span-7">
          <h2 className="mb-6 text-xl font-semibold tracking-tight">Send a message</h2>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
