import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Icon, type IconName } from "@/components/ui";
import { COMPANY_PROFILE_FACTS, COMPANY_PROFILE_PROJECTS } from "@/lib/company-profile-evidence";
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

const commitments = [
  ["shield", "Chất lượng sản phẩm", "Nguồn gốc rõ ràng, tư vấn đúng cấu hình và nhu cầu."],
  ["clock", "Tiến độ triển khai", "Phản hồi nhanh, phối hợp giao hàng theo kế hoạch."],
  ["file-text", "Chính sách bảo hành", "Thông tin bảo hành, đổi trả và hỗ trợ minh bạch."],
  ["headset", "Hỗ trợ kỹ thuật", "Tư vấn sau bán hàng khi cần kiểm tra hoặc thay thế."],
] as const;

const businessAreas = [
  ["cable", "Cáp mạng & cáp quang", "Vật tư kết nối, dây nhảy, phụ kiện và giải pháp đấu nối."],
  ["server", "Thiết bị mạng", "Switch, router, Wi-Fi, tủ rack và thiết bị mạng cho doanh nghiệp."],
  ["eye", "Camera quan sát", "Camera, đầu ghi, lưu trữ và phụ kiện cho hệ thống an ninh."],
  ["zap", "Thiết bị quang", "Thiết bị truyền dẫn quang và phụ kiện phục vụ hạ tầng viễn thông."],
  ["sun", "Đèn năng lượng mặt trời", "Thiết bị chiếu sáng tiết kiệm năng lượng cho nhiều nhu cầu sử dụng."],
  ["box", "Phụ kiện viễn thông", "Tủ mạng, vật tư thi công và phụ kiện hoàn thiện hệ thống."],
] as const;

