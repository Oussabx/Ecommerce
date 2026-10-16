import type { Metadata } from "next";
import { Intentions } from "@/components/home/Intentions";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export const metadata: Metadata = {
  title: "Shop by intention",
  description: "Curated edits: the everyday setup, gaming, working from anywhere, better sound, first setups and smart upgrades.",
  alternates: { canonical: "/collections" },
};

export default function CollectionsPage() {
  return (
    <>
      <div className="container-x pt-5 md:pt-6">
        <Breadcrumbs items={[{ label: "Shop", href: "/shop" }, { label: "Collections" }]} />
      </div>
      <Intentions />
    </>
  );
}
