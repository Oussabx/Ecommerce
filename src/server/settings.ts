import "server-only";
import { unstable_cache } from "next/cache";
import { db, hasDatabase } from "./db";
import { storeDefaults, type SiteSettings } from "@/config/store-defaults";
import { campaign as campaignDefault } from "@/data/promotions";
import { announcements as announcementsDefault } from "@/config/announcements";

export const SETTINGS_TAG = "settings";

/** All site settings, merged over defaults. Cached; invalidated by revalidateTag("settings"). */
const getDbSettings = unstable_cache(
  async (): Promise<SiteSettings> => {
    const rows = await db.setting.findMany();
    const get = (k: string) => rows.find((r) => r.key === k)?.value as unknown;
    const store = (get("store") ?? {}) as Partial<SiteSettings["store"]>;
    return {
      store: {
        ...storeDefaults,
        ...store,
        contact: { ...storeDefaults.contact, ...(store.contact ?? {}) },
        social: { ...storeDefaults.social, ...(store.social ?? {}) },
      },
      announcements: (get("announcements") as string[] | undefined) ?? announcementsDefault,
      campaign: { ...campaignDefault, ...((get("campaign") as object | undefined) ?? {}) },
    };
  },
  ["site-settings"],
  { tags: [SETTINGS_TAG], revalidate: 3600 },
);

export const getSettings = (): Promise<SiteSettings> =>
  hasDatabase ? getDbSettings() : Promise.resolve({ store: storeDefaults, announcements: announcementsDefault, campaign: campaignDefault });

export async function saveSetting(key: "store" | "announcements" | "campaign", value: object) {
  await db.setting.upsert({ where: { key }, create: { key, value }, update: { value } });
}
