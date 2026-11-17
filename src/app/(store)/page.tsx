import Image from "next/image";
import Link from "next/link";
import { getActiveBanners, getActiveBrands, getArticles, queryProducts } from "@/lib/data";
import { ProductGrid } from "@/components/store/product";
import { Icon, SectionHeader, type IconName } from "@/components/ui";
import { NewsletterForm } from "@/components/store/chrome";
import { HeroCarousel } from "@/components/store/hero-carousel";

export const dynamic = "force-dynamic";
export const metadata = { alternates: { canonical: "/" } };

export default async function HomePage() {
  const [bestsellers, cameraProducts, networkCableProducts, brands, banners, articles] = await Promise.all([
    queryProducts({ only: "bestseller", limit: 8, includeTotal: false }),
    queryProducts({ categorySlug: "camera-quan-sat", limit: 8, includeTotal: false }),
    queryProducts({ categorySlug: "day-cap-mang", limit: 8, includeTotal: false }),
    getActiveBrands(),
    getActiveBanners(),
    getArticles({ limit: 4 }),
  ]);
  return (
    <div>
      {/* ============ HERO ============ */}
      <section className="bg-ink-50">
        <HeroCarousel banners={banners} />
      </section>

      <section className="border-b border-line bg-white py-5">
        <div className="wrap grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {([
            ["shield", "Hàng chính hãng", "Nguồn gốc rõ ràng, hỗ trợ chứng từ"],
            ["headset", "Tư vấn kỹ thuật", "Chọn đúng thiết bị cho từng công trình"],
            ["truck", "Giao hàng toàn quốc", "Đóng gói kỹ, giao đúng tiến độ"],
            ["check-circle", "Hỗ trợ sau bán", "Bảo hành và đồng hành lâu dài"],
          ] as [IconName, string, string][]).map(([icon, title, description]) => (
            <div key={title} className="flex items-center gap-3 rounded-lg border border-line bg-ink-50/40 px-4 py-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700"><Icon name={icon} className="h-5 w-5" /></span>
              <div className="min-w-0"><h2 className="text-[13px] font-bold text-ink-900">{title}</h2><p className="mt-0.5 text-[11px] leading-4 text-ink-500">{description}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ BEST SELLERS ============ */}
      {bestsellers.items.length > 0 && (
        <section className="wrap py-6">
          <SectionHeader title="Bán chạy nhất" subtitle="Sản phẩm được tin dùng tại các công trình" href="/san-pham" />
          <ProductGrid products={bestsellers.items} />
        </section>
      )}

      {/* ============ CATEGORY SHOWCASE ============ */}
      {cameraProducts.items.length > 0 && (
        <section className="wrap py-6">
          <SectionHeader title="Camera" subtitle="Thiết bị camera quan sát chính hãng" href="/danh-muc/camera-quan-sat" />
          <ProductGrid products={cameraProducts.items} />
        </section>
      )}
      {networkCableProducts.items.length > 0 && (
        <section className="wrap py-6">
          <SectionHeader title="Cáp mạng" subtitle="Cáp mạng cho công trình và hệ thống mạng" href="/danh-muc/day-cap-mang" />
          <ProductGrid products={networkCableProducts.items} />
        </section>
      )}

      {/* ============ CUSTOMER TRUST ============ */}
      <section className="wrap py-10">
        <div className="grid items-center gap-6 lg:grid-cols-[1.18fr_0.82fr]">
          <div className="overflow-hidden rounded-lg border border-line bg-brand-50">
            <div className="relative aspect-[4/3] bg-[repeating-linear-gradient(90deg,#e8f3fb_0,#e8f3fb_52px,#dbeaf5_52px,#dbeaf5_104px)]">
              <Image
                src="/quanngthangnhanvien.jpeg"
                alt="Đội ngũ nhân viên Quang Thắng"
                fill
                loading="lazy"
                quality={70}
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
                style={{ objectPosition: "center 18%" }}
              />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-extrabold leading-tight text-ink-950 sm:text-3xl">
              Vì sao khách hàng chọn Quang Thắng?
            </h2>
            <p className="mt-3 text-sm leading-6 text-ink-500">
              Ưu tiên bằng chứng thật thay vì các câu “uy tín - chất lượng - tận tâm” chung chung.
            </p>
            <div className="mt-6 space-y-3">
              {[
                ["Phục vụ B2B", "Đại lý, nhà thầu, doanh nghiệp và dự án."],
                ["Hỗ trợ kỹ thuật", "Tư vấn chọn cáp theo môi trường và hệ thống thực tế."],
                ["Chứng từ", "Hỗ trợ CO/CQ và hồ sơ theo yêu cầu dự án."],
                ["Giao hàng", "Hỗ trợ giao nội thành và vận chuyển toàn quốc."],
              ].map(([title, desc]) => (
                <div key={title} className="flex gap-3 rounded-lg border border-line bg-white p-4">
                  <Icon name="check" className="mt-0.5 h-5 w-5 shrink-0 text-brand-700" />
                  <div>
                    <h3 className="text-sm font-extrabold text-ink-950">{title}</h3>
                    <p className="mt-1 text-[13px] leading-5 text-ink-600">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ BRANDS ============ */}
      {brands.length > 0 && (
        <section className="bg-ink-50 py-10">
          <div className="wrap">
            <SectionHeader title="Thương hiệu & đối tác" subtitle="Các thương hiệu đang được Quang Thắng phân phối" href="/thuong-hieu" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {brands.slice(0, 12).map((b) => (
              <Link key={b.id} href={`/thuong-hieu/${b.slug}`} className="group flex min-h-28 items-center justify-center overflow-hidden rounded-lg border border-line bg-white p-5 transition-all hover:border-brand-400 hover:shadow-md">
                <span className="relative flex h-16 w-full items-center justify-center">
                  {b.logo ? (
                    // Image optimization is not used here until the Vercel image
                    // optimizer issue is separately reproduced and resolved.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={b.logo} alt={b.name} width={160} height={64} className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <span className="text-sm font-extrabold text-brand-700">{b.name.charAt(0)}</span>
                  )}
                </span>
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
