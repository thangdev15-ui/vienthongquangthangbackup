"use client";

import { useState } from "react";
import { Icon, Stars } from "@/components/ui";
import { ProductGrid } from "@/components/store/product";
import { ReviewForm, ReviewList } from "@/components/store/product-page";
import type { ProductRow, Review } from "@/lib/types";

type Spec = { id: string; name: string; value: string };
type TabKey = "summary" | "specs" | "warranty" | "reviews" | "related";

export function ProductDetailTabs({
  product,
  specs,
  reviews,
  related,
  phone,
  zalo,
}: {
  product: {
    id: string;
    shortDescription: string | null;
    description: string | null;
    warranty: string | null;
    rating: number;
    reviewCount: number;
  };
  specs: Spec[];
  reviews: Review[];
  related: ProductRow[];
  phone: string;
  zalo: string;
}) {
  const tabs: { key: TabKey; label: string; show: boolean }[] = [
    { key: "summary", label: "Mô tả", show: true },
    { key: "specs", label: "Thông số kỹ thuật", show: specs.length > 0 },
    { key: "warranty", label: "Bảo hành", show: Boolean(product.warranty) },
    { key: "reviews", label: `Đánh giá (${product.reviewCount})`, show: true },
    { key: "related", label: "Sản phẩm liên quan", show: related.length > 0 },
  ];
  const visibleTabs = tabs.filter((t) => t.show);
  const [active, setActive] = useState<TabKey>(visibleTabs[0]?.key ?? "summary");

  return (
    <section className="mt-10 overflow-hidden rounded-lg border border-line bg-white">
      <div className="flex gap-1 overflow-x-auto border-b border-line bg-ink-50/60 p-2 no-scrollbar">
        {visibleTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActive(tab.key)}
            className={`whitespace-nowrap rounded-md px-3.5 py-2 text-[13px] font-bold transition-colors ${
              active === tab.key ? "bg-brand-700 text-white shadow-sm" : "text-ink-600 hover:bg-white hover:text-brand-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-4 sm:p-6">
        {active === "summary" && (
          <div>
            <h2 className="mb-3 text-lg font-bold text-ink-950">Mô tả sản phẩm</h2>
            {product.shortDescription && <p className="mb-4 text-[15px] leading-7 text-ink-700">{product.shortDescription}</p>}
            {product.description ? (
              <div className="rich-content" dangerouslySetInnerHTML={{ __html: product.description }} />
            ) : (
              <p className="text-sm text-ink-500">Chi tiết sản phẩm vui lòng liên hệ hotline {phone} để được tư vấn.</p>
            )}
          </div>
        )}

        {active === "specs" && (
          <div>
            <h2 className="mb-3 text-lg font-bold text-ink-950">Thông số kỹ thuật</h2>
            <div className="overflow-hidden rounded-md border border-line">
              <table className="w-full text-sm">
                <tbody>
                  {specs.map((s, i) => (
                    <tr key={s.id} className={i % 2 === 0 ? "bg-white" : "bg-ink-50/50"}>
                      <th scope="row" className="w-1/3 border-b border-line px-4 py-2.5 text-left align-top text-[13px] font-semibold text-ink-600">
                        {s.name}
                      </th>
                      <td className="border-b border-line px-4 py-2.5 text-ink-900">{s.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {active === "warranty" && product.warranty && (
          <div>
            <h2 className="mb-3 text-lg font-bold text-ink-950">Bảo hành</h2>
            <div className="flex items-start gap-3 rounded-md border border-success-600/20 bg-success-50 p-4 text-sm text-success-700">
              <Icon name="shield" className="mt-0.5 h-5 w-5 shrink-0" />
              <p>
                <b>Chính sách bảo hành:</b> {product.warranty}. Sản phẩm lỗi do nhà sản xuất được đổi mới trong thời hạn bảo hành.
              </p>
            </div>
          </div>
        )}

        {active === "reviews" && (
          <div>
            <h2 className="mb-4 text-lg font-bold text-ink-950">Đánh giá của khách hàng</h2>
            {product.reviewCount > 0 && (
              <div className="mb-5 flex items-center gap-3 rounded-md border border-line bg-white p-4">
                <span className="text-4xl font-extrabold text-ink-950">{product.rating.toFixed(1)}</span>
                <div>
                  <Stars rating={product.rating} />
                  <p className="text-[13px] text-ink-500">{product.reviewCount} đánh giá đã xác nhận</p>
                </div>
              </div>
            )}
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-3 text-sm font-bold text-ink-900">Viết đánh giá</h3>
                <ReviewForm productId={product.id} />
              </div>
              <div>
                <h3 className="mb-3 text-sm font-bold text-ink-900">Các đánh giá</h3>
                <ReviewList reviews={reviews} />
              </div>
            </div>
          </div>
        )}

        {active === "related" && (
          <div>
            <h2 className="mb-5 text-lg font-bold text-ink-950">Sản phẩm liên quan</h2>
            <ProductGrid products={related} />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 border-t border-line bg-ink-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] font-medium text-ink-600">Cần tư vấn cấu hình phù hợp công trình?</p>
        <div className="flex gap-2">
          <a href={zalo} target="_blank" rel="noopener" className="btn-zalo h-9 px-3 text-[13px]">
            <Icon name="message" className="h-4 w-4" />
            Chat Zalo
          </a>
          <a href={`tel:${phone.replace(/\D/g, "")}`} className="btn-primary h-9 px-3 text-[13px]">
            <Icon name="phone" className="h-4 w-4" />
            {phone}
          </a>
        </div>
      </div>
    </section>
  );
}
