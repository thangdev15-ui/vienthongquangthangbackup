"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Icon, type IconName, Price, Stars } from "@/components/ui";
import { useShop } from "@/components/store/shops";
import { subscribeAction } from "@/lib/actions";
import { formatVND, type Category } from "@/lib/types";

export type NavCategory = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  children: NavCategory[];
};

type Settings = Record<string, string>;

/* ------------------------------ Announcement bar ----------------------------- */

export function AnnouncementBar({ text }: { text: string }) {
  return (
    <div className="bg-ink-950 text-[13px] text-ink-200">
      <div className="wrap flex h-9 items-center justify-between gap-4">
        <p className="truncate">{text}</p>
        <div className="hidden items-center gap-5 sm:flex">
          <Link href="/tai-khoan?tab=orders" className="hidden hover:text-white lg:inline">
            Theo dõi đơn hàng
          </Link>
          <Link href="/tin-tuc" className="hover:text-white">
            Download Software &amp; Firmware
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- Top bar ---------------------------------- */

export function TopBar({ settings }: { settings: Settings }) {
  return (
    <div className="border-b border-line bg-white">
      <div className="wrap flex h-10 items-center justify-between text-[13px] text-ink-600">
        <div className="flex min-w-0 items-center gap-5">
          <span className="hidden items-center gap-1.5 md:flex">
            <Icon name="pin" className="h-4 w-4 text-brand-700" />
            <span className="truncate">{settings.address}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Icon name="clock" className="h-4 w-4 text-brand-700" />
            {settings.hours}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <a href={settings.phone.replace(/[\s.]/g, "") && `tel:${settings.phone.replace(/\D/g, "")}`} className="hidden items-center gap-1.5 font-semibold text-ink-900 hover:text-brand-700 sm:flex">
            <Icon name="phone" className="h-4 w-4 text-accent-600" />
            {settings.phone}
          </a>
          <span className="hidden text-ink-300 sm:inline">|</span>
          <Link href={settings.zalo} target="_blank" rel="noopener" className="flex items-center gap-1.5 font-medium hover:text-[#0068ff]">
            <Icon name="message" className="h-4 w-4" />
            CSKH: {settings.cs_kh}
          </Link>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- Search bar -------------------------------- */

type Suggestion = {
  products: { id: string; name: string; slug: string; image: string | null; price: number | null; salePrice: number | null; priceType: string; categoryName: string }[];
  categories: { name: string; slug: string }[];
};

export function SearchBar({ autoFocus = false }: { autoFocus?: boolean }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [sug, setSug] = useState<Suggestion | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (q.trim().length < 2) return;
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/suggestions?q=${encodeURIComponent(q.trim())}`);
        if (res.ok) setSug(await res.json());
      } catch {
        /* noop */
      }
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    router.push(`/tim-kiem?q=${encodeURIComponent(q.trim())}`);
    setOpen(false);
  }

  return (
    <div ref={boxRef} className="relative w-full">
      <form onSubmit={submit} role="search">
        <input
          value={q}
          autoFocus={autoFocus}
          onChange={(e) => {
            const value = e.target.value;
            setQ(value);
            if (value.trim().length < 2) setSug(null);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Tìm sản phẩm, mã SKU, thương hiệu… ví dụ: cáp Cat6, switch PoE, camera Hikvision"
          aria-label="Tìm kiếm sản phẩm"
          className="input h-11 rounded-l-md rounded-r-none pr-11"
        />
        <button
          type="submit"
          aria-label="Tìm kiếm"
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-md bg-brand-700 text-white transition-colors hover:bg-brand-800"
        >
          <Icon name="search" className="h-5 w-5" />
        </button>
      </form>
      {open && sug && (sug.products.length > 0 || sug.categories.length > 0) && (
        <div className="absolute inset-x-0 top-full z-50 mt-1 max-h-[70vh] overflow-auto rounded-md border border-line bg-white py-2 shadow-xl thin-scrollbar">
          {sug.categories.length > 0 && (
            <div className="px-3 py-1">
              <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-ink-400">Danh mục</p>
              {sug.categories.map((c) => (
                <button
                  key={c.slug}
                  onClick={() => {
                    router.push(`/danh-muc/${c.slug}`);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-brand-50"
                >
                  <Icon name="layers" className="h-4 w-4 text-brand-600" />
                  {c.name}
                </button>
              ))}
            </div>
          )}
          {sug.products.length > 0 && (
            <div className="px-3 py-1">
              <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-ink-400">Sản phẩm</p>
              {sug.products.slice(0, 6).map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    router.push(`/san-pham/${p.slug}`);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded px-2 py-2 text-left hover:bg-brand-50"
                >
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-ink-100">
                    {p.image && <Image src={p.image} alt="" fill className="object-cover" sizes="40px" />}
                  </div>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink-900">{p.name}</span>
                    <span className="block text-[12px] text-ink-400">{p.categoryName}</span>
                  </span>
                  {p.priceType === "fixed" ? (
                    <span className="text-sm font-bold text-ink-900">{formatVND(p.salePrice ?? p.price)}</span>
                  ) : (
                    <span className="text-xs font-bold text-ink-400">LIÊN HỆ</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ----------------------------------- Header ---------------------------------- */

export function Header({ settings, onOpenMobile }: { settings: Settings; onOpenMobile: () => void }) {
  const { cartCount, wishlist, setCartOpen } = useShop();
  return (
    <div className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="wrap flex h-16 items-center gap-3 sm:gap-5">
        <button
          onClick={onOpenMobile}
          className="flex h-10 w-10 items-center justify-center rounded-md text-ink-700 hover:bg-ink-50 lg:hidden"
          aria-label="Mở menu"
        >
          <Icon name="menu" className="h-6 w-6" />
        </button>
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Trang chủ Viễn Thông Quang Thắng">
          <Image src="/logoqt.png" alt="Viễn Thông Quang Thắng" width={180} height={64} priority className="h-10 w-auto object-contain" />
          <span className="leading-tight">
            <span className="block text-[15px] font-extrabold tracking-tight text-ink-950 sm:text-base">
              Viễn Thông <span className="text-brand-700">Quang Thắng</span>
            </span>
            <span className="hidden text-[11px] font-medium text-ink-500 sm:block">Thiết bị mạng • Cáp • Camera</span>
          </span>
        </Link>
        <div className="hidden flex-1 lg:block lg:max-w-2xl">
          <SearchBar />
        </div>
        <div className="ml-auto flex items-center gap-0.5 sm:gap-1.5">
          <div className="hidden flex-col items-end md:flex">
            <span className="text-[11px] font-medium text-ink-500">Hotline tư vấn</span>
            <a href={`tel:${settings.phone.replace(/\D/g, "")}`} className="text-[15px] font-extrabold text-accent-600 hover:text-accent-700">
              {settings.phone}
            </a>
          </div>
          <Link href="/tai-khoan?tab=wishlist" className="relative hidden h-10 w-10 items-center justify-center rounded-md text-ink-700 hover:bg-ink-50 sm:flex" aria-label="Yêu thích">
            <Icon name="heart" className="h-5 w-5" />
            {wishlist.length > 0 && (
              <span className="absolute -top-0.5 right-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-600 px-1 text-[10px] font-bold text-white">
                {wishlist.length}
              </span>
            )}
          </Link>
          <Link href="/tai-khoan" className="flex h-10 w-10 items-center justify-center rounded-md text-ink-700 hover:bg-ink-50" aria-label="Tài khoản">
            <Icon name="user" className="h-5 w-5" />
          </Link>
          <button onClick={() => setCartOpen(true)} className="relative flex h-10 w-10 items-center justify-center rounded-md text-ink-700 hover:bg-ink-50" aria-label="Giỏ hàng">
            <Icon name="cart" className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 right-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-600 px-1 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
      <div className="border-t border-line bg-brand-700 py-2 lg:hidden">
        <div className="wrap">
          <SearchBar />
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- Mega nav --------------------------------- */

export function MegaNav({ categories }: { categories: NavCategory[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return (
    <nav aria-label="Điều hướng chính" className="relative z-30 border-b border-line bg-white" onMouseLeave={() => setOpen(false)}>
      <div className="wrap flex items-center gap-1">
        <button
          onMouseEnter={() => setOpen(true)}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen((v) => !v)}
          className="mr-1 flex h-11 items-center gap-2 rounded-md bg-ink-950 px-4 text-sm font-bold text-white"
          aria-expanded={open}
        >
          <Icon name="menu" className="h-4 w-4" />
          Tất cả danh mục
          <Icon name="chevron-down" className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        <div className="hidden h-11 items-center gap-0.5 lg:flex">
          <MegaLink href="/san-pham" label="Sản phẩm" />
          <MegaLink href="/thuong-hieu" label="Thương hiệu" />
          <MegaLink href="/khuyen-mai" label="Khuyến mãi" hot />
          <MegaLink href="/tin-tuc" label="Tin tức" />
          <MegaLink href="/gioi-thieu" label="Giới thiệu" />
          <MegaLink href="/lien-he" label="Liên hệ" />
        </div>
        <span className="ml-auto hidden items-center gap-2 text-[13px] font-medium text-ink-500 xl:flex">
          <Icon name="shield" className="h-4 w-4 text-success-600" />
          Sản phẩm chính hãng — Tư vấn kỹ thuật tận tâm
        </span>
      </div>
      {/* Desktop mega panel */}
      <div
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className={`absolute inset-x-0 top-full z-40 hidden border-b border-line bg-white shadow-xl transition-opacity lg:block ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="wrap grid grid-cols-4 gap-x-8 gap-y-6 py-7">
          {categories.slice(0, 8).map((cat) => (
            <div key={cat.id}>
              <Link
                href={`/danh-muc/${cat.slug}`}
                className="mb-2.5 flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-wide text-ink-950 hover:text-brand-700"
              >
                {cat.name}
                <Icon name="chevron-right" className="h-3.5 w-3.5" />
              </Link>
              <ul className="space-y-1.5">
                {(cat.children.length ? cat.children : [{ name: "Xem tất cả", slug: cat.slug, id: `${cat.id}-all`, image: null, children: [] } as NavCategory]).slice(0, 6).map((sub) => (
                  <li key={sub.id}>
                    <Link href={`/danh-muc/${sub.slug}`} className="block text-[13px] text-ink-600 hover:text-brand-700">
                      {sub.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-line bg-ink-50/60">
          <div className="wrap flex flex-wrap items-center gap-x-6 gap-y-2 py-3 text-[13px]">
            <Link href="/san-pham" className="font-bold text-brand-700 hover:underline">
              → Xem tất cả sản phẩm
            </Link>
            <Link href="/thuong-hieu" className="text-ink-600 hover:text-brand-700">Thương hiệu</Link>
            <Link href="/khuyen-mai" className="font-semibold text-accent-600 hover:underline">Khuyến mãi Hot</Link>
            <Link href="/tin-tuc" className="text-ink-600 hover:text-brand-700">Tin tức công nghệ</Link>
            <Link href="/lien-he" className="text-ink-600 hover:text-brand-700">Liên hệ</Link>
          </div>
        </div>
      </div>
      {/* Mobile quick links */}
      <div className="flex gap-1 overflow-x-auto border-t border-line px-4 py-2 no-scrollbar lg:hidden">
        {[
          { href: "/san-pham", label: "Sản phẩm" },
          { href: "/thuong-hieu", label: "Thương hiệu" },
          { href: "/khuyen-mai", label: "Khuyến mãi" },
          { href: "/tin-tuc", label: "Tin tức" },
          { href: "/gioi-thieu", label: "Giới thiệu" },
          { href: "/lien-he", label: "Liên hệ" },
        ].map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`whitespace-nowrap rounded-full px-3 py-1 text-[13px] font-medium ${
              pathname === l.href ? "bg-brand-700 text-white" : "bg-ink-50 text-ink-700"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

function MegaLink({ href, label, hot = false }: { href: string; label: string; hot?: boolean }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      className={`flex h-11 items-center rounded-md px-3 text-sm font-semibold transition-colors ${
        active ? "bg-brand-50 text-brand-800" : hot ? "text-accent-600 hover:bg-accent-50" : "text-ink-800 hover:bg-ink-50"
      }`}
    >
      {label}
    </Link>
  );
}

/* ---------------------------------- Mobile menu -------------------------------- */

export function MobileMenu({ open, onClose, categories }: { open: boolean; onClose: () => void; categories: NavCategory[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] lg:hidden">
      <div className="absolute inset-0 bg-ink-950/50" onClick={onClose} aria-hidden="true" />
      <div className="absolute inset-y-0 left-0 flex w-[88%] max-w-sm flex-col bg-white shadow-2xl animate-slide-in" style={{ animationName: "qt-slide-left" }}>
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <span className="text-base font-extrabold text-ink-950">
            Viễn Thông <span className="text-brand-700">Quang Thắng</span>
          </span>
          <button onClick={onClose} aria-label="Đóng menu" className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-ink-50">
            <Icon name="x" className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 thin-scrollbar" aria-label="Menu di động">
          <p className="px-2 pb-1 pt-2 text-[11px] font-bold uppercase tracking-wide text-ink-400">Danh mục sản phẩm</p>
          {categories.map((cat) => (
            <div key={cat.id} className="border-b border-line/70 last:border-0">
              <div className="flex items-center">
                <Link href={`/danh-muc/${cat.slug}`} onClick={onClose} className="flex-1 px-2 py-2.5 text-sm font-semibold text-ink-900">
                  {cat.name}
                </Link>
                {cat.children.length > 0 && (
                  <button
                    onClick={() => setExpanded(expanded === cat.id ? null : cat.id)}
                    aria-label={`Mở rộng ${cat.name}`}
                    className="flex h-9 w-9 items-center justify-center text-ink-400"
                  >
                    <Icon name="chevron-down" className={`h-4 w-4 transition-transform ${expanded === cat.id ? "rotate-180" : ""}`} />
                  </button>
                )}
              </div>
              {expanded === cat.id && cat.children.length > 0 && (
                <ul className="space-y-0.5 pb-2 pl-4">
                  {cat.children.map((sub) => (
                    <li key={sub.id}>
                      <Link href={`/danh-muc/${sub.slug}`} onClick={onClose} className="block rounded px-2 py-1.5 text-[13px] text-ink-600 hover:bg-brand-50 hover:text-brand-700">
                        {sub.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
          <p className="px-2 pb-1 pt-4 text-[11px] font-bold uppercase tracking-wide text-ink-400">Khác</p>
          {[
            { href: "/san-pham", label: "Tất cả sản phẩm" },
            { href: "/thuong-hieu", label: "Thương hiệu" },
            { href: "/khuyen-mai", label: "Khuyến mãi" },
            { href: "/tin-tuc", label: "Tin tức công nghệ" },
            { href: "/gioi-thieu", label: "Giới thiệu" },
            { href: "/lien-he", label: "Liên hệ" },
            { href: "/tai-khoan", label: "Tài khoản" },
            { href: "/tai-khoan?tab=wishlist", label: "Yêu thích" },
          ].map((l) => (
            <Link key={l.href} href={l.href} onClick={onClose} className="block rounded px-2 py-2.5 text-sm font-medium text-ink-800 hover:bg-ink-50">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}

/* ---------------------------------- Cart drawer -------------------------------- */

export function CartDrawer({ settings }: { settings: Settings }) {
  const { cartOpen, setCartOpen, cart, cartSubtotal, updateQty, removeFromCart } = useShop();
  const router = useRouter();
  useEffect(() => {
    document.body.style.overflow = cartOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [cartOpen]);
  if (!cartOpen) return null;
  return (
    <div className="fixed inset-0 z-[80]">
      <div className="absolute inset-0 bg-ink-950/50" onClick={() => setCartOpen(false)} aria-hidden="true" />
      <div className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl animate-slide-in" role="dialog" aria-label="Giỏ hàng">
        <div className="flex items-center justify-between border-b border-line px-4 py-3.5">
          <h2 className="flex items-center gap-2 text-base font-bold text-ink-950">
            <Icon name="cart" className="h-5 w-5 text-brand-700" />
            Giỏ hàng ({cart.length})
          </h2>
          <button onClick={() => setCartOpen(false)} aria-label="Đóng giỏ hàng" className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-ink-50">
            <Icon name="x" className="h-5 w-5" />
          </button>
        </div>
        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <Icon name="cart" className="h-12 w-12 text-ink-200" />
            <p className="font-semibold text-ink-800">Giỏ hàng của bạn trống</p>
            <p className="text-sm text-ink-500">Khám phá kho thiết bị viễn thông chính hãng của chúng tôi.</p>
            <Link href="/san-pham" onClick={() => setCartOpen(false)} className="btn-primary mt-2">
              Bắt đầu mua hàng
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-4 thin-scrollbar">
              {cart.map((item) => (
                <li key={item.productId} className="flex gap-3 py-3.5">
                  <Link href={`/san-pham/${item.slug}`} onClick={() => setCartOpen(false)} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-ink-100">
                    {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link href={`/san-pham/${item.slug}`} onClick={() => setCartOpen(false)} className="block truncate text-[13px] font-semibold text-ink-900 hover:text-brand-700">
                      {item.name}
                    </Link>
                    <p className="mt-0.5 text-sm font-bold text-ink-900">{formatVND(item.salePrice ?? item.price)}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex items-center rounded-md border border-line">
                        <button onClick={() => updateQty(item.productId, item.qty - 1)} className="flex h-7 w-7 items-center justify-center text-ink-600 hover:text-brand-700" aria-label="Giảm số lượng">
                          <Icon name="minus" className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center text-[13px] font-semibold">{item.qty}</span>
                        <button onClick={() => updateQty(item.productId, item.qty + 1)} className="flex h-7 w-7 items-center justify-center text-ink-600 hover:text-brand-700" aria-label="Tăng số lượng">
                          <Icon name="plus" className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <button onClick={() => removeFromCart(item.productId)} className="text-ink-400 hover:text-sale-600" aria-label="Xoá sản phẩm">
                        <Icon name="trash" className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-line p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-ink-600">Tạm tính</span>
                <span className="text-lg font-extrabold text-ink-950">{formatVND(cartSubtotal)}</span>
              </div>
              <button
                onClick={() => {
                  setCartOpen(false);
                  router.push("/thanh-toan");
                }}
                className="btn-primary h-11 w-full"
              >
                Tiến hành thanh toán
              </button>
              <Link href="/gio-hang" onClick={() => setCartOpen(false)} className="btn-outline mt-2 h-10 w-full">
                Xem giỏ hàng
              </Link>
              <a href={settings.zalo} target="_blank" rel="noopener" className="btn-zalo mt-2 h-10 w-full">
                <Icon name="message" className="h-4 w-4" />
                Báo giá qua Zalo
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------- Compare bar -------------------------------- */

/* ------------------------------- Floating contacts ------------------------------ */

export function FloatingContacts({ settings }: { settings: Settings }) {
  return (
    <>
      <div className="fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-2 lg:flex">
        <a
          href={settings.zalo}
          target="_blank"
          rel="noopener"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0068ff] text-white shadow-lg transition-transform hover:scale-105"
          aria-label="Chat Zalo"
        >
          <Icon name="message" className="h-6 w-6" />
        </a>
        <a
          href={`tel:${settings.phone.replace(/\D/g, "")}`}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-600 text-white shadow-lg transition-transform hover:scale-105"
          aria-label="Gọi tư vấn"
        >
          <Icon name="phone" className="h-6 w-6" />
        </a>
      </div>
    </>
  );
}

/* ---------------------------------- Mobile tab bar ------------------------------ */

export function MobileTabBar({ onOpenCategories }: { onOpenCategories: () => void }) {
  const { cartCount, setCartOpen } = useShop();
  const pathname = usePathname();
  const items: { icon: IconName; label: string; href?: string; onClick?: () => void; badge?: number }[] = [
    { icon: "home", label: "Trang chủ", href: "/" },
    { icon: "grid", label: "Danh mục", onClick: onOpenCategories },
    { icon: "search", label: "Tìm kiếm", href: "/tim-kiem" },
    { icon: "cart", label: "Giỏ hàng", onClick: () => setCartOpen(true), badge: cartCount },
    { icon: "user", label: "Tài khoản", href: "/tai-khoan" },
  ];
  return (
    <nav aria-label="Điều hướng di động" className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-white lg:hidden">
      <div className="grid grid-cols-5">
        {items.map((it) =>
          it.href ? (
            <Link
              key={it.label}
              href={it.href}
              className={`relative flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium ${pathname === it.href ? "text-brand-700" : "text-ink-500"}`}
            >
              <Icon name={it.icon} className="h-5 w-5" />
              {it.label}
              {!!it.badge && it.badge > 0 && (
                <span className="absolute right-1/4 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-600 px-1 text-[9px] font-bold text-white">
                  {it.badge}
                </span>
              )}
            </Link>
          ) : (
            <button key={it.label} onClick={it.onClick} className="relative flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium text-ink-500">
              <Icon name={it.icon} className="h-5 w-5" />
              {it.label}
              {!!it.badge && it.badge > 0 && (
                <span className="absolute right-1/4 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-600 px-1 text-[9px] font-bold text-white">
                  {it.badge}
                </span>
              )}
            </button>
          ),
        )}
      </div>
    </nav>
  );
}

/* ------------------------------------ Footer ---------------------------------- */

export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "ok" | "err">("idle");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setState("loading");
    const res = await subscribeAction(email);
    setState(res.ok ? "ok" : "err");
    if (res.ok) setEmail("");
  }
  return (
    <form onSubmit={submit} className={compact ? "" : "flex w-full max-w-md gap-2"}>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email của bạn"
        aria-label="Email đăng ký nhận tin"
        className="input flex-1"
      />
      <button type="submit" disabled={state === "loading"} className="btn-primary shrink-0">
        {state === "ok" ? "Đã đăng ký" : "Đăng ký"}
      </button>
      {state === "ok" && <span className="text-sm font-medium text-success-600">Cảm ơn bạn đã đăng ký!</span>}
      {state === "err" && <span className="text-sm font-medium text-sale-600">Vui lòng nhập email hợp lệ.</span>}
    </form>
  );
}

export function Footer({ categories, settings }: { categories: NavCategory[]; settings: Settings }) {
  return (
    <footer className="mt-14 border-t border-line bg-ink-950 pb-20 text-ink-300 lg:pb-0">
      <div className="wrap grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="mb-4 flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-600 text-lg font-extrabold text-white">QT</span>
            <span className="text-base font-extrabold text-white">
              Viễn Thông <span className="text-brand-300">Quang Thắng</span>
            </span>
          </div>
          <p className="text-[13px] leading-6 text-ink-300">
            Tổng kho thiết bị viễn thông, cáp mạng &amp; camera tại TP. Hồ Chí Minh. Sản phẩm chính hãng, tư vấn kỹ thuật,
            giao hàng toàn quốc.
          </p>
          <div className="mt-4 flex gap-3">
            <a href={settings.facebook} target="_blank" rel="noopener" aria-label="Facebook" className="flex h-9 w-9 items-center justify-center rounded-md bg-white/10 hover:bg-white/20">
              <Icon name="facebook" className="h-4 w-4" />
            </a>
            <a href={settings.zalo} target="_blank" rel="noopener" aria-label="Zalo" className="flex h-9 w-9 items-center justify-center rounded-md bg-white/10 hover:bg-white/20">
              <Icon name="message" className="h-4 w-4" />
            </a>
          </div>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-white">Danh mục sản phẩm</h3>
          <ul className="grid grid-cols-1 gap-2 text-[13px]">
            {categories.slice(0, 9).map((c) => (
              <li key={c.id}>
                <Link href={`/danh-muc/${c.slug}`} className="hover:text-white">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-white">Hỗ trợ &amp; Chính sách</h3>
          <ul className="space-y-2 text-[13px]">
            <li><Link href="/huong-dan-mua-hang" className="hover:text-white">Hướng dẫn mua hàng online</Link></li>
            <li><Link href="/hinh-thuc-thanh-toan" className="hover:text-white">Hình thức thanh toán</Link></li>
            <li><Link href="/chinh-sach-bao-hanh" className="hover:text-white">Chính sách bảo hành</Link></li>
            <li><Link href="/chinh-sach-doi-tra" className="hover:text-white">Chính sách đổi trả</Link></li>
            <li><Link href="/chinh-sach-giao-nhan" className="hover:text-white">Chính sách giao nhận</Link></li>
            <li><Link href="/chinh-sach-bao-mat" className="hover:text-white">Chính sách bảo mật</Link></li>
            <li><Link href="/tin-khuyen-mai-hot" className="hover:text-white">Khuyến mãi</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-white">Liên hệ</h3>
          <ul className="space-y-2.5 text-[13px]">
            <li className="flex gap-2.5">
              <Icon name="pin" className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
              {settings.address}
            </li>
            <li className="flex gap-2.5">
              <Icon name="clock" className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
              {settings.hours}
            </li>
            <li className="flex gap-2.5">
              <Icon name="phone" className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
              <a href={`tel:${settings.phone.replace(/\D/g, "")}`} className="font-semibold text-white hover:text-brand-300">
                {settings.phone} (tư vấn)
              </a>
            </li>
            <li className="flex gap-2.5">
              <Icon name="message" className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
              <a href={settings.zalo} target="_blank" rel="noopener" className="hover:text-white">
                Zalo: {settings.zalo.replace("https://zalo.me/", "")} — Quang Thắng
              </a>
            </li>
          </ul>
          <p className="mt-4 text-[12px] text-ink-400">MST: {settings.mst} — đăng ký kinh doanh do SKH&amp;ĐT TP.HCM cấp</p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="wrap flex flex-col items-center justify-between gap-2 py-4 text-[12px] text-ink-400 sm:flex-row">
          <span>© {new Date().getFullYear()} Viễn Thông Quang Thắng. Thiết bị chính hãng — giá tốt cho công trình.</span>
          <span>GPKD số {settings.mst}</span>
        </div>
      </div>
    </footer>
  );
}
