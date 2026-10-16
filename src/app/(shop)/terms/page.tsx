import type { Metadata } from "next";
import { InfoPageView } from "@/components/layout/InfoPageView";
import { pages } from "@/content/pages";

export const metadata: Metadata = {
  title: "Terms & conditions",
  description: "These terms apply when you browse and order from OSA Techstore.",
  alternates: { canonical: "/terms" },
};

export default function Page() {
  return <InfoPageView page={pages.terms} />;
}
