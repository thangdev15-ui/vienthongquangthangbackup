"use client";

import Link from "next/link";
import { EmptyState, Icon } from "@/components/ui";
import { useShop } from "@/components/store/shops";
import { CheckoutForm } from "@/components/store/checkout";

export function CheckoutWrapper({
  shippingFee,
  bankName,
  bankAccount,
  bankOwner,
  defaultName,
  defaultPhone,
  defaultEmail,
}: {
  shippingFee: number;
  bankName: string;
  bankAccount: string;
  bankOwner: string;
  defaultName: string;
  defaultPhone: string;
  defaultEmail: string;
}) {
  const { cart } = useShop();

  if (cart.length === 0) {
    return (
      <EmptyState
        icon="cart"
        title="Giỏ hàng trống"
        description="Bạn cần thêm sản phẩm vào giỏ hàng trước khi thanh toán."
        action={<Link href="/san-pham" className="btn-primary">T Quay về mua hàng</Link>}
      />
    );
  }

  return (
    <CheckoutForm
      items={cart}
      shippingFee={shippingFee}
      bankName={bankName}
      bankAccount={bankAccount}
      bankOwner={bankOwner}
      defaultName={defaultName}
      defaultPhone={defaultPhone}
      defaultEmail={defaultEmail}
    />
  );
}

void Icon;
