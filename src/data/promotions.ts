import type { Campaign } from "../config/store-defaults";

/** Default homepage campaign (seeded into the database; edit in Admin → Content). */
export const campaign: Campaign = {
  enabled: true,
  eyebrow: "Campaign 01 — The upgrade edit",
  headline: ["Your next upgrade", "starts here."],
  body: "Three devices we'd recommend to a friend this season — chosen for what they do well, not for the spec sheet alone.",
  heroProduct: "samsung-galaxy-s25-ultra",
  heroColor: "silverblue",
  supporting: ["macbook-air-13-m4", "sony-wh-1000xm5"],
  cta: { label: "Shop the edit", href: "/shop" },
};
