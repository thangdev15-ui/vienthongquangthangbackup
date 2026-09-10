"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon, Price, Stars, Spinner } from "@/components/ui";
import { useShop } from "@/components/store/shops";
import { submitReviewAction } from "@/lib/actions";
import { discountPercent, formatVND, type ProductRow, type Review } from "@/lib/types";

/* ----------------------------------- Gallery ---------------------------------- */

export function Gallery({ images, name }: { images: { url: string }[]; name: string }) {
  const [idx, setIdx] = useState(0);
  const src = images.length ? images[Math.min(idx, images.length - 1)].url : null;
  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-lg border border-line bg-white">
        {src ? (
          <Image
            src={src}
            alt={name}
            fill
            priority
            sizes="(min-width:1024px) 42vw, 90vw"
            className="object-contain p-3 transition-transform duration-300 hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-ink-300">
            <Icon name="box" className="h-20 w-20" />
          </div>
        )}
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
          {images.map((img, i) => (
            <button
              key={img.url + i}
              onClick={() => setIdx(i)}
              aria-label={`Ảnh ${i + 1}`}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-md border bg-white ${
                i === idx ? "border-brand-600 ring-2 ring-brand-600/30" : "border-line hover:border-brand-400"
              }`}
            >
              <Image src={img.url} alt="" fill sizes="64px" className="object-contain p-1" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ----------------------------------- BuyBox ----------------------------------- */

const ZALO_BASE = "https://zalo.me/0941746161?text=";

export function BuyBox({ p, phone, zalo }: { p: ProductRow; phone: string; zalo: string }) {
  const { addToCart, toggleWishlist, isWishlisted } = useShop();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const canCart = p.priceType === "fixed";
  const off = discountPercent(p.price, p.salePrice);

  function buyNow() {
    addToCart(
      { productId: p.id, name: p.name, slug: p.slug, image: p.image, sku: p.sku, price: p.price, salePrice: p.salePrice, priceType: p.priceType, stock: p.stock },
      qty,
      true,
    );
    router.push("/thanh-toan");
  }

  return (
    <div className="space-y-4">
      <div>
        {p.brandName && (
          <Link href="/thuong-hieu" className="text-[13px] font-bold uppercase tracking-wide text-brand-700 hover:underline">
            {p.brandName}
          </Link>
        )}
        <h1 className="mt-1 text-xl font-bold leading-snug text-ink-950 sm:text-2xl">{p.name}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-[13px] text-ink-500">
          {p.sku && <span>Mã: <b className="text-ink-700">{p.sku}</b></span>}
          {p.reviewCount > 0 && (
            <span className="flex items-center gap-1.5">
              <Stars rating={p.rating} className="h-4 w-4" />
              <a href="#danh-gia" className="hover:text-brand-700">
                {p.rating.toFixed(1)} ({p.reviewCount} đánh giá)
              </a>
            </span>
          )}
          {canCart && (p.stock > 0 ? <span className="font-semibold text-success-600">Còn hàng</span> : <span className="font-semibold text-sale-600">Tạm hết hàng</span>)}
        </div>
      </div>

      <div className="rounded-lg border border-line bg-ink-50/60 p-4">
        <div className="flex flex-wrap items-baseline gap-3">
          <Price price={p.price} salePrice={p.salePrice} priceType={p.priceType} size="lg" />
          {off != null && (
            <span className="rounded bg-sale-600 px-1.5 py-0.5 text-[12px] font-bold text-white">TIẾT KIỆM {off}%</span>
          )}
        </div>
        {p.priceType !== "fixed" && (
          <p className="mt-1 text-[13px] text-ink-500">
            Gọi <a href={`tel:${phone.replace(/\D/g, "")}`} className="font-bold text-ink-900">{phone}</a> hoặc nhắn Zalo để nhận giá công trình.
          </p>
        )}
      </div>

      {p.shortDescription && <p className="text-sm leading-6 text-ink-600">{p.shortDescription}</p>}

      {canCart ? (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-md border border-ink-200 bg-white">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="flex h-11 w-11 items-center justify-center text-ink-600 hover:text-brand-700" aria-label="Giảm số lượng">
              <Icon name="minus" className="h-4 w-4" />
            </button>
            <span className="w-12 text-center font-bold">{qty}</span>
            <button onClick={() => setQty((q) => Math.min(999, q + 1))} className="flex h-11 w-11 items-center justify-center text-ink-600 hover:text-brand-700" aria-label="Tăng số lượng">
              <Icon name="plus" className="h-4 w-4" />
            </button>
          </div>
          <button onClick={() => addToCart({ productId: p.id, name: p.name, slug: p.slug, image: p.image, sku: p.sku, price: p.price, salePrice: p.salePrice, priceType: p.priceType, stock: p.stock }, qty)} className="btn-outline h-11 flex-1 min-w-[140px]">
            <Icon name="cart" className="h-4 w-4" />
            Thêm vào giỏ
          </button>
          <button onClick={buyNow} className="btn-primary h-11 flex-1 min-w-[120px]">
            Mua ngay
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          <a href={ZALO_BASE + encodeURIComponent(`Xin chào, em muốn nhận báo giá cho: ${p.name}`)} target="_blank" rel="noopener" className="btn-zalo h-11 flex-1 min-w-[140px]">
            <Icon name="message" className="h-4 w-4" />
            Nhận báo giá qua Zalo
          </a>
          <a href={`tel:${phone.replace(/\D/g, "")}`} className="btn-primary h-11 flex-1 min-w-[120px]">
            <Icon name="phone" className="h-4 w-4" />
            Gọi tư vấn
          </a>
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={() => toggleWishlist(p.id, p.name)} className={`btn-ghost h-9 text-[13px] ${isWishlisted(p.id) ? "text-sale-600" : ""}`}>
          <Icon name="heart" className="h-4 w-4" filled={isWishlisted(p.id)} />
          {isWishlisted(p.id) ? "Đã yêu thích" : "Yêu thích"}
        </button>
      </div>

      {p.warranty && (
        <div className="flex items-start gap-2.5 rounded-md border border-success-600/20 bg-success-50 p-3 text-[13px] text-success-700">
          <Icon name="shield" className="mt-0.5 h-4 w-4 shrink-0" />
          <span><b>Bảo hành:</b> {p.warranty}</span>
        </div>
      )}
    </div>
  );
}

/* ----------------------------------- Reviews ---------------------------------- */

export function ReviewForm({ productId, defaultName = "" }: { productId: string; defaultName?: string }) {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState(defaultName);
  const [content, setContent] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) {
      setError("Vui lòng viết nội dung đánh giá.");
      return;
    }
    setState("loading");
    const res = await submitReviewAction({ productId, rating, name, content });
    if (res.ok) {
      setState("ok");
      setContent("");
      setError("");
    } else {
      setState("err");
      setError(res.error ?? "Có lỗi xảy ra.");
    }
  }

  if (state === "ok") {
    return (
      <div className="rounded-md border border-success-600/20 bg-success-50 p-4 text-sm text-success-700">
        <b>Cảm ơn bạn!</b> Đánh giá đã được gửi và đang chờ xác nhận từ Viễn Thông Quang Thắng.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <span className="label">Điểm đánh giá</span>
        <div className="flex gap-1" role="radiogroup" aria-label="Điểm đánh giá">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={rating === i}
              aria-label={`${i} sao`}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(i)}
              className="text-amber-400"
            >
              <Icon name="star" filled={i <= (hover || rating)} className="h-6 w-6" />
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="label" htmlFor="rev-name">Họ tên</label>
        <input id="rev-name" value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Tên của bạn" />
      </div>
      <div>
        <label className="label" htmlFor="rev-content">Nhận xét của bạn</label>
        <textarea id="rev-content" value={content} onChange={(e) => setContent(e.target.value)} rows={4} className="textarea" placeholder="Chia sẻ trải nghiệm sử dụng sản phẩm…" />
      </div>
      {error && <p className="text-[13px] font-medium text-sale-600">{error}</p>}
      <button type="submit" disabled={state === "loading"} className="btn-primary">
        {state === "loading" && <Spinner />}
        Gửi đánh giá
      </button>
    </form>
  );
}

export function ReviewList({ reviews }: { reviews: Review[] }) {
  if (!reviews.length) {
    return <p className="text-sm text-ink-500">Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm này.</p>;
  }
  return (
    <ul className="space-y-4">
      {reviews.map((r) => (
        <li key={r.id} className="rounded-md border border-line bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-700">
                {r.customerName.charAt(0).toUpperCase()}
              </span>
              <div>
                <p className="text-sm font-semibold text-ink-900">{r.customerName}</p>
                <Stars rating={r.rating} className="h-3.5 w-3.5" />
              </div>
            </div>
            <time className="text-[12px] text-ink-400">{new Date(r.createdAt).toLocaleDateString("vi-VN")}</time>
          </div>
          <p className="mt-2.5 text-sm leading-6 text-ink-700">{r.content}</p>
        </li>
      ))}
    </ul>
  );
}
