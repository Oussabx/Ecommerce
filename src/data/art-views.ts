import type { ArtKind } from "./types";

/**
 * Gallery views generated for each art kind (see scripts/generate-product-art.mts).
 * The first view is the primary image; the second is used as the hover image.
 */
export const artViews: Record<ArtKind, string[]> = {
  phone: ["duo", "back", "front", "detail"],
  laptop: ["open", "closed", "detail"],
  headphones: ["front", "side", "detail"],
  earbuds: ["case", "buds"],
  controller: ["top", "angle", "detail"],
  console: ["front", "angle"],
  handheld: ["front", "angle"],
  watch: ["front", "angle", "detail"],
  tablet: ["front", "back"],
  speaker: ["front", "angle"],
  charger: ["angle", "front"],
  powerbank: ["front", "angle"],
  cable: ["coil", "detail"],
  puck: ["top", "angle"],
  mouse: ["top", "angle"],
  keyboard: ["top", "angle"],
};

export const viewLabels: Record<string, string> = {
  duo: "Front and back",
  back: "Back",
  front: "Front",
  detail: "Detail",
  open: "Open",
  closed: "Closed",
  side: "Side",
  case: "Charging case",
  buds: "Earbuds",
  top: "Top",
  angle: "Angled",
  coil: "Coiled",
};
