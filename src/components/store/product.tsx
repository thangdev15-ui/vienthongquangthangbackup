"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Icon, Price, Stars, Spinner } from "@/components/ui";
import { useShop } from "@/components/store/shops";
import { discountPercent, formatVND, type ProductRow } from "@/lib/types";

function toCart(p: ProductRow) {
  return {
    productId: p.id,
    name: p.name,
    slug: p.slug,
    image: p.image,
    sku: p.sku,
    price: p.price,
    salePrice: p.salePrice,
    priceType: p.priceType,
    stock: p.stock,
  };
}

const ZALO_BASE = "https://zalo.me/0941746161?text=";

/* --------------------------------- ProductCard -------------------------------- */

export function ProductCard({ p }: { p: ProductRow }) {
  const { addToCart, toggleWishlist, isWishlisted } = useShop();
  const off = discountPercent(p.price, p.salePrice);
  return (
    <article className="card group relative flex h-full flex-col overflow-hidden transition-all hover:border-brand-300 hover:shadow-md">
      <div className="relative aspect-square overflow-hidden bg-white">
        <Link href={`/san-pham/${p.slug}`} aria-label={p.name}>
          {p.image ? (
            <Image
              src={p.image}
              alt={p.name}
              fill
              sizes="(min-width:1280px) 25vw, (min-width:768px) 33vw, 50vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-ink-50 text-ink-300">
              <Icon name="box" className="h-12 w-12" />
            </div>
          )}
        </Link>
        {off != null && (
          <span className="absolute left-2 top-2 rounded bg-sale-600 px-1.5 py-0.5 text-[11px] font-bold text-white">-{off}%</span>
        )}
        {p.sale && off == null && <span className="absolute left-2 top-2 rounded bg-accent-600 px-1.5 py-0.5 text-[11px] font-bold text-white">GIẢM GIÁ</span>}
        <div className="absolute right-2 top-2 flex flex-col gap-1.5">
          <button
            onClick={() => toggleWishlist(p.id, p.name)}
            aria-label={isWishlisted(p.id) ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
            className={`flex h-8 w-8 items-center justify-center rounded-full border shadow-sm transition-colors ${
              isWishlisted(p.id) ? "border-sale-500 bg-sale-50 text-sale-600" : "border-line bg-white/95 text-ink-500 hover:text-sale-600"
            }`}
          >
            <Icon name="heart" className="h-4 w-4" filled={isWishlisted(p.id)} />
          </button>
        </div>
      </div>
      <div className="flex min-h-[168px] flex-1 flex-col gap-1 p-3">
        {p.brandName && (
          <span className="text-[11px] font-bold uppercase tracking-wide text-brand-700">{p.brandName}</span>
        )}
        <Link href={`/san-pham/${p.slug}`} className="line-clamp-2 min-h-[2.7em] text-[13.5px] font-semibold leading-snug text-ink-900 hover:text-brand-700">
          {p.name}
        </Link>
        {p.sku && <p className="text-[11px] text-ink-400">Mã: {p.sku}</p>}
        {p.reviewCount > 0 && (
          <div className="flex items-center gap-1.5">
            <Stars rating={p.rating} className="h-3.5 w-3.5" />
            <span className="text-[11px] text-ink-400">({p.reviewCount})</span>
          </div>
        )}
        <div className="mt-auto pt-1.5">
          <Price price={p.price} salePrice={p.salePrice} priceType={p.priceType} size="sm" />
        </div>
        <button onClick={() => addToCart(toCart(p), 1)} className="btn-outline mt-2 h-9 w-full text-[13px]">
          <Icon name="cart" className="h-4 w-4" />
          Thêm vào giỏ
        </button>
      </div>
    </article>
  );
}

/* --------------------------------- QuickView ---------------------------------- */

function QuickView({ p, onClose }: { p: ProductRow; onClose: () => void }) {
  const { addToCart } = useShop();
  const canCart = p.priceType === "fixed";
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-950/60" onClick={onClose} aria-hidden="true" />
      <div role="dialog" aria-label={p.name} className="card relative grid w-full max-w-2xl gap-0 overflow-hidden sm:grid-cols-2 animate-fade-up">
        <div className="relative aspect-square bg-white">
          {p.image ? (
            <Image src={p.image} alt={p.name} fill sizes="50vw" className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-ink-300">
              <Icon name="box" className="h-14 w-14" />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 p-5">
          <button onClick={onClose} aria-label="Đóng" className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-md bg-white/90 text-ink-500 shadow hover:text-ink-900">
            <Icon name="x" className="h-4 w-4" />
          </button>
          {p.brandName && <span className="text-[11px] font-bold uppercase tracking-wide text-brand-700">{p.brandName}</span>}
          <h3 className="text-base font-bold leading-snug text-ink-950">{p.name}</h3>
          {p.shortDescription && <p className="line-clamp-3 text-[13px] text-ink-500">{p.shortDescription}</p>}
          <Price price={p.price} salePrice={p.salePrice} priceType={p.priceType} size="md" />
          <div className="mt-auto flex flex-col gap-2 pt-3">
            {canCart ? (
              <button onClick={() => addToCart(toCart(p), 1)} className="btn-primary h-10 w-full">
                <Icon name="cart" className="h-4 w-4" />
                Thêm vào giỏ
              </button>
            ) : (
              <a href={ZALO_BASE + encodeURIComponent(`Xin chào, em muốn nhận báo giá cho: ${p.name}`)} target="_blank" rel="noopener" className="btn-zalo h-10 w-full">
                <Icon name="message" className="h-4 w-4" />
                Nhận báo giá
              </a>
            )}
            <Link href={`/san-pham/${p.slug}`} onClick={onClose} className="btn-outline h-10 w-full">
              Xem chi tiết
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- ProductGrid -------------------------------- */

export function ProductGrid({ products, columns = 4 }: { products: ProductRow[]; columns?: 3 | 4 | 5 }) {
  const [quick, setQuick] = useState<ProductRow | null>(null);
  const cols =
    columns === 5
      ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      : columns === 3
        ? "grid-cols-2 sm:grid-cols-3"
        : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";
  return (
    <>
      <div className={`grid items-stretch gap-3 sm:gap-4 ${cols}`}>
        {products.map((p) => (
          <div key={p.id} className="relative h-full">
            <ProductCard p={p} />
            <button
              onClick={() => setQuick(p)}
              className="absolute bottom-[72px] right-2 hidden h-8 items-center gap-1 rounded-full border border-line bg-white/95 px-2.5 text-[11px] font-semibold text-ink-600 shadow-sm hover:text-brand-700 lg:flex"
            >
              <Icon name="eye" className="h-3.5 w-3.5" />
              Xem nhanh
            </button>
          </div>
        ))}
      </div>
      {quick && <QuickView p={quick} onClose={() => setQuick(null)} />}
    </>
  );
}

/* ------------------------------- Toolbar (sort) ------------------------------- */

const SORTS = [
  { value: "newest", label: "Mới nhất" },
  { value: "price_asc", label: "Giá thấp đến cao" },
  { value: "price_desc", label: "Giá cao đến thấp" },
  { value: "bestselling", label: "Bán chạy" },
  { value: "rating", label: "Đánh giá cao" },
];

function ToolbarInner({ count, baseHref, showSort = true }: { count: number; baseHref: string; showSort?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const sort = sp.get("sort") ?? "newest";
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-ink-500">
        Hiển thị <span className="font-bold text-ink-900">{count.toLocaleString("vi-VN")}</span> sản phẩm
      </p>
      {showSort && (
        <label className="flex items-center gap-2 text-sm text-ink-600">
          <span className="hidden sm:inline">Sắp xếp:</span>
          <select
            value={sort}
            onChange={(e) => {
              const next = new URLSearchParams(sp.toString());
              if (e.target.value === "newest") next.delete("sort");
              else next.set("sort", e.target.value);
              next.delete("page");
              router.replace(`${pathname}?${next.toString()}`);
            }}
            className="input h-9 w-48 font-medium"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}

export function Toolbar(props: { count: number; baseHref: string; showSort?: boolean }) {
  return (
    <Suspense fallback={null}>
      <ToolbarInner {...props} />
    </Suspense>
  );
}

/* --------------------------------- FilterSidebar ------------------------------- */

const PRICE_RANGES = [
  { value: "", label: "Tất cả mức giá" },
  { value: "0-200000", label: "Dưới 200.000 ₫" },
  { value: "200000-1000000", label: "200.000 ₫ – 1.000.000 ₫" },
  { value: "1000000-5000000", label: "1.000.000 ₫ – 5.000.000 ₫" },
  { value: "5000000-100000000", label: "Trên 5.000.000 ₫" },
];

function FiltersInner({
  brands,
  showPrice,
  showBrand,
}: {
  brands: { id: string; name: string }[];
  showPrice: boolean;
  showBrand: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const brandId = sp.get("brand") ?? "";
  const price = sp.get("price") ?? "";
  const inStock = sp.get("stock") === "1";
  const hasFilters = brandId || price || inStock;

  function set(key: string, value: string) {
    const next = new URLSearchParams(sp.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    router.replace(`${pathname}?${next.toString()}`);
  }

  return (
    <aside className="card divide-y divide-line p-4 lg:sticky lg:top-32" aria-label="Bộ lọc sản phẩm">
      <div className="flex items-center justify-between pb-3">
        <h2 className="flex items-center gap-2 text-sm font-bold text-ink-950">
          <Icon name="filter" className="h-4 w-4 text-brand-700" />
          Lọc sản phẩm
        </h2>
        {hasFilters && (
          <button onClick={() => router.replace(pathname)} className="text-[12px] font-semibold text-brand-700 hover:underline">
            Xoá tất cả
          </button>
        )}
      </div>
      {showBrand && brands.length > 0 && (
        <div className="py-3">
          <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-ink-500">Thương hiệu</p>
          <select value={brandId} onChange={(e) => set("brand", e.target.value)} className="input h-9 text-[13px]">
            <option value="">Tất cả thương hiệu</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      )}
      {showPrice && (
        <div className="py-3">
          <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-ink-500">Khoảng giá</p>
          <select value={price} onChange={(e) => set("price", e.target.value)} className="input h-9 text-[13px]">
            {PRICE_RANGES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-[11px] text-ink-400">Sản phẩm giá &quot;Liên hệ&quot; không áp dụng lọc theo giá.</p>
        </div>
      )}
      <div className="py-3">
        <label className="flex cursor-pointer items-center gap-2 text-[13px] font-medium text-ink-800">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => set("stock", e.target.checked ? "1" : "")}
            className="h-4 w-4 rounded border-ink-300 accent-brand-700"
          />
          Chỉ hiển thị còn hàng
        </label>
      </div>
    </aside>
  );
}

export function FilterSidebar(props: { brands: { id: string; name: string }[]; showPrice?: boolean; showBrand?: boolean }) {
  return (
    <Suspense fallback={null}>
      <FiltersInner showPrice showBrand {...props} />
    </Suspense>
  );
}

export { formatVND };
