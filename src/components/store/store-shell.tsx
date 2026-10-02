"use client";

import { useState } from "react";
import { RouteProgress } from "@/components/route-progress";
import {
  AnnouncementBar,
  TopBar,
  Header,
  MegaNav,
  MobileMenu,
  Footer,
  MobileTabBar,
  FloatingContacts,
  CartDrawer,
  type NavCategory,
} from "@/components/store/chrome";

export function StoreShell({
  categories,
  settings,
  children,
}: {
  categories: NavCategory[];
  settings: Record<string, string>;
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      <RouteProgress />
      <AnnouncementBar text={settings.announcement} settings={settings} />
      <TopBar settings={settings} />
      <Header settings={settings} categories={categories} onOpenMobile={() => setMenuOpen(true)} />
      <MegaNav categories={categories} />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} categories={categories} />
      <main className="relative min-h-[50vh] pb-16 lg:pb-0">
        {children}
      </main>
      <Footer categories={categories} settings={settings} />
      <MobileTabBar onOpenCategories={() => setMenuOpen(true)} />
      <FloatingContacts settings={settings} />
      <CartDrawer settings={settings} />
    </>
  );
}
