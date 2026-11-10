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

const NAV_ICONS: Record<string, IconName> = {
  "camera-quan-sat": "eye", "day-cap-mang": "cable", "phu-kien-mang": "grid", "thiet-bi-mang": "server",
  "tu-mang": "box", "phu-kien-quang": "cable", "thiet-bi-quang": "zap", "day-cap-quang": "zap",
  "cap-mang": "cable", "cap-quang": "zap", "phu-kien-camera": "eye", "camera": "eye",
  "thang-mang-cap": "layers", "den-nang-luong-mat-troi": "sun", "den-nlmt": "sun",
};

type Settings = Record<string, string>;

/* ------------------------------ Announcement bar ----------------------------- */

export function AnnouncementBar({ text, settings }: { text: string; settings: Settings }) {
  return (
    <div className="bg-brand-800 text-[13px] text-white">
      <div className="wrap flex min-h-10 items-center justify-between gap-4 py-1">
        <div className="flex min-w-0 items-center gap-4">
          <p className="hidden truncate font-semibold text-brand-50 lg:block">{text}</p>
          <span className="flex min-w-0 items-center gap-1.5">
            <Icon name="pin" className="h-4 w-4 shrink-0 text-accent-100" />
            <span className="truncate">{settings.address}</span>
          </span>
          <a href={`tel:${settings.phone.replace(/\D/g, "")}`} className="hidden shrink-0 items-center gap-1.5 font-bold text-white hover:text-accent-100 md:flex">
            <Icon name="phone" className="h-4 w-4 text-accent-100" />
            {settings.phone}
          </a>
        </div>
        <div className="hidden shrink-0 items-center gap-5 sm:flex">
          <Link href="/ho-so-nang-luc" className="hover:text-accent-100">
            Hồ sơ năng lực
          </Link>
          <Link href="/tai-khoan?tab=orders" className="hidden hover:text-white lg:inline">
            Theo dõi đơn hàng
          </Link>
          <Link href="/tin-tuc" className="hover:text-accent-100">
            Tin tức công nghệ
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
          <span className="flex items-center gap-1.5">
            <Icon name="clock" className="h-4 w-4 text-brand-700" />
            {settings.hours}
          </span>
        </div>
        <Link href="/lien-he" className="hidden font-semibold text-brand-700 hover:text-brand-800 sm:inline">
          Liên hệ
        </Link>
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
    const query = q.trim();
    if (query.length < 2) return;
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch("/api/suggestions?q=" + encodeURIComponent(query), { signal: controller.signal });
        if (res.ok) setSug(await res.json());
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          /* Search suggestions are optional and should not interrupt typing. */
        }
      }
    }, 350);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
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
          className="input h-12 rounded-l-md rounded-r-none pr-12"
        />
        <button
          type="submit"
          aria-label="Tìm kiếm"
          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-md bg-brand-700 text-white transition-colors hover:bg-brand-800"
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
                    <span className="text-xs font-bold text-accent-600">LIÊN HỆ</span>
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

