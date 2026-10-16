"use client";
import { useState } from "react";
import { formatPrice } from "@/lib/format";

/** Orders per day — single series, accent bars, hover tooltip, table fallback for screen readers. */
export function OrdersChart({ days }: { days: { date: string; label: string; orders: number; revenue: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...days.map((d) => d.orders));
  const h = 160;
  const barW = 100 / days.length;
  // Bar with rounded top corners. The SVG is stretched horizontally (preserveAspectRatio="none"),
  // so the corner radius is expressed separately in x and y units to stay visually round.
  const bar = (x: number, y: number, w: number, hh: number) => {
    if (hh <= 0) return "";
    const rx = Math.min(w / 2, 0.9);
    const ry = Math.min(hh, 6);
    return `M${x},${y + hh}V${y + ry}Q${x},${y} ${x + rx},${y}H${x + w - rx}Q${x + w},${y} ${x + w},${y + ry}V${y + hh}Z`;
  };
  return (
    <figure>
      <div className="relative" style={{ height: h + 24 }}>
        {/* gridlines */}
        {[0.5, 1].map((t) => (
          <div key={t} className="absolute inset-x-0 border-t border-dashed border-rule" style={{ top: h - h * t }} aria-hidden>
            <span className="absolute -top-4 left-0 text-[11px] text-subtle">{Math.round(max * t)}</span>
          </div>
        ))}
        <div className="absolute inset-x-0 border-t border-rule" style={{ top: h }} aria-hidden />
        <svg viewBox={`0 0 100 ${h}`} preserveAspectRatio="none" className="absolute inset-x-0 top-0 h-[160px] w-full" aria-hidden>
          {days.map((d, i) => {
            const bh = (d.orders / max) * (h - 8);
            return (
              <path
                key={d.date}
                d={bar(i * barW + barW * 0.2, h - Math.max(bh, d.orders ? 2 : 0), barW * 0.6, Math.max(bh, d.orders ? 2 : 0))}
                className={hover === null || hover === i ? "fill-accent" : "fill-accent/40"}
              />
            );
          })}
        </svg>
        {/* hit targets larger than the marks */}
        <div className="absolute inset-x-0 top-0 flex" style={{ height: h }}>
          {days.map((d, i) => (
            <button
              key={d.date}
              type="button"
              className="h-full flex-1 rounded-lg focus-visible:bg-accent/5"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              aria-label={`${d.label}: ${d.orders} orders, ${formatPrice(d.revenue)}`}
            />
          ))}
        </div>
        {hover !== null && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 whitespace-nowrap rounded-xl bg-paper-3 px-3 py-2 text-xs text-ink shadow-[var(--shadow-lift)] ring-1 ring-rule"
            style={{ left: `${(hover + 0.5) * barW}%`, top: Math.max(0, h - (days[hover].orders / max) * (h - 8) - 52) }}
          >
            <p className="text-muted">{days[hover].label}</p>
            <p className="font-semibold">
              {days[hover].orders} {days[hover].orders === 1 ? "order" : "orders"} · {formatPrice(days[hover].revenue)}
            </p>
          </div>
        )}
        <div className="absolute inset-x-0 flex" style={{ top: h + 6 }} aria-hidden>
          {days.map((d, i) => (
            <span key={d.date} className="flex-1 text-center text-[10px] text-subtle">
              {i % 2 === days.length % 2 ? d.label.split(" ")[0] : ""}
            </span>
          ))}
        </div>
      </div>
      <table className="sr-only">
        <caption>Orders per day</caption>
        <thead>
          <tr>
            <th>Day</th>
            <th>Orders</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {days.map((d) => (
            <tr key={d.date}>
              <td>{d.label}</td>
              <td>{d.orders}</td>
              <td>{formatPrice(d.revenue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
