import type { Metadata } from "next";
import { getActiveBrands, queryProducts } from "@/lib/data";
import { Breadcrumbs, EmptyState, Pagination } from "@/components/ui";
import { FilterSidebar, ProductGrid, Toolbar } from "@/components/store/product";
import Link from "next/link";

export const metadata: Metadata = {
  alternates: { canonical: "/san-pham" },
  title: "Tất cả sản phẩm",
  description: "Kho thiết bị viễn thông chính hãng: cáp mạng, cáp quang, switch, camera, thiết bị quang, tủ rack, phụ kiện mạng. Liên hệ 094.710.6161 để nhận báo giá công trình.",
};
export const dynamic = "force-dynamic";

export default async function AllProductsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const q = (sp.q ?? "").trim();
  const priceParts = (sp.price ?? "").split("-");
  const res = await queryProducts({
    q: q || undefined,
    brandId: sp.brand,
    min: priceParts[0] ? parseInt(priceParts[0], 10) : undefined,
    max: priceParts[1] ? parseInt(priceParts[1], 10) : undefined,
    inStock: sp.stock === "1",
    sort: (sp.sort as never) ?? "newest",
    page,
    pageSize: 12,
  });
  const brands = await getActiveBrands();

  const hrefFor = (p: number) => {
    const params = new URLSearchParams();
    if (sp.brand) params.set("brand", sp.brand);
    if (q) params.set("q", q);
    if (sp.price) params.set("price", sp.price);
    if (sp.stock) params.set("stock", sp.stock);
    if (sp.sort && sp.sort !== "newest") params.set("sort", sp.sort);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/san-pham${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="wrap py-6">
      <Breadcrumbs items={[{ label: "Sản phẩm" }]} />
      <div className="mt-3 mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-950">Tất cả sản phẩm</h1>
          <p className="mt-1 text-sm text-ink-500">Thiết bị viễn thông chính hãng — cáp, thiết bị mạng, camera, quang, tủ rack.</p>
        </div>
      </div>
      <form action="/san-pham" className="mb-6 flex max-w-2xl gap-2" role="search">
        <input name="q" defaultValue={q} className="input h-11" placeholder="Tìm theo tên sản phẩm, mã SKU..." aria-label="Tìm sản phẩm" />
        <button className="btn-primary h-11 shrink-0" type="submit">Tìm kiếm</button>
      </form>
      <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
        <FilterSidebar brands={brands.map((b) => ({ id: b.id, name: b.name }))} />
        <div>
          <Toolbar count={res.total} baseHref="/san-pham" />
          {res.items.length === 0 ? (
            <EmptyState
              icon="search"
              title="Không tìm thấy sản phẩm"
              description="Thử đổi bộ lọc hoặc tìm kiếm từ khóa khác."
              action={<Link href="/san-pham" className="btn-primary">Xoá bộ lọc</Link>}
            />
          ) : (
            <>
              <ProductGrid products={res.items} />
              <Pagination page={page} pages={res.pages} hrefFor={hrefFor} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
