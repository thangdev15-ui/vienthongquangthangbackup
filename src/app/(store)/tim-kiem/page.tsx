import type { Metadata } from "next";
import Link from "next/link";
import { searchAll } from "@/lib/data";
import { Breadcrumbs, EmptyState, Icon, Pagination } from "@/components/ui";
import { ProductGrid, Toolbar } from "@/components/store/product";

export const metadata: Metadata = { title: "Tìm kiếm" };
export const dynamic = "force-dynamic";

const HOT_KEYWORDS = ["dây cáp mạng cat6", "cáp quang", "camera gia đình", "switch poe", "tủ rack", "dây nhảy quang"];

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const res = q ? await searchAll(q) : null;
  const total = res?.products.length ?? 0;
  const hrefFor = (p: number) => `/tim-kiem?q=${encodeURIComponent(q)}&page=${p}`;

  return (
    <div className="wrap py-6">
      <Breadcrumbs items={[{ label: "Tìm kiếm" }]} />
      <div className="mt-3 mb-6">
        <h1 className="text-2xl font-extrabold text-ink-950">
          {q ? (
            <>
              Kết quả cho <span className="text-brand-700">&quot;{q}&quot;</span>
            </>
          ) : (
            "Tìm kiếm sản phẩm"
          )}
        </h1>
        {!q && (
          <div className="mt-4">
            <p className="mb-2 text-sm font-semibold text-ink-700">Tìm kiếm nhiều:</p>
            <div className="flex flex-wrap gap-2">
              {HOT_KEYWORDS.map((k) => (
                <Link key={k} href={`/tim-kiem?q=${encodeURIComponent(k)}`} className="chip">
                  {k}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {q && !res && (
        <EmptyState icon="search" title="Không tìm thấy kết quả" description="Thử từ khóa khác: cáp mạng, cáp quang, camera, switch, tủ rack…" />
      )}

      {res && (
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside className="card h-fit p-4">
            <h2 className="mb-3 text-sm font-bold text-ink-950">Danh mục phù hợp</h2>
            {res.categories.length === 0 && <p className="text-[13px] text-ink-400">Không có danh mục phù hợp.</p>}
            <ul className="space-y-1.5">
              {res.categories.map((c) => (
                <li key={c.id}>
                  <Link href={`/danh-muc/${c.slug}`} className="flex items-center gap-2 text-[13px] text-ink-700 hover:text-brand-700">
                    <Icon name="layers" className="h-3.5 w-3.5 text-brand-600" />
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
            {res.articles.length > 0 && (
              <>
                <h2 className="mb-2 mt-5 text-sm font-bold text-ink-950">Bài viết</h2>
                <ul className="space-y-2">
                  {res.articles.map((a) => (
                    <li key={a.id}>
                      <Link href={`/tin-tuc/${a.slug}`} className="line-clamp-2 text-[13px] text-ink-700 hover:text-brand-700">
                        {a.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </aside>
          <div>
            <Toolbar count={total} baseHref="/tim-kiem" showSort={false} />
            {total === 0 ? (
              <EmptyState
                icon="search"
                title={`Không tìm thấy sản phẩm cho "${q}"`}
                description="Gọi hotline 0947.106.161 — kho hàng thực tế nhiều hơn website, chúng tôi sẽ kiểm tra và báo giá cho bạn."
              />
            ) : (
              <ProductGrid products={res.products} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
