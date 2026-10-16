"use client";
import Link from "next/link";
import { useUI } from "./UIProvider";
import { Icon } from "@/components/ui/Icon";

export function Toaster() {
  const { toasts, dismissToast } = useUI();
  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-start gap-2 sm:left-6 sm:right-auto sm:w-[380px]" aria-live="polite" role="status">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto flex w-full animate-[rise_.4s_var(--ease-out-expo)_both] items-center gap-3 rounded-2xl bg-paper-3 py-2.5 pl-4 pr-2 text-sm text-ink shadow-[var(--shadow-lift)] ring-1 ring-rule">
          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent/15 text-accent" aria-hidden>
            <Icon name="check" size={14} />
          </span>
          <p className="flex-1">{t.message}</p>
          {t.action &&
            (t.action.href ? (
              <Link href={t.action.href} onClick={() => dismissToast(t.id)} className="shrink-0 rounded-full px-3 py-2 text-sm font-semibold text-accent hover:bg-paper-2">
                {t.action.label}
              </Link>
            ) : (
              <button type="button" onClick={() => { t.action?.onClick?.(); dismissToast(t.id); }} className="shrink-0 rounded-full px-3 py-2 text-sm font-semibold text-accent hover:bg-paper-2">
                {t.action.label}
              </button>
            ))}
          <button type="button" onClick={() => dismissToast(t.id)} className="grid size-8 shrink-0 place-items-center rounded-full text-muted hover:bg-paper-2 hover:text-ink" aria-label="Dismiss">
            <Icon name="close" size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
