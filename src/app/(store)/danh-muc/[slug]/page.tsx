import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getActiveBrands, getActiveCategories, getCategoryBySlug, queryProducts } from "@/lib/data";
import { Breadcrumbs, EmptyState, Icon, Pagination } from "@/components/ui";
import { FilterSidebar, ProductGrid, Toolbar } from "@/components/store/product";
import { BASE_URL } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const cat = await getCategoryBySlug(slug);
  if (!cat || !cat.active) notFound();
  return {
    title: cat.seoTitle || `${cat.name} chính hãng - Báo giá và tư vấn | Quang Thắng Telecom`,
    description: cat.seoDescription ?? cat.description ?? `Danh mục ${cat.name} chính hãng tại Viễn Thông Quang Thắng. Xem thông số, lựa chọn sản phẩm phù hợp và nhận tư vấn báo giá cho công trình.`,
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
  const categoryDescription = cat.description?.trim()
    || `Khám phá ${cat.name} chính hãng tại Viễn Thông Quang Thắng. Lựa chọn sản phẩm theo nhu cầu sử dụng, thông số kỹ thuật và yêu cầu của công trình; đội ngũ kỹ thuật hỗ trợ tư vấn trước khi đặt hàng.`;
  const categoryJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: cat.name,
        description: categoryDescription,
        url: `${BASE_URL}${baseHref}`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: chain.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.label,
          item: `${BASE_URL}${item.href ?? baseHref}`,
        })),
      },
    ],
  };
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryJsonLd) }} />
      <Breadcrumbs items={chain} />
      <div className="mt-3 mb-5">
        <h1 className="text-2xl font-extrabold text-ink-950">{cat.name}</h1>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-ink-600">{categoryDescription}</p>
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
              description={`Danh mục "${cat.name}" đang được bổ sung sản phẩm. Vui lòng quay lại sau hoặc liên hệ hotline 094.710.6161 để đặt hàng trực tiếp.`}
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

      <section className="mt-10 border-t border-line pt-8" aria-labelledby="category-buying-guide">
        <div className="max-w-4xl">
          <p className="section-eyebrow">Tư vấn lựa chọn</p>
          <h2 id="category-buying-guide" className="section-title mt-3">Chọn {cat.name} phù hợp nhu cầu sử dụng</h2>
          <p className="mt-4 text-sm leading-7 text-ink-600">
            Trước khi đặt hàng, hãy xác định môi trường lắp đặt, thông số kỹ thuật cần tương thích và số lượng sử dụng thực tế. Điều này giúp lựa chọn đúng {cat.name.toLocaleLowerCase("vi-VN")} và hạn chế phát sinh khi thi công hoặc vận hành.
          </p>
          <ul className="mt-5 grid gap-3 text-sm leading-6 text-ink-700 sm:grid-cols-3">
            <li className="border-l-2 border-accent-500 pl-3"><strong className="text-ink-950">Môi trường:</strong> trong nhà, ngoài trời, tủ kỹ thuật hay vị trí có yêu cầu chống nhiễu.</li>
            <li className="border-l-2 border-accent-500 pl-3"><strong className="text-ink-950">Tương thích:</strong> đối chiếu chuẩn kết nối, thông số và thiết bị đang sử dụng.</li>
            <li className="border-l-2 border-accent-500 pl-3"><strong className="text-ink-950">Quy mô:</strong> xác định chiều dài, số lượng và phương án dự phòng cho công trình.</li>
          </ul>
          <Link href="/lien-he" className="btn-outline mt-6">Nhận tư vấn kỹ thuật <Icon name="arrow-right" className="h-4 w-4" /></Link>
        </div>
      </section>
    </div>
  );
}
