import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getPageBySlug, getSettings } from "@/lib/data";
import { Breadcrumbs, Icon } from "@/components/ui";

export const metadata: Metadata = {
  title: "Giới thiệu",
  description: "Giới thiệu Viễn Thông Quang Thắng — tổng kho thiết bị viễn thông, cáp mạng & camera tại TP. Hồ Chí Minh. GPKD 0315327471.",
};
export const dynamic = "force-dynamic";

export default async function GioiThieuPage() {
  const [page, settings] = await Promise.all([getPageBySlug("gioi-thieu"), getSettings()]);
  return (
    <div className="wrap py-6">
      <Breadcrumbs items={[{ label: "Giới thiệu" }]} />
      <section className="mt-5 grid items-center gap-8 overflow-hidden rounded-lg bg-ink-950 p-6 text-white md:grid-cols-[1.05fr_.95fr] md:p-10">
        <div>
          <Image src="/logoqt.png" alt="Viễn Thông Quang Thắng" width={210} height={75} className="h-14 w-auto object-contain object-left brightness-0 invert" />
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-brand-300">Đồng hành cùng công trình Việt</p>
          <h1 className="mt-2 text-3xl font-extrabold leading-tight sm:text-4xl">Tổng kho thiết bị mạng, cáp và camera</h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-ink-200">Cung ứng thiết bị chính hãng, tư vấn đúng nhu cầu và hỗ trợ kỹ thuật cho nhà thầu, doanh nghiệp và gia đình trên toàn quốc.</p>
          <div className="mt-6 flex flex-wrap gap-3"><Link href="/san-pham" className="btn-primary">Xem sản phẩm <Icon name="arrow-right" className="h-4 w-4" /></Link><a href={settings.zalo} target="_blank" rel="noopener" className="btn-zalo">Tư vấn qua Zalo</a></div>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-white/10">
          <Image src="/imported/old-site/company/qt-cable-6-web-1.png" alt="Hạ tầng cáp và thiết bị Quang Thắng" fill sizes="(min-width:768px) 45vw, 100vw" className="object-cover" priority />
        </div>
      </section>
      {page?.content && (
        <div className="rich-content mx-auto mt-10 max-w-4xl" dangerouslySetInnerHTML={{ __html: page.content }} />
      )}
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(
          [
            ["pin", "Trụ sở chính", settings.address],
            ["clock", "Giờ mở cửa", settings.hours],
            ["phone", "Hotline tư vấn", settings.phone],
            ["shield", "Giấy phép kinh doanh", `MST ${settings.mst} — SKH&ĐT TP.HCM cấp`],
          ] as [React.ComponentProps<typeof Icon>["name"], string, string][]
        ).map(([icon, t, d]) => (
          <div key={t} className="card p-4">
            <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-md bg-brand-50 text-brand-700">
              <Icon name={icon} className="h-5 w-5" />
            </span>
            <h2 className="text-sm font-bold text-ink-950">{t}</h2>
            <p className="mt-1 text-[13px] leading-6 text-ink-500">{d}</p>
          </div>
        ))}
      </div>
      <section className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {["/imported/old-site/company/ava1.png", "/imported/old-site/company/ava2.png", "/imported/old-site/company/av3.png"].map((src) => (
          <div key={src} className="relative aspect-[4/3] overflow-hidden rounded-lg border border-line bg-white"><Image src={src} alt="Hình ảnh hoạt động Quang Thắng" fill sizes="(min-width:1024px) 33vw, 100vw" className="object-cover" /></div>
        ))}
      </section>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/san-pham" className="btn-primary">
          Xem sản phẩm
          <Icon name="arrow-right" className="h-4 w-4" />
        </Link>
        <a href={settings.zalo} target="_blank" rel="noopener" className="btn-zalo">
          <Icon name="message" className="h-4 w-4" />
          {settings.zaloLabel ?? "Chat Zalo"}
        </a>
      </div>
    </div>
  );
}
