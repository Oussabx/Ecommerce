import type { Metadata } from "next";
import { InfoPageView } from "@/components/layout/InfoPageView";
import { pages } from "@/content/pages";

export const metadata: Metadata = {
  title: "Delivery",
  description: "We deliver to every governorate in Lebanon. Here is how delivery works when you order from OSA Techstore.",
  alternates: { canonical: "/delivery" },
};

export default function Page() {
  return <InfoPageView page={pages.delivery} />;
}
