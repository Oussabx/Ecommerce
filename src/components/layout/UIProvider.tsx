"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

type Panel = "cart" | "search" | "menu" | null;
interface Toast {
  id: number;
  message: string;
  action?: { label: string; href?: string; onClick?: () => void };
}
interface UIContext {
  panel: Panel;
  open: (p: Exclude<Panel, null>) => void;
  close: () => void;
  toast: (message: string, action?: Toast["action"]) => void;
  toasts: Toast[];
  dismissToast: (id: number) => void;
}

const Ctx = createContext<UIContext | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [panel, setPanel] = useState<Panel>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);
  const pathname = usePathname();

  // Close overlays on navigation.
  useEffect(() => setPanel(null), [pathname]);

  // Lock page scroll while an overlay is open.
  useEffect(() => {
    if (!panel) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [panel]);

  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const toast = useCallback(
    (message: string, action?: Toast["action"]) => {
      const id = nextId.current++;
      setToasts((t) => [...t.slice(-2), { id, message, action }]);
      setTimeout(() => dismissToast(id), 4500);
    },
    [dismissToast],
  );

  const value = useMemo<UIContext>(
    () => ({ panel, open: setPanel, close: () => setPanel(null), toast, toasts, dismissToast }),
    [panel, toast, toasts, dismissToast],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useUI() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useUI must be used inside UIProvider");
  return ctx;
}
