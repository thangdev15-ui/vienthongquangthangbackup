import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getApprovedReviews, getRelatedProducts, getProductBySlug, getSettings } from "@/lib/data";
import { Breadcrumbs, Icon } from "@/components/ui";
import { BuyBox, Gallery } from "@/components/store/product-page";
import { ProductDetailTabs } from "@/components/store/product-detail-tabs";
import { BASE_URL } from "@/lib/types";

export const dynamic = "force-dynamic";

function withoutEmbeddedImages(html: string | null) {
  if (!html) return null;

  // Legacy product descriptions occasionally contain full PNG/JPEG files as
  // data URLs. They are serialized into the RSC payload repeatedly and can
  // turn a small product page into a multi-hundred-kilobyte document.
  return html
    .replace(/<img\b[^>]*\bsrc\s*=\s*(?:"data:image\/[^"]*"|'data:image\/[^']*'|data:image\/[^\s>]+)[^>]*>/gi, "")
    .replace(/data:image\/[a-z0-9.+-]+;base64,[a-z0-9+/=\s]+/gi, "");
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProductBySlug(slug);
  if (!data || data.product.status !== "published") notFound();
  const p = data.product;
  const mainImage = data.images.find((i) => i.isMain)?.url ?? data.images[0]?.url ?? null;
  const description = withoutEmbeddedImages(p.description);
  const desc = p.shortDescription ?? p.seoDescription ?? description?.replace(/<[^>]+>/g, " ").slice(0, 160) ?? "";
  return {
    title: p.seoTitle || p.name,
    description: desc,
    alternates: { canonical: `/san-pham/${p.slug}` },
    openGraph: {
      title: p.name,
      description: desc,
      images: mainImage ? [mainImage] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getProductBySlug(slug);
  if (!data || data.product.status !== "published") notFound();
  const p = data.product;
  const description = withoutEmbeddedImages(p.description);
  const mainImage = data.images.find((i) => i.isMain)?.url ?? data.images[0]?.url ?? null;
  const { description: _rawDescription, ...productFields } = p;
  const row = {
    ...productFields,
    brandName: data.brand?.name ?? "",
    categoryName: data.category?.name ?? "",
    image: mainImage,
  };
  const settings = await getSettings();
  const reviews = await getApprovedReviews(p.id);
  const related = await getRelatedProducts(p);

  const breadcrumbs = [
    { label: "Sản phẩm", href: "/san-pham" },
    ...(data.category ? [{ label: data.category.name, href: `/danh-muc/${data.category.slug}` }] : []),
    { label: p.name },
  ];

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.shortDescription ?? undefined,
    sku: p.sku ?? undefined,
    brand: data.brand ? { "@type": "Brand", name: data.brand.name } : undefined,
    image: mainImage ? [mainImage] : undefined,
    ...(p.priceType === "fixed" && p.price != null ? {
      offers:
        {
          "@type": "Offer",
          priceCurrency: "VND",
          price: p.salePrice ?? p.price,
          availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          url: `${BASE_URL}/san-pham/${p.slug}`,
        },
    } : {}),
    ...(p.reviewCount > 0
      ? { aggregateRating: { "@type": "AggregateRating", ratingValue: p.rating, reviewCount: p.reviewCount } }
      : {}),
  };

  return (
    <div className="wrap py-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <Breadcrumbs items={breadcrumbs} />

      <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <Gallery images={data.images.map((i) => ({ url: i.url }))} name={p.name} />
        <BuyBox p={row} phone={settings.phone} />
      </div>

      <ProductDetailTabs product={{ ...p, description }} specs={data.specs} reviews={reviews} related={related} phone={settings.phone} zalo={settings.zalo} />

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="card flex gap-3 p-4 text-[13px] text-ink-600">
          <Icon name="truck" className="mt-0.5 h-5 w-5 shrink-0 text-brand-700" />
          <p><b className="text-ink-900">Giao hàng toàn quốc</b><br />Đóng gói kỹ cho công trình.</p>
        </div>
        <div className="card flex gap-3 p-4 text-[13px] text-ink-600">
          <Icon name="credit-card" className="mt-0.5 h-5 w-5 shrink-0 text-brand-700" />
          <p><b className="text-ink-900">Thanh toán linh hoạt</b><br />COD hoặc chuyển khoản.</p>
        </div>
        <div className="card flex gap-3 p-4 text-[13px] text-ink-600">
          <Icon name="shield" className="mt-0.5 h-5 w-5 shrink-0 text-brand-700" />
          <p><b className="text-ink-900">Tư vấn kỹ thuật</b><br />Kiểm tra cấu hình trước khi bàn giao.</p>
        </div>
      </div>
    </div>
  );
}
