"use client";
import { useEffect, useState } from "react";
import { useSettings } from "./ShopData";

export function AnnouncementBar() {
  const { announcements, store } = useSettings();
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || announcements.length < 2) return;
    const t = setInterval(() => setI((n) => (n + 1) % announcements.length), 4500);
    return () => clearInterval(t);
  }, [paused, announcements.length]);
  return (
    <div className="border-b border-ink/10 bg-ink text-paper" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="container-x flex h-9 items-center justify-between gap-4">
        <span className="label hidden text-paper/50 md:inline">OSA/{String(i + 1).padStart(2, "0")}</span>
        <p className="label relative h-4 flex-1 overflow-hidden text-center md:flex-none" aria-live="polite">
          <span key={i} className="block animate-[rise_.6s_var(--ease-out-expo)_both]">
            {announcements[i % Math.max(1, announcements.length)]}
          </span>
        </p>
        {store.sampleCatalog ? (
          <span className="label hidden text-lime md:inline" title="Products, prices and stock shown are sample data">
            ● Sample catalogue
          </span>
        ) : (
          <span className="label hidden text-paper/50 md:inline">Lebanon · USD</span>
        )}
      </div>
    </div>
  );
}
