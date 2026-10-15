const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const usd2 = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

export const formatPrice = (n: number) => (Number.isInteger(n) ? usd.format(n) : usd2.format(n));
export const pad2 = (n: number) => String(n).padStart(2, "0");
export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
export const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");
export const discountLabel = (price: number, compareAt: number) =>
  compareAt > price ? `−${Math.round(((compareAt - price) / compareAt) * 100)}%` : null;
