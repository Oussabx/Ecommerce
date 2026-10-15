/** Lightweight client-side checks mirroring src/server/validation.ts (the server re-validates everything). */
export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
export const isPhone = (v: string) => /^\+?[0-9 ()-]{7,20}$/.test(v.trim()) && v.replace(/\D/g, "").length >= 7;
export const required = (v: string) => v.trim().length > 0;
