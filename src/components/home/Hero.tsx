"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Icon } from "@/components/ui/Icon";

interface Piece {
  src: string;
  alt: string;
  /** Position & size as % of the stage */
  style: React.CSSProperties;
  speed: number;
  from: { x: string; y: string; r: string };
  delay: number;
  priority?: boolean;
  z: number;
}

const pieces: Piece[] = [
  {
    src: "/products/macbook-air-13-m4/midnight-open.svg",
    alt: "MacBook Air 13-inch with M4 in Midnight, open",
    style: { left: "40%", top: "6%", width: "62%" },
    speed: -0.05,
    from: { x: "60px", y: "0px", r: "0deg" },
    delay: 450,
    z: 1,
  },
  {
    src: "/products/iphone-16-pro/desert-duo.svg",
    alt: "iPhone 16 Pro in Desert Titanium, front and back",
    style: { left: "14%", top: "-8%", width: "44%" },
    speed: -0.12,
    from: { x: "0px", y: "80px", r: "-4deg" },
    delay: 250,
    priority: true,
    z: 3,
  },
  {
    src: "/products/sony-wh-1000xm5/black-front.svg",
    alt: "Sony WH-1000XM5 headphones in black",
    style: { left: "72%", top: "44%", width: "38%" },
    speed: -0.2,
    from: { x: "80px", y: "40px", r: "8deg" },
    delay: 650,
    z: 4,
  },
  {
    src: "/products/dualsense-wireless-controller/white-top.svg",
    alt: "DualSense wireless controller in white",
    style: { left: "-6%", top: "52%", width: "36%" },
    speed: -0.16,
    from: { x: "-60px", y: "40px", r: "-10deg" },
    delay: 800,
    z: 4,
  },
];

export function Hero({ categoryCount }: { categoryCount: number }) {
  const ref = useRef<HTMLElement>(null);

  // Scroll-linked drift for the product composition (skipped for reduced motion).
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = Math.min(window.scrollY, 1200);
      el.style.setProperty("--sy", String(y));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section ref={ref} className="relative overflow-hidden border-b border-ink" aria-labelledby="hero-title">
      {/* background index grid */}
      <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden>
        <div className="container-x grid h-full grid-cols-12">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="border-l border-ink/[0.06] last:border-r" />
          ))}
        </div>
      </div>

      <div className="container-x relative pt-6 md:pt-8">

        <h1 id="hero-title" className="display relative z-[2] mt-6 text-[clamp(3.6rem,12.6vw,13.5rem)] md:mt-8">
          <span className="block overflow-hidden pb-[0.04em]">
            <span className="block animate-[rise_1s_var(--ease-out-expo)_both]">Good tech.</span>
          </span>
          <span className="block overflow-hidden pb-[0.04em]">
            <span className="block animate-[rise_1s_var(--ease-out-expo)_120ms_both]">
              <span className="relative inline-block">
                <span className="absolute -inset-x-[0.04em] bottom-[0.06em] top-[0.12em] -z-10 origin-left animate-[wipe_.9s_var(--ease-out-expo)_.7s_both] bg-lime" aria-hidden />
                No
              </span>{" "}
              guesswork.
            </span>
          </span>
        </h1>

        <div className="relative grid gap-10 pb-10 lg:grid-cols-12 lg:gap-6 lg:pb-14">
          <div className="relative z-[5] order-2 flex flex-col justify-end lg:order-1 lg:col-span-4 lg:pt-16">
            <p className="max-w-sm animate-[rise_.9s_var(--ease-out-expo)_.5s_both] text-[17px] leading-relaxed text-ink-2">
              Discover the devices worth your money. Compare the details, find your next upgrade, and shop with confidence.
            </p>
            <div className="mt-7 flex animate-[rise_.9s_var(--ease-out-expo)_.65s_both] flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
              <Link href="/shop" className="btn btn-primary">
                Explore the collection <Icon name="arrow" size={16} className="btn-arrow" />
              </Link>
              <Link href="/#intentions" className="btn btn-outline">
                Find your next device
              </Link>
            </div>
            <dl className="mt-10 grid animate-[fade_1s_ease_.9s_both] grid-cols-3 border-t border-ink/20 pt-4">
              {[
                [String(categoryCount).padStart(2, "0"), "Categories"],
                ["USD", "Clear pricing"],
                ["LB", "Delivery nationwide"],
              ].map(([v, l]) => (
                <div key={l}>
                  <dt className="label text-muted">{l}</dt>
                  <dd className="display-wide mt-1 text-2xl">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Product composition */}
          <div className="relative order-1 mt-2 aspect-[1/0.78] lg:order-2 lg:col-span-8 lg:-mt-[5vw]">
            <div
              className="absolute left-[30%] top-[4%] h-[78%] w-[34%]"
              style={{ transform: "translate3d(0, calc(var(--sy, 0) * -0.04px), 0)" }}
              aria-hidden
            >
              <div className="relative h-full w-full origin-bottom animate-[rise_1s_var(--ease-out-expo)_.2s_both] bg-lime">
                <span className="label absolute left-2 top-2">Signal/01</span>
                <span className="label absolute bottom-2 right-2">↘ Index</span>
                <span className="absolute inset-x-0 top-1/2 h-px bg-ink/25" />
                <span className="absolute inset-y-0 left-1/2 w-px bg-ink/25" />
              </div>
            </div>

            {pieces.map((p) => (
              <div
                key={p.src}
                className="absolute"
                style={{ ...p.style, zIndex: p.z, transform: `translate3d(0, calc(var(--sy, 0) * ${p.speed}px), 0)` }}
              >
                <div
                  className="relative aspect-square animate-[product-in_1.1s_var(--ease-out-expo)_both]"
                  style={{ animationDelay: `${p.delay}ms`, ["--from-x" as string]: p.from.x, ["--from-y" as string]: p.from.y, ["--from-r" as string]: p.from.r }}
                >
                  <Image src={p.src} alt={p.alt} fill priority={p.priority} sizes="(min-width: 1024px) 40vw, 70vw" className="object-contain" />
                </div>
              </div>
            ))}

            {/* technical annotations */}
            <Annotation className="left-[52%] top-[2%] hidden md:flex" index="01" title="iPhone 16 Pro" detail="A18 Pro · 48MP Fusion" delay={1100} />
            <Annotation className="right-[1%] top-[86%] hidden md:flex" index="02" title="WH-1000XM5" detail="30 h · Adaptive ANC" delay={1250} align="right" />
            <Annotation className="bottom-[2%] left-[30%] hidden md:flex" index="03" title="MacBook Air M4" detail="Up to 18 h · 1.24 kg" delay={1400} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Annotation({ className, index, title, detail, delay, align = "left" }: { className: string; index: string; title: string; detail: string; delay: number; align?: "left" | "right" }) {
  return (
    <div className={`absolute z-[6] animate-[fade_.8s_ease_both] items-start gap-2 ${align === "right" ? "flex-row-reverse text-right" : ""} ${className}`} style={{ animationDelay: `${delay}ms` }}>
      <span className="mt-1.5 block h-px w-10 bg-ink" aria-hidden />
      <div className="bg-paper/85 px-1.5 py-1 backdrop-blur-sm">
        <p className="label text-muted">{index} —</p>
        <p className="text-[13px] font-semibold leading-tight">{title}</p>
        <p className="label text-muted">{detail}</p>
      </div>
    </div>
  );
}
