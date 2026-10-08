import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Icon, type IconName } from "@/components/ui";
import { COMPANY_PROFILE_CERTIFICATES, COMPANY_PROFILE_FACTS, COMPANY_PROFILE_PROJECTS } from "@/lib/company-profile-evidence";
import { getActiveBrands, getCompanyProfile, getSettings } from "@/lib/data";
import { ProjectGallery } from "./project-gallery";

export const metadata: Metadata = {
  title: "Hồ sơ năng lực | Viễn Thông Quang Thắng",
  description: "Hồ sơ năng lực doanh nghiệp Viễn Thông Quang Thắng: thiết bị viễn thông, hạ tầng mạng, cáp quang và camera.",
};

const values = [
  { number: "01", title: "Chất lượng & nguồn gốc", body: "Cung cấp sản phẩm có nguồn gốc rõ ràng, đáp ứng tiêu chuẩn kỹ thuật và yêu cầu thực tế của từng công trình." },
  { number: "02", title: "Tư vấn giải pháp tổng thể", body: "Kết hợp thiết bị phù hợp với tư vấn kỹ thuật để tối ưu chi phí đầu tư, hiệu suất vận hành và khả năng sử dụng lâu dài." },
  { number: "03", title: "Đồng hành lâu dài", body: "Đội ngũ chuyên nghiệp, trách nhiệm và am hiểu kỹ thuật, hỗ trợ khách hàng từ tư vấn đến triển khai và vận hành." },
];

const capabilities = [
  ["server", "Hạ tầng kỹ thuật", "Thiết bị mạng, cáp, tủ rack và phụ kiện đồng bộ cho từng quy mô công trình."],
  ["headset", "Đội ngũ kỹ thuật", "Tư vấn chọn thiết bị, kiểm tra tương thích và hỗ trợ xử lý trong quá trình triển khai."],
  ["shield", "Đối tác chiến lược", "Phân phối nhiều thương hiệu viễn thông, mạng, camera và thiết bị công trình uy tín."],
  ["check-circle", "Dịch vụ hậu mãi", "Bảo hành, đổi trả và hỗ trợ kỹ thuật rõ ràng, đồng hành sau khi bàn giao."],
] as const;

const customerGroups = [
  ["01", "Doanh nghiệp & văn phòng", "Thiết bị mạng, Wi-Fi, tủ rack và camera theo quy mô không gian và nhu cầu vận hành."],
  ["02", "Nhà thầu & đơn vị thi công", "Danh mục cáp, vật tư và thiết bị đồng bộ; phối hợp theo số lượng và tiến độ công trình."],
  ["03", "Nhà xưởng & công trình", "Tư vấn hạ tầng kết nối, truyền dẫn và giám sát phù hợp với môi trường lắp đặt."],
  ["04", "Cửa hàng & khách hàng cá nhân", "Lựa chọn thiết bị và phụ kiện thiết thực, dễ sử dụng và thuận tiện bảo trì."],
] as const;

const processImages = [
  "/imported/company-profile/tiepnhannhucau.jpeg",
  "/imported/company-profile/web/cameragiamsatcanho3.webp",
  "/imported/company-profile/chuanbigiaohang.jpeg",
  "/imported/company-profile/hotrosauban.jpeg",
] as const;

const solutionImages = [
  "/imported/old-site/products/camera-hikvision-ds-2cd1123g0e-il-35669c3f44.jpg",
  "/imported/old-site/products/camera-dahua-dh-ipc-hdw1239t1-led-s5-7fa9ad053a.jpg",
  "/imported/old-site/products/camera-hdtvi-hikvision-ds-2ce16h8t-it5f-f7e915925c.jpg",
  "/imported/old-site/products/dau-ghi-hinh-camera-ip-64-kenh-nvr5864-6fb3da0c04.jpg",
  "/imported/old-site/products/camera-hikvision-ds-2cd2046g2-iu-sl-a0b5db55cd.jpg",
  "/imported/old-site/products/camera-dahua-dh-hac-hfw1500tlp-s2-c0e8bbdfbc.jpg",
] as const;

