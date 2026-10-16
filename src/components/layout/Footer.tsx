import Link from "next/link";
import { Logo } from "./Logo";
import { Icon, type IconName } from "@/components/ui/Icon";
import { footerNav } from "@/config/navigation";
import { getSettings } from "@/server/settings";

export async function Footer() {
  const { store } = await getSettings();
  const socials = (Object.entries(store.social) as [IconName, string][]).filter(([, url]) => url);
  const c = store.contact;
  const contactRows = [
    c.phone && { label: "Phone", value: c.phone, href: `tel:${c.phone.replace(/\s/g, "")}` },
    c.whatsapp && { label: "WhatsApp", value: c.whatsapp, href: `https://wa.me/${c.whatsapp.replace(/\D/g, "")}` },
    c.email && { label: "Email", value: c.email, href: `mailto:${c.email}` },
    c.address && { label: "Address", value: c.address },
    c.hours && { label: "Hours", value: c.hours },
  ].filter(Boolean) as { label: string; value: string; href?: string }[];

  return (
    <footer className="mt-8 bg-paper-2 text-ink">
      <div className="container-x grid gap-10 py-14 md:grid-cols-12">
        <div className="md:col-span-4">
          <Logo className="w-28" />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted">{store.description}</p>
          {socials.length > 0 && (
            <ul className="mt-5 flex gap-2">
              {socials.map(([name, url]) => (
                <li key={name}>
                  <a href={url} target="_blank" rel="noopener noreferrer" className="grid size-10 place-items-center rounded-full bg-white text-ink transition-colors hover:text-accent" aria-label={name}>
                    <Icon name={name} size={18} />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        <FooterCol title="Shop" links={footerNav.shop} />
        <FooterCol title="Help" links={footerNav.help} />
        <FooterCol title="OSA" links={footerNav.company} />
        <div className="md:col-span-2">
          <h2 className="mb-3 text-sm font-semibold">Contact</h2>
          {contactRows.length ? (
            <dl className="space-y-2.5 text-sm">
              {contactRows.map((r) => (
                <div key={r.label}>
                  <dt className="text-xs text-muted">{r.label}</dt>
                  <dd>{r.href ? <a href={r.href} className="hover:text-accent">{r.value}</a> : r.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-sm text-muted">
              <Link href="/contact" className="text-ink hover:text-accent">Send us a message</Link>. We reply to every enquiry.
            </p>
          )}
          <h2 className="mb-2 mt-6 text-sm font-semibold">Payment</h2>
          <ul className="space-y-1 text-sm text-muted">
            {store.paymentMethods.map((p) => (
              <li key={p.id} className="flex items-center gap-2">
                <Icon name="cash" size={16} /> {p.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="container-x">
        <div className="flex flex-col gap-2 border-t border-rule-strong/60 py-5 text-xs text-muted md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {store.legalName}. Prices in USD. Delivery across {store.country}.
          </p>
          {store.sampleCatalog && <p>Sample catalogue: products, prices and stock are for demonstration.</p>}
          <p className="flex gap-4">
            <Link href="/privacy" className="hover:text-ink">Privacy</Link>
            <Link href="/terms" className="hover:text-ink">Terms</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <nav className="md:col-span-2" aria-label={title}>
      <h2 className="mb-3 text-sm font-semibold">{title}</h2>
      <ul className="space-y-2 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-muted transition-colors hover:text-ink">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
