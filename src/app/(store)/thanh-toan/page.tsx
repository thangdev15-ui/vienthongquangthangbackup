import type { Metadata } from "next";
import { getSessionProfile } from "@/lib/auth";
import { getSettings } from "@/lib/data";
import { Breadcrumbs } from "@/components/ui";
import { CheckoutWrapper } from "@/components/store/checkout-wrapper";

export const metadata: Metadata = { title: "Thanh toán" };
export const dynamic = "force-dynamic";

export default async function ThanhToanPage() {
  const [settings, user] = await Promise.all([getSettings(), getSessionProfile()]);
  return (
    <div className="wrap py-6">
      <Breadcrumbs items={[{ label: "Giỏ hàng", href: "/gio-hang" }, { label: "Thanh toán" }]} />
      <h1 className="mt-3 mb-6 text-2xl font-extrabold text-ink-950">Thanh toán</h1>
      <CheckoutWrapper
        shippingFee={Number(settings.shipping_fee) || 0}
        bankName={settings.bank_name}
        bankAccount={settings.bank_account}
        bankOwner={settings.bank_owner}
        defaultName={user?.name ?? ""}
        defaultPhone={user?.phone ?? ""}
        defaultEmail={user?.email ?? ""}
      />
    </div>
  );
}
