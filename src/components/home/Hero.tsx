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
    style: { left: "34%", top: "10%", width: "52%" },
    speed: -0.05,
    from: { x: "60px", y: "0px", r: "0deg" },
    delay: 450,
    z: 1,
  },
  {
    src: "/products/iphone-16-pro/desert-duo.svg",
    alt: "iPhone 16 Pro in Desert Titanium, front and back",
    style: { left: "8%", top: "2%", width: "40%" },
    speed: -0.12,
    from: { x: "0px", y: "80px", r: "-4deg" },
    delay: 250,
    priority: true,
    z: 3,
  },
  {
    src: "/products/sony-wh-1000xm5/black-front.svg",
    alt: "Sony WH-1000XM5 headphones in black",
    style: { left: "68%", top: "40%", width: "30%" },
    speed: -0.2,
    from: { x: "80px", y: "40px", r: "8deg" },
    delay: 650,
    z: 4,
  },
  {
    src: "/products/dualsense-wireless-controller/white-top.svg",
    alt: "DualSense wireless controller in white",
    style: { left: "2%", top: "54%", width: "28%" },
    speed: -0.16,
    from: { x: "-60px", y: "40px", r: "-10deg" },
    delay: 800,
    z: 4,
  },
];

export function Hero({ categoryCount }: { categoryCount: number }) {
  const ref = useRef<HTMLElement>(null);

  // Gentle scroll-linked drift for the product composition (skipped for reduced motion).
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      el.style.setProperty("--sy", String(Math.min(window.scrollY, 1200)));
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
    <section ref={ref} className="container-x pt-10 md:pt-16" aria-labelledby="hero-title">
      <div className="mx-auto max-w-3xl text-center">
        <h1 id="hero-title" className="display animate-[rise_1s_var(--ease-out-expo)_both] text-[clamp(2.75rem,7vw,5.5rem)]">
          Good tech.
          <br />
          <span className="text-muted">No guesswork.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl animate-[rise_.9s_var(--ease-out-expo)_.15s_both] text-lg leading-relaxed text-muted md:text-xl">
          The devices worth your money, explained clearly and delivered across Lebanon.
        </p>
        <div className="mt-8 flex animate-[rise_.9s_var(--ease-out-expo)_.3s_both] flex-col justify-center gap-3 sm:flex-row">
          <Link href="/shop" className="btn btn-primary">
            Shop all products
          </Link>
          <Link href="/#intentions" className="btn btn-outline">
            Help me choose <Icon name="arrow" size={16} className="btn-arrow" />
          </Link>
        </div>
      </div>

      {/* Product composition */}
      <div className="relative mt-12 overflow-hidden rounded-[32px] bg-[radial-gradient(ellipse_at_50%_30%,#24271a_0%,var(--color-paper-2)_60%)] md:mt-16">
        <div className="relative mx-auto aspect-[1/0.8] max-w-5xl md:aspect-[1/0.58]">
          {pieces.map((p) => (
            <div
              key={p.src}
              className="absolute"
              style={{ ...p.style, zIndex: p.z, transform: `translate3d(0, calc(var(--sy, 0) * ${p.speed * 0.5}px), 0)` }}
            >
              <div
                className="relative aspect-square animate-[product-in_1.1s_var(--ease-out-expo)_both]"
                style={{ animationDelay: `${p.delay}ms`, ["--from-x" as string]: p.from.x, ["--from-y" as string]: p.from.y, ["--from-r" as string]: p.from.r }}
              >
                <Image src={p.src} alt={p.alt} fill priority={p.priority} sizes="(min-width: 1024px) 40vw, 70vw" className="object-contain drop-shadow-[0_24px_30px_rgba(0,0,0,0.5)]" />
              </div>
            </div>
          ))}
        </div>
        <ul className="relative flex flex-wrap justify-center gap-x-8 gap-y-2 border-t border-rule px-6 py-5 text-sm text-muted">
          <li className="flex items-center gap-2"><Icon name="truck" size={18} className="text-accent" /> Delivery across Lebanon</li>
          <li className="flex items-center gap-2"><Icon name="cash" size={18} className="text-accent" /> Cash on delivery</li>
          <li className="flex items-center gap-2"><Icon name="grid" size={18} className="text-accent" /> {categoryCount} categories</li>
        </ul>
      </div>
    </section>
  );
}
