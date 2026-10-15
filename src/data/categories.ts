import type { Category } from "./types";

export const categories: Category[] = [
  {
    slug: "smartphones",
    index: 1,
    code: "SP",
    name: "Smartphones",
    indexName: "Smartphones",
    description:
      "Flagships, everyday phones and smart mid-range picks — compared on the details that matter: camera, battery, screen and storage.",
    coverProduct: "iphone-16-pro",
  },
  {
    slug: "computers",
    index: 2,
    code: "CP",
    name: "Computers",
    indexName: "Laptops & Computers",
    description:
      "Laptops and tablets for study, work and play. Thin-and-light machines, creative workstations and gaming laptops.",
    coverProduct: "macbook-air-13-m4",
  },
  {
    slug: "gaming",
    index: 3,
    code: "GM",
    name: "Gaming",
    indexName: "Gaming",
    description: "Consoles, handhelds and controllers. The hardware, without the noise.",
    coverProduct: "dualsense-wireless-controller",
  },
  {
    slug: "audio",
    index: 4,
    code: "AU",
    name: "Audio",
    indexName: "Audio",
    description:
      "Noise-cancelling headphones, true wireless earbuds and portable speakers, picked for sound and comfort.",
    coverProduct: "sony-wh-1000xm5",
  },
  {
    slug: "accessories",
    index: 5,
    code: "AC",
    name: "Accessories",
    indexName: "Accessories",
    description:
      "Chargers, power banks, cables and desk essentials that make the rest of your tech work better.",
    coverProduct: "anker-maggo-power-bank-10k",
  },
  {
    slug: "smart-devices",
    index: 6,
    code: "SD",
    name: "Smart Devices",
    indexName: "Smart Devices",
    description: "Smartwatches and trackers that keep you connected — and a little more organised.",
    coverProduct: "apple-watch-series-10",
  },
];
