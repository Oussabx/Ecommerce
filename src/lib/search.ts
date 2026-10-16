import type { ProductSummary } from "./catalog";

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/["'’()]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/**
 * Token-based product search across name, brand, category, model, tags and
 * key highlights. Every query token must match (prefix match) somewhere.
 */
export function searchProducts(items: ProductSummary[], query: string): ProductSummary[] {
  const tokens = norm(query).split(" ").filter(Boolean);
  if (!tokens.length) return [];
  const scored: { p: ProductSummary; score: number }[] = [];
  for (const p of items) {
    const name = norm(`${p.brand} ${p.name}`);
    const fields = [name, norm(p.categoryName), norm(p.model), norm(p.tags.join(" ")), norm(p.highlights.join(" "))];
    const words = fields.join(" ").split(" ");
    let score = 0;
    let ok = true;
    for (const t of tokens) {
      const inName = name.split(" ").some((w) => w.startsWith(t));
      const anywhere = inName || words.some((w) => w.startsWith(t)) || fields.some((f) => f.includes(t));
      if (!anywhere) {
        ok = false;
        break;
      }
      score += inName ? 3 : 1;
    }
    if (!ok) continue;
    if (name.startsWith(tokens.join(" "))) score += 4;
    if (norm(p.name).includes(tokens.join(" "))) score += 3;
    scored.push({ p, score });
  }
  return scored.sort((a, b) => b.score - a.score || a.p.price - b.p.price).map((s) => s.p);
}

export function suggestTerms(items: ProductSummary[], query: string) {
  const q = norm(query);
  if (!q) return { brands: [] as string[], categories: [] as { slug: string; name: string }[] };
  const brands = Array.from(new Set(items.map((i) => i.brand))).filter((b) => norm(b).startsWith(q) || q.startsWith(norm(b)));
  const cats = new Map<string, string>();
  for (const i of items) if (norm(i.categoryName).startsWith(q) || norm(i.categoryName).includes(q)) cats.set(i.category, i.categoryName);
  return { brands, categories: Array.from(cats, ([slug, name]) => ({ slug, name })) };
}
