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
    <section id="contact" className="scroll-mt-24 border-t border-ink bg-paper-2" aria-labelledby="contact-title">
      <div className="container-x grid gap-10 py-16 md:py-24 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h2 id="contact-title" className="display text-[clamp(3rem,8vw,7rem)]">
            Contact us.
          </h2>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-ink-2">
            Not sure which device is right, or want to check stock before you order? Send us a message and a real person will get back to you.
          </p>
          {rows.length > 0 && (
            <ul className="mt-8 divide-y divide-rule border-y border-rule">
              {rows.map((r) => (
                <li key={r.label} className="flex items-center gap-4 py-3">
                  <Icon name={r.icon} size={20} />
                  <span className="w-24 text-sm text-muted">{r.label}</span>
                  {r.href ? (
                    <a href={r.href} target={r.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="font-semibold underline-offset-4 hover:underline">
                      {r.value}
                    </a>
                  ) : (
                    <span className="font-semibold">{r.value}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
