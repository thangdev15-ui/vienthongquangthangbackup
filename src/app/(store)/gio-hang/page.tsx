import type { Metadata } from "next";
import { getSettings } from "@/lib/data";
import { Breadcrumbs } from "@/components/ui";
import { CartPageView } from "@/components/store/cart-page";

export const metadata: Metadata = { title: "Giỏ hàng" };
export const dynamic = "force-dynamic";

export default async function CartPage() {
  const settings = await getSettings();
  return (
    <div className="wrap py-6">
      <Breadcrumbs items={[{ label: "Giỏ hàng" }]} />
      <h1 className="mt-3 mb-6 text-2xl font-extrabold text-ink-950">Giỏ hàng</h1>
      <CartPageView shippingFee={Number(settings.shipping_fee) || 0} zalo={settings.zalo} />
    </div>
  );
}
