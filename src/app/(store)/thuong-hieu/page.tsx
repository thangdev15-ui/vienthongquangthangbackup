import type { Metadata } from "next";
import Link from "next/link";
import { getActiveBrands, getPublishedProductCountsByBrand } from "@/lib/data";
import { Breadcrumbs, Icon } from "@/components/ui";

export const metadata: Metadata = {
  alternates: { canonical: "/thuong-hieu" },
  title: "Thương hiệu",
  description: "Các thương hiệu thiết bị viễn thông, cáp mạng và camera mà Viễn Thông Quang Thắng phân phối: Vcom, Commscope, Hikvision, TP-Link, Netlink…",
};
export const dynamic = "force-dynamic";

export default async function BrandsPage() {
  const [brands, counts] = await Promise.all([getActiveBrands(), getPublishedProductCountsByBrand()]);
  const countMap = new Map(counts.map((c) => [c.brandId, c.n]));

  return (
    <div className="wrap py-6">
      <Breadcrumbs items={[{ label: "Thương hiệu" }]} />
      <h1 className="mt-3 text-2xl font-extrabold text-ink-950">Thương hiệu</h1>
      <p className="mt-1.5 mb-6 max-w-3xl text-sm text-ink-500">
        Chúng tôi phân phối thiết bị chính hãng từ các thương hiệu cáp, thiết bị mạng, thiết bị quang và camera uy tín.
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {brands.map((b) => (
          <Link key={b.id} href={`/thuong-hieu/${b.slug}`} className="card group flex flex-col items-center gap-3 p-6 text-center transition-all hover:border-brand-400 hover:shadow-md">
            <span className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-md bg-ink-50">
              {b.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={b.logo} alt={b.name} width={160} height={96} className="h-full w-full object-contain p-2" />
              ) : (
                <span className="text-2xl font-extrabold text-brand-700">{b.name.charAt(0)}</span>
              )}
            </span>
            <span className="text-sm font-bold text-ink-900 group-hover:text-brand-700">{b.name}</span>
            <span className="flex items-center gap-1 text-[12px] text-ink-400">
              <Icon name="box" className="h-3.5 w-3.5" />
              {countMap.get(b.id) ?? 0} sản phẩm
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
