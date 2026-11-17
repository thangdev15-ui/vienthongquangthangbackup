import type { Metadata } from "next";
import { getSettings } from "@/lib/data";
import { Breadcrumbs, Icon } from "@/components/ui";
import { ContactForm } from "@/components/store/contact";

export const metadata: Metadata = {
  alternates: { canonical: "/lien-he" },
  title: "Liên hệ",
  description: "Liên hệ Viễn Thông Quang Thắng — 435/26 Thống Nhất, P. Thông Tây Hội, TP.HCM. Hotline 094.710.6161 (tư vấn), Zalo báo giá nhanh.",
};
export const revalidate = 600;

export default async function LienHePage() {
  const settings = await getSettings();
  return (
    <div className="wrap py-6">
      <Breadcrumbs items={[{ label: "Liên hệ" }]} />
      <h1 className="mt-3 text-2xl font-extrabold text-ink-950">Liên hệ với chúng tôi</h1>
      <p className="mt-1.5 mb-6 max-w-3xl text-sm text-ink-500">
        Cần báo giá công trình, hỏi thông số kỹ thuật hay đối tác phân phối — để lại thông tin, chúng tôi phản hồi trong giờ làm việc.
      </p>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="space-y-4">
          {(
            [
              ["pin", "Địa chỉ cửa hàng", settings.address],
              ["clock", "Giờ làm việc", settings.hours],
              ["phone", "Điện thoại tư vấn", settings.phone],
              ["message", "Zalo báo giá", `094.710.6161 (${settings.zaloLabel ?? "Quang Thắng"})`],
              ["mail", "Email", settings.email],
            ] as [React.ComponentProps<typeof Icon>["name"], string, string][]
          ).map(([icon, t, d]) => (
            <div key={t} className="card flex items-start gap-3.5 p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-700">
                <Icon name={icon} className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-ink-950">{t}</h2>
                <p className="mt-0.5 break-words text-[13px] text-ink-600">{d}</p>
              </div>
            </div>
          ))}
          <div className="flex gap-2">
            <a href={settings.zalo} target="_blank" rel="noopener" className="btn-zalo h-10 flex-1">
              <Icon name="message" className="h-4 w-4" />
              Chat Zalo
            </a>
            <a href={`tel:${settings.phone.replace(/\D/g, "")}`} className="btn-primary h-10 flex-1">
              <Icon name="phone" className="h-4 w-4" />
              Gọi ngay
            </a>
          </div>
          <a
            href="https://www.google.com/maps/dir/?api=1&destination=435%2F26%20Th%E1%BB%91ng%20Nh%E1%BA%A5t%2C%20Ph%C6%B0%E1%BB%9Dng%20Th%C3%B4ng%20T%C3%A2y%20H%E1%BB%99i%2C%20TP.%20H%E1%BB%93%20Ch%C3%AD%20Minh"
            target="_blank"
            rel="noopener"
            className="btn-outline h-10 w-full"
          >
            <Icon name="external" className="h-4 w-4" />
            Xem chỉ đường đến cửa hàng
          </a>
        </div>

        <div className="space-y-6">
          <div className="card p-5">
            <h2 className="mb-4 text-base font-bold text-ink-950">Gửi lời nhắn / yêu cầu báo giá</h2>
            <ContactForm />
          </div>
          <div className="card overflow-hidden">
            <div className="h-72 sm:h-80">
              <iframe
                title="Bản đồ Viễn Thông Quang Thắng"
                src="https://www.google.com/maps?q=435%2F26%20Thong%20Nhat%2C%20Thuong%20Tay%20Hoi%2C%20Go%20Vap%2C%20Ho%20Chi%20Minh&output=embed"
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
