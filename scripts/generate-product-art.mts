/**
 * Generates studio-style SVG product renders for every product × colour in the
 * catalog into public/products/<slug>/<color>-<view>.svg.
 *
 * These renders are stand-ins until real product photography is supplied.
 * To use photography for a product, set `images` on it in src/data/products.ts;
 * the generated files are then ignored for that product.
 *
 *   npm run art
 */
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { products } from "../src/data/products.ts";
import { artViews } from "../src/data/art-views.ts";

type Color = { id: string; name: string; body: string; accent?: string; swatch: string };
type Ctx = { body: string; accent: string; variant?: string; p: string };
type Drawing = { defs: string; g: string };

// ─── colour helpers ──────────────────────────────────────────────────────────
const toRgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const toHex = (r: number[]) => "#" + r.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
const mix = (a: string, b: string, t: number) => {
  const x = toRgb(a);
  const y = toRgb(b);
  return toHex(x.map((v, i) => v + (y[i] - v) * t));
};
const L = (c: string, t: number) => mix(c, "#ffffff", t);
const D = (c: string, t: number) => mix(c, "#000000", t);
const lum = (c: string) => {
  const [r, g, b] = toRgb(c);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
};

// ─── reusable gradient builders ───────────────────────────────────────────────
const lin = (id: string, stops: [number, string, number?][], x2 = 1, y2 = 0, x1 = 0, y1 = 0) =>
  `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops
    .map(([o, c, op]) => `<stop offset="${o}" stop-color="${c}"${op !== undefined ? ` stop-opacity="${op}"` : ""}/>`)
    .join("")}</linearGradient>`;
const rad = (id: string, stops: [number, string, number?][], cx = 0.5, cy = 0.5, r = 0.5, fx?: number, fy?: number) =>
  `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}"${fx !== undefined ? ` fx="${fx}" fy="${fy}"` : ""}>${stops
    .map(([o, c, op]) => `<stop offset="${o}" stop-color="${c}"${op !== undefined ? ` stop-opacity="${op}"` : ""}/>`)
    .join("")}</radialGradient>`;

/** Metallic edge: bright rims, darker faces. */
const metal = (id: string, c: string) =>
  lin(id, [
    [0, L(c, 0.35)],
    [0.06, D(c, 0.08)],
    [0.5, L(c, 0.08)],
    [0.94, D(c, 0.12)],
    [1, L(c, 0.25)],
  ]);
/** Soft vertical body shading. */
const satin = (id: string, c: string, k = 1) =>
  lin(
    id,
    [
      [0, L(c, 0.14 * k)],
      [0.45, c],
      [1, D(c, 0.12 * k)],
    ],
    0.35,
    1,
  );

const shadow = (p: string, cx: number, cy: number, rx: number, ry: number, o = 0.28): Drawing => ({
  defs: rad(`${p}sh`, [
    [0, "#1b1a17", o],
    [0.55, "#1b1a17", o * 0.35],
    [1, "#1b1a17", 0],
  ]),
  g: `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${p}sh)"/>`,
});

/** Abstract screen wallpaper in the product accent colour. */
const wallpaper = (id: string, accent: string, dark = true) =>
  rad(id, dark
    ? [
        [0, L(accent, 0.25)],
        [0.35, accent],
        [0.75, D(accent, 0.6)],
        [1, "#08090a"],
      ]
    : [
        [0, L(accent, 0.6)],
        [0.5, L(accent, 0.2)],
        [1, accent],
      ], 0.3, 0.25, 0.95);

const glare = (x: number, y: number, w: number, h: number, o = 0.07) =>
  `<path d="M${x} ${y} L${x + w * 0.55} ${y} L${x + w * 0.15} ${y + h} L${x} ${y + h} Z" fill="#fff" opacity="${o}"/>`;

const lens = (p: string, cx: number, cy: number, r: number, ring: string) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${D(ring, 0.25)}"/>` +
  `<circle cx="${cx}" cy="${cy}" r="${r * 0.9}" fill="url(#${p}ring)"/>` +
  `<circle cx="${cx}" cy="${cy}" r="${r * 0.7}" fill="url(#${p}glass)"/>` +
  `<circle cx="${cx}" cy="${cy}" r="${r * 0.32}" fill="#0b1220"/>` +
  `<circle cx="${cx}" cy="${cy}" r="${r * 0.16}" fill="#23324d"/>` +
  `<ellipse cx="${cx - r * 0.25}" cy="${cy - r * 0.28}" rx="${r * 0.18}" ry="${r * 0.11}" fill="#fff" opacity=".55" transform="rotate(-35 ${cx - r * 0.25} ${cy - r * 0.28})"/>`;
const lensDefs = (p: string, ring: string) =>
  rad(`${p}ring`, [
    [0.6, L(ring, 0.15)],
    [0.85, D(ring, 0.35)],
    [1, L(ring, 0.4)],
  ]) +
  rad(`${p}glass`, [
    [0, "#3d4f72"],
    [0.45, "#141b2a"],
    [1, "#030406"],
  ], 0.4, 0.35, 0.6);

