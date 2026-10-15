import type { Metadata } from "next";
import { InfoPageView } from "@/components/layout/InfoPageView";
import { pages } from "@/content/pages";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "This policy explains what personal information OSA Techstore collects, why, and how it is protected.",
  alternates: { canonical: "/privacy" },
};

export default function Page() {
  return <InfoPageView page={pages.privacy} />;
}
