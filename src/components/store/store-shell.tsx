"use client";

import { useState } from "react";
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
  SideRails,
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
      <AnnouncementBar text={settings.announcement} />
      <TopBar settings={settings} />
      <Header settings={settings} onOpenMobile={() => setMenuOpen(true)} />
      <MegaNav categories={categories} />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} categories={categories} />
      <SideRails />
      <main className="min-h-[50vh] pb-16 lg:pb-0">{children}</main>
      <Footer categories={categories} settings={settings} />
      <MobileTabBar onOpenCategories={() => setMenuOpen(true)} />
      <FloatingContacts settings={settings} />
      <CartDrawer settings={settings} />
    </>
  );
}