// ─── phone ────────────────────────────────────────────────────────────────────
function phone(ctx: Ctx, side: "back" | "front", x = 330, y = 110, w = 340, h = 720): Drawing {
  const { body, accent, variant = "apple-pro", p } = ctx;
  const apple = variant.startsWith("apple");
  const r = apple ? 62 : variant === "pixel-bar" ? 70 : variant === "samsung-ultra" ? 26 : 56;
  let defs = metal(`${p}frame`, body) + satin(`${p}back`, body) + lensDefs(p, body);
  let g = "";
  // buttons
  const btn = D(body, 0.18);
  g += `<rect x="${x - 5}" y="${y + h * 0.2}" width="8" height="46" rx="3" fill="${btn}"/>`;
  g += `<rect x="${x - 5}" y="${y + h * 0.28}" width="8" height="70" rx="3" fill="${btn}"/>`;
  g += `<rect x="${x + w - 3}" y="${y + h * 0.25}" width="8" height="96" rx="3" fill="${btn}"/>`;
  g += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#${p}frame)"/>`;
  if (side === "back") {
    g += `<rect x="${x + 7}" y="${y + 7}" width="${w - 14}" height="${h - 14}" rx="${r - 7}" fill="url(#${p}back)"/>`;
    defs += lin(`${p}plate`, [
      [0, L(body, 0.22)],
      [1, D(body, 0.08)],
    ], 1, 1);
    if (variant === "apple-pro" || variant === "xiaomi-square") {
      const s = variant === "xiaomi-square" ? w * 0.56 : w * 0.52;
      const px = variant === "xiaomi-square" ? x + (w - s) / 2 : x + 20;
      const py = y + 22;
      g += `<rect x="${px}" y="${py}" width="${s}" height="${s}" rx="${variant === "xiaomi-square" ? 34 : 44}" fill="url(#${p}plate)" stroke="${L(body, 0.3)}" stroke-width="2"/>`;
      const lr = s * 0.2;
      if (variant === "apple-pro") {
        g += lens(p, px + s * 0.29, py + s * 0.28, lr, body) + lens(p, px + s * 0.29, py + s * 0.72, lr, body) + lens(p, px + s * 0.72, py + s * 0.5, lr, body);
        g += `<circle cx="${px + s * 0.74}" cy="${py + s * 0.2}" r="${s * 0.06}" fill="#f2ead2"/><circle cx="${px + s * 0.74}" cy="${py + s * 0.8}" r="${s * 0.05}" fill="#16181c"/>`;
      } else {
        const q = s * 0.27;
        g += lens(p, px + q, py + q, lr, body) + lens(p, px + s - q, py + q, lr, body) + lens(p, px + q, py + s - q, lr, body);
        g += `<circle cx="${px + s - q}" cy="${py + s - q}" r="${s * 0.07}" fill="#f2ead2"/>`;
      }
    } else if (variant === "apple-dual") {
      const pw = w * 0.24;
      const ph = w * 0.46;
      g += `<rect x="${x + 22}" y="${y + 22}" width="${pw}" height="${ph}" rx="${pw / 2}" fill="url(#${p}plate)" stroke="${L(body, 0.3)}" stroke-width="2"/>`;
      g += lens(p, x + 22 + pw / 2, y + 22 + pw / 2, pw * 0.4, body) + lens(p, x + 22 + pw / 2, y + 22 + ph - pw / 2, pw * 0.4, body);
      g += `<circle cx="${x + 22 + pw + 22}" cy="${y + 22 + ph / 2}" r="9" fill="#f2ead2"/>`;
    } else if (variant === "pixel-bar") {
      const by = y + h * 0.13;
      defs += lin(`${p}bar`, [
        [0, L(body, 0.35)],
        [0.5, L(body, 0.12)],
        [1, D(body, 0.1)],
      ], 0, 1);
      g += `<rect x="${x + 18}" y="${by}" width="${w - 36}" height="104" rx="52" fill="url(#${p}bar)" stroke="${D(body, 0.1)}" stroke-width="2"/>`;
      g += `<rect x="${x + 44}" y="${by + 16}" width="${w * 0.58}" height="72" rx="36" fill="#121418"/>`;
      g += lens(p, x + 82, by + 52, 26, "#2a2c30") + lens(p, x + 148, by + 52, 26, "#2a2c30") + lens(p, x + 214, by + 52, 22, "#2a2c30");
      g += `<circle cx="${x + w - 64}" cy="${by + 52}" r="9" fill="#f2ead2"/>`;
    } else {
      // Samsung: individual lenses in a vertical column
      const n = variant === "samsung-ultra" ? 3 : 3;
      const lr = variant === "samsung-ultra" ? 30 : variant === "samsung-pill" ? 22 : 25;
      const gap = lr * 2.55;
      const cx = x + 64;
      if (variant === "samsung-pill") {
        g += `<rect x="${cx - lr - 10}" y="${y + 40}" width="${(lr + 10) * 2}" height="${gap * 2 + (lr + 10) * 2}" rx="${lr + 10}" fill="${D(body, 0.08)}" stroke="${L(body, 0.25)}" stroke-width="2"/>`;
      }
      for (let i = 0; i < n; i++) g += lens(p, cx, y + 50 + lr + i * gap, lr, body);
      if (variant === "samsung-ultra") {
        g += lens(p, cx + 76, y + 50 + lr + gap * 0.5, lr * 0.8, body);
        g += `<circle cx="${cx + 76}" cy="${y + 50 + lr + gap * 1.5}" r="9" fill="#f2ead2"/><circle cx="${cx + 76}" cy="${y + 50 + lr - 6}" r="7" fill="#16181c"/>`;
      } else {
        g += `<circle cx="${cx + 58}" cy="${y + 50 + lr}" r="8" fill="#f2ead2"/>`;
      }
    }
    // soft sheen across the back glass
    defs += lin(`${p}sheen`, [
      [0, "#fff", 0],
      [0.45, "#fff", lum(body) > 0.6 ? 0.18 : 0.08],
      [0.6, "#fff", 0],
    ], 1, 1);
    g += `<rect x="${x + 7}" y="${y + 7}" width="${w - 14}" height="${h - 14}" rx="${r - 7}" fill="url(#${p}sheen)"/>`;
  } else {
    defs += wallpaper(`${p}wall`, accent);
    g += `<rect x="${x + 8}" y="${y + 8}" width="${w - 16}" height="${h - 16}" rx="${r - 8}" fill="#060708"/>`;
    defs += `<clipPath id="${p}clip"><rect x="${x + 15}" y="${y + 15}" width="${w - 30}" height="${h - 30}" rx="${r - 14}"/></clipPath>`;
    g += `<rect x="${x + 15}" y="${y + 15}" width="${w - 30}" height="${h - 30}" rx="${r - 14}" fill="url(#${p}wall)"/>`;
    // abstract wallpaper forms
    g += `<g opacity=".55" clip-path="url(#${p}clip)"><circle cx="${x + w * 0.85}" cy="${y + h * 0.78}" r="${w * 0.55}" fill="${D(accent, 0.35)}"/><circle cx="${x + w * 0.1}" cy="${y + h * 0.95}" r="${w * 0.4}" fill="${D(accent, 0.6)}"/></g>`;
    if (apple) g += `<rect x="${x + w / 2 - 52}" y="${y + 30}" width="104" height="30" rx="15" fill="#000"/>`;
    else g += `<circle cx="${x + w / 2}" cy="${y + 40}" r="11" fill="#000"/>`;
    // clock + widgets as simple bars
    g += `<rect x="${x + w / 2 - 70}" y="${y + 120}" width="140" height="44" rx="10" fill="#fff" opacity=".9"/>`;
    g += `<rect x="${x + w / 2 - 44}" y="${y + 176}" width="88" height="10" rx="5" fill="#fff" opacity=".55"/>`;
    for (let i = 0; i < 4; i++) g += `<rect x="${x + 40 + i * ((w - 80 - 52) / 3)}" y="${y + h - 120}" width="52" height="52" rx="14" fill="#fff" opacity=".2"/>`;
    g += `<rect x="${x + w / 2 - 50}" y="${y + h - 40}" width="100" height="6" rx="3" fill="#fff" opacity=".7"/>`;
    g += glare(x + 15, y + 15, w - 30, h - 30, 0.06);
  }
  return { defs, g };
}

