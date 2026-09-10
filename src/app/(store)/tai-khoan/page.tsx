import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { getProfileAddresses, getProfileOrders, getWishlistProducts } from "@/lib/data";
import { AddressManager, LogoutButton, ProfileForm } from "@/components/store/account";
import { ProductGrid } from "@/components/store/product";
import { Breadcrumbs, EmptyState, StatusBadge } from "@/components/ui";
import { formatDate, formatVND, ORDER_STATUS } from "@/lib/types";

export const metadata: Metadata = { title: "Tài khoản" };
export const dynamic = "force-dynamic";

export default async function TaiKhoanPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const user = await getSessionProfile();
  if (!user) redirect("/dang-nhap?next=/tai-khoan");

  const tab = sp.tab ?? "orders";
  const [orders, wishlist, addresses] = await Promise.all([
    getProfileOrders(user.id),
    getWishlistProducts(user.id),
    getProfileAddresses(user.id),
  ]);

  const TABS = [
    { key: "orders", label: "Đơn hàng", icon: "cart" },
    { key: "wishlist", label: "Yêu thích", icon: "heart" },
    { key: "profile", label: "Thông tin cá nhân", icon: "user" },
    { key: "addresses", label: "Địa chỉ", icon: "pin" },
  ] as const;

  return (
    <div className="wrap py-6">
      <Breadcrumbs items={[{ label: "Tài khoản" }]} />
      <h1 className="mt-3 mb-6 text-2xl font-extrabold text-ink-950">Tài khoản của tôi</h1>
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="card h-fit overflow-hidden">
          <div className="border-b border-line bg-ink-50/60 p-4">
            <p className="text-sm font-bold text-ink-950">{user.name}</p>
            <p className="truncate text-[12px] text-ink-500">{user.email}</p>
          </div>
          <nav className="p-2">
            {TABS.map((t) => (
              <Link
                key={t.key}
                href={`/tai-khoan?tab=${t.key}`}
                className={`mb-0.5 flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium ${
                  tab === t.key ? "bg-brand-50 font-semibold text-brand-800" : "text-ink-600 hover:bg-ink-50"
                }`}
              >
                {t.label}
              </Link>
            ))}
          </nav>
          <div className="border-t border-line p-3">
            <LogoutButton />
          </div>
        </aside>

        <div className="min-w-0">
          {tab === "orders" && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <EmptyState
                  icon="cart"
                  title="Chưa có đơn hàng"
                  description="Các đơn hàng bạn đặt (khi đăng nhập) sẽ hiển thị tại đây."
                  action={<Link href="/san-pham" className="btn-primary">Mua hàng ngay</Link>}
                />
              ) : (
                orders.map(({ order, items }) => (
                  <div key={order.id} className="card overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-ink-50/50 px-4 py-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-bold text-brand-700">{order.orderCode}</span>
                        <span className="text-[13px] text-ink-500">{formatDate(order.createdAt)}</span>
                      </div>
                      <StatusBadge label={ORDER_STATUS[order.status]?.label ?? order.status} tone={ORDER_STATUS[order.status]?.tone} />
                    </div>
                    <ul className="divide-y divide-line">
                      {items.map((it) => (
                        <li key={it.id} className="flex items-center gap-3 px-4 py-2.5 text-[13px]">
                          <span className="line-clamp-1 flex-1 font-medium text-ink-900">{it.productName}</span>
                          <span className="text-ink-400">x{it.quantity}</span>
                          <span className="font-semibold">{formatVND(it.subtotal)}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center justify-between border-t border-line px-4 py-3 text-sm">
                      <span className="text-ink-500">{items.length} sản phẩm</span>
                      <span className="font-extrabold text-ink-950">{formatVND(order.total)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "wishlist" &&
            (wishlist.length ? (
              <ProductGrid products={wishlist} columns={3} />
            ) : (
              <EmptyState
                icon="heart"
                title="Danh sách yêu thích trống"
                description="Bấm biểu tượng trái tim trên sản phẩm để lưu vào danh sách yêu thích."
                action={<Link href="/san-pham" className="btn-primary">Khám phá sản phẩm</Link>}
              />
            ))}

          {tab === "profile" && (
            <div className="card p-5">
              <h2 className="mb-4 text-base font-bold text-ink-950">Thông tin cá nhân</h2>
              <ProfileForm name={user.name} phone={user.phone ?? ""} />
            </div>
          )}

          {tab === "addresses" && (
            <div className="card p-5">
              <h2 className="mb-4 text-base font-bold text-ink-950">Địa chỉ giao hàng</h2>
              <AddressManager addresses={addresses} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