export function Header({ settings, onOpenMobile, categories }: { settings: Settings; onOpenMobile: () => void; categories: NavCategory[] }) {
  const quickCategories = categories.slice(0, 9);
  const pathname = usePathname();
  return (
    <div className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="wrap flex min-h-[76px] items-center gap-2.5 sm:gap-3">
        <button
          onClick={onOpenMobile}
          className="flex h-10 w-10 items-center justify-center rounded-md text-ink-700 hover:bg-ink-50 lg:hidden"
          aria-label="Mở menu"
        >
          <Icon name="menu" className="h-6 w-6" />
        </button>
        <Link href="/" className="flex h-14 w-[138px] shrink-0 items-center px-1 xl:w-[150px] 2xl:w-[178px]" aria-label="Trang chủ Viễn Thông Quang Thắng">
          {/* The raw file is intentionally used here. Vercel's image optimizer
              caused a production 500 for this header logo on 10/11/2026. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logoqt.png?v=2" alt="Viễn Thông Quang Thắng" width={300} height={106} className="h-auto w-full object-contain" />
        </Link>
        <div className="hidden min-w-0 flex-[0.75] lg:block lg:max-w-[230px] xl:max-w-[310px] 2xl:max-w-[440px]">
          <SearchBar />
        </div>
        <nav aria-label="Danh mục nhanh" className="hidden min-w-0 flex-[2.25] items-stretch gap-0.5 lg:flex xl:gap-1">
          {quickCategories.map((cat) => {
            const active = pathname === `/danh-muc/${cat.slug}` || pathname.startsWith(`/danh-muc/${cat.slug}/`);
            return (
              <Link
                key={cat.id}
                href={`/danh-muc/${cat.slug}`}
                className={`flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-md px-1 text-center text-[10px] font-semibold leading-tight transition-colors xl:text-[11px] 2xl:text-[12px] ${
                  active ? "bg-brand-600 text-white" : "text-ink-700 hover:bg-brand-50 hover:text-brand-700"
                }`}
              >
                <Icon name={NAV_ICONS[cat.slug] ?? "box"} className="h-4.5 w-4.5 shrink-0" />
                <span className="line-clamp-2">{cat.name}</span>
              </Link>
            );
          })}
          <Link href="/san-pham" className="flex min-h-12 shrink-0 items-center justify-center rounded-md px-2 text-center text-[11px] font-bold text-accent-600 hover:bg-accent-50 hover:text-accent-700">
            Xem thêm
          </Link>
        </nav>
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
  const pathname = usePathname();
  return (
    <nav aria-label="Điều hướng chính" className="relative z-30 border-b border-line bg-white lg:hidden">
      <div className="wrap hidden items-stretch gap-1 overflow-hidden py-1.5 lg:flex">
        <div className="flex min-w-0 flex-1 items-stretch gap-1">
          {categories.slice(0, 10).map((cat) => {
            const active = pathname === `/danh-muc/${cat.slug}` || pathname.startsWith(`/danh-muc/${cat.slug}/`);
            return (
              <Link
                key={cat.id}
                href={`/danh-muc/${cat.slug}`}
                className={`flex min-h-12 min-w-0 flex-1 items-center justify-center gap-1.5 px-2.5 text-center text-[12px] font-semibold leading-tight transition-colors ${
                  active ? "bg-brand-700 text-white" : "bg-brand-500 text-white hover:bg-brand-600"
                }`}
              >
                <Icon name={NAV_ICONS[cat.slug] ?? "box"} className="h-4 w-4 shrink-0" />
                {cat.name}
              </Link>
            );
          })}
        </div>
        <Link href="/khuyen-mai" className="flex min-h-12 w-28 shrink-0 items-center justify-center gap-1 bg-sale-600 px-2 text-center text-[12px] font-bold text-white hover:bg-sale-700">
          <Icon name="zap" className="h-4 w-4" />
          Khuyến mãi
        </Link>
      </div>
      {/* Mobile quick links */}
      <div className="flex gap-1 overflow-x-auto border-t border-line px-4 py-2 no-scrollbar lg:hidden">
        {[
          { href: "/san-pham", label: "Sản phẩm" },
          { href: "/thuong-hieu", label: "Thương hiệu" },
          { href: "/khuyen-mai", label: "Khuyến mãi" },
          { href: "/tin-tuc", label: "Tin tức" },
          { href: "/ho-so-nang-luc", label: "Hồ sơ năng lực" },
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
            { href: "/ho-so-nang-luc", label: "Hồ sơ năng lực" },
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
  const { cartCount, wishlist, setCartOpen } = useShop();
  return (
    <div className="fixed bottom-20 right-4 z-40 flex flex-col gap-2.5 lg:top-1/2 lg:bottom-auto lg:-translate-y-1/2">
      <button
        onClick={() => setCartOpen(true)}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-ink-950 text-white shadow-lg transition-transform hover:scale-105"
        aria-label="Giỏ hàng"
      >
        <Icon name="cart" className="h-6 w-6" />
        {cartCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-600 px-1 text-[10px] font-bold text-white">
            {cartCount}
          </span>
        )}
      </button>
      <Link
        href="/tai-khoan?tab=wishlist"
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white text-ink-800 shadow-lg ring-1 ring-line transition-transform hover:scale-105 hover:text-brand-700"
        aria-label="Yêu thích"
      >
        <Icon name="heart" className="h-6 w-6" />
        {wishlist.length > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-600 px-1 text-[10px] font-bold text-white">
            {wishlist.length}
          </span>
        )}
      </Link>
      <Link
        href="/tai-khoan"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-ink-800 shadow-lg ring-1 ring-line transition-transform hover:scale-105 hover:text-brand-700"
        aria-label="Tài khoản"
      >
        <Icon name="user" className="h-6 w-6" />
      </Link>
      <a
        href={settings.zalo}
        target="_blank"
        rel="noopener"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0068ff] text-[12px] font-extrabold text-white shadow-lg transition-transform hover:scale-105"
        aria-label="Mở Zalo"
      >
        Zalo
      </a>
      <a
        href={settings.facebook}
        target="_blank"
        rel="noopener"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1877f2] text-white shadow-lg transition-transform hover:scale-105"
        aria-label="Mở Facebook"
      >
        <Icon name="facebook" className="h-7 w-7" />
      </a>
    </div>
  );
}

