import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "./Icon";
import { cn } from "@/lib/format";

export function SectionHeader({
  title,
  intro,
  link,
  className,
  tone = "light",
}: {
  title: ReactNode;
  intro?: ReactNode;
  link?: { href: string; label: string };
  className?: string;
  tone?: "light" | "dark";
}) {
  return (
    <div className={cn("flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-8", className)}>
      <div className="max-w-2xl">
        <h2 className="display text-[clamp(2rem,4.2vw,3.25rem)]">{title}</h2>
        {intro && <p className={cn("mt-2 text-lg leading-relaxed", tone === "dark" ? "text-white/65" : "text-muted")}>{intro}</p>}
      </div>
      {link && (
        <Link href={link.href} className={cn("group inline-flex shrink-0 items-center gap-1.5 font-medium", tone === "dark" ? "text-white" : "text-accent")}>
          {link.label}
          <Icon name="chevronRight" size={16} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
