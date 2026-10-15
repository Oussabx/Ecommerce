import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "./Icon";
import { cn } from "@/lib/format";

export function SectionHeader({
  index,
  title,
  intro,
  link,
  className,
  tone = "light",
}: {
  index?: string;
  title: ReactNode;
  intro?: ReactNode;
  link?: { href: string; label: string };
  className?: string;
  tone?: "light" | "dark";
}) {
  return (
    <div className={cn("grid gap-6 border-t pt-5 md:grid-cols-12 md:gap-8", tone === "dark" ? "border-paper/25" : "border-ink", className)}>
      <div className="label md:col-span-2">{index}</div>
      <h2 className="display text-[clamp(2.6rem,7vw,6.5rem)] md:col-span-7">{title}</h2>
      <div className="flex flex-col justify-end gap-5 md:col-span-3">
        {intro && <p className={cn("max-w-sm text-[15px] leading-relaxed", tone === "dark" ? "text-paper/70" : "text-muted")}>{intro}</p>}
        {link && (
          <Link href={link.href} className="label group inline-flex items-center gap-2">
            <span className="link-underline">{link.label}</span>
            <Icon name="arrow" size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </div>
    </div>
  );
}
