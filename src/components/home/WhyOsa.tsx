import { getSettings } from "@/server/settings";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";

const icons: Record<string, IconName> = { authentic: "badge", delivery: "truck", support: "chat", payment: "cash" };

export async function WhyOsa() {
  const { store } = await getSettings();
  if (!store.advantages.length) return null;
  return (
    <section className="container-x py-14 md:py-20" aria-labelledby="why-title">
      <SectionHeader title={<span id="why-title">Why shop with OSA</span>} intro="A focused range, plain descriptions and real people after you buy." />
      <ul className={`mt-8 grid gap-3 md:mt-10 lg:gap-4 ${store.advantages.length % 3 === 0 ? "sm:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4"}`}>
        {store.advantages.map((a, i) => (
          <Reveal as="li" key={a.id} delay={i * 70} className="tile p-6 md:p-7">
            <span className="grid size-12 place-items-center rounded-2xl bg-accent text-on-accent">
              <Icon name={icons[a.id] ?? "check"} size={24} />
            </span>
            <h3 className="mt-5 text-lg font-semibold">{a.title}</h3>
            <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{a.body}</p>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
