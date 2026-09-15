"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon, Spinner } from "@/components/ui";
import { useShop, type CartItem } from "@/components/store/shops";
import { placeOrderAction } from "@/lib/actions";
import { formatVND, PAYMENT_METHODS, PROVINCES } from "@/lib/types";

export function CheckoutForm({
  items,
  shippingFee,
  bankName,
  bankAccount,
  bankOwner,
  defaultName = "",
  defaultPhone = "",
  defaultEmail = "",
}: {
  items: CartItem[];
  shippingFee: number;
  bankName: string;
  bankAccount: string;
  bankOwner: string;
  defaultName?: string;
  defaultPhone?: string;
  defaultEmail?: string;
}) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "err">("idle");
  const [error, setError] = useState("");
  const hasContactItems = items.some((item) => item.priceType !== "fixed");
  const [form, setForm] = useState({
    customerName: defaultName,
    phone: defaultPhone,
    email: defaultEmail,
    address: "",
    province: "TP. Hồ Chí Minh",
    district: "",
    ward: "",
    note: "",
    paymentMethod: items.some((item) => item.priceType !== "fixed") ? "contact" : "cod",
  });
  const subtotal = items.reduce((s, c) => s + ((c.salePrice ?? c.price) ?? 0) * c.qty, 0);
  const total = Math.max(0, subtotal + shippingFee);

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setError("");
    const res = await placeOrderAction({
      items: items.map((c) => ({ productId: c.productId, quantity: c.qty })),
      customerName: form.customerName,
      phone: form.phone,
      email: form.email,
      address: form.address,
      province: form.province,
      district: form.district,
      ward: form.ward,
      note: form.note,
      paymentMethod: form.paymentMethod,
    });
    if (res.ok && res.code) {
      router.push(`/dat-hang-thanh-cong/${res.code}`);
      return;
    }
    setState("err");
    setError(res.error ?? "Đặt hàng thất bại.");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <form onSubmit={submit} className="card space-y-5 p-5 sm:p-6" noValidate>
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-ink-950">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-700 text-[13px] font-bold text-white">1</span>
            Thông tin khách hàng &amp; giao hàng
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="co-name">Họ và tên *</label>
              <input id="co-name" required value={form.customerName} onChange={(e) => set("customerName", e.target.value)} className="input" placeholder="Nguyễn Văn A" />
            </div>
            <div>
              <label className="label" htmlFor="co-phone">Số điện thoại *</label>
              <input id="co-phone" required type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} className="input" placeholder="09xx xxx xxx" />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="co-email">Email</label>
              <input id="co-email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className="input" placeholder="email@example.com" />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="co-address">Địa chỉ *</label>
              <input id="co-address" required value={form.address} onChange={(e) => set("address", e.target.value)} className="input" placeholder="Số nhà, đường, thôn xóm…" />
            </div>
            <div>
              <label className="label" htmlFor="co-province">Tỉnh / thành phố *</label>
              <select id="co-province" value={form.province} onChange={(e) => set("province", e.target.value)} className="input">
                {PROVINCES.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="co-district">Quận / huyện</label>
              <input id="co-district" value={form.district} onChange={(e) => set("district", e.target.value)} className="input" placeholder="VD: Quận Gò Vấp" />
            </div>
            <div>
              <label className="label" htmlFor="co-ward">Phường / xã</label>
              <input id="co-ward" value={form.ward} onChange={(e) => set("ward", e.target.value)} className="input" placeholder="VD: P. Thông Tây Hội" />
            </div>
            <div>
              <label className="label" htmlFor="co-note">Ghi chú đơn hàng</label>
              <input id="co-note" value={form.note} onChange={(e) => set("note", e.target.value)} className="input" placeholder="Ghi chú thêm (nếu có)" />
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-ink-950">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-700 text-[13px] font-bold text-white">2</span>
            Hình thức thanh toán
          </h2>
          <div className="space-y-2">
            {Object.entries(PAYMENT_METHODS).filter(([value]) => !hasContactItems || value === "contact").map(([value, label]) => (
              <label
                key={value}
                className={`flex cursor-pointer items-start gap-3 rounded-md border p-3.5 transition-colors ${
                  form.paymentMethod === value ? "border-brand-600 bg-brand-50/60" : "border-line hover:border-brand-300"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value={value}
                  checked={form.paymentMethod === value}
                  onChange={() => set("paymentMethod", value)}
                  className="mt-1 accent-brand-700"
                />
                <span>
                  <span className="block text-sm font-semibold text-ink-900">{label}</span>
                  {value === "cod" && <span className="block text-[13px] text-ink-500">Kiểm tra hàng và thanh toán khi nhận.</span>}
                  {value === "bank" && (
                    <span className="block text-[13px] text-ink-500">
                      {bankAccount ? (
                        <>
                          Ngân hàng {bankName} — STK <b>{bankAccount}</b> (CN: {bankOwner})
                        </>
                      ) : (
                        "Thông tin chuyển khoản sẽ được nhân viên gửi qua Zalo/điện thoại."
                      )}
                    </span>
                  )}
                  {value === "contact" && <span className="block text-[13px] text-ink-500">Đội ngũ kỹ thuật sẽ gọi xác nhận đơn hàng.</span>}
                </span>
              </label>
            ))}
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-md border border-sale-500/30 bg-sale-50 p-3 text-sm font-medium text-sale-700">
            <Icon name="alert-circle" className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <button type="submit" disabled={state === "loading"} className="btn-primary h-12 w-full text-base">
          {state === "loading" ? <Spinner /> : <Icon name="check-circle" className="h-5 w-5" />}
          {hasContactItems ? "Gửi yêu cầu đặt hàng" : `Đặt hàng (${formatVND(total)})`}
        </button>
      </form>

      <aside className="card h-fit p-5">
        <h2 className="mb-4 text-base font-bold text-ink-950">Tóm tắt đơn hàng</h2>
        <ul className="max-h-72 space-y-3 overflow-y-auto thin-scrollbar">
          {items.map((c) => (
            <li key={c.productId} className="flex items-center gap-3">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-ink-100">
                {c.image && <Image src={c.image} alt="" fill sizes="48px" className="object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-ink-900">{c.name}</p>
                <p className="text-[12px] text-ink-400">x{c.qty}</p>
              </div>
              <span className={`text-[13px] font-semibold ${c.priceType === "fixed" ? "text-ink-900" : "text-accent-600"}`}>{c.priceType === "fixed" ? formatVND(((c.salePrice ?? c.price) ?? 0) * c.qty) : "Liên hệ"}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-500">Tạm tính</dt>
            <dd className={`font-semibold ${hasContactItems ? "text-accent-600" : "text-ink-900"}`}>{hasContactItems ? "Liên hệ" : formatVND(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-500">Phí vận chuyển</dt>
            <dd className="font-semibold text-ink-900">{shippingFee > 0 ? formatVND(shippingFee) : "Miễn phí"}</dd>
          </div>
          <div className="flex justify-between border-t border-line pt-3 text-base">
            <dt className="font-bold text-ink-950">Tổng cộng</dt>
            <dd className={`font-extrabold ${hasContactItems ? "text-accent-600" : "text-brand-700"}`}>{hasContactItems ? "Liên hệ" : formatVND(total)}</dd>
          </div>
        </dl>
        <p className="mt-4 flex items-start gap-2 text-[12px] leading-5 text-ink-500">
          <Icon name="shield" className="mt-0.5 h-4 w-4 shrink-0 text-success-600" />
          Chúng tôi sẽ gọi điện xác nhận trước khi giao hàng. Sản phẩm được kiểm tra kỹ trước khi đóng gói.
        </p>
      </aside>
    </div>
  );
}
