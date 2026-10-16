"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { ProductImage } from "@/lib/catalog";
import { Icon } from "@/components/ui/Icon";
import { cn, pad2 } from "@/lib/format";

export function Gallery({ images, name }: { images: ProductImage[]; name: string }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const [lightbox, setLightbox] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Reset to first image when the image set changes (colour switch).
  const first = images[0]?.src;
  useEffect(() => setActive(0), [first]);

  useEffect(() => {
    if (!lightbox) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight") setActive((a) => (a + 1) % images.length);
      if (e.key === "ArrowLeft") setActive((a) => (a - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, images.length]);

  const img = images[active] ?? images[0];

  return (
    <div className="grid gap-3 md:grid-cols-[72px_1fr] md:gap-4">
      {/* thumbnails */}
      <ul className="no-scrollbar order-2 flex gap-2 overflow-x-auto md:order-1 md:flex-col" aria-label="Product images">
        {images.map((im, i) => (
          <li key={im.src} className="shrink-0">
            <button
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show ${im.label.toLowerCase()} view`}
              aria-current={i === active}
              className={cn("relative block size-16 border bg-paper-2 transition-colors md:size-[72px]", i === active ? "border-ink" : "border-transparent hover:border-rule-strong")}
            >
              <Image src={im.src} alt="" fill sizes="72px" className="object-contain p-1.5" />
              <span className="label absolute bottom-0.5 left-1 text-[9px] text-muted">{pad2(i + 1)}</span>
            </button>
          </li>
        ))}
      </ul>

      {/* main image with hover zoom */}
      <div className="order-1 md:order-2">
        <div
          className="group relative aspect-square cursor-zoom-in overflow-hidden bg-paper-2"
          onMouseEnter={() => setZoom(true)}
          onMouseLeave={() => setZoom(false)}
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
          }}
          onClick={() => setLightbox(true)}
        >
          <Image
            key={img.src}
            src={img.src}
            alt={img.alt}
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="animate-[fade_.4s_ease] object-contain p-[6%] transition-transform duration-300 ease-out"
            style={{ transform: zoom ? "scale(1.8)" : "scale(1)", transformOrigin: origin }}
          />
          <span className="label pointer-events-none absolute left-3 top-3 text-muted">
            {pad2(active + 1)} / {pad2(images.length)} — {img.label}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightbox(true);
            }}
            className="absolute bottom-3 right-3 grid size-10 place-items-center bg-paper/90 hover:bg-lime"
            aria-label={`Enlarge image of ${name}`}
          >
            <Icon name="zoom" size={18} />
          </button>
          {images.length > 1 && (
            <div className="absolute bottom-3 left-3 flex gap-1 md:hidden">
              <button type="button" onClick={(e) => { e.stopPropagation(); setActive((active - 1 + images.length) % images.length); }} className="grid size-10 place-items-center bg-paper/90" aria-label="Previous image">
                <Icon name="arrowLeft" size={16} />
              </button>
              <button type="button" onClick={(e) => { e.stopPropagation(); setActive((active + 1) % images.length); }} className="grid size-10 place-items-center bg-paper/90" aria-label="Next image">
                <Icon name="arrow" size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-[60] flex animate-[fade_.2s_ease] flex-col bg-paper" role="dialog" aria-modal="true" aria-label={`${name} images`}>
          <div className="container-x flex h-16 items-center justify-between border-b border-ink">
            <p className="label">
              {pad2(active + 1)} / {pad2(images.length)} — {img.label}
            </p>
            <button ref={closeRef} type="button" onClick={() => setLightbox(false)} className="label inline-flex h-10 items-center gap-2" aria-label="Close enlarged image">
              Close <Icon name="close" />
            </button>
          </div>
          <div className="relative flex-1">
            <Image key={img.src} src={img.src} alt={img.alt} fill sizes="100vw" className="animate-[fade_.3s_ease] object-contain p-6 md:p-12" />
            {images.length > 1 && (
              <>
                <button type="button" onClick={() => setActive((active - 1 + images.length) % images.length)} className="absolute left-4 top-1/2 grid size-12 -translate-y-1/2 place-items-center border border-ink bg-paper hover:bg-lime" aria-label="Previous image">
                  <Icon name="arrowLeft" />
                </button>
                <button type="button" onClick={() => setActive((active + 1) % images.length)} className="absolute right-4 top-1/2 grid size-12 -translate-y-1/2 place-items-center border border-ink bg-paper hover:bg-lime" aria-label="Next image">
                  <Icon name="arrow" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
