import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { UIProvider } from "@/components/layout/UIProvider";
import { Toaster } from "@/components/layout/Toaster";
import { siteUrl } from "@/config/store";
import { ShopDataProvider } from "@/components/layout/ShopData";
import { getCatalog } from "@/server/catalog";
import { getSettings } from "@/server/settings";
import { toClientProduct } from "@/lib/catalog";

const ui = Inter({ subsets: ["latin"], variable: "--nf-ui", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const { store } = await getSettings();
  return {
    metadataBase: new URL(siteUrl),
    title: { default: `${store.name} — ${store.tagline}`, template: `%s · ${store.name}` },
    description: "Smartphones, laptops, gaming, audio and accessories — compared clearly and delivered across Lebanon.",
    applicationName: store.name,
    openGraph: { type: "website", siteName: store.name, locale: "en_LB" },
    twitter: { card: "summary_large_image" },
    alternates: { canonical: "/" },
  };
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [catalog, settings] = await Promise.all([getCatalog(), getSettings()]);
  return (
    <html lang="en" className={ui.variable}>
      <body className="min-h-dvh">
        <noscript>
          <style>{`.reveal{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <a href="#main" className="sr-only z-[70] rounded-full bg-ink text-white px-4 py-3 focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
          Skip to content
        </a>
        <ShopDataProvider products={catalog.products.map(toClientProduct)} categories={catalog.categories} settings={settings}>
        <UIProvider>
          {children}
          <Toaster />
        </UIProvider>
        </ShopDataProvider>
      </body>
    </html>
  );
}
