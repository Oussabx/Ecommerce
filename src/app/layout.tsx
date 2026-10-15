import type { Metadata, Viewport } from "next";
import { Archivo, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { UIProvider } from "@/components/layout/UIProvider";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SearchOverlay } from "@/components/layout/SearchOverlay";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { Toaster } from "@/components/layout/Toaster";
import { siteUrl, store } from "@/config/store";

const display = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--nf-display", display: "swap" });
const ui = Inter({ subsets: ["latin"], variable: "--nf-ui", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--nf-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${store.name} — ${store.tagline}`, template: `%s · ${store.name}` },
  description: "Smartphones, laptops, gaming, audio and accessories — compared clearly and delivered across Lebanon.",
  applicationName: store.name,
  openGraph: { type: "website", siteName: store.name, locale: "en_LB" },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#f5f3ee",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${ui.variable} ${mono.variable}`}>
      <body className="min-h-dvh">
        <noscript>
          <style>{`.reveal{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <a href="#main" className="sr-only z-[70] bg-lime px-4 py-3 focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
          Skip to content
        </a>
        <UIProvider>
          <AnnouncementBar />
          <Header />
          <main id="main" className="min-h-[60vh]">
            {children}
          </main>
          <Footer />
          <SearchOverlay />
          <CartDrawer />
          <MobileMenu />
          <Toaster />
        </UIProvider>
      </body>
    </html>
  );
}