// ─── laptop ───────────────────────────────────────────────────────────────────
function laptopOpen(ctx: Ctx): Drawing {
  const { body, accent, variant = "mac", p } = ctx;
  const gaming = variant.startsWith("gaming");
  let defs = satin(`${p}base`, body) + wallpaper(`${p}wall`, accent);
  defs += lin(`${p}edge`, [
    [0, L(body, 0.4)],
    [1, D(body, 0.25)],
  ], 0, 1);
  let g = "";
  // lid / bezel
  g += `<rect x="168" y="196" width="664" height="430" rx="22" fill="${D(body, 0.35)}"/>`;
  g += `<rect x="174" y="202" width="652" height="420" rx="18" fill="#0b0c0d"/>`;
  g += `<rect x="190" y="218" width="620" height="390" rx="6" fill="url(#${p}wall)"/>`;
  defs += `<clipPath id="${p}clip"><rect x="190" y="218" width="620" height="390" rx="6"/></clipPath>`;
  g += `<g opacity=".6" clip-path="url(#${p}clip)"><circle cx="760" cy="600" r="260" fill="${D(accent, 0.4)}"/><circle cx="280" cy="640" r="200" fill="${D(accent, 0.65)}"/></g>`;
  g += `<path d="M190 520 C 360 420 520 470 810 330 L810 608 L190 608 Z" fill="${L(accent, 0.2)}" opacity=".25" clip-path="url(#${p}clip)"/>`;
  if (variant.startsWith("mac")) g += `<rect x="470" y="202" width="60" height="18" rx="7" fill="#0b0c0d"/>`;
  g += `<circle cx="500" cy="210" r="3.5" fill="#1d2530"/>`;
  // menu bar + dock hints
  g += `<rect x="190" y="218" width="620" height="16" fill="#000" opacity=".25"/>`;
  g += `<rect x="370" y="574" width="260" height="24" rx="8" fill="#fff" opacity=".22"/>`;
  g += glare(190, 218, 620, 390, 0.05);
  // hinge + base
  const baseH = gaming ? 34 : 24;
  g += `<rect x="190" y="624" width="620" height="10" rx="3" fill="${D(body, 0.45)}"/>`;
  g += `<path d="M118 632 L882 632 L906 ${632 + baseH} Q906 ${640 + baseH} 896 ${640 + baseH} L104 ${640 + baseH} Q94 ${640 + baseH} 94 ${632 + baseH} Z" fill="url(#${p}base)"/>`;
  g += `<path d="M118 632 L882 632 L886 637 L114 637 Z" fill="${L(body, 0.35)}"/>`;
  g += `<rect x="94" y="${636 + baseH}" width="812" height="4" rx="2" fill="${D(body, 0.3)}"/>`;
  if (!gaming) g += `<path d="M430 632 L570 632 L564 642 Q562 645 558 645 L442 645 Q438 645 436 642 Z" fill="${D(body, 0.12)}"/>`;
  else {
    for (let i = 0; i < 9; i++) g += `<rect x="${380 + i * 26}" y="${648}" width="14" height="4" rx="2" fill="${D(body, 0.35)}"/>`;
    if (variant === "gaming") g += `<rect x="120" y="${640 + baseH - 6}" width="760" height="2" fill="${accent}" opacity=".7"/>`;
  }
  return { defs, g };
}
function laptopClosed(ctx: Ctx): Drawing {
  const { body, p } = ctx;
  const defs =
    lin(`${p}lid`, [
      [0, L(body, 0.2)],
      [0.5, body],
      [1, D(body, 0.1)],
    ], 1, 1) +
    lin(`${p}side`, [
      [0, L(body, 0.1)],
      [1, D(body, 0.3)],
    ], 0, 1);
  let g = "";
  g += `<path d="M250 330 Q252 318 266 318 L734 318 Q748 318 750 330 L852 640 Q856 656 838 656 L162 656 Q144 656 148 640 Z" fill="url(#${p}lid)"/>`;
  g += `<path d="M148 640 Q144 656 162 656 L838 656 Q856 656 852 640 L852 664 Q852 680 836 680 L164 680 Q148 680 148 664 Z" fill="url(#${p}side)"/>`;
  g += `<path d="M266 318 L734 318 L740 334 L260 334 Z" fill="#fff" opacity=".18"/>`;
  g += `<rect x="470" y="474" width="60" height="60" rx="18" fill="${D(body, 0.08)}" opacity=".7"/>`;
  g += `<path d="M300 330 L520 330 L330 650 L170 650 Z" fill="#fff" opacity=".05"/>`;
  return { defs, g };
}

// ─── headphones ───────────────────────────────────────────────────────────────
function headphonesFront(ctx: Ctx): Drawing {
  const { body, accent, variant, p } = ctx;
  const bose = variant === "bose";
  let defs = satin(`${p}cup`, body, 1.4) + lin(`${p}band`, [
    [0, L(body, 0.2)],
    [1, D(body, 0.1)],
  ], 0, 1);
  defs += lin(`${p}cush`, [
    [0, D(accent, 0.2)],
    [1, D(accent, 0.45)],
  ]);
  let g = "";
  g += `<path d="M262 560 C262 270 360 160 500 160 C640 160 738 270 738 560" fill="none" stroke="url(#${p}band)" stroke-width="${bose ? 34 : 44}" stroke-linecap="round"/>`;
  g += `<path d="M300 520 C300 300 380 214 500 214 C620 214 700 300 700 520" fill="none" stroke="${D(body, 0.3)}" stroke-width="${bose ? 18 : 26}" stroke-linecap="round" opacity=".85"/>`;
  g += `<path d="M300 520 C300 300 380 214 500 214" fill="none" stroke="#fff" stroke-width="3" opacity=".12"/>`;
  // sliders
  g += `<rect x="248" y="440" width="28" height="110" rx="12" fill="${bose ? "#b9b9bb" : L(body, 0.12)}"/>`;
  g += `<rect x="724" y="440" width="28" height="110" rx="12" fill="${bose ? "#b9b9bb" : L(body, 0.12)}"/>`;
  // cups (seen front-on, thickness visible)
  for (const [cx, dir] of [
    [262, 1],
    [738, -1],
  ] as const) {
    g += `<rect x="${cx - 78}" y="500" width="156" height="290" rx="${bose ? 66 : 78}" fill="url(#${p}cup)"/>`;
    g += `<rect x="${cx - 78 + (dir === 1 ? 104 : 0)}" y="512" width="52" height="266" rx="26" fill="url(#${p}cush)"/>`;
    g += `<rect x="${cx - 60}" y="520" width="20" height="240" rx="10" fill="#fff" opacity=".08"/>`;
  }
  return { defs, g };
}
function headphonesSide(ctx: Ctx): Drawing {
  const { body, accent, p } = ctx;
  let defs = rad(`${p}shell`, [
    [0, L(body, 0.18)],
    [0.7, body],
    [1, D(body, 0.25)],
  ], 0.4, 0.35, 0.7);
  defs += lin(`${p}band`, [
    [0, L(body, 0.2)],
    [1, D(body, 0.15)],
  ], 0, 1);
  let g = "";
  g += `<path d="M330 420 C330 230 400 140 500 140 C600 140 670 230 670 420" fill="none" stroke="url(#${p}band)" stroke-width="40" stroke-linecap="round"/>`;
  g += `<rect x="470" y="300" width="60" height="120" rx="20" fill="${L(body, 0.1)}"/>`;
  g += `<ellipse cx="500" cy="590" rx="205" ry="250" fill="${D(accent, 0.35)}"/>`;
  g += `<ellipse cx="500" cy="585" rx="185" ry="232" fill="url(#${p}shell)"/>`;
  g += `<ellipse cx="500" cy="585" rx="150" ry="196" fill="none" stroke="${D(body, 0.15)}" stroke-width="2"/>`;
  g += `<ellipse cx="440" cy="480" rx="60" ry="110" fill="#fff" opacity=".06" transform="rotate(-20 440 480)"/>`;
  g += `<circle cx="580" cy="760" r="6" fill="${D(body, 0.4)}"/>`;
  return { defs, g };
}

