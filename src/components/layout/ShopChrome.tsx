import type { ReactNode } from "react";
import { AnnouncementBar } from "./AnnouncementBar";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { SearchOverlay } from "./SearchOverlay";
import { CartDrawer } from "./CartDrawer";
import { MobileMenu } from "./MobileMenu";

/** Storefront frame: announcement strip, header, footer and overlays. */
export function ShopChrome({ children }: { children: ReactNode }) {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main id="main" className="min-h-[60vh]">
        {children}
      </main>
      <Footer />
      <SearchOverlay />
      <CartDrawer />
      <MobileMenu />
    </>
  );
}
