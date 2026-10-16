import { getSettings } from "@/server/settings";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { pad2 } from "@/lib/format";

const icons: Record<string, IconName> = { authentic: "badge", warranty: "shield", delivery: "truck", support: "chat", payment: "cash" };

export async function WhyOsa() {
  const { store } = await getSettings();
  if (!store.advantages.length) return null;
  return (
    <section className="bg-ink text-paper" aria-labelledby="why-title">
      <div className="container-x grid gap-10 py-16 md:py-24 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <h2 id="why-title" className="display text-[clamp(3rem,7vw,6.5rem)]">
            Less noise.
            <br />
            <span className="text-lime">More signal.</span>
          </h2>
          <p className="mt-6 max-w-sm text-paper/65">
            We keep the range focused, describe products plainly and stay available after you buy. That&apos;s the whole idea.
          </p>
        </div>
        <ol className="grid gap-px bg-paper/15 sm:grid-cols-2 lg:col-span-8">
          {store.advantages.map((a, i) => (
            <Reveal as="li" key={a.id} delay={i * 80} className="flex flex-col gap-6 bg-ink p-6 md:p-8">
              <div className="flex items-start justify-between">
                <span className="display text-[5.5rem] leading-none text-paper/15">{pad2(i + 1)}</span>
                <Icon name={icons[a.id] ?? "check"} size={28} className="text-lime" />
              </div>
              <div className="border-t border-paper/20 pt-4">
                <h3 className="text-lg font-semibold">{a.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-paper/65">{a.body}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
