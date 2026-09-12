import Image from "next/image";
import Link from "next/link";
import { getActiveBanners, getActiveBrands, getActivePromotions, getArticles, queryProducts } from "@/lib/data";
import { ProductGrid } from "@/components/store/product";
import { Icon, SectionHeader, type IconName } from "@/components/ui";
import { NewsletterForm } from "@/components/store/chrome";
import { HeroCarousel } from "@/components/store/hero-carousel";
import { formatVND } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, bestsellers, saleItems, brands, banners, promotions, articles] = await Promise.all([
    queryProducts({ only: "featured", limit: 8 }),
    queryProducts({ only: "bestseller", limit: 8 }),
    queryProducts({ only: "sale", limit: 4 }),
    getActiveBrands(),
    getActiveBanners(),
    getActivePromotions(),
    getArticles({ limit: 4 }),
  ]);
  const hero = banners.find((b) => b.image) ?? null;
  const promo = promotions[0] ?? null;
  const banner = hero;

  return (
    <div>
      {/* ============ HERO ============ */}
      <section className="bg-ink-50 py-3">
        <div className="wrap">
          <HeroCarousel />
        </div>
      </section>

      {/* ============ FEATURED ============ */}
      {featured.items.length > 0 && (
        <section className="wrap py-6">
          <SectionHeader title="Sản phẩm nổi bật" subtitle="Được chọn cho công trình và dự án" href="/san-pham" />
          <ProductGrid products={featured.items} />
        </section>
      )}

      {/* ============ PROMO BANNER ============ */}
      {(banner || promo) && (
        <section className="wrap py-8">
          {banner?.image ? (
            <Link href={banner.buttonUrl || "/san-pham"} className="group relative block overflow-hidden rounded-lg border border-line">
              <div className="relative aspect-[21/8]">
                <Image src={banner.image} alt={banner.title} fill sizes="1200px" className="object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
                <div className="absolute inset-0 bg-gradient-to-r from-ink-950/85 via-ink-950/50 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-center p-6 sm:p-10">
                  <h2 className="max-w-lg text-xl font-extrabold leading-tight text-white sm:text-3xl">{banner.title}</h2>
                  {banner.subtitle && <p className="mt-2 max-w-md text-sm text-ink-200 sm:text-[15px]">{banner.subtitle}</p>}
                  {banner.buttonText && (
                    <span className="mt-4 inline-flex w-fit items-center gap-2 rounded-md bg-accent-600 px-4 py-2 text-sm font-bold text-white group-hover:bg-accent-700">
                      {banner.buttonText}
                      <Icon name="arrow-right" className="h-4 w-4" />
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ) : (
            <PromoStrip promo={promo} />
          )}
          {saleItems.items.length > 0 && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {saleItems.items.map((p) => (
                <Link key={p.id} href={`/san-pham/${p.slug}`} className="card flex h-full items-center gap-3 p-3 transition-all hover:border-brand-400 hover:shadow-md">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-ink-50">
                    {p.image && <Image src={p.image} alt="" fill sizes="56px" className="object-cover" />}
                  </div>
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-[13px] font-semibold text-ink-900">{p.name}</p>
                    <p className="text-[13px] font-bold text-sale-600">{formatVND(p.salePrice ?? p.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ============ BRANDS ============ */}
      {brands.length > 0 && (
        <section className="wrap py-10">
          <SectionHeader title="Thương hiệu đại lý & phân phối" subtitle="Các hãng thiết bị đang có trong kho sản phẩm" href="/thuong-hieu" />
          <div className="flex snap-x gap-3 overflow-x-auto pb-2 no-scrollbar">
            {brands.slice(0, 12).map((b) => (
              <Link key={b.id} href={`/thuong-hieu/${b.slug}`} className="card group flex h-20 w-[220px] shrink-0 snap-start items-center gap-3 p-3 transition-all hover:border-brand-400 hover:shadow-md">
                <span className="relative flex h-12 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white ring-1 ring-line">
                  {b.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={b.logo} alt={b.name} className="h-full w-full object-contain p-2" />
                  ) : (
                    <span className="text-sm font-extrabold text-brand-700">{b.name.charAt(0)}</span>
                  )}
                </span>
                <span className="min-w-0 flex-1 truncate text-[13px] font-bold text-ink-800 group-hover:text-brand-700">{b.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ============ BEST SELLERS ============ */}
      {bestsellers.items.length > 0 && (
        <section className="bg-white py-12">
          <div className="wrap">
            <SectionHeader title="Bán chạy nhất" subtitle="Sản phẩm được tin dùng tại các công trình" href="/san-pham" hrefLabel="Xem thêm" />
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {bestsellers.items.map((p) => (
                <Link key={p.id} href={`/san-pham/${p.slug}`} className="group rounded-lg border border-line bg-white p-3 transition-all hover:border-brand-400 hover:shadow-lg">
                  <div className="relative aspect-square overflow-hidden rounded-md bg-white">
                    {p.image ? (
                      <Image src={p.image} alt={p.name} fill sizes="25vw" className="object-cover transition-transform duration-300 group-hover:scale-[1.04]" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-ink-300"><Icon name="box" className="h-10 w-10" /></div>
                    )}
                  </div>
                  <p className="mt-2.5 line-clamp-2 min-h-[2.6em] text-[13px] font-semibold leading-snug text-ink-900">{p.name}</p>
                  <p className="mt-1 text-sm font-bold text-brand-700">{p.priceType === "fixed" ? formatVND(p.salePrice ?? p.price) : "LIÊN HỆ"}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ WHY CHOOSE US ============ */}
      <section className="wrap py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(
            [
              ["shield", "Hàng rõ nguồn gốc", "Ưu tiên hàng có tem nhãn, serial và chứng từ theo từng dự án."],
              ["headset", "Có người tư vấn", "Hỗ trợ chọn đúng cáp, switch, camera và phụ kiện trước khi chốt đơn."],
              ["truck", "Đóng gói kỹ", "Giao nội thành và gửi tỉnh; hàng cồng kềnh được báo phí trước."],
              ["check-circle", "Theo sát sau bán", "Tiếp nhận bảo hành, đổi trả đúng điều kiện và hỗ trợ kiểm tra lỗi."],
            ] as [IconName, string, string][]
          ).map(([icon, t, d]) => (
            <div key={t} className="card p-5">
              <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-md bg-brand-50 text-brand-700">
                <Icon name={icon} className="h-5 w-5" />
              </span>
              <h3 className="text-[15px] font-bold text-brand-800">{t}</h3>
              <p className="mt-1 text-[13px] leading-6 text-ink-500">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ LATEST NEWS ============ */}
      {articles.items.length > 0 && (
        <section className="bg-white py-10">
          <div className="wrap">
            <SectionHeader title="Tin tức & kiến thức kỹ thuật" subtitle="Hướng dẫn thi công, so sánh thiết bị" href="/tin-tuc" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {articles.items.map((a) => (
                <Link key={a.id} href={`/tin-tuc/${a.slug}`} className="card group overflow-hidden transition-all hover:border-brand-400 hover:shadow-md">
                  <div className="relative aspect-[16/9] overflow-hidden bg-ink-950">
                    {a.coverImage ? (
                      <Image src={a.coverImage} alt={a.title} fill sizes="300px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center"><Icon name="file-text" className="h-8 w-8 text-brand-400" /></div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-brand-700">{a.category}</p>
                    <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-ink-900 group-hover:text-brand-700">{a.title}</h3>
                    {a.excerpt && <p className="mt-1.5 line-clamp-2 text-[12.5px] text-ink-500">{a.excerpt}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ NEWSLETTER CTA ============ */}
      <section className="wrap py-12">
        <div className="card flex flex-col items-start justify-between gap-6 overflow-hidden bg-gradient-to-r from-brand-800 to-brand-600 p-8 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-extrabold text-white">Nhận báo giá & tin khuyến mãi</h2>
            <p className="mt-1 text-sm text-brand-100">Đăng ký email để nhận ưu đãi cho công trình, dự án của bạn.</p>
          </div>
          <div className="w-full max-w-md">
            <NewsletterForm />
          </div>
        </div>
      </section>
    </div>
  );
}

function PromoStrip({ promo }: { promo: { title: string; badge: string | null; description: string | null; url: string | null; image: string | null } | null }) {
  if (!promo) return null;
  return (
    <Link href={promo.url ?? "/khuyen-mai"} className="card group flex items-center gap-4 overflow-hidden p-5 transition-all hover:border-accent-500">
      {promo.badge && <span className="rounded-md bg-accent-600 px-2.5 py-1 text-[12px] font-extrabold tracking-wide text-white">{promo.badge}</span>}
      <div className="min-w-0 flex-1">
        <h2 className="text-base font-extrabold text-ink-950 sm:text-lg">{promo.title}</h2>
        {promo.description && <p className="mt-0.5 text-[13px] text-ink-500">{promo.description}</p>}
      </div>
      <Icon name="arrow-right" className="h-5 w-5 shrink-0 text-accent-600" />
    </Link>
  );
}
