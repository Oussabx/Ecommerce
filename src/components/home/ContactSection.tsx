import { ContactForm } from "@/components/layout/ContactForm";
import { Icon } from "@/components/ui/Icon";
import { getSettings } from "@/server/settings";

/** "Contact us" block on the homepage. Shows only the contact details that are configured. */
export async function ContactSection() {
  const { store } = await getSettings();
  const c = store.contact;
  const rows = [
    c.phone && { icon: "chat" as const, label: "Call us", value: c.phone, href: `tel:${c.phone.replace(/\s/g, "")}` },
    c.whatsapp && { icon: "chat" as const, label: "WhatsApp", value: c.whatsapp, href: `https://wa.me/${c.whatsapp.replace(/\D/g, "")}` },
    c.email && { icon: "info" as const, label: "Email", value: c.email, href: `mailto:${c.email}` },
    c.address && { icon: "pin" as const, label: "Visit", value: c.address },
    c.hours && { icon: "clock" as const, label: "Hours", value: c.hours },
  ].filter(Boolean) as { icon: "chat" | "info" | "pin" | "clock"; label: string; value: string; href?: string }[];

  return (
    <section id="contact" className="container-x scroll-mt-24 py-8 md:py-12" aria-labelledby="contact-title">
      <div className="grid gap-10 rounded-[32px] bg-paper-2 p-6 md:p-12 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <h2 id="contact-title" className="display text-[clamp(2rem,4.2vw,3.25rem)]">
            Contact us
          </h2>
          <p className="mt-3 max-w-md text-lg leading-relaxed text-muted">
            Not sure which device is right, or want to check stock before you order? Send us a message and a real person will get back to you.
          </p>
          {rows.length > 0 && (
            <ul className="mt-8 space-y-2">
              {rows.map((r) => (
                <li key={r.label} className="flex items-center gap-4 rounded-2xl bg-white p-3 pr-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
                    <Icon name={r.icon} size={18} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13px] text-muted">{r.label}</span>
                    {r.href ? (
                      <a href={r.href} target={r.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="font-semibold hover:text-accent">
                        {r.value}
                      </a>
                    ) : (
                      <span className="font-semibold">{r.value}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-3xl bg-white p-5 shadow-[var(--shadow-card)] md:p-8 lg:col-span-7">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