export default async function CompanyProfilePage() {
  const [profile, brands, settings] = await Promise.all([getCompanyProfile(), getActiveBrands(), getSettings()]);
  const phoneHref = `tel:${settings.phone.replace(/\D/g, "")}`;
  return (
    <div id="company-profile-page" className="bg-white text-ink-900">
      <section className="relative isolate overflow-hidden bg-brand-950 text-white">
        <div className="absolute inset-0 -z-10"><Image src={profile.heroImage || "/quangthangshop.jpg"} alt="Hạ tầng viễn thông Quang Thắng" fill priority sizes="100vw" className="object-cover object-center opacity-45" /><div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,27,54,.98)_0%,rgba(3,27,54,.86)_43%,rgba(3,27,54,.35)_100%)]" /></div>
        <div className="wrap py-16 sm:py-20 lg:py-28"><div className="max-w-3xl"><div className="mb-6 flex items-center gap-2 text-xs font-semibold text-white/65"><Link href="/">Trang chủ</Link><span>/</span><span className="text-white">Hồ sơ năng lực</span></div><p className="flex items-center gap-3 text-xs font-extrabold uppercase tracking-[.2em] text-accent-200"><span className="h-px w-9 bg-accent-500" />{profile.heroEyebrow || "Hồ sơ năng lực"}</p><h1 className="mt-5 max-w-2xl text-4xl font-extrabold uppercase leading-[1.05] tracking-tight text-white sm:text-6xl">{profile.heroTitle || "Hồ sơ năng lực"}</h1><p className="mt-5 max-w-2xl text-lg font-semibold text-white/90 sm:text-xl">Giải pháp hạ tầng viễn thông - mạng lưới đáng tin cậy</p><p className="mt-4 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">{profile.heroDescription}</p><div className="mt-8 flex flex-wrap gap-3"><Link href="/lien-he" className="btn-accent"><Icon name="message" className="h-4 w-4" />Liên hệ tư vấn</Link><a href={phoneHref} className="inline-flex h-10 items-center gap-2 rounded border border-white/35 px-4 text-sm font-bold text-white hover:bg-white/10"><Icon name="phone" className="h-4 w-4" />{settings.phone}</a></div></div></div>
        <div className="border-t border-white/10 bg-brand-950/45"><div className="wrap grid grid-cols-2 gap-4 py-5 text-xs font-semibold text-white/75 sm:grid-cols-4"><span className="flex items-center gap-2"><Icon name="shield" className="h-5 w-5 text-accent-200" />Chính hãng</span><span className="flex items-center gap-2"><Icon name="settings" className="h-5 w-5 text-accent-200" />Tư vấn chuyên sâu</span><span className="flex items-center gap-2"><Icon name="file-text" className="h-5 w-5 text-accent-200" />Hỗ trợ CO/CQ</span><span className="flex items-center gap-2"><Icon name="truck" className="h-5 w-5 text-accent-200" />Giao hàng toàn quốc</span></div></div>
      </section>

      <section className="border-b border-line bg-white">
        <div className="wrap grid grid-cols-2 gap-y-6 py-7 sm:grid-cols-4">
          {[["2018", "Hoạt động từ 12/10/2018"], ["Thiết bị", "Điện tử & viễn thông"], ["Giải pháp", "Mạng, camera & kết nối"], ["Đồng hành", "Tư vấn & hỗ trợ kỹ thuật"]].map(([value, label]) => <div key={value} className="border-l border-line px-4 text-center"><p className="text-2xl font-extrabold text-brand-900 sm:text-3xl">{value}</p><p className="mt-2 text-xs font-semibold text-ink-500">{label}</p></div>)}
        </div>
      </section>

      <section className="wrap py-16 sm:py-24"><header className="mb-9"><p className="section-eyebrow">Giới thiệu công ty</p><h2 className="section-title mt-3 lg:whitespace-nowrap">{profile.introTitle || "Công ty Cổ phần Viễn thông Quang Thắng"}</h2></header><div className="grid items-center gap-10 lg:grid-cols-[.9fr_1.1fr] lg:gap-16"><div className="relative order-2 aspect-[4/3] overflow-hidden rounded-lg bg-ink-100 lg:order-1"><Image src={profile.introImage || "/quangthangshop.jpg"} alt="Không gian Viễn Thông Quang Thắng" fill sizes="(min-width:1024px) 45vw, 100vw" className="object-cover" /><div className="absolute bottom-4 right-4 bg-brand-900 px-5 py-4 text-white shadow-xl"><p className="text-xs text-white/60">Đồng hành cùng khách hàng</p><p className="mt-1 font-bold">Chuyên nghiệp · Uy tín</p></div></div><div className="order-1 lg:order-2"><p className="whitespace-pre-line text-sm leading-7 text-ink-600 sm:text-base">{profile.introDescription}</p><div className="mt-7 grid gap-4 sm:grid-cols-2">{[["shield", "Sản phẩm chính hãng"], ["settings", "Tư vấn giải pháp"], ["file-text", "Chính sách rõ ràng"], ["headset", "Đội ngũ hỗ trợ"]].map(([icon, text]) => <div key={text} className="flex items-center gap-3 text-sm font-bold text-ink-800"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700"><Icon name={icon as IconName} className="h-4 w-4" /></span>{text}</div>)}</div><Link href="/gioi-thieu" className="btn-primary mt-8">Xem chi tiết về công ty <Icon name="arrow-right" className="h-4 w-4" /></Link></div></div></section>

      <section className="bg-brand-950 py-16 sm:py-24" aria-labelledby="company-facts-title">
        <div className="wrap">
          <div className="relative overflow-hidden rounded-lg border border-white/20 bg-white px-6 py-8 shadow-xl sm:px-10 sm:py-12 lg:px-14">
            <div className="absolute inset-y-0 left-0 w-2 bg-accent-500" />
            <div className="flex flex-wrap items-end justify-between gap-5 border-b border-line pb-7">
              <div><p className="section-eyebrow">Thông tin pháp lý doanh nghiệp</p><h2 id="company-facts-title" className="section-title mt-3 lg:whitespace-nowrap">Công ty Cổ phần Viễn thông Quang Thắng</h2></div>
              <span className="inline-flex items-center gap-2 border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-bold text-brand-800"><Icon name="file-text" className="h-4 w-4" />Hồ sơ doanh nghiệp</span>
            </div>
            <dl className="mt-5 grid gap-x-12 sm:grid-cols-2 lg:grid-cols-3">
              {COMPANY_PROFILE_FACTS.map(([label, value]) => <div key={label} className="border-b border-line py-5"><dt className="text-xs font-bold uppercase tracking-wide text-ink-500">{label}</dt><dd className="mt-2 break-words text-sm font-semibold leading-6 text-ink-900">{label === "Email trong hồ sơ" ? <a href={`mailto:${value}`} className="text-brand-700 hover:underline">{value}</a> : label === "Hotline" ? <a href="tel:0941746161" className="text-brand-700 hover:underline">{value}</a> : value}</dd></div>)}
            </dl>
            <p className="mt-6 text-xs leading-5 text-ink-500">Thông tin theo hồ sơ năng lực doanh nghiệp Quang Thắng cung cấp.</p>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-ink-50 py-16 sm:py-24"><div className="wrap"><header className="mb-10 max-w-none"><p className="section-eyebrow">Đồng hành cùng sự phát triển</p><h2 className="section-title mt-3 lg:whitespace-nowrap">Một đối tác đáng tin cậy cho mỗi công trình</h2></header><div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:gap-20"><div className="max-w-xl"><p className="text-base leading-7 text-ink-600">Từ một sản phẩm đơn lẻ đến kế hoạch cung ứng dài hạn, Quang Thắng tập trung vào tính phù hợp, khả năng triển khai và hiệu quả sử dụng.</p><Link href="/lien-he" className="btn-primary mt-7">Trao đổi nhu cầu <Icon name="arrow-right" className="h-4 w-4" /></Link></div><div className="divide-y divide-line border-y border-brand-900/20">{values.map((item) => <article key={item.number} className="grid gap-3 py-6 sm:grid-cols-[3.5rem_1fr] sm:gap-5"><span className="pt-1 text-sm font-extrabold tabular-nums text-accent-600">{item.number}</span><div><h3 className="text-xl font-bold text-ink-950">{item.title}</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-ink-600">{item.body}</p></div></article>)}</div></div></div></section>

      <section className="wrap grid gap-10 py-16 sm:py-24 lg:grid-cols-[.7fr_1.3fr] lg:gap-16"><div><p className="section-eyebrow">Năng lực thế mạnh</p><h2 className="section-title mt-3">Năng lực cốt lõi</h2><p className="mt-5 text-sm leading-7 text-ink-600 sm:text-base">Kết hợp danh mục sản phẩm, kinh nghiệm tư vấn và khả năng phối hợp giao hàng để giúp khách hàng triển khai nhanh, đúng và dễ mở rộng.</p><Link href="/lien-he" className="btn-outline mt-7">Xem chi tiết năng lực <Icon name="arrow-right" className="h-4 w-4" /></Link></div><div className="grid gap-4 sm:grid-cols-2">{capabilities.map(([icon, title, body]) => <article key={title} className="rounded-lg border border-line p-5 transition-colors hover:border-brand-400"><Icon name={icon as IconName} className="h-7 w-7 text-brand-700" /><h3 className="mt-5 font-extrabold text-ink-950">{title}</h3><p className="mt-2 text-sm leading-6 text-ink-600">{body}</p></article>)}</div></section>

      <section className="relative overflow-hidden bg-brand-950 py-16 text-white sm:py-20"><div className="absolute inset-0 opacity-15"><Image src="/backgroundne.png" alt="" fill sizes="100vw" className="object-cover object-center" /></div><div className="wrap relative"><div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[.18em] text-accent-200">Giải pháp viễn thông toàn diện</p><h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">{profile.solutionsTitle}</h2><p className="mt-4 text-sm leading-7 text-white/70 sm:text-base">{profile.solutionsDescription}</p></div><div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{profile.solutions.map(({ title, description: body }, index) => <article key={title} className="rounded-md border border-white/15 bg-white/[.06] p-5 backdrop-blur-sm transition-colors hover:border-accent-300/70 hover:bg-white/10"><Icon name={(["wifi", "eye", "cable", "box", "zap", "settings"] as IconName[])[index % 6]} className="h-6 w-6 text-accent-200" /><h3 className="mt-5 font-bold text-white">{title}</h3><p className="mt-2 text-sm leading-6 text-white/65">{body}</p></article>)}</div></div></section>

      <section className="wrap py-16 sm:py-20" aria-labelledby="business-areas-title"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="section-eyebrow">Lĩnh vực hoạt động</p><h2 id="business-areas-title" className="section-title mt-3">Ngành hàng thương mại</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-ink-600">Danh mục thiết bị và vật tư phục vụ hạ tầng viễn thông, mạng, camera và các công trình cần kết nối ổn định.</p></div><Link href="/san-pham" className="text-sm font-bold text-accent-600">Xem sản phẩm <Icon name="arrow-right" className="inline h-4 w-4" /></Link></div><div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{businessAreas.map(([, title, body], index) => <article key={title} className="min-h-48 border-t-2 border-brand-700 bg-ink-50 p-6 transition-colors hover:bg-brand-50 sm:p-7"><span className="text-xs font-bold uppercase tracking-[.16em] text-accent-600">0{index + 1} / Lĩnh vực</span><h3 className="mt-5 text-lg font-extrabold leading-6 text-ink-950 sm:text-xl">{title}</h3><p className="mt-3 max-w-sm text-sm leading-6 text-ink-600">{body}</p></article>)}</div></section>

      <section id="du-an-hoat-dong" className="wrap py-16 sm:py-24" aria-labelledby="projects-title">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div><p className="section-eyebrow">Dấu ấn thực tế</p><h2 id="projects-title" className="section-title mt-3">Dự án & hoạt động kết nối</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-ink-600">Từ hạ tầng mạng, hệ thống an ninh đến những hoạt động gắn kết đối tác. Khám phá hình ảnh thực tế của Quang Thắng qua từng công trình và sự kiện.</p></div>
          <Link href="/lien-he" className="text-sm font-bold text-accent-600 hover:text-accent-700">Trao đổi dự án <Icon name="arrow-right" className="inline h-4 w-4" /></Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-2">
          {COMPANY_PROFILE_PROJECTS.map((project, index) => <article id={project.id} key={project.id} className="overflow-hidden rounded-lg border border-line bg-white shadow-sm">
            <div className="flex items-start gap-4 p-5 sm:p-6"><span className="text-3xl font-extrabold text-brand-200">0{index + 1}</span><div className="min-w-0"><p className="text-xs font-bold uppercase tracking-wide text-accent-600">{project.category}</p><h3 className="mt-1.5 text-lg font-extrabold leading-snug text-ink-950 lg:whitespace-nowrap">{project.title}</h3><p className="mt-2 line-clamp-3 text-sm leading-6 text-ink-600">{project.description}</p></div></div>
            <div className="px-3 pb-3">
              <ProjectGallery images={project.images} projectTitle={project.title} />
            </div>
          </article>)}
        </div>
      </section>

      <section className="border-y border-line bg-ink-50 py-16 sm:py-20"><div className="wrap"><div><p className="section-eyebrow">Quy trình hợp tác</p><h2 className="section-title mt-3 max-w-none lg:whitespace-nowrap">{profile.processTitle}</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-ink-600">Quy trình rõ ràng giúp hai bên thống nhất kỳ vọng và chủ động tiến độ từ lúc tư vấn đến sau bàn giao.</p></div><ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{profile.process.map(({ title, description: body }, index) => <li key={title} className="relative rounded-lg border border-line bg-white p-5"><span className="text-xs font-extrabold tracking-[.18em] text-accent-600">{String(index + 1).padStart(2, "0")}</span><h3 className="mt-4 font-extrabold text-ink-950">{title}</h3><p className="mt-2 text-sm leading-6 text-ink-600">{body}</p></li>)}</ol></div></section>

      {brands.length > 0 && <section className="overflow-hidden border-y border-line bg-white py-12 sm:py-16"><div className="wrap flex flex-wrap items-end justify-between gap-4"><div><p className="section-eyebrow">Đối tác thương hiệu</p><h2 className="section-title mt-3 lg:whitespace-nowrap">Đồng hành cùng những thương hiệu uy tín</h2></div><Link href="/thuong-hieu" className="text-sm font-bold text-accent-600">Xem tất cả <Icon name="arrow-right" className="inline h-4 w-4" /></Link></div><div className="brand-marquee mt-8" role="region" aria-label="Thương hiệu đối tác"><div className="brand-marquee-track">{[0, 1].map((copy) => <div key={copy} className="brand-marquee-group" aria-hidden={copy === 1}>{brands.slice(0, 12).map((brand) => <div key={brand.id} className="brand-marquee-logo">{brand.logo ? <img src={brand.logo} alt={copy === 0 ? brand.name : ""} /> : <span>{brand.name}</span>}</div>)}</div>)}</div></div></section>}

      <section className="bg-brand-950 py-16 text-white sm:py-20">
        <div className="wrap">
          <header className="mb-9"><p className="text-xs font-bold uppercase tracking-[.18em] text-accent-200">Năng lực cung ứng</p><h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl lg:whitespace-nowrap">Chủ động nguồn hàng. Linh hoạt giao nhận.</h2></header>
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div><p className="text-sm leading-7 text-white/75">Hệ thống kho được bố trí theo từng nhóm cáp mạng, cáp quang, thiết bị mạng, thiết bị quang và camera. Quản lý hàng hóa chặt chẽ giúp rút ngắn thời gian soạn hàng và hạn chế gián đoạn trong quá trình cung ứng.</p><p className="mt-4 text-sm leading-7 text-white/75">Quang Thắng phối hợp với các đơn vị vận chuyển, lên phương án giao nhận cho đơn hàng dự án hoặc số lượng lớn theo thời gian, địa điểm và tiến độ thi công.</p><Link href="/lien-he" className="btn-accent mt-7">Trao đổi nhu cầu cung ứng <Icon name="arrow-right" className="h-4 w-4" /></Link></div>
          <figure><div className="relative aspect-[16/10] overflow-hidden rounded-lg"><Image src="/imported/company-profile/web/logistics.webp" alt="Xe giao hàng Quang Thắng cùng các cuộn cáp phục vụ công trình" fill sizes="(min-width:1024px) 45vw, 100vw" className="object-cover" /></div><figcaption className="mt-3 text-xs leading-5 text-white/60">Hình ảnh cung ứng và giao nhận trong hồ sơ năng lực Quang Thắng.</figcaption></figure>
          </div>
        </div>
      </section>

      <section className="wrap py-16 sm:py-24">
        <header className="mb-9"><p className="section-eyebrow">Chứng nhận & giấy phép</p><h2 className="section-title mt-3 lg:whitespace-nowrap">Nền tảng cho sự tin cậy</h2></header>
        <div className="grid items-center gap-10 lg:grid-cols-[.8fr_1.2fr] lg:gap-16">
        <div><p className="text-sm leading-7 text-ink-600">Hồ sơ doanh nghiệp tập hợp giấy chứng nhận, chứng nhận đại lý và các ghi nhận từ đối tác trong quá trình hoạt động.</p><p className="mt-4 text-sm leading-7 text-ink-600">Liên hệ Quang Thắng để nhận bản chi tiết và xác nhận phạm vi, thời hạn của chứng nhận phù hợp với sản phẩm hoặc dự án cần tư vấn.</p><Link href="/lien-he" className="btn-outline mt-7">Yêu cầu hồ sơ chi tiết <Icon name="arrow-right" className="h-4 w-4" /></Link></div>
        <figure><a href="/imported/company-profile/web/chung-nhan.webp" target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg border border-line bg-ink-50" aria-label="Xem ảnh chứng nhận và giấy phép trong hồ sơ (mở tab mới)"><Image src="/imported/company-profile/web/chung-nhan.webp" alt="Trang chứng nhận, giấy phép và chứng nhận đại lý trong hồ sơ năng lực Quang Thắng" width={1786} height={2526} sizes="(min-width:1024px) 50vw, 100vw" className="h-auto w-full" /></a><figcaption className="mt-3 text-xs text-ink-500">Trích trang “Chứng nhận, giấy phép” trong hồ sơ doanh nghiệp · Nhấn để xem ảnh lớn.</figcaption></figure>
        </div>
      </section>

      <section className="wrap py-16 sm:py-24"><header className="mb-9"><p className="section-eyebrow">Con người Quang Thắng</p><h2 className="section-title mt-3 lg:whitespace-nowrap">Đội ngũ là tài sản quý giá nhất</h2></header><div className="grid items-center gap-10 lg:grid-cols-[.8fr_1.2fr] lg:gap-16"><div><p className="text-sm leading-7 text-ink-600 sm:text-base">Đội ngũ gồm ban lãnh đạo, bộ phận kinh doanh và kỹ thuật, phối hợp từ tư vấn giải pháp, cung ứng sản phẩm đến triển khai hệ thống. Ban lãnh đạo định hướng và quản lý chất lượng; bộ phận kinh doanh chăm sóc khách hàng; đội ngũ kỹ thuật triển khai, giám sát và hỗ trợ vận hành.</p><Link href="/lien-he" className="btn-primary mt-7">Kết nối cùng đội ngũ <Icon name="arrow-right" className="h-4 w-4" /></Link></div><div className="relative overflow-hidden rounded-lg"><div className="relative aspect-[1.8]"><Image src="/quanngthangnhanvien.jpeg" alt="Đội ngũ nhân viên Quang Thắng" fill sizes="(min-width:1024px) 60vw, 100vw" className="object-cover object-center" /></div></div></div></section>

      <section className="border-y border-line bg-ink-50 py-16 sm:py-20"><div className="wrap"><div><p className="section-eyebrow">Cam kết dịch vụ</p><h2 className="section-title mt-3 lg:whitespace-nowrap">Giá trị được thể hiện trong từng lần phục vụ</h2></div><div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{commitments.map(([icon, title, body]) => <article key={title} className="rounded-lg border border-line bg-white p-5"><Icon name={icon as IconName} className="h-6 w-6 text-brand-700" /><h3 className="mt-5 font-extrabold text-ink-950">{title}</h3><p className="mt-2 text-sm leading-6 text-ink-600">{body}</p></article>)}</div></div></section>



      <section className="wrap py-10 sm:py-16"><div className="relative isolate overflow-hidden rounded-xl bg-brand-950 px-6 py-12 text-center text-white sm:px-12 sm:py-16"><div className="absolute inset-0 -z-10 opacity-35"><Image src="/banner1.png" alt="" fill sizes="100vw" className="object-cover" /></div><div className="absolute inset-0 -z-10 bg-brand-950/65" /><p className="text-xs font-bold uppercase tracking-[.18em] text-accent-200">Sẵn sàng đồng hành</p><h2 className="mx-auto mt-3 max-w-none text-3xl font-extrabold text-white sm:text-5xl lg:whitespace-nowrap">{profile.closingTitle}</h2><p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">{profile.closingDescription}</p><div className="mt-8 flex flex-wrap justify-center gap-3"><Link href="/lien-he" className="btn-accent">Liên hệ ngay <Icon name="arrow-right" className="h-4 w-4" /></Link><a href={phoneHref} className="inline-flex h-10 items-center gap-2 rounded border border-white/35 px-4 text-sm font-bold text-white hover:bg-white/10"><Icon name="phone" className="h-4 w-4" />Gọi {settings.phone}</a></div></div></section>
    </div>
  );
}
