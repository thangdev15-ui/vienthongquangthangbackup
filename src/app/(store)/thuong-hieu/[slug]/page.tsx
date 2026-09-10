import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBrandBySlug, queryProducts } from "@/lib/data";
import { Breadcrumbs, EmptyState, Pagination } from "@/components/ui";
import { ProductGrid, Toolbar } from "@/components/store/product";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const b = await getBrandBySlug(slug);
  if (!b) return { title: "Thương hiệu không tồn tại" };
  return {
    title: b.seoTitle || `Thiết bị ${b.name}`,
    description: b.seoDescription ?? b.description ?? `Sản phẩm ${b.name} chính hãng tại Viễn Thông Quang Thắng. Liên hệ 0941.74.6161 để nhận báo giá.`,
    alternates: { canonical: `/thuong-hieu/${b.slug}` },
  };
}

export default async function BrandPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const b = await getBrandBySlug(slug);
  if (!b || !b.active) notFound();
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const res = await queryProducts({
    brandSlug: b.slug,
    sort: (sp.sort as never) ?? "newest",
    page,
    pageSize: 12,
  });

  return (
    <div className="wrap py-6">
      <Breadcrumbs items={[{ label: "Thương hiệu", href: "/thuong-hieu" }, { label: b.name }]} />
      <div className="mt-3 mb-5 flex items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-md border border-line bg-ink-50">
          {b.logo ? (
            <Image src={b.logo} alt={b.name} fill sizes="56px" className="object-contain p-1.5" />
          ) : (
            <span className="text-xl font-extrabold text-brand-700">{b.name.charAt(0)}</span>
          )}
        </span>
        <div>
          <h1 className="text-2xl font-extrabold text-ink-950">{b.name}</h1>
          {b.description && <p className="mt-0.5 max-w-2xl text-sm text-ink-500">{b.description}</p>}
          {b.website && (
            <a href={b.website} target="_blank" rel="noopener" className="mt-1 inline-block text-[13px] font-semibold text-brand-700 hover:underline">
              Website chính thức →
            </a>
          )}
        </div>
      </div>
      <Toolbar count={res.total} baseHref={`/thuong-hieu/${b.slug}`} />
      {res.items.length === 0 ? (
        <EmptyState
          icon="box"
          title={`Chưa có sản phẩm ${b.name} được đăng tải`}
          description="Vui lòng quay lại sau hoặc gọi 0941.74.6161 để đặt hàng trực tiếp."
          action={<Link href="/san-pham" className="btn-primary">Xem tất cả sản phẩm</Link>}
        />
      ) : (
        <>
          <ProductGrid products={res.items} />
          <Pagination
            page={page}
            pages={res.pages}
            hrefFor={(p) => (p > 1 ? `/thuong-hieu/${b.slug}?page=${p}` : `/thuong-hieu/${b.slug}`)}
          />
        </>
      )}
    </div>
  );
}
