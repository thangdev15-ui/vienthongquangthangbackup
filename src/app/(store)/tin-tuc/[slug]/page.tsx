import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getArticleBySlug, getArticles, getSettings, queryProducts, stripHtml } from "@/lib/data";
import { Breadcrumbs, Icon } from "@/components/ui";
import { ArticleTOC } from "@/components/store/article";
import { ProductGrid } from "@/components/store/product";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = await getArticleBySlug(slug);
  if (!a) return { title: "Bài viết không tồn tại" };
  return {
    title: a.seoTitle || a.title,
    description: a.seoDescription ?? a.excerpt ?? stripHtml(a.content).slice(0, 160),
    alternates: { canonical: `/tin-tuc/${a.slug}` },
    openGraph: {
      title: a.title,
      description: a.excerpt ?? undefined,
      images: a.coverImage ? [a.coverImage] : undefined,
      type: "article",
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = await getArticleBySlug(slug);
  if (!a || a.status !== "published") notFound();
  const settings = await getSettings();
  const [related, relatedProducts] = await Promise.all([
    getArticles({ limit: 3, excludeId: a.id }),
    queryProducts({ q: a.tags?.split(",")[0]?.trim() ?? "", limit: 4, includeTotal: false }),
  ]);
  const relatedItems = related.items.filter((x) => x.id !== a.id);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.excerpt ?? undefined,
    datePublished: a.publishedAt.toISOString(),
    dateModified: a.publishedAt.toISOString(),
    image: a.coverImage ?? undefined,
    author: { "@type": "Organization", name: settings.site_name },
  };

  return (
    <div className="wrap py-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <Breadcrumbs items={[{ label: "Tin tức", href: "/tin-tuc" }, { label: a.title }]} />

      <article className="mx-auto mt-5 max-w-4xl">
        <div className="min-w-0">
          <p className="text-[12px] font-bold uppercase tracking-wide text-brand-700">{a.category}</p>
          <h1 className="mt-1.5 text-2xl font-extrabold leading-tight text-ink-950 sm:text-3xl">{a.title}</h1>
          <p className="mt-2 text-[13px] text-ink-400">
            Đăng ngày {new Date(a.publishedAt).toLocaleDateString("vi-VN")} • Viễn Thông Quang Thắng
          </p>
          <div className="mt-5"><ArticleTOC /></div>
          {a.coverImage && (
            <div className="relative mt-5 aspect-[21/9] overflow-hidden rounded-lg border border-line">
              <Image src={a.coverImage} alt={a.title} fill sizes="(min-width:1024px) 65vw, 90vw" className="object-cover" />
            </div>
          )}
          <div className="rich-content mt-6" dangerouslySetInnerHTML={{ __html: a.content }} />

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-brand-200 bg-brand-50/60 p-4">
            <div>
              <p className="text-sm font-bold text-ink-950">Cần tư vấn kỹ thuật hoặc báo giá thiết bị?</p>
              <p className="text-[13px] text-ink-500">Đội ngũ kỹ thuật Quang Thắng hỗ trợ trực tiếp.</p>
            </div>
            <div className="flex gap-2">
              <a href={settings.zalo} target="_blank" rel="noopener" className="btn-zalo h-9">
                <Icon name="message" className="h-4 w-4" />
                Chat Zalo
              </a>
              <a href={`tel:${settings.phone.replace(/\D/g, "")}`} className="btn-primary h-9">
                <Icon name="phone" className="h-4 w-4" />
                {settings.phone}
              </a>
            </div>
          </div>
        </div>

      </article>

      {relatedItems.length > 0 && (
        <section className="mx-auto mt-12 max-w-5xl border-t border-line pt-8">
          <h2 className="mb-5 text-xl font-bold text-ink-950">Tin mới nhất</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {relatedItems.map((r) => (
              <a key={r.id} href={`/tin-tuc/${r.slug}`} className="card overflow-hidden transition-all hover:border-brand-400 hover:shadow-md">
                {r.coverImage && <div className="relative aspect-[16/9] bg-ink-100"><Image src={r.coverImage} alt={r.title} fill sizes="(min-width:1024px) 30vw, 90vw" className="object-cover" /></div>}
                <div className="p-4"><p className="line-clamp-2 text-sm font-bold text-ink-900">{r.title}</p><p className="mt-2 text-xs text-ink-400">{new Date(r.publishedAt).toLocaleDateString("vi-VN")}</p></div>
              </a>
            ))}
          </div>
        </section>
      )}

      {relatedProducts.items.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-5 text-lg font-bold text-ink-950">Sản phẩm liên quan đến bài viết</h2>
          <ProductGrid products={relatedProducts.items} />
        </section>
      )}
    </div>
  );
}
