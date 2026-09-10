import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getActivePromotions, queryProducts } from "@/lib/data";
import { Breadcrumbs, EmptyState, Icon } from "@/components/ui";
import { ProductGrid } from "@/components/store/product";

export const metadata: Metadata = {
  title: "Khuyến mãi",
  description: "Chương trình khuyến mãi, giảm giá thiết bị viễn thông, cáp mạng, camera tại Viễn Thông Quang Thắng. Cập nhật liên tục.",
};
export const dynamic = "force-dynamic";

export default async function KhuyenMaiPage() {
  const [promotions, sale] = await Promise.all([getActivePromotions(), queryProducts({ only: "sale", limit: 12, sort: "newest" })]);

  return (
    <div className="wrap py-6">
      <Breadcrumbs items={[{ label: "Khuyến mãi" }]} />
      <h1 className="mt-3 text-2xl font-extrabold text-ink-950">Khuyến mãi &amp; sản phẩm giảm giá</h1>
      <p className="mt-1.5 mb-6 max-w-3xl text-sm text-ink-500">
        Theo dõi khu vực này để cập nhật chương trình khuyến mãi theo tháng và ưu đãi cho công trình, dự án.
      </p>

      {promotions.length > 0 && (
        <div className="mb-8 grid gap-4 md:grid-cols-2">
          {promotions.map((p) => (
            <Link
              key={p.id}
              href={p.url ?? "/san-pham"}
              className="card group grid overflow-hidden transition-all hover:border-accent-500 hover:shadow-md sm:grid-cols-[200px_1fr]"
            >
              {p.image && (
                <div className="relative hidden aspect-square sm:block">
                  <Image src={p.image} alt={p.title} fill sizes="200px" className="object-cover" />
                </div>
              )}
              <div className="flex flex-col justify-center p-5">
                {p.badge && <span className="mb-2 w-fit rounded bg-accent-600 px-2 py-0.5 text-[11px] font-extrabold tracking-wide text-white">{p.badge}</span>}
                <h2 className="text-base font-extrabold text-ink-950 group-hover:text-accent-600">{p.title}</h2>
                {p.description && <p className="mt-1 text-[13px] leading-6 text-ink-500">{p.description}</p>}
                <p className="mt-2 flex items-center gap-1 text-[13px] font-semibold text-accent-600">
                  Xem chi tiết <Icon name="arrow-right" className="h-3.5 w-3.5" />
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <h2 className="mb-4 text-lg font-bold text-ink-950">Sản phẩm đang giảm giá</h2>
      {sale.items.length === 0 ? (
        <EmptyState
          icon="tag"
          title="Không có chương trình đang chạy"
          description="Khuyến mãi mới sẽ xuất hiện tại đây. Gọi 0941.74.6161 để nhận giá ưu đãi cho đơn hàng số lượng lớn."
          action={<Link href="/san-pham" className="btn-primary">Xem tất cả sản phẩm</Link>}
        />
      ) : (
        <ProductGrid products={sale.items} />
      )}
    </div>
  );
}
