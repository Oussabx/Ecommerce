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
    <footer className="bg-ink text-paper">
      <div className="container-x grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-4">
          <Logo className="w-40 text-paper" />
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-paper/60">{store.description}</p>
          {socials.length > 0 && (
            <ul className="mt-6 flex gap-2">
              {socials.map(([name, url]) => (
                <li key={name}>
                  <a href={url} target="_blank" rel="noopener noreferrer" className="grid size-10 place-items-center border border-paper/20 transition-colors hover:border-lime hover:text-lime" aria-label={name}>
                    <Icon name={name} size={18} />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        <FooterCol title="Shop" index="01" links={footerNav.shop} />
        <FooterCol title="Help" index="02" links={footerNav.help} />
        <FooterCol title="OSA" index="03" links={footerNav.company} />
        <div className="md:col-span-2">
          <h2 className="label mb-4 text-paper/50">04 — Contact</h2>
          {contactRows.length ? (
            <dl className="space-y-3 text-sm">
              {contactRows.map((r) => (
                <div key={r.label}>
                  <dt className="label text-paper/40">{r.label}</dt>
                  <dd>{r.href ? <a href={r.href} className="link-underline">{r.value}</a> : r.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-sm text-paper/70">
              <Link href="/contact" className="link-underline">Send us a message</Link> — we reply to every enquiry.
            </p>
          )}
          <h2 className="label mb-3 mt-8 text-paper/50">Payment</h2>
          <ul className="space-y-1 text-sm text-paper/80">
            {store.paymentMethods.map((p) => (
              <li key={p.id} className="flex items-center gap-2">
                <Icon name="cash" size={16} /> {p.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-paper/15">
        <div className="container-x flex flex-col gap-3 py-5 text-xs text-paper/50 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {store.legalName}. Prices in USD. Delivery across {store.country}.
          </p>
          {store.sampleCatalog && <p className="label text-lime/80">Sample catalogue — products, prices and stock are for demonstration.</p>}
          <p className="flex gap-4">
            <Link href="/privacy" className="hover:text-paper">Privacy</Link>
            <Link href="/terms" className="hover:text-paper">Terms</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, index, links }: { title: string; index: string; links: { href: string; label: string }[] }) {
  return (
    <nav className="md:col-span-2" aria-label={title}>
      <h2 className="label mb-4 text-paper/50">
        {index} — {title}
      </h2>
      <ul className="space-y-2 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="link-underline text-paper/85 hover:text-paper">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
