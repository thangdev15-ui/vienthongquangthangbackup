import type { Metadata } from "next";
import Link from "next/link";
import { getArticles, stripHtml } from "@/lib/data";
import { Breadcrumbs, Pagination } from "@/components/ui";
import { ArticleCard } from "./card";

export const metadata: Metadata = {
  title: "Tin tức công nghệ",
  description: "Kiến thức kỹ thuật về cáp mạng, cáp quang, WiFi, camera, switch PoE và thi công hạ tầng viễn thông từ đội ngũ kỹ thuật Viễn Thông Quang Thắng.",
};
export const dynamic = "force-dynamic";

export default async function TinTucPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const cat = sp.cat ?? "";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const pageSize = 12;
  const [all, categoryRows] = await Promise.all([
    getArticles({ category: cat || undefined, limit: pageSize, offset: (page - 1) * pageSize }),
    getArticles({ limit: 500 }),
  ]);
  const cats = Array.from(new Set(categoryRows.items.map((a) => a.category).filter(Boolean))) as string[];
  const hrefFor = (p: number) => `/tin-tuc?${new URLSearchParams({ ...(cat ? { cat } : {}), ...(p > 1 ? { page: String(p) } : {}) }).toString()}`;
  return (
    <div className="wrap py-6">
      <Breadcrumbs items={[{ label: "Tin tức" }]} />
      <div className="mt-3 mb-5">
        <h1 className="text-2xl font-extrabold text-ink-950">Tin tức &amp; kiến thức kỹ thuật</h1>
        <p className="mt-1 text-sm text-ink-500">Hướng dẫn, so sánh và kinh nghiệm thi công từ đội ngũ kỹ thuật Quang Thắng.</p>
      </div>
      {cats.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <Link href="/tin-tuc" className={`chip ${!cat ? "!border-brand-600 !text-brand-700" : ""}`}>
            Tất cả
          </Link>
          {cats.map((c) => (
            <Link key={c} href={`/tin-tuc?cat=${encodeURIComponent(c)}`} className={`chip ${cat === c ? "!border-brand-600 !text-brand-700" : ""}`}>
              {c}
            </Link>
          ))}
        </div>
      )}
      {all.items.length === 0 ? (
        <div className="card p-10 text-center text-sm text-ink-400">Chưa có bài viết nào trong chuyên mục này.</div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {all.items.map((a) => (
            <ArticleCard
              key={a.id}
              title={a.title}
              slug={a.slug}
              excerpt={a.excerpt ?? stripHtml(a.content).slice(0, 140)}
              category={a.category ?? "Tổng hợp"}
              cover={a.coverImage}
              date={a.publishedAt}
            />
          ))}
        </div>
      )}
      <Pagination page={page} pages={Math.max(1, Math.ceil(all.total / pageSize))} hrefFor={hrefFor} />
    </div>
  );
}