// ─── earbuds ─────────────────────────────────────────────────────────────────
function bud(cx: number, cy: number, s: number, rot: number, body: string, p: string, samsung: boolean) {
  const stem = samsung
    ? `<path d="M${-14 * s} ${20 * s} L${-10 * s} ${170 * s} Q0 ${182 * s} ${10 * s} ${170 * s} L${14 * s} ${20 * s} Z" fill="url(#${p}bud)"/><rect x="${-3 * s}" y="${40 * s}" width="${6 * s}" height="${110 * s}" rx="${3 * s}" fill="#fff" opacity=".7"/>`
    : `<rect x="${-16 * s}" y="${10 * s}" width="${32 * s}" height="${170 * s}" rx="${16 * s}" fill="url(#${p}bud)"/><rect x="${-10 * s}" y="${160 * s}" width="${20 * s}" height="${12 * s}" rx="${4 * s}" fill="#9a9a9a"/>`;
  return `<g transform="translate(${cx} ${cy}) rotate(${rot})">${stem}<ellipse cx="${-10 * s}" cy="${-20 * s}" rx="${62 * s}" ry="${54 * s}" fill="url(#${p}bud)"/><ellipse cx="${-48 * s}" cy="${-34 * s}" rx="${28 * s}" ry="${24 * s}" fill="${D(body, 0.25)}"/><ellipse cx="${-48 * s}" cy="${-34 * s}" rx="${18 * s}" ry="${15 * s}" fill="#3a3a3a" opacity=".55"/><ellipse cx="${10 * s}" cy="${-40 * s}" rx="${16 * s}" ry="${8 * s}" fill="#fff" opacity=".6"/></g>`;
}
function earbudsCase(ctx: Ctx): Drawing {
  const { body, variant, p } = ctx;
  const samsung = variant === "samsung";
  const defs =
    satin(`${p}case`, body, 1.6) +
    lin(`${p}bud`, [
      [0, L(body, 0.4)],
      [1, D(body, 0.12)],
    ], 1, 1);
  let g = "";
  const w = samsung ? 330 : 360;
  const h = samsung ? 260 : 300;
  const x = 500 - w / 2;
  const y = 520 - h / 2;
  g += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${samsung ? 70 : 118}" fill="url(#${p}case)"/>`;
  g += `<path d="M${x + 6} ${y + h * 0.36} L${x + w - 6} ${y + h * 0.36}" stroke="${D(body, 0.2)}" stroke-width="2.5"/>`;
  g += `<rect x="${x + 30}" y="${y + 12}" width="${w - 60}" height="${h * 0.18}" rx="${h * 0.09}" fill="#fff" opacity=".35"/>`;
  g += `<circle cx="500" cy="${y + h * 0.55}" r="5" fill="#7ad48b"/>`;
  g += bud(780, 300, 0.75, 18, body, p, samsung);
  return { defs, g };
}
function earbudsPair(ctx: Ctx): Drawing {
  const { body, variant, p } = ctx;
  const defs = lin(`${p}bud`, [
    [0, L(body, 0.4)],
    [1, D(body, 0.12)],
  ], 1, 1);
  const samsung = variant === "samsung";
  return { defs, g: bud(410, 420, 1.6, -14, body, p, samsung) + bud(640, 470, 1.6, 12, body, p, samsung) };
}

// ─── controller ──────────────────────────────────────────────────────────────
const PAD =
  "M300 330 C380 300 620 300 700 330 L770 352 C850 372 890 450 912 560 C934 670 930 760 884 792 C840 822 784 800 760 752 L690 636 C670 604 640 594 610 594 L390 594 C360 594 330 604 310 636 L240 752 C216 800 160 822 116 792 C70 760 66 670 88 560 C110 450 150 372 230 352 Z";
function controller(ctx: Ctx): Drawing {
  const { body, accent, variant, p } = ctx;
  const xbox = variant === "xbox";
  let defs = rad(`${p}pad`, [
    [0, L(body, 0.18)],
    [0.7, body],
    [1, D(body, 0.2)],
  ], 0.45, 0.3, 0.75);
  defs += rad(`${p}stick`, [
    [0, "#3b3c3f"],
    [0.8, "#151617"],
    [1, "#0b0b0c"],
  ], 0.4, 0.35, 0.6);
  let g = `<path d="${PAD}" fill="url(#${p}pad)"/>`;
  g += `<path d="M300 330 C380 300 620 300 700 330" fill="none" stroke="#fff" stroke-width="4" opacity=".35"/>`;
  const btn = lum(body) > 0.6 ? "#d3d3d1" : L(body, 0.15);
  const stick = (cx: number, cy: number) =>
    `<circle cx="${cx}" cy="${cy}" r="58" fill="${D(body, 0.3)}"/><circle cx="${cx}" cy="${cy}" r="46" fill="url(#${p}stick)"/><circle cx="${cx}" cy="${cy}" r="30" fill="none" stroke="#2c2d30" stroke-width="3"/>`;
  const dpad = (cx: number, cy: number) =>
    `<path d="M${cx - 16} ${cy - 56} h32 v40 h40 v32 h-40 v40 h-32 v-40 h-40 v-32 h40 Z" fill="${btn}" stroke="${D(body, 0.25)}" stroke-width="2"/>`;
  const face = (cx: number, cy: number) =>
    [
      [0, -42],
      [42, 0],
      [0, 42],
      [-42, 0],
    ]
      .map(([dx, dy]) => `<circle cx="${cx + dx}" cy="${cy + dy}" r="20" fill="${btn}" stroke="${D(body, 0.25)}" stroke-width="2"/>`)
      .join("");
  if (xbox) {
    g += stick(285, 450) + dpad(400, 560) + face(715, 450) + stick(600, 560);
    g += `<circle cx="500" cy="395" r="30" fill="${D(body, 0.2)}" stroke="${L(body, 0.2)}" stroke-width="3"/>`;
    g += `<rect x="440" y="455" width="22" height="14" rx="7" fill="${D(body, 0.3)}"/><rect x="538" y="455" width="22" height="14" rx="7" fill="${D(body, 0.3)}"/>`;
  } else {
    // two-tone DualSense: dark centre plate behind sticks
    g += `<path d="M330 470 C380 450 620 450 670 470 L690 600 L310 600 Z" fill="${accent}"/>`;
    g += `<rect x="392" y="338" width="216" height="128" rx="18" fill="${L(body, 0.06)}" stroke="${D(body, 0.12)}" stroke-width="2"/>`;
    g += `<path d="M380 340 C400 470 300 520 260 560" fill="none" stroke="#5aa6ff" stroke-width="4" opacity=".5"/><path d="M620 340 C600 470 700 520 740 560" fill="none" stroke="#5aa6ff" stroke-width="4" opacity=".5"/>`;
    g += dpad(270, 450) + face(730, 450) + stick(395, 560) + stick(605, 560);
    g += `<circle cx="500" cy="530" r="16" fill="#1a1b1d"/>`;
  }
  return { defs, g };
}

// ─── console ─────────────────────────────────────────────────────────────────
function consoleFront(ctx: Ctx): Drawing {
  const { body, accent, variant, p } = ctx;
  if (variant === "xbox") {
    const defs = lin(`${p}box`, [
      [0, L(body, 0.15)],
      [0.5, body],
      [1, D(body, 0.2)],
    ]);
    let g = `<rect x="360" y="150" width="280" height="700" rx="18" fill="url(#${p}box)"/>`;
    g += `<rect x="360" y="150" width="280" height="10" rx="5" fill="#fff" opacity=".12"/>`;
    g += `<rect x="372" y="170" width="256" height="70" rx="12" fill="#0d0e0f"/>`;
    for (let i = 0; i < 9; i++) for (let j = 0; j < 2; j++) g += `<circle cx="${392 + i * 27}" cy="${190 + j * 30}" r="8" fill="#2a2c2e"/>`;
    g += `<rect x="388" y="620" width="10" height="160" rx="5" fill="#0a0a0b"/><circle cx="600" cy="300" r="12" fill="#2f3133" stroke="#4a4c4f" stroke-width="2"/>`;
    g += `<rect x="370" y="160" width="40" height="680" fill="#fff" opacity=".04"/>`;
    return { defs, g };
  }
  const defs =
    lin(`${p}panel`, [
      [0, L(body, 0.1)],
      [0.5, body],
      [1, D(body, 0.1)],
    ]) +
    lin(`${p}core`, [
      [0, "#2b2c2f"],
      [0.5, "#121315"],
      [1, "#1d1e21"],
    ]);
  let g = `<rect x="438" y="150" width="124" height="712" rx="24" fill="url(#${p}core)"/>`;
  g += `<path d="M444 158 C380 150 340 190 338 240 L326 818 C326 846 344 864 372 864 L444 864 Z" fill="url(#${p}panel)"/>`;
  g += `<path d="M556 158 C620 150 660 190 662 240 L674 818 C674 846 656 864 628 864 L556 864 Z" fill="url(#${p}panel)"/>`;
  g += `<path d="M444 158 C380 150 340 190 338 240 L336 300 C360 220 400 196 444 196 Z" fill="#fff" opacity=".35"/>`;
  g += `<rect x="452" y="760" width="96" height="6" rx="3" fill="${accent}" opacity=".6"/><circle cx="500" cy="800" r="6" fill="#5c5f66"/>`;
  return { defs, g };
}

// ─── handheld ────────────────────────────────────────────────────────────────
function handheld(ctx: Ctx): Drawing {
  const { body, accent, p } = ctx;
  let defs = wallpaper(`${p}wall`, accent) + satin(`${p}jc`, body, 1.6) + satin(`${p}unit`, "#1b1c1e");
  let g = "";
  g += `<rect x="240" y="350" width="520" height="310" rx="18" fill="url(#${p}unit)"/>`;
  g += `<rect x="258" y="366" width="484" height="278" rx="8" fill="#050506"/>`;
  g += `<rect x="268" y="376" width="464" height="258" rx="4" fill="url(#${p}wall)"/>`;
  defs += `<clipPath id="${p}clip"><rect x="268" y="376" width="464" height="258" rx="4"/></clipPath>`;
  g += `<g opacity=".6" clip-path="url(#${p}clip)"><circle cx="680" cy="600" r="160" fill="${D(accent, 0.4)}"/><circle cx="320" cy="390" r="90" fill="${L(accent, 0.3)}"/></g>`;
  g += glare(268, 376, 464, 258, 0.06);
  // joy-cons
  g += `<path d="M240 350 L190 350 C140 350 120 390 120 440 L120 570 C120 620 140 660 190 660 L240 660 Z" fill="url(#${p}jc)"/>`;
  g += `<path d="M760 350 L810 350 C860 350 880 390 880 440 L880 570 C880 620 860 660 810 660 L760 660 Z" fill="url(#${p}jc)"/>`;
  g += `<rect x="234" y="356" width="6" height="298" fill="${accent}"/><rect x="760" y="356" width="6" height="298" fill="${accent}"/>`;
  const st = (cx: number, cy: number) => `<circle cx="${cx}" cy="${cy}" r="30" fill="#0e0f10"/><circle cx="${cx}" cy="${cy}" r="22" fill="#2a2b2e"/>`;
  g += st(180, 430) + st(820, 560);
  for (const [dx, dy] of [
    [0, -26],
    [26, 0],
    [0, 26],
    [-26, 0],
  ]) {
    g += `<circle cx="${180 + dx}" cy="${560 + dy}" r="11" fill="#3a3b3f"/><circle cx="${820 + dx}" cy="${430 + dy}" r="11" fill="#3a3b3f"/>`;
  }
  defs += "";
  return { defs, g };
}

// ─── watch ───────────────────────────────────────────────────────────────────
function watch(ctx: Ctx): Drawing {
  const { body, accent, variant, p } = ctx;
  const round = variant === "round";
  const band = D(body, lum(body) > 0.6 ? 0.08 : -0.05);
  let defs = metal(`${p}case`, body) + satin(`${p}band`, band, 1.2);
  let g = "";
  g += `<path d="M410 120 L590 120 L600 360 L400 360 Z" fill="url(#${p}band)"/>`;
  g += `<path d="M400 640 L600 640 L590 880 L410 880 Z" fill="url(#${p}band)"/>`;
  for (let i = 0; i < 5; i++) g += `<rect x="${470}" y="${700 + i * 32}" width="60" height="8" rx="4" fill="${D(band, 0.2)}" opacity=".7"/>`;
  if (round) {
    g += `<circle cx="500" cy="500" r="182" fill="url(#${p}case)"/>`;
    g += `<circle cx="500" cy="500" r="160" fill="#060607"/>`;
    g += `<circle cx="500" cy="500" r="150" fill="none" stroke="${accent}" stroke-width="16" stroke-dasharray="560 400" transform="rotate(-90 500 500)" stroke-linecap="round"/>`;
    g += `<circle cx="500" cy="500" r="120" fill="none" stroke="${L(accent, 0.4)}" stroke-width="12" stroke-dasharray="380 400" transform="rotate(-90 500 500)" stroke-linecap="round" opacity=".7"/>`;
    g += `<rect x="440" y="470" width="120" height="40" rx="8" fill="#fff" opacity=".9"/>`;
    g += `<rect x="676" y="440" width="20" height="44" rx="6" fill="${L(body, 0.2)}"/><rect x="676" y="520" width="20" height="44" rx="6" fill="${L(body, 0.2)}"/>`;
  } else {
    g += `<rect x="360" y="318" width="280" height="340" rx="86" fill="url(#${p}case)"/>`;
    g += `<rect x="372" y="330" width="256" height="316" rx="74" fill="#060607"/>`;
    const ring = (r: number, c: string, len: number) =>
      `<circle cx="500" cy="488" r="${r}" fill="none" stroke="${c}" stroke-width="18" stroke-dasharray="${len} 999" transform="rotate(-90 500 488)" stroke-linecap="round"/>`;
    g += ring(96, accent, 470) + ring(72, L(accent, 0.35), 300) + ring(48, "#ffffff", 220);
    g += `<rect x="636" y="420" width="22" height="64" rx="10" fill="${L(body, 0.15)}"/><rect x="636" y="510" width="14" height="70" rx="6" fill="${D(body, 0.2)}"/>`;
  }
  g += glare(380, 330, 240, 300, 0.05);
  return { defs, g };
}

// ─── tablet ──────────────────────────────────────────────────────────────────
function tablet(ctx: Ctx, side: "front" | "back"): Drawing {
  const { body, accent, p } = ctx;
  let defs = metal(`${p}frame`, body) + satin(`${p}back`, body) + wallpaper(`${p}wall`, accent) + lensDefs(p, body);
  let g = `<rect x="120" y="250" width="760" height="520" rx="40" fill="url(#${p}frame)"/>`;
  if (side === "front") {
    g += `<rect x="128" y="258" width="744" height="504" rx="34" fill="#060708"/>`;
    g += `<rect x="150" y="280" width="700" height="460" rx="16" fill="url(#${p}wall)"/>`;
    defs += `<clipPath id="${p}clip"><rect x="150" y="280" width="700" height="460" rx="16"/></clipPath>`;
    g += `<g opacity=".55" clip-path="url(#${p}clip)"><circle cx="760" cy="700" r="300" fill="${D(accent, 0.4)}"/><circle cx="240" cy="740" r="180" fill="${D(accent, 0.65)}"/></g>`;
    for (let i = 0; i < 6; i++) g += `<rect x="${210 + i * 100}" y="680" width="60" height="40" rx="12" fill="#fff" opacity=".22"/>`;
    g += `<circle cx="500" cy="268" r="4" fill="#1b2230"/>`;
    g += glare(150, 280, 700, 460, 0.05);
  } else {
    g += `<rect x="128" y="258" width="744" height="504" rx="34" fill="url(#${p}back)"/>`;
    g += `<rect x="160" y="290" width="88" height="88" rx="28" fill="${D(body, 0.06)}" stroke="${L(body, 0.3)}" stroke-width="2"/>` + lens(p, 204, 334, 28, body);
    g += `<rect x="470" y="474" width="60" height="60" rx="20" fill="${D(body, 0.05)}" opacity=".7"/>`;
  }
  return { defs, g };
}

// ─── speaker ─────────────────────────────────────────────────────────────────
function speaker(ctx: Ctx): Drawing {
  const { body, accent, p } = ctx;
  const defs =
    `<pattern id="${p}mesh" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="${body}"/><circle cx="6" cy="6" r="2.2" fill="${D(body, 0.25)}"/></pattern>` +
    lin(`${p}shade`, [
      [0, "#fff", 0.25],
      [0.35, "#fff", 0],
      [0.75, "#000", 0.1],
      [1, "#000", 0.4],
    ], 0, 1) +
    rad(`${p}end`, [
      [0, D(body, 0.1)],
      [0.7, D(body, 0.4)],
      [1, D(body, 0.6)],
    ]);
  let g = `<rect x="150" y="380" width="700" height="250" rx="125" fill="url(#${p}mesh)"/>`;
  g += `<rect x="150" y="380" width="700" height="250" rx="125" fill="url(#${p}shade)"/>`;
  g += `<ellipse cx="200" cy="505" rx="48" ry="122" fill="url(#${p}end)"/><ellipse cx="800" cy="505" rx="48" ry="122" fill="url(#${p}end)"/>`;
  g += `<ellipse cx="200" cy="505" rx="28" ry="80" fill="${D(body, 0.5)}" stroke="${L(body, 0.15)}" stroke-width="3"/><ellipse cx="800" cy="505" rx="28" ry="80" fill="${D(body, 0.5)}" stroke="${L(body, 0.15)}" stroke-width="3"/>`;
  g += `<rect x="410" y="470" width="180" height="56" rx="10" fill="${accent}"/>`;
  g += `<rect x="200" y="612" width="600" height="18" rx="9" fill="${D(body, 0.45)}"/>`;
  for (let i = 0; i < 4; i++) g += `<circle cx="${400 + i * 66}" cy="402" r="9" fill="${D(body, 0.35)}"/>`;
  return { defs, g };
}

// ─── charger ─────────────────────────────────────────────────────────────────
function chargerAngle(ctx: Ctx): Drawing {
  const { body, variant, p } = ctx;
  const cube = variant === "cube";
  const s = cube ? 230 : 260;
  const hgt = cube ? 230 : 300;
  const x = 500 - s / 2 - 40;
  const y = 360;
  const dx = 90;
  const dy = -60;
  const defs =
    lin(`${p}f`, [
      [0, L(body, 0.05)],
      [1, D(body, 0.08)],
    ], 0, 1) +
    lin(`${p}s`, [
      [0, D(body, 0.12)],
      [1, D(body, 0.25)],
    ], 0, 1);
  let g = "";
  // prongs on top
  g += `<rect x="${x + s * 0.32 + dx * 0.5}" y="${y + dy * 0.5 - 70}" width="16" height="80" rx="8" fill="#b7b9bc"/>`;
  g += `<rect x="${x + s * 0.68 + dx * 0.5}" y="${y + dy * 0.5 - 70}" width="16" height="80" rx="8" fill="#b7b9bc"/>`;
  g += `<path d="M${x} ${y} L${x + dx} ${y + dy} L${x + s + dx} ${y + dy} L${x + s} ${y} Z" fill="${L(body, 0.18)}" stroke="${L(body, 0.18)}" stroke-width="16" stroke-linejoin="round"/>`;
  g += `<path d="M${x + s} ${y} L${x + s + dx} ${y + dy} L${x + s + dx} ${y + dy + hgt} L${x + s} ${y + hgt} Z" fill="url(#${p}s)" stroke="${D(body, 0.2)}" stroke-width="16" stroke-linejoin="round"/>`;
  g += `<rect x="${x}" y="${y}" width="${s}" height="${hgt}" fill="url(#${p}f)" stroke="${body}" stroke-width="16" stroke-linejoin="round"/>`;
  const port = (cy: number, wide = false) =>
    `<rect x="${x + s / 2 - (wide ? 34 : 28)}" y="${cy}" width="${wide ? 68 : 56}" height="${wide ? 18 : 20}" rx="${wide ? 3 : 10}" fill="#121315"/>`;
  if (cube) g += port(y + hgt * 0.45);
  else g += port(y + hgt * 0.22) + port(y + hgt * 0.42) + port(y + hgt * 0.65, true);
  return { defs, g };
}
function chargerFront(ctx: Ctx): Drawing {
  const { body, variant, p } = ctx;
  const cube = variant === "cube";
  const defs = satin(`${p}f`, body, 1.4);
  const w = cube ? 260 : 280;
  const h = cube ? 260 : 340;
  let g = `<rect x="${500 - w / 2}" y="${520 - h / 2}" width="${w}" height="${h}" rx="${cube ? 46 : 38}" fill="url(#${p}f)"/>`;
  const port = (cy: number, wide = false) =>
    `<rect x="${500 - (wide ? 36 : 30)}" y="${cy}" width="${wide ? 72 : 60}" height="${wide ? 20 : 22}" rx="${wide ? 3 : 11}" fill="#121315"/>`;
  if (cube) g += port(510);
  else g += port(420) + port(490) + port(570, true);
  g += `<rect x="${500 - w / 2 + 16}" y="${520 - h / 2 + 12}" width="${w - 32}" height="20" rx="10" fill="#fff" opacity=".18"/>`;
  return { defs, g };
}

// ─── power bank ──────────────────────────────────────────────────────────────
function powerbank(ctx: Ctx): Drawing {
  const { body, accent, p } = ctx;
  const defs = satin(`${p}pb`, body, 1.4);
  let g = `<rect x="340" y="230" width="320" height="520" rx="58" fill="url(#${p}pb)"/>`;
  g += `<circle cx="500" cy="440" r="120" fill="none" stroke="${lum(body) > 0.5 ? D(body, 0.1) : L(body, 0.1)}" stroke-width="10"/>`;
  g += `<rect x="410" y="640" width="180" height="60" rx="10" fill="#0c0d0e"/>`;
  g += `<rect x="424" y="656" width="90" height="28" rx="4" fill="${accent}"/><rect x="524" y="656" width="52" height="28" rx="4" fill="${accent}" opacity=".35"/>`;
  g += `<rect x="352" y="242" width="40" height="490" rx="20" fill="#fff" opacity=".07"/>`;
  return { defs, g };
}

// ─── cable ───────────────────────────────────────────────────────────────────
function cable(ctx: Ctx): Drawing {
  const { body, accent, p } = ctx;
  const defs = lin(`${p}plug`, [
    [0, L(body, 0.25)],
    [1, D(body, 0.2)],
  ], 0, 1);
  let g = "";
  const loops = [
    [500, 520, 230, 150, -8],
    [500, 520, 210, 138, 6],
    [500, 520, 190, 126, -2],
  ];
  for (const [cx, cy, rx, ry, rot] of loops) {
    g += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="${D(body, 0.25)}" stroke-width="22" transform="rotate(${rot} ${cx} ${cy})"/>`;
    g += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="${body}" stroke-width="16" transform="rotate(${rot} ${cx} ${cy})"/>`;
    g += `<ellipse cx="${cx}" cy="${cy - 3}" rx="${rx}" ry="${ry}" fill="none" stroke="#fff" stroke-width="3" opacity=".22" stroke-dasharray="6 10" transform="rotate(${rot} ${cx} ${cy})"/>`;
  }
  const plug = (x: number, y: number, rot: number) =>
    `<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M0 -12 C 40 -12 60 0 70 0" stroke="${body}" stroke-width="16" fill="none"/><rect x="60" y="-26" width="120" height="52" rx="14" fill="url(#${p}plug)"/><rect x="170" y="-15" width="58" height="30" rx="12" fill="#c9cbce"/><rect x="180" y="-6" width="38" height="12" rx="6" fill="#4b4d51"/><rect x="74" y="-6" width="40" height="4" rx="2" fill="${accent}" opacity=".7"/></g>`;
  g += plug(640, 360, -28) + plug(330, 690, 160);
  return { defs, g };
}

// ─── puck (MagSafe charger / AirTag) ─────────────────────────────────────────
function puck(ctx: Ctx): Drawing {
  const { body, accent, variant, p } = ctx;
  const defs =
    rad(`${p}disc`, [
      [0, L(body, 0.3)],
      [0.8, body],
      [1, D(body, 0.18)],
    ], 0.4, 0.35, 0.7) +
    rad(`${p}steel`, [
      [0, "#f4f5f6"],
      [0.6, "#b9bcc1"],
      [1, "#8c9096"],
    ], 0.35, 0.3, 0.8);
  let g = "";
  if (variant === "tag") {
    const pos = [
      [380, 400],
      [620, 400],
      [380, 640],
      [620, 640],
    ];
    pos.forEach(([cx, cy], i) => {
      if (i % 2) g += `<circle cx="${cx}" cy="${cy}" r="108" fill="url(#${p}steel)"/><circle cx="${cx}" cy="${cy}" r="30" fill="none" stroke="#a0a4aa" stroke-width="4"/>`;
      else g += `<circle cx="${cx}" cy="${cy}" r="108" fill="url(#${p}disc)"/><circle cx="${cx}" cy="${cy}" r="96" fill="none" stroke="${D(body, 0.06)}" stroke-width="2"/>`;
    });
    return { defs, g };
  }
  g += `<path d="M500 690 C 500 800 640 830 760 800 C 860 776 900 720 920 700" fill="none" stroke="${D(body, 0.12)}" stroke-width="22" stroke-linecap="round"/>`;
  g += `<path d="M500 690 C 500 800 640 830 760 800 C 860 776 900 720 920 700" fill="none" stroke="${body}" stroke-width="16" stroke-linecap="round"/>`;
  g += `<circle cx="500" cy="500" r="200" fill="url(#${p}steel)"/>`;
  g += `<circle cx="500" cy="500" r="176" fill="url(#${p}disc)"/>`;
  g += `<circle cx="500" cy="500" r="120" fill="none" stroke="${accent}" stroke-width="6" opacity=".7"/>`;
  g += `<circle cx="500" cy="500" r="12" fill="${D(body, 0.1)}"/>`;
  return { defs, g };
}

// ─── mouse & keyboard ────────────────────────────────────────────────────────
function mouse(ctx: Ctx): Drawing {
  const { body, accent, p } = ctx;
  const defs = rad(`${p}m`, [
    [0, L(body, 0.22)],
    [0.7, body],
    [1, D(body, 0.22)],
  ], 0.55, 0.35, 0.75);
  let g = `<path d="M430 190 C540 160 660 210 676 320 L700 610 C712 770 620 850 510 850 C400 850 320 770 330 620 L338 330 C344 260 372 210 430 190 Z" fill="url(#${p}m)"/>`;
  g += `<path d="M330 450 C280 460 262 560 300 620 C320 650 340 640 340 620 Z" fill="${D(body, 0.15)}"/>`;
  g += `<path d="M500 180 L506 420" stroke="${D(body, 0.3)}" stroke-width="3"/>`;
  g += `<rect x="482" y="230" width="36" height="96" rx="18" fill="#7b7e83"/><g opacity=".7">${Array.from({ length: 8 }, (_, i) => `<rect x="486" y="${238 + i * 11}" width="28" height="4" rx="2" fill="#4a4c50"/>`).join("")}</g>`;
  g += `<rect x="352" y="470" width="26" height="54" rx="10" fill="${D(body, 0.3)}"/><rect x="352" y="534" width="26" height="54" rx="10" fill="${D(body, 0.3)}"/>`;
  g += `<circle cx="514" cy="470" r="6" fill="${accent}"/>`;
  g += `<path d="M430 190 C540 160 660 210 676 320" fill="none" stroke="#fff" stroke-width="4" opacity=".25"/>`;
  return { defs, g };
}
function keyboard(ctx: Ctx): Drawing {
  const { body, accent, p } = ctx;
  const defs = lin(`${p}kb`, [
    [0, L(body, 0.15)],
    [1, D(body, 0.15)],
  ], 0, 1);
  let g = `<rect x="70" y="340" width="860" height="330" rx="26" fill="url(#${p}kb)"/>`;
  g += `<rect x="70" y="340" width="860" height="8" rx="4" fill="#fff" opacity=".2"/>`;
  const k = 38;
  const gap = 8;
  const rows = [16, 16, 15, 14, 13];
  const keyFill = accent;
  rows.forEach((n, ri) => {
    const y = 372 + ri * (k + gap);
    let x = 92;
    for (let i = 0; i < n; i++) {
      let w = k;
      if (ri === 2 && i === 0) w = k * 1.4;
      if (ri === 3 && (i === 0 || i === n - 1)) w = k * 1.8;
      if (ri === 4 && i === 6) w = k * 5;
      if (x + w > 700) break;
      g += `<rect x="${x}" y="${y}" width="${w}" height="${k}" rx="8" fill="${keyFill}"/><ellipse cx="${x + w / 2}" cy="${y + k / 2}" rx="${w * 0.3}" ry="${k * 0.28}" fill="#000" opacity=".12"/>`;
      x += w + gap;
    }
  });
  for (let r = 0; r < 5; r++)
    for (let c = 0; c < 4; c++)
      g += `<rect x="${730 + c * (k + gap)}" y="${372 + r * (k + gap)}" width="${k}" height="${k}" rx="8" fill="${keyFill}"/>`;
  return { defs, g };
}

// ─── view assembly ───────────────────────────────────────────────────────────
function svg(defs: string, g: string, viewBox = "0 0 1000 1000") {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="1000" height="1000"><defs>${defs}</defs>${g}</svg>`;
}
const wrap = (d: Drawing, transform: string) => ({ defs: d.defs, g: `<g transform="${transform}">${d.g}</g>` });
const withShadow = (d: Drawing, p: string, cy = 880, rx = 320, ry = 34): Drawing => {
  const s = shadow(p, 500, cy, rx, ry);
  return { defs: s.defs + d.defs, g: s.g + d.g };
};

function render(kind: string, view: string, c: Color, variant?: string): string {
  const ctx = (p: string): Ctx => ({ body: c.body, accent: c.accent ?? c.body, variant, p });
  const a = ctx("a");
  switch (kind) {
    case "phone": {
      if (view === "duo") {
        const back = wrap(phone(ctx("b"), "back"), "translate(-120 30) rotate(-7 500 470)");
        const front = wrap(phone(ctx("f"), "front"), "translate(150 60) rotate(6 500 470) scale(.95)");
        const s = shadow("s", 520, 905, 340, 30);
        return svg(s.defs + back.defs + front.defs, s.g + back.g + front.g);
      }
      if (view === "detail") {
        const d = phone(a, "back");
        return svg(d.defs, d.g, "300 80 320 320");
      }
      return svg(...Object.values(withShadow(phone(a, view as "back" | "front"), "s", 880, 220, 26)) as [string, string]);
    }
    case "laptop": {
      if (view === "closed") return svg(...(Object.values(withShadow(laptopClosed(a), "s", 700, 420, 30)) as [string, string]));
      const d = withShadow(laptopOpen(a), "s", 690, 440, 28);
      if (view === "detail") return svg(d.defs, d.g, "380 160 300 300");
      return svg(d.defs, d.g, "0 60 1000 800");
    }
    case "headphones": {
      if (view === "side") return svg(...(Object.values(withShadow(headphonesSide(a), "s", 870, 230, 26)) as [string, string]));
      const d = withShadow(headphonesFront(a), "s", 820, 340, 26);
      if (view === "detail") return svg(d.defs, d.g, "150 470 360 360");
      return svg(d.defs, d.g);
    }
    case "earbuds":
      return view === "buds"
        ? svg(...(Object.values(withShadow(earbudsPair(a), "s", 800, 260, 26)) as [string, string]))
        : svg(...(Object.values(withShadow(earbudsCase(a), "s", 700, 230, 26)) as [string, string]));
    case "controller": {
      const d = withShadow(controller(a), "s", 840, 380, 28);
      if (view === "angle") return svg(...(Object.values(wrap(d, "rotate(-14 500 560) translate(0 -20)")) as [string, string]));
      if (view === "detail") return svg(d.defs, d.g, "560 300 320 320");
      return svg(d.defs, d.g, "0 80 1000 900");
    }
    case "console": {
      const d = withShadow(consoleFront(a), "s", 880, 240, 24);
      if (view === "angle") return svg(...(Object.values(wrap(d, "rotate(-90 500 520) translate(0 0) scale(.92)")) as [string, string]));
      return svg(d.defs, d.g);
    }
    case "handheld": {
      const d = withShadow(handheld(a), "s", 720, 420, 26);
      if (view === "angle") return svg(...(Object.values(wrap(d, "rotate(-10 500 500) scale(.95)")) as [string, string]));
      return svg(d.defs, d.g, "50 150 900 700");
    }
    case "watch": {
      const d = withShadow(watch(a), "s", 920, 160, 20);
      if (view === "angle") return svg(...(Object.values(wrap(d, "rotate(-16 500 500) scale(.92)")) as [string, string]));
      if (view === "detail") return svg(d.defs, d.g, "340 300 340 340");
      return svg(d.defs, d.g);
    }
    case "tablet": {
      const d = withShadow(tablet(a, view === "back" ? "back" : "front"), "s", 810, 400, 28);
      return svg(d.defs, d.g, "50 150 900 750");
    }
    case "speaker": {
      const d = withShadow(speaker(a), "s", 680, 360, 26);
      if (view === "angle") return svg(...(Object.values(wrap(d, "rotate(-12 500 520) scale(.95)")) as [string, string]));
      return svg(d.defs, d.g, "50 200 900 650");
    }
    case "charger": {
      const d = view === "front" ? withShadow(chargerFront(a), "s", 720, 200, 22) : withShadow(chargerAngle(a), "s", 700, 240, 24);
      return svg(d.defs, d.g);
    }
    case "powerbank": {
      const d = withShadow(powerbank(a), "s", 780, 200, 22);
      if (view === "angle") return svg(...(Object.values(wrap(d, "rotate(12 500 500)")) as [string, string]));
      return svg(d.defs, d.g);
    }
    case "cable": {
      const d = withShadow(cable(a), "s", 760, 300, 26);
      if (view === "detail") return svg(d.defs, d.g, "560 160 340 340");
      return svg(d.defs, d.g);
    }
    case "puck": {
      const d = withShadow(puck(a), "s", 800, 260, 24);
      if (view === "angle") return svg(...(Object.values(wrap(d, "rotate(-14 500 500) scale(.95)")) as [string, string]));
      return svg(d.defs, d.g);
    }
    case "mouse": {
      const d = withShadow(mouse(a), "s", 880, 220, 24);
      if (view === "angle") return svg(...(Object.values(wrap(d, "rotate(18 500 520) scale(.95)")) as [string, string]));
      return svg(d.defs, d.g);
    }
    case "keyboard": {
      const d = withShadow(keyboard(a), "s", 690, 440, 24);
      if (view === "angle") return svg(...(Object.values(wrap(d, "rotate(-8 500 500) scale(.95)")) as [string, string]));
      return svg(d.defs, d.g);
    }
  }
  throw new Error(`Unknown art kind ${kind}`);
}

// ─── main ────────────────────────────────────────────────────────────────────
const outRoot = join(process.cwd(), "public", "products");
rmSync(outRoot, { recursive: true, force: true });
let count = 0;
for (const product of products) {
  if (product.images) continue;
  const dir = join(outRoot, product.slug);
  mkdirSync(dir, { recursive: true });
  for (const color of product.colors) {
    for (const view of artViews[product.art.kind]) {
      writeFileSync(join(dir, `${color.id}-${view}.svg`), render(product.art.kind, view, color, product.art.variant));
      count++;
    }
  }
}
console.log(`Generated ${count} product renders in public/products`);