export function SideRails() {
  return (
    <div className="side-rails" aria-label="Quảng bá thương hiệu">
      <div className="side-rail-slot">
        <Link href="/thuong-hieu" className="side-rail side-rail-left" aria-label="Xem thương hiệu phân phối">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/quangthangshop.jpg" alt="Quang Thắng Telecom" className="side-rail-frame" />
        </Link>
      </div>
      <div />
      <div className="side-rail-slot">
        <Link href="/thuong-hieu" className="side-rail side-rail-right" aria-label="Xem thương hiệu phân phối">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/quangthangshop.jpg" alt="Quang Thắng Telecom" className="side-rail-frame" />
        </Link>
      </div>
    </div>
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

export function Footer({ categories: _categories, settings }: { categories: NavCategory[]; settings: Settings }) {
  return (
    <footer
      className="relative mt-14 flex min-h-[min(100svh,52rem)] overflow-hidden bg-brand-950 pb-20 text-white lg:pb-0"
      style={{ minHeight: "min(100svh, 52rem)" }}
    >
      <div className="absolute inset-0"><Image src="/imported/company-profile/nenfooter.jpeg" alt="" fill sizes="100vw" className="object-cover" /></div>
      <div className="absolute inset-0 bg-[#123F69]/55" />
      <div className="wrap relative z-10 flex w-full flex-col py-12 sm:py-16 lg:py-20">
        <div className="max-w-6xl">
          <p className="text-xs font-extrabold uppercase tracking-[.2em] text-white/75">Quang Thắng Telecom</p>
          <h2 className="mt-4 text-4xl font-extrabold tracking-normal text-white sm:text-5xl">Liên hệ với chúng tôi</h2>
        </div>
        <div className="mt-7 grid gap-10 border-t border-white/35 pt-7 text-sm leading-7 sm:grid-cols-2 lg:mt-10 lg:grid-cols-[1fr_1.15fr] lg:gap-20 lg:pt-9">
          <div>
            <h3 className="text-lg font-extrabold text-white">Trụ sở</h3>
            <p className="mt-4 max-w-md text-white/90">{settings.address}</p>
            <p className="mt-2 text-white/90">MST: {settings.mst}</p>
            <a href={`tel:${settings.phone.replace(/\D/g, "")}`} className="mt-4 block w-fit font-bold text-white hover:text-white/75">Điện thoại: {settings.phone}</a>
            <a href={`mailto:${settings.email}`} className="mt-2 block w-fit font-bold text-white hover:text-white/75">Email: {settings.email}</a>
            <div className="mt-9"><h3 className="text-lg font-extrabold text-white">Hỗ trợ tư vấn</h3><a href={settings.zalo} target="_blank" rel="noopener" className="mt-4 inline-flex h-11 items-center gap-2 border border-white/55 px-4 font-bold hover:bg-white/15"><Icon name="message" className="h-4 w-4" />Nhắn Zalo báo giá</a></div>
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white">Văn phòng giao dịch</h3>
            <p className="mt-4 max-w-xl text-white/90">{settings.address}</p>
            <a href={`tel:${settings.phone.replace(/\D/g, "")}`} className="mt-4 block w-fit font-bold text-white hover:text-white/75">Điện thoại: {settings.phone}</a>
            <a href={`mailto:${settings.email}`} className="mt-2 block w-fit font-bold text-white hover:text-white/75">Email: {settings.email}</a>
            <div className="mt-9"><h3 className="text-lg font-extrabold text-white">Mạng xã hội</h3><div className="mt-4 flex gap-3"><a href={settings.facebook} target="_blank" rel="noopener" aria-label="Facebook" className="flex h-10 w-10 items-center justify-center bg-[#1877f2] text-white hover:opacity-80"><Icon name="facebook" className="h-5 w-5" /></a><a href={settings.zalo} target="_blank" rel="noopener" aria-label="Zalo" className="flex h-10 w-10 items-center justify-center bg-white text-brand-900 hover:opacity-80"><Icon name="message" className="h-5 w-5" /></a></div></div>
          </div>
        </div>
        <div className="mt-auto border-t border-white/20 pt-5 text-xs text-white/65 sm:flex sm:items-center sm:justify-between"><span>© {new Date().getFullYear()} Viễn Thông Quang Thắng. All rights reserved.</span><span className="mt-2 block sm:mt-0">Thiết bị chính hãng · Tư vấn kỹ thuật · Giao hàng toàn quốc</span></div>
      </div>
    </footer>
  );
}
