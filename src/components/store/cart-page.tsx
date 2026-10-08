"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon, EmptyState } from "@/components/ui";
import { useShop } from "@/components/store/shops";
import { formatVND } from "@/lib/types";

export function CartPageView({ shippingFee, zalo }: { shippingFee: number; zalo: string }) {
  const { cart, cartSubtotal, cartCount, updateQty, removeFromCart, clearCart } = useShop();
  const router = useRouter();
  const total = Math.max(0, cartSubtotal + shippingFee);

  if (cart.length === 0) {
    return (
      <EmptyState
        icon="cart"
        title="Giỏ hàng của bạn đang trống"
        description="Khám phá kho thiết bị viễn thông chính hãng hoặc liên hệ hotline 0947.106.161 để đặt hàng theo yêu cầu."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Link href="/san-pham" className="btn-primary">
              Bắt đầu mua hàng
            </Link>
            <a href={zalo} target="_blank" rel="noopener" className="btn-zalo">
              <Icon name="message" className="h-4 w-4" />
              Đặt hàng qua Zalo
            </a>
          </div>
        }
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-admin min-w-[560px]">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Đơn giá</th>
                <th>Số lượng</th>
                <th>Tạm tính</th>
                <th aria-label="Thao tác" />
              </tr>
            </thead>
            <tbody>
              {cart.map((c) => (
                <tr key={c.productId}>
                  <td>
                    <div className="flex items-center gap-3">
                      <Link href={`/san-pham/${c.slug}`} className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-ink-100">
                        {c.image && <Image src={c.image} alt="" fill sizes="56px" className="object-cover" />}
                      </Link>
                      <div className="min-w-0">
                        <Link href={`/san-pham/${c.slug}`} className="line-clamp-2 text-[13px] font-semibold text-ink-900 hover:text-brand-700">
                          {c.name}
                        </Link>
                        {c.sku && <p className="text-[11px] text-ink-400">Mã: {c.sku}</p>}
                      </div>
                    </div>
                  </td>
                  <td className={`whitespace-nowrap ${c.priceType === "fixed" ? "" : "font-semibold text-accent-600"}`}>{c.priceType === "fixed" ? formatVND(c.salePrice ?? c.price) : "Liên hệ"}</td>
                  <td>
                    <div className="flex items-center rounded-md border border-line">
                      <button onClick={() => updateQty(c.productId, c.qty - 1)} className="flex h-8 w-8 items-center justify-center text-ink-600 hover:text-brand-700" aria-label="Giảm">
                        <Icon name="minus" className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-9 text-center text-sm font-semibold">{c.qty}</span>
                      <button onClick={() => updateQty(c.productId, c.qty + 1)} className="flex h-8 w-8 items-center justify-center text-ink-600 hover:text-brand-700" aria-label="Tăng">
                        <Icon name="plus" className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className={`whitespace-nowrap font-bold ${c.priceType === "fixed" ? "" : "text-accent-600"}`}>{c.priceType === "fixed" ? formatVND(((c.salePrice ?? c.price) ?? 0) * c.qty) : "Liên hệ"}</td>
                  <td>
                    <button onClick={() => removeFromCart(c.productId)} className="text-ink-400 hover:text-sale-600" aria-label={`Xoá ${c.name}`}>
                      <Icon name="trash" className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-line p-3">
          <Link href="/san-pham" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline">
            <Icon name="chevron-left" className="h-4 w-4" />
            Tiếp tục mua hàng
          </Link>
          <button onClick={clearCart} className="text-sm font-medium text-ink-500 hover:text-sale-600">
            Xoá tất cả ({cartCount} sản phẩm)
          </button>
        </div>
      </div>

      <aside className="card h-fit p-5">
        <h2 className="mb-4 text-base font-bold text-ink-950">Tóm tắt giỏ hàng</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-500">Tạm tính ({cartCount} sp)</dt>
            <dd className="font-semibold">{cart.some((item) => item.priceType !== "fixed") ? "Liên hệ" : formatVND(cartSubtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-500">Vận chuyển</dt>
            <dd className="font-semibold">{shippingFee > 0 ? formatVND(shippingFee) : "Miễn phí"}</dd>
          </div>
          <div className="flex justify-between border-t border-line pt-3 text-base">
            <dt className="font-bold">Tổng cộng</dt>
            <dd className="font-extrabold text-brand-700">{cart.some((item) => item.priceType !== "fixed") ? "Liên hệ" : formatVND(total)}</dd>
          </div>
        </dl>
        <button onClick={() => router.push("/thanh-toan")} className="btn-primary mt-4 h-12 w-full text-base">
          Tiến hành thanh toán
        </button>
        <a href={zalo} target="_blank" rel="noopener" className="btn-zalo mt-2 h-10 w-full">
          <Icon name="message" className="h-4 w-4" />
          Thanh toán qua Zalo
        </a>
        <p className="mt-4 text-[12px] leading-5 text-ink-400">
          Sản phẩm chưa niêm yết giá vẫn có thể thêm vào giỏ. Nhân viên sẽ gọi xác nhận và báo giá trước khi giao hàng.
        </p>
      </aside>
    </div>
  );
}
