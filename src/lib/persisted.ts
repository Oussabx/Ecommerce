"use client";
import { useSyncExternalStore } from "react";

/**
 * Tiny persisted store backed by localStorage. Server render and hydration use
 * `initial`; the stored value is applied right after hydration (no mismatch).
 * Changes sync across tabs via the `storage` event.
 */
export function createPersisted<T>(key: string, initial: T, validate: (v: unknown) => v is T) {
  let value = initial;
  let loaded = false;
  const listeners = new Set<() => void>();

  const load = () => {
    if (loaded || typeof window === "undefined") return;
    loaded = true;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (validate(parsed)) value = parsed;
      }
    } catch {
      /* storage unavailable (private mode) — keep in-memory value */
    }
    window.addEventListener("storage", (e) => {
      if (e.key !== key) return;
      try {
        const parsed = e.newValue ? JSON.parse(e.newValue) : initial;
        if (validate(parsed)) {
          value = parsed;
          listeners.forEach((l) => l());
        }
      } catch {}
    });
  };

  const get = () => {
    load();
    return value;
  };
  const set = (next: T | ((prev: T) => T)) => {
    load();
    value = typeof next === "function" ? (next as (p: T) => T)(value) : next;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {}
    listeners.forEach((l) => l());
  };
  const subscribe = (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  };
  const use = () => useSyncExternalStore(subscribe, get, () => initial);
  /** True once the client has read localStorage (for skeleton states). */
  const useHydrated = () => useSyncExternalStore(subscribe, () => true, () => false);

  return { get, set, use, useHydrated };
}

export const isStringArray = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === "string");
