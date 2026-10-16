import type { Metadata } from "next";
import { InfoPageView } from "@/components/layout/InfoPageView";
import { pages } from "@/content/pages";

export const metadata: Metadata = {
  title: "About OSA",
  description: "OSA Techstore is a technology retailer in Lebanon. We stock a focused range of devices and describe them plainly, so you can choose quickly and buy with co",
  alternates: { canonical: "/about" },
};

export default function Page() {
  return <InfoPageView page={pages.about} />;
}
