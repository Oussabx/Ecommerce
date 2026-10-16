import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { MARK_PATH } from "@/components/layout/Logo";

/**
 * Homepage hero: big type on black, with the lime S ribbon from the brand
 * sweeping across the right side (it draws itself in after the intro).
 */
export function Hero({ categoryCount, productCount }: { categoryCount: number; productCount: number }) {
  return (
    <section className="relative isolate overflow-hidden" aria-labelledby="hero-title">
      {/* glow + grid texture */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute -right-[10%] top-[-20%] h-[90%] w-[70%] rounded-full bg-accent/20 blur-[140px]" />
        <div className="absolute bottom-[-30%] left-[-10%] h-[60%] w-[50%] rounded-full bg-cobalt/15 blur-[140px]" />
        <div className="hero-grid absolute inset-0 opacity-[0.35]" />
      </div>

      {/* brand ribbon */}
      <svg
        viewBox="0 0 120 96"
        className="hero-ribbon pointer-events-none absolute -z-10 overflow-visible w-[150%] max-w-none opacity-30 sm:opacity-50 md:-right-[4%] md:top-1/2 md:w-[52%] md:-translate-y-1/2 lg:right-[2%] lg:w-[46%] md:opacity-100 max-md:-right-[60%] max-md:bottom-[-12%]"
        fill="none"
        aria-hidden
      >
        <path d={MARK_PATH} pathLength={1} stroke="var(--color-accent)" strokeOpacity={0.12} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" className="hero-ribbon__halo" />
        <path d={MARK_PATH} pathLength={1} stroke="var(--color-accent)" strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      <div className="container-x flex min-h-[calc(100svh-100px)] flex-col justify-center py-16 md:min-h-[720px] md:py-24">
        <div className="relative max-w-3xl">
          <p className="inline-flex animate-[rise_.8s_var(--ease-out-expo)_both] items-center gap-2 rounded-full bg-paper-2/80 px-3.5 py-1.5 text-[13px] font-medium text-ink-2 ring-1 ring-rule backdrop-blur">
            <span className="size-2 rounded-full bg-accent shadow-[0_0_10px_var(--color-accent)]" aria-hidden />
            Delivering across Lebanon · Cash on delivery
          </p>
          <h1 id="hero-title" className="display mt-6 animate-[rise_1s_var(--ease-out-expo)_.08s_both] text-[clamp(3.4rem,8.4vw,7.75rem)] !leading-[0.92] !tracking-[-0.045em]">
            Tech worth
            <br />
            <span className="text-accent">having.</span>
          </h1>
          <p className="mt-6 max-w-lg animate-[rise_1s_var(--ease-out-expo)_.18s_both] text-lg leading-relaxed text-ink-2 md:text-xl">
            Phones, laptops, gaming and audio from the brands you trust, explained plainly and brought to your door.
          </p>
          <div className="mt-9 flex animate-[rise_1s_var(--ease-out-expo)_.28s_both] flex-col gap-3 sm:flex-row">
            <Link href="/shop" className="btn btn-primary !min-h-14 !px-8 text-base shadow-[0_0_40px_-8px_var(--color-accent)]">
              Shop now <Icon name="arrow" size={18} className="btn-arrow" />
            </Link>
            <Link href="/deals" className="btn btn-outline !min-h-14 !px-8 text-base backdrop-blur">
              See the deals
            </Link>
          </div>
        </div>

        <dl className="mt-14 grid max-w-2xl animate-[fade_1s_ease_.5s_both] grid-cols-3 gap-3 md:mt-20">
          {[
            ["$4", "Flat delivery, anywhere"],
            [String(productCount), "Products in store"],
            [String(categoryCount), "Categories"],
          ].map(([v, l]) => (
            <div key={l} className="rounded-2xl bg-paper-2/70 p-4 ring-1 ring-rule backdrop-blur md:p-5">
              <dd className="text-3xl font-semibold tracking-tight md:text-4xl">{v}</dd>
              <dt className="mt-1 text-[13px] text-muted">{l}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/** Scrolling lime band of categories and brands under the hero. */
export function HeroMarquee({ words }: { words: string[] }) {
  const row = (
    <ul className="flex shrink-0 items-center gap-8 pr-8">
      {words.map((w, i) => (
        <li key={i} className="flex items-center gap-8 whitespace-nowrap">
          <span>{w}</span>
          <svg viewBox="0 0 120 96" className="h-5 w-6 shrink-0" fill="none" aria-hidden>
            <path d={MARK_PATH} stroke="currentColor" strokeWidth={17} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </li>
      ))}
    </ul>
  );
  return (
    <div className="relative -rotate-1 overflow-hidden bg-accent py-4 text-on-accent shadow-[0_0_60px_-20px_var(--color-accent)]" aria-hidden>
      <div className="flex w-max animate-marquee text-2xl font-bold uppercase tracking-tight md:text-3xl">
        {row}
        {row}
      </div>
    </div>
  );
}
