import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getActiveBrands, getActiveCategories, getCategoryBySlug, queryProducts, stripHtml } from "@/lib/data";
import { Breadcrumbs, EmptyState, Icon, Pagination } from "@/components/ui";
import { FilterSidebar, ProductGrid, Toolbar } from "@/components/store/product";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const cat = await getCategoryBySlug(slug);
  if (!cat) return { title: "Danh mục không tồn tại" };
  return {
    title: cat.seoTitle || `${cat.name} — Giá tốt cho công trình`,
    description: cat.seoDescription ?? cat.description ?? `Danh mục ${cat.name} tại Viễn Thông Quang Thắng — chính hãng, tư vấn kỹ thuật, giao hàng toàn quốc.`,
    alternates: { canonical: `/danh-muc/${cat.slug}` },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const cat = await getCategoryBySlug(slug);
  if (!cat || !cat.active) notFound();

  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const priceParts = (sp.price ?? "").split("-");
  const [res, brands, allCats] = await Promise.all([
    queryProducts({
      categorySlug: cat.slug,
      brandId: sp.brand,
      min: priceParts[0] ? parseInt(priceParts[0], 10) : undefined,
      max: priceParts[1] ? parseInt(priceParts[1], 10) : undefined,
      inStock: sp.stock === "1",
      sort: (sp.sort as never) ?? "newest",
      page,
      pageSize: 12,
    }),
    getActiveBrands(),
    getActiveCategories(),
  ]);

  // breadcrumbs with ancestor chain
  const crumbs: { label: string; href?: string }[] = [];
  const byId = new Map(allCats.map((c) => [c.id, c]));
  let cur: (typeof allCats)[number] | undefined = byId.get(cat.id);
  const chain: typeof crumbs = [];
  let guard = 0;
  while (cur && guard++ < 8) {
    chain.unshift({ label: cur.name, href: cur.id === cat.id ? undefined : `/danh-muc/${cur.slug}` });
    cur = cur.parentId ? byId.get(cur.parentId) : undefined;
  }

  const children = allCats.filter((c) => c.parentId === cat.id);
  const grandchildrenIds = new Set(children.map((c) => c.id));
  const grandChildren = allCats.filter((c) => c.parentId && grandchildrenIds.has(c.parentId));

  const baseHref = `/danh-muc/${cat.slug}`;
  const hrefFor = (p: number) => {
    const params = new URLSearchParams();
    if (sp.brand) params.set("brand", sp.brand);
    if (sp.price) params.set("price", sp.price);
    if (sp.stock) params.set("stock", sp.stock);
    if (sp.sort && sp.sort !== "newest") params.set("sort", sp.sort);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `${baseHref}${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="wrap py-6">
      <Breadcrumbs items={chain} />
      <div className="mt-3 mb-5">
        <h1 className="text-2xl font-extrabold text-ink-950">{cat.name}</h1>
        {cat.description && <p className="mt-1.5 line-clamp-3 max-w-2xl text-sm leading-6 text-ink-500">{stripHtml(cat.description).slice(0, 320)}</p>}
      </div>

      {(children.length > 0 || grandChildren.length > 0) && (
        <div className="mb-5 flex flex-wrap gap-2">
          {children.map((c) => (
            <Link key={c.id} href={`/danh-muc/${c.slug}`} className="chip">
              {c.name}
            </Link>
          ))}
          {grandChildren.map((c) => (
            <Link key={c.id} href={`/danh-muc/${c.slug}`} className="chip !border-dashed">
              {c.name}
            </Link>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
        <FilterSidebar brands={brands.map((b) => ({ id: b.id, name: b.name }))} />
        <div>
          <Toolbar count={res.total} baseHref={baseHref} />
          {res.items.length === 0 ? (
            <EmptyState
              icon="box"
              title="Danh mục đang cập nhật"
              description={`Danh mục "${cat.name}" đang được bổ sung sản phẩm. Vui lòng quay lại sau hoặc liên hệ hotline 0941.74.6161 để đặt hàng trực tiếp.`}
              action={<Link href="/san-pham" className="btn-primary">Xem tất cả sản phẩm</Link>}
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
