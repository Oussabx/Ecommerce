import type { Metadata } from "next";
import { InfoPageView } from "@/components/layout/InfoPageView";
import { pages } from "@/content/pages";

export const metadata: Metadata = {
  title: "Warranty",
  description: "Each product page shows the warranty that applies to it. This page explains how to use it.",
  alternates: { canonical: "/warranty" },
};

export default function Page() {
  return <InfoPageView page={pages.warranty} />;
}
