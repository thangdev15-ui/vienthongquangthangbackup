"use client";

import Link from "next/link";
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

function SideRails() {
  return (
    <>
      <Link href="/thuong-hieu" className="side-rail side-rail-left" aria-label="Xem thương hiệu phân phối">
        <img src="/logoqt.png" alt="" className="w-full object-contain" />
        <span className="side-rail-kicker">Nhà phân phối</span>
        <strong>THIẾT BỊ<br />CHÍNH HÃNG</strong>
        <span className="side-rail-button">Xem thương hiệu</span>
      </Link>
      <Link href="/thuong-hieu" className="side-rail side-rail-right" aria-label="Xem thương hiệu phân phối">
        <img src="/logoqt.png" alt="" className="w-full object-contain" />
        <span className="side-rail-kicker">Nhà phân phối</span>
        <strong>THIẾT BỊ<br />CHÍNH HÃNG</strong>
        <span className="side-rail-button">Xem thương hiệu</span>
      </Link>
    </>
  );
}