export default async function CompanyProfilePage() {
  const [profile, brands, settings] = await Promise.all([getCompanyProfile(), getActiveBrands(), getSettings()]);
  const phoneHref = `tel:${settings.phone.replace(/\D/g, "")}`;
  const profileEmail = COMPANY_PROFILE_FACTS.find(([label]) => label === "Email trong hồ sơ")?.[1] ?? "quangthangtelecom@gmail.com";
  const profileAddress = COMPANY_PROFILE_FACTS.find(([label]) => label === "Địa chỉ")?.[1] ?? "435/26 Thống Nhất, Phường Thông Tây Hội, TP. Hồ Chí Minh";
  const mapEmbedHref = `https://www.google.com/maps?q=${encodeURIComponent(profileAddress)}&output=embed`;
  const directorName = COMPANY_PROFILE_FACTS.find(([label]) => label === "Người đại diện")?.[1] ?? "Võ Quốc Thắng";
  const directionsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profileAddress)}`;
  return (
    <div id="company-profile-page" className="bg-white text-ink-900">
      <section className="relative isolate overflow-hidden bg-brand-950 text-white">
        <div className="absolute inset-0 -z-10"><Image src={profile.heroImage || "/quangthangshop.jpg"} alt="Hạ tầng viễn thông Quang Thắng" fill priority sizes="100vw" className="object-cover object-center opacity-45" /><div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,27,54,.98)_0%,rgba(3,27,54,.86)_43%,rgba(3,27,54,.35)_100%)]" /></div>
        <div className="wrap py-8 sm:py-10 lg:py-20"><div className="max-w-3xl"><div className="mb-5 flex items-center gap-2 text-xs font-semibold text-white/65"><Link href="/">Trang chủ</Link><span>/</span><span className="text-white">Hồ sơ năng lực</span></div><p className="flex items-center gap-3 text-xs font-extrabold uppercase tracking-[.2em] text-accent-200"><span className="h-px w-9 bg-accent-500" />{profile.heroEyebrow || "Hồ sơ năng lực"}</p><h1 className="mt-4 max-w-2xl text-4xl font-extrabold uppercase leading-[1.05] tracking-tight text-white sm:text-6xl">{profile.heroTitle || "Hồ sơ năng lực"}</h1><p className="mt-4 max-w-2xl text-lg font-semibold text-white/90 sm:text-xl">Giải pháp hạ tầng viễn thông - mạng lưới đáng tin cậy</p><p className="mt-3 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">{profile.heroDescription}</p><div className="mt-6 flex flex-wrap gap-3"><Link href="/lien-he" className="btn-accent"><Icon name="message" className="h-4 w-4" />Liên hệ tư vấn</Link><a href={phoneHref} className="inline-flex h-10 items-center gap-2 rounded border border-white/35 px-4 text-sm font-bold text-white hover:bg-white/10"><Icon name="phone" className="h-4 w-4" />{settings.phone}</a></div></div></div>
        <div className="border-t border-white/10 bg-brand-950/45"><div className="wrap grid grid-cols-2 gap-4 py-5 text-xs font-semibold text-white/75 sm:grid-cols-4"><span className="flex items-center gap-2"><Icon name="shield" className="h-5 w-5 text-accent-200" />Chính hãng</span><span className="flex items-center gap-2"><Icon name="settings" className="h-5 w-5 text-accent-200" />Tư vấn chuyên sâu</span><span className="flex items-center gap-2"><Icon name="file-text" className="h-5 w-5 text-accent-200" />Hỗ trợ CO/CQ</span><span className="flex items-center gap-2"><Icon name="truck" className="h-5 w-5 text-accent-200" />Giao hàng toàn quốc</span></div></div>
      </section>

      <nav aria-label="Mục lục hồ sơ năng lực" className="border-b border-line bg-white">
        <div className="wrap flex items-center gap-6 overflow-x-auto py-4 text-sm font-bold text-ink-600">
          <span className="shrink-0 text-xs font-extrabold uppercase tracking-wide text-brand-800">Trong hồ sơ</span>
          {[["Giới thiệu", "#gioi-thieu-nang-luc"], ["Pháp lý", "#thong-tin-phap-ly"], ["Khách hàng", "#nhom-khach-hang"], ["Dự án", "#du-an-hoat-dong"], ["Quy trình", "#quy-trinh-hop-tac"], ["Liên hệ", "#van-phong-quang-thang"]].map(([label, href]) => <a key={href} href={href} className="shrink-0 border-b-2 border-transparent py-1 transition-colors hover:border-accent-500 hover:text-brand-800">{label}</a>)}
          <a href="#yeu-cau-ho-so-pdf" className="shrink-0 border-b-2 border-transparent py-1 transition-colors hover:border-accent-500 hover:text-brand-800">Yêu cầu hồ sơ PDF</a>
        </div>
      </nav>

      <section className="border-b border-line bg-white">
        <div className="wrap grid grid-cols-2 gap-y-6 py-7 sm:grid-cols-4">
          {[["2018", "Hoạt động từ 12/10/2018"], ["Thiết bị", "Điện tử & viễn thông"], ["Giải pháp", "Mạng, camera & kết nối"], ["Đồng hành", "Tư vấn & hỗ trợ kỹ thuật"]].map(([value, label]) => <div key={value} className="border-l border-line px-4 text-center"><p className="text-2xl font-extrabold text-brand-900 sm:text-3xl">{value}</p><p className="mt-2 text-xs font-semibold text-ink-500">{label}</p></div>)}
        </div>
      </section>

      <section id="gioi-thieu-nang-luc" className="wrap py-10 sm:py-14"><div className="grid items-center gap-8 lg:grid-cols-[.9fr_1.1fr] lg:gap-14"><div className="relative order-2 aspect-[4/3] overflow-hidden rounded-lg bg-ink-100 lg:order-2"><Image src="/imported/company-profile/hinhvanphongmoi.jpeg" alt="Phòng họp tại văn phòng Viễn Thông Quang Thắng" fill sizes="(min-width:1024px) 52vw, 100vw" className="object-cover object-center" /><div className="absolute bottom-4 right-4 bg-brand-900 px-5 py-4 text-white shadow-xl"><p className="text-xs text-white/70">Không gian làm việc</p><p className="mt-1 font-bold">Chuyên nghiệp · Uy tín</p></div></div><div className="order-1 lg:order-1"><header className="mb-5"><p className="section-eyebrow">Thư ngỏ · Giới thiệu chung</p><h2 className="section-title mt-3">{profile.introTitle || "Công ty Cổ phần Viễn thông Quang Thắng"}</h2></header><p className="whitespace-pre-line text-sm leading-7 text-ink-600 sm:text-base">{profile.introDescription}</p><div className="mt-5 grid gap-x-4 gap-y-3 sm:grid-cols-2">{[["shield", "Sản phẩm chính hãng"], ["settings", "Tư vấn giải pháp"], ["file-text", "Chính sách rõ ràng"], ["headset", "Đội ngũ hỗ trợ"]].map(([icon, text]) => <div key={text} className="flex items-center gap-3 text-sm font-bold text-ink-800"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700"><Icon name={icon as IconName} className="h-4 w-4" /></span>{text}</div>)}</div><Link href="/gioi-thieu" className="btn-primary mt-6">Xem chi tiết về công ty <Icon name="arrow-right" className="h-4 w-4" /></Link></div></div></section>

      <section id="thong-tin-phap-ly" className="bg-brand-950 py-10 sm:py-14" aria-labelledby="company-facts-title">
        <div className="wrap">
          <div className="relative overflow-hidden border border-line bg-white px-5 py-6 sm:px-8 sm:py-8 lg:px-10">
            <div className="absolute inset-y-0 left-0 w-2 bg-accent-500" />
            <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,.72fr)] lg:gap-12">
              <div className="min-w-0">
                <div className="border-b border-line pb-4">
                  <p className="section-eyebrow">Thông tin pháp lý doanh nghiệp</p>
                  <h2 id="company-facts-title" className="section-title mt-2">Công ty Cổ phần Viễn thông Quang Thắng</h2>
                </div>
                <dl className="grid gap-x-8 sm:grid-cols-2">
                  {COMPANY_PROFILE_FACTS.map(([label, value]) => <div key={label} className="border-b border-line py-3"><dt className="text-xs font-bold uppercase tracking-wide text-ink-500">{label}</dt><dd className="mt-1 break-words text-sm font-semibold leading-6 text-ink-900">{label === "Email trong hồ sơ" ? <a href={`mailto:${value}`} className="text-brand-700 hover:underline">{value}</a> : label === "Hotline" ? <a href="tel:0947106161" className="text-brand-700 hover:underline">{value}</a> : value}</dd></div>)}
                </dl>
                <p className="mt-4 text-xs leading-5 text-ink-500">Thông tin theo hồ sơ năng lực doanh nghiệp Quang Thắng cung cấp.</p>
              </div>
              <aside className="order-first overflow-hidden border-b border-line bg-brand-950 text-center text-white lg:order-last lg:border-b-0 lg:border-l lg:pl-0">
                <div className="relative h-80 w-full sm:h-[28rem] lg:h-full lg:min-h-[35rem]">
                  <Image src="/CEO.jpeg" alt={`CEO ${directorName} tại Quang Thắng`} fill sizes="(min-width:1024px) 32vw, 100vw" className="object-cover object-center" />
                  <div className="absolute inset-x-0 bottom-0 bg-brand-950/90 px-6 py-6">
                    <p className="text-xs font-extrabold uppercase tracking-[.16em] text-accent-200">CEO · Người đại diện</p>
                    <p className="mt-2 text-2xl font-extrabold text-white">{directorName}</p>
                    <p className="mt-1 text-sm text-white/70">Công ty Cổ phần Viễn thông Quang Thắng</p>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-ink-50 py-10 sm:py-14"><div className="wrap grid gap-7 lg:grid-cols-[.8fr_1.2fr] lg:gap-16"><div className="max-w-xl"><p className="section-eyebrow">Đồng hành cùng sự phát triển</p><h2 className="section-title mt-3">Một đối tác đáng tin cậy cho mỗi công trình</h2><p className="mt-4 text-base leading-7 text-ink-600">Từ một sản phẩm đơn lẻ đến kế hoạch cung ứng dài hạn, Quang Thắng tập trung vào tính phù hợp, khả năng triển khai và hiệu quả sử dụng.</p><Link href="/lien-he" className="btn-primary mt-6">Trao đổi nhu cầu <Icon name="arrow-right" className="h-4 w-4" /></Link></div><div className="divide-y divide-line border-y border-brand-900/20">{values.map((item) => <article key={item.number} className="grid gap-3 py-4 sm:grid-cols-[3.5rem_1fr] sm:gap-5"><span className="pt-1 text-sm font-extrabold tabular-nums text-accent-600">{item.number}</span><div><h3 className="text-lg font-bold text-ink-950">{item.title}</h3><p className="mt-1.5 max-w-2xl text-sm leading-6 text-ink-600">{item.body}</p></div></article>)}</div></div></section>

      <section id="nhom-khach-hang" className="wrap py-10 sm:py-14">
        <header className="mb-9"><p className="section-eyebrow">Đối tượng phục vụ</p><h2 className="section-title mt-3">Phục vụ nhiều mô hình, tư vấn theo nhu cầu</h2><p className="mt-4 max-w-3xl text-sm leading-7 text-ink-600">Từ khách hàng cá nhân đến doanh nghiệp và đơn vị thi công, danh mục và phương án được trao đổi theo quy mô, môi trường sử dụng và tiến độ thực tế.</p></header>
        <div className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {customerGroups.map(([number, title, description]) => <article key={number} className="bg-white p-5 transition-colors hover:bg-brand-50 sm:p-6"><span className="text-sm font-extrabold tabular-nums text-accent-600">{number}</span><h3 className="mt-3 text-lg font-extrabold leading-6 text-ink-950">{title}</h3><p className="mt-2 text-sm leading-6 text-ink-600">{description}</p></article>)}
        </div>
      </section>

      <section className="wrap grid gap-8 py-10 sm:py-14 lg:grid-cols-[.7fr_1.3fr] lg:gap-14"><div><p className="section-eyebrow">Năng lực thế mạnh</p><h2 className="section-title mt-3">Năng lực cốt lõi</h2><p className="mt-4 text-sm leading-7 text-ink-600 sm:text-base">Kết hợp danh mục sản phẩm, kinh nghiệm tư vấn và khả năng phối hợp giao hàng để giúp khách hàng triển khai nhanh, đúng và dễ mở rộng.</p><Link href="/lien-he" className="btn-outline mt-6">Xem chi tiết năng lực <Icon name="arrow-right" className="h-4 w-4" /></Link></div><div className="grid gap-x-8 sm:grid-cols-2">{capabilities.map(([icon, title, body], index) => <article key={title} className="border-t border-line py-5"><div className="flex items-center gap-3"><span className="text-sm font-extrabold tabular-nums text-brand-300">0{index + 1}</span><Icon name={icon as IconName} className="h-5 w-5 text-brand-700" /><h3 className="font-extrabold text-ink-950">{title}</h3></div><p className="mt-2 pl-9 text-sm leading-6 text-ink-600">{body}</p></article>)}</div></section>

      <section className="relative overflow-hidden bg-[#315f88] py-10 text-white sm:py-14"><div className="absolute inset-0 opacity-10"><Image src="/backgroundne.png" alt="" fill sizes="100vw" className="object-cover object-center" /></div><div className="wrap relative"><div className="flex flex-wrap items-end justify-between gap-5"><div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[.18em] text-white/75">Giải pháp viễn thông toàn diện</p><h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">{profile.solutionsTitle}</h2><p className="mt-4 text-sm leading-7 text-white/75 sm:text-base">{profile.solutionsDescription}</p></div><Link href="/san-pham" className="inline-flex h-10 items-center gap-2 border border-white/55 px-4 text-sm font-bold text-accent-500 hover:bg-white/10 hover:text-accent-200">Xem sản phẩm <Icon name="arrow-right" className="h-4 w-4" /></Link></div><div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{profile.solutions.map(({ title, description: body }, index) => <article key={title} className="group overflow-hidden border border-white/20 bg-[#315f88] transition-colors hover:border-white/45"><div className="relative aspect-[16/8] bg-white"><Image src={solutionImages[index % solutionImages.length]} alt={title} fill sizes="(min-width:1024px) 33vw, 50vw" className="object-contain p-3 transition-transform duration-300 group-hover:scale-105" /></div><div className="p-5"><h3 className="font-bold text-white">{title}</h3><p className="mt-2 text-sm leading-6 text-white/75">{body}</p></div></article>)}</div></div></section>

      <section id="du-an-hoat-dong" className="wrap py-10 sm:py-14" aria-labelledby="projects-title">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div><p className="section-eyebrow">Dấu ấn thực tế</p><h2 id="projects-title" className="section-title mt-3">Dự án & hoạt động kết nối</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-ink-600">Từ hạ tầng mạng, hệ thống an ninh đến những hoạt động gắn kết đối tác. Khám phá hình ảnh thực tế của Quang Thắng qua từng công trình và sự kiện.</p></div>
          <Link href="/lien-he" className="text-sm font-bold text-accent-600 hover:text-accent-700">Trao đổi dự án <Icon name="arrow-right" className="inline h-4 w-4" /></Link>
        </div>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {COMPANY_PROFILE_PROJECTS.map((project, index) => <article id={project.id} key={project.id} className="group min-w-0 overflow-hidden border border-line bg-white transition-colors hover:border-brand-300">
            <ProjectGallery images={project.images} projectTitle={project.title} className="aspect-[4/3]" />
            <div className="p-5">
              <div className="flex items-center gap-2"><span className="text-sm font-extrabold tabular-nums text-brand-300">0{index + 1}</span><span className="h-px w-5 bg-accent-500" /><p className="truncate text-[11px] font-extrabold uppercase tracking-[.12em] text-accent-600" title={project.category}>{project.category}</p></div>
              <h3 className="mt-3 truncate text-lg font-extrabold leading-snug text-ink-950" title={project.title}>{project.title}</h3>
              <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-ink-600" title={project.description}>{project.description}</p>
            </div>
          </article>)}
        </div>
      </section>

      <section id="quy-trinh-hop-tac" className="border-y border-line bg-ink-50 py-10 sm:py-14"><div className="wrap"><div><p className="section-eyebrow">Quy trình hợp tác</p><h2 className="section-title mt-3 max-w-none">{profile.processTitle}</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-ink-600">Quy trình rõ ràng giúp hai bên thống nhất kỳ vọng và chủ động tiến độ từ lúc tư vấn đến sau bàn giao.</p></div><ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{profile.process.map(({ title, description: body }, index) => <li key={title} className="overflow-hidden border border-line bg-white"><div className="relative aspect-[16/9] bg-ink-100"><Image src={processImages[index % processImages.length]} alt="" fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover" /><span className="absolute left-4 top-4 bg-white/95 px-3 py-1.5 text-xs font-extrabold tracking-[.18em] text-brand-800">{String(index + 1).padStart(2, "0")}</span></div><div className="p-5"><h3 className="font-extrabold text-ink-950">{title}</h3><p className="mt-2 text-sm leading-6 text-ink-600">{body}</p></div></li>)}</ol></div></section>

      {brands.length > 0 && <section className="overflow-hidden border-y border-line bg-white py-8 sm:py-10"><div className="wrap flex flex-wrap items-end justify-between gap-4"><div><p className="section-eyebrow">Đối tác thương hiệu</p><h2 className="section-title mt-3">Đồng hành cùng những thương hiệu uy tín</h2></div><Link href="/thuong-hieu" className="text-sm font-bold text-accent-600">Xem tất cả <Icon name="arrow-right" className="inline h-4 w-4" /></Link></div><div className="brand-marquee mt-8" role="region" aria-label="Thương hiệu đối tác"><div className="brand-marquee-track">{[0, 1].map((copy) => <div key={copy} className="brand-marquee-group" aria-hidden={copy === 1}>{brands.slice(0, 12).map((brand) => <div key={brand.id} className="brand-marquee-logo">{brand.logo ? <img src={brand.logo} alt={copy === 0 ? brand.name : ""} /> : <span>{brand.name}</span>}</div>)}</div>)}</div></div></section>}

      <section className="bg-brand-950 py-10 text-white sm:py-14">
        <div className="wrap">
          <div className="grid items-center gap-7 lg:grid-cols-2 lg:gap-12">
          <div><header className="mb-5"><p className="text-xs font-bold uppercase tracking-[.18em] text-accent-200">Năng lực cung ứng</p><h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">Chủ động nguồn hàng. Linh hoạt giao nhận.</h2></header><p className="text-sm leading-7 text-white/75">Hệ thống kho được bố trí theo từng nhóm cáp mạng, cáp quang, thiết bị mạng, thiết bị quang và camera. Quản lý hàng hóa chặt chẽ giúp rút ngắn thời gian soạn hàng và hạn chế gián đoạn trong quá trình cung ứng.</p><p className="mt-3 text-sm leading-7 text-white/75">Quang Thắng phối hợp với các đơn vị vận chuyển, lên phương án giao nhận cho đơn hàng dự án hoặc số lượng lớn theo thời gian, địa điểm và tiến độ thi công.</p><Link href="/lien-he" className="btn-accent mt-6">Trao đổi nhu cầu cung ứng <Icon name="arrow-right" className="h-4 w-4" /></Link></div>
          <figure><div className="relative aspect-[16/10] overflow-hidden"><Image src="/imported/company-profile/web/logistics.webp" alt="Xe giao hàng Quang Thắng cùng các cuộn cáp phục vụ công trình" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" /></div><figcaption className="mt-2 text-xs leading-5 text-white/60">Hình ảnh cung ứng và giao nhận trong hồ sơ năng lực Quang Thắng.</figcaption></figure>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-ink-50 py-10 sm:py-14">
        <div className="wrap">
          <header className="max-w-3xl"><p className="section-eyebrow">Chứng nhận & giấy phép</p><h2 className="section-title mt-3">Nền tảng cho sự tin cậy</h2><p className="mt-4 text-sm leading-7 text-ink-600 sm:text-base">Hồ sơ pháp lý, chứng nhận đại lý và những ghi nhận từ đối tác trong quá trình hoạt động của Quang Thắng.</p></header>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {COMPANY_PROFILE_CERTIFICATES.map((certificate) => <a key={certificate.src} href={certificate.src} target="_blank" rel="noreferrer" className="group flex min-h-[23rem] flex-col border border-line bg-white p-4 transition-all hover:-translate-y-1 hover:border-brand-300 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700" aria-label={`Mở ${certificate.title} kích thước đầy đủ`}><h3 className="min-h-12 text-sm font-extrabold leading-5 text-ink-950">{certificate.title}</h3><div className="relative mt-3 h-52 w-full"><Image src={certificate.src} alt={certificate.title} fill sizes="(min-width:1280px) 16vw, (min-width:1024px) 25vw, 50vw" className="object-contain" /></div><p className="mt-auto pt-4 text-xs leading-5 text-ink-600">{certificate.description}</p><span className="mt-3 text-xs font-bold text-brand-700">Xem ảnh đầy đủ <Icon name="external" className="inline h-3.5 w-3.5" /></span></a>)}
          </div>
        </div>
      </section>

      <section className="wrap py-12 sm:py-16 lg:py-20"><div className="grid items-center gap-9 lg:grid-cols-[1.15fr_.85fr] lg:gap-16"><div className="order-2 lg:order-1"><div className="relative aspect-[16/10] overflow-hidden bg-ink-100 shadow-xl"><Image src="/quanngthangnhanvien.jpeg" alt="Đội ngũ nhân viên Quang Thắng" fill sizes="(min-width:1024px) 58vw, 100vw" className="object-cover object-center" /></div><p className="mt-3 text-sm text-ink-500">Đội ngũ Quang Thắng trong hoạt động nội bộ tại công ty.</p></div><div className="order-1 lg:order-2"><p className="section-eyebrow">Con người Quang Thắng</p><h2 className="mt-4 text-4xl font-extrabold leading-[1.08] text-ink-950 sm:text-5xl lg:text-6xl">Đội ngũ là tài sản quý giá nhất</h2><p className="mt-6 text-base leading-8 text-ink-600 sm:text-lg">Đội ngũ gồm ban lãnh đạo, bộ phận kinh doanh và kỹ thuật, phối hợp từ tư vấn giải pháp, cung ứng sản phẩm đến triển khai hệ thống. Ban lãnh đạo định hướng và quản lý chất lượng; bộ phận kinh doanh chăm sóc khách hàng; đội ngũ kỹ thuật triển khai, giám sát và hỗ trợ vận hành.</p><Link href="/lien-he" className="btn-primary mt-8">Trao đổi với đội ngũ <Icon name="arrow-right" className="h-4 w-4" /></Link></div></div></section>

      <section id="van-phong-quang-thang" className="border-y border-line bg-ink-50 py-10 sm:py-14">
        <div className="wrap grid items-center gap-7 lg:grid-cols-[1fr_1fr] lg:gap-12">
          <div>
            <p className="section-eyebrow">Văn phòng Quang Thắng</p>
            <h2 className="section-title mt-3">Ghé thăm và trao đổi trực tiếp</h2>
            <div className="mt-5 flex items-start gap-3">
              <Icon name="pin" className="mt-1 h-5 w-5 shrink-0 text-brand-700" />
              <div><p className="text-sm font-semibold leading-6 text-ink-800">{profileAddress}</p><a href={directionsHref} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-brand-800 underline decoration-brand-300 underline-offset-4 hover:text-accent-600">Xem chỉ đường <Icon name="external" className="h-4 w-4" /></a></div>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-7 gap-y-3 border-t border-line pt-5 text-sm font-bold">
              <a href={phoneHref} className="inline-flex items-center gap-2 text-ink-800 hover:text-brand-700"><Icon name="phone" className="h-4 w-4 text-brand-700" />{settings.phone}</a>
              <a href={`mailto:${profileEmail}`} className="inline-flex items-center gap-2 text-ink-800 hover:text-brand-700"><Icon name="mail" className="h-4 w-4 text-brand-700" />{profileEmail}</a>
            </div>
          </div>
          <figure className="relative aspect-[4/3] overflow-hidden bg-ink-100">
            <Image src="/imported/company-profile/hinhvanphongmoi.jpeg" alt="Phòng họp tại văn phòng Viễn Thông Quang Thắng" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover object-center" />
            <div className="absolute right-3 top-3 h-28 w-44 overflow-hidden border-2 border-white bg-white shadow-lg sm:h-32 sm:w-52">
              <iframe title="Bản đồ vị trí Viễn Thông Quang Thắng" src={mapEmbedHref} className="h-full w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            </div>
            <figcaption className="absolute bottom-0 left-0 bg-brand-950/85 px-4 py-2 text-xs font-semibold text-white">Văn phòng Viễn Thông Quang Thắng · TP. Hồ Chí Minh</figcaption>
          </figure>
        </div>
      </section>

      <section id="yeu-cau-ho-so-pdf" className="border-y border-line bg-ink-50 py-8 sm:py-10">
        <div className="wrap grid items-center gap-6 lg:grid-cols-[1.1fr_.9fr] lg:gap-12">
          <div>
            <p className="section-eyebrow">Hồ sơ năng lực doanh nghiệp</p>
            <h2 className="section-title mt-3">Cần bản hồ sơ đầy đủ?</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-600">Hồ sơ gốc gồm 16 trang với thông tin doanh nghiệp, hình ảnh công trình và chứng nhận. Gửi yêu cầu để nhận bản PDF trực tiếp từ Quang Thắng.</p>
            <a href={`mailto:${profileEmail}?subject=${encodeURIComponent("Yêu cầu hồ sơ năng lực Quang Thắng")}`} className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-brand-800 underline decoration-brand-300 underline-offset-4 hover:text-accent-600">Yêu cầu qua email <Icon name="arrow-right" className="h-4 w-4" /></a>
          </div>
          <div className="flex items-center gap-5 border-l border-line pl-5 sm:pl-8">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center bg-brand-900 text-white"><Icon name="file-text" className="h-8 w-8" /></div>
            <div><p className="text-xs font-bold uppercase tracking-[.14em] text-accent-600">PROFILE · QUANG THẮNG</p><p className="mt-1 text-sm font-bold text-ink-900">Hồ sơ năng lực bản PDF</p><p className="mt-1 text-xs text-ink-500">16 trang · Tiếng Việt</p></div>
          </div>
        </div>
      </section>

      <section className="wrap py-10 sm:py-16"><div className="relative isolate overflow-hidden rounded-xl bg-brand-950 px-6 py-12 text-center text-white sm:px-12 sm:py-16"><div className="absolute inset-0 -z-10 opacity-35"><Image src="/imported/company-profile/web/logistics.webp" alt="" fill sizes="100vw" className="object-cover object-center" /></div><div className="absolute inset-0 -z-10 bg-brand-950/70" /><p className="text-xs font-bold uppercase tracking-[.18em] text-accent-200">Sẵn sàng đồng hành</p><h2 className="mx-auto mt-3 max-w-none text-3xl font-extrabold text-white sm:text-5xl">{profile.closingTitle}</h2><p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">{profile.closingDescription}</p><div className="mt-8 flex flex-wrap justify-center gap-3"><Link href="/lien-he" className="btn-accent">Liên hệ ngay <Icon name="arrow-right" className="h-4 w-4" /></Link><a href={phoneHref} className="inline-flex h-10 items-center gap-2 rounded border border-white/35 px-4 text-sm font-bold text-white hover:bg-white/10"><Icon name="phone" className="h-4 w-4" />Gọi {settings.phone}</a></div></div></section>
    </div>
  );
}
