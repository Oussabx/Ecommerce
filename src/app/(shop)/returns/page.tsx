import type { Metadata } from "next";
import { InfoPageView } from "@/components/layout/InfoPageView";
import { pages } from "@/content/pages";

export const metadata: Metadata = {
  title: "Returns & exchanges",
  description: "If something isn't right with your order, contact us and we'll explain your options.",
  alternates: { canonical: "/returns" },
};

export default function Page() {
  return <InfoPageView page={pages.returns} />;
}
