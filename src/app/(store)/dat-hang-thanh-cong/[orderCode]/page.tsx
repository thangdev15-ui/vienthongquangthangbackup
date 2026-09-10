import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderWithItems, getSettings } from "@/lib/data";
import { Icon } from "@/components/ui";
import { formatDate, formatVND, PAYMENT_METHODS } from "@/lib/types";

export const metadata: Metadata = { title: "Đặt hàng thành công" };
export const dynamic = "force-dynamic";

export default async function OrderSuccessPage({ params }: { params: Promise<{ orderCode: string }> }) {
  const { orderCode } = await params;
  const data = await getOrderWithItems(orderCode);
  if (!data) notFound();
  const { order, items } = data;
  const settings = await getSettings();

  return (
    <div className="wrap max-w-3xl py-10">
      <div className="card overflow-hidden">
        <div className="border-b border-line bg-success-50 px-6 py-8 text-center">
          <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-600 text-white">
            <Icon name="check" className="h-8 w-8" />
          </span>
          <h1 className="text-2xl font-extrabold text-ink-950">Đặt hàng thành công!</h1>
          <p className="mt-2 text-sm text-ink-600">
            Mã đơn hàng của bạn: <b className="text-base text-brand-700">{order.orderCode}</b>
          </p>
          <p className="mt-1 text-[13px] text-ink-500">
            Chúng tôi sẽ gọi điện xác nhận đơn hàng trong giờ làm việc ({settings.hours}).
          </p>
        </div>
        <div className="p-6">
          <h2 className="mb-3 text-sm font-bold text-ink-950">Thông tin đơn hàng</h2>
          <dl className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
            <div className="flex justify-between gap-3"><dt className="text-ink-500">Khách hàng</dt><dd className="font-semibold">{order.customerName}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-ink-500">Điện thoại</dt><dd className="font-semibold">{order.phone}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-ink-500">Thanh toán</dt><dd className="font-semibold">{PAYMENT_METHODS[order.paymentMethod]}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-ink-500">Đặt lúc</dt><dd className="font-semibold">{formatDate(order.createdAt)}</dd></div>
            <div className="sm:col-span-2 flex justify-between gap-3"><dt className="text-ink-500">Địa chỉ giao</dt><dd className="text-right font-semibold">{order.ward}, {order.district}, {order.province} — {order.address}</dd></div>
          </dl>

          {order.paymentMethod === "bank" && (
            <div className="mt-4 rounded-md border border-brand-200 bg-brand-50/60 p-4 text-[13px] text-ink-700">
              <b>Vui lòng chuyển khoản</b> theo thông tin nhân viên gửi qua điện thoại/Zalo sau khi xác nhận đơn.
              Ghi chú chuyển khoản: mã đơn <b>{order.orderCode}</b>.
            </div>
          )}

          <h2 className="mb-2 mt-6 text-sm font-bold text-ink-950">Sản phẩm trong đơn</h2>
          <ul className="divide-y divide-line">
            {items.map((it) => (
              <li key={it.id} className="flex items-center gap-3 py-3">
                <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-ink-100">
                  {it.productImage && <Image src={it.productImage} alt="" fill sizes="48px" className="object-cover" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-ink-900">{it.productName}</p>
                  <p className="text-[12px] text-ink-400">{formatVND(it.unitPrice)} × {it.quantity}</p>
                </div>
                <span className="text-[13px] font-bold">{formatVND(it.subtotal)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-1.5 border-t border-line pt-3 text-sm">
            <div className="flex justify-between"><dt className="text-ink-500">Tạm tính</dt><dd className="font-semibold">{formatVND(order.subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-500">Vận chuyển</dt><dd className="font-semibold">{order.shippingFee > 0 ? formatVND(order.shippingFee) : "Miễn phí"}</dd></div>
            <div className="flex justify-between pt-1 text-base"><dt className="font-bold">Tổng cộng</dt><dd className="font-extrabold text-brand-700">{formatVND(order.total)}</dd></div>
          </dl>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/san-pham" className="btn-primary h-11 px-6">
              Tiếp tục mua hàng
            </Link>
            <Link href="/tai-khoan?tab=orders" className="btn-outline h-11 px-6">
              Xem đơn hàng
            </Link>
            <a href={settings.zalo} target="_blank" rel="noopener" className="btn-zalo h-11 px-6">
              <Icon name="message" className="h-4 w-4" />
              Xác nhận qua Zalo
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
