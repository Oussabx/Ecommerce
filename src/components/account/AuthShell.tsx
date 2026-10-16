import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export function AuthShell({ title, kicker, intro, children }: { title: string; kicker: string; intro: ReactNode; children: ReactNode }) {
  return (
    <div className="container-x pb-20 pt-6">
      <Breadcrumbs items={[{ label: "Account", href: "/account" }, { label: title }]} />
      <div className="mt-8 grid gap-10 border-t border-ink pt-4 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <p className="label text-muted">{kicker}</p>
          <h1 className="display mt-4 text-[clamp(3.2rem,8vw,7rem)]">{title}</h1>
          <div className="mt-5 max-w-md text-muted">{intro}</div>
        </div>
        <div className="lg:col-span-5 lg:col-start-8">{children}</div>
      </div>
    </div>
  );
}
