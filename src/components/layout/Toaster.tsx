"use client";
import Link from "next/link";
import { useUI } from "./UIProvider";
import { Icon } from "@/components/ui/Icon";

export function Toaster() {
  const { toasts, dismissToast } = useUI();
  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-start gap-2 sm:left-6 sm:right-auto sm:w-[380px]" aria-live="polite" role="status">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto flex w-full animate-[rise_.4s_var(--ease-out-expo)_both] items-center gap-3 bg-ink py-3 pl-4 pr-2 text-sm text-paper shadow-xl">
          <span className="size-2 shrink-0 bg-lime" aria-hidden />
          <p className="flex-1">{t.message}</p>
          {t.action &&
            (t.action.href ? (
              <Link href={t.action.href} onClick={() => dismissToast(t.id)} className="label shrink-0 px-2 py-2 text-lime hover:underline">
                {t.action.label}
              </Link>
            ) : (
              <button type="button" onClick={() => { t.action?.onClick?.(); dismissToast(t.id); }} className="label shrink-0 px-2 py-2 text-lime hover:underline">
                {t.action.label}
              </button>
            ))}
          <button type="button" onClick={() => dismissToast(t.id)} className="grid size-8 shrink-0 place-items-center text-paper/60 hover:text-paper" aria-label="Dismiss">
            <Icon name="close" size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
