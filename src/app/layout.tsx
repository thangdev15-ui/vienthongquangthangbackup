import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ShopProvider } from "@/components/store/shops";
import { GoogleAnalytics } from "@/components/analytics/ga4";
import { LeadEvents } from "@/components/analytics/lead-events";
import { BASE_URL } from "@/lib/types";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Quang Thang Telecom — Thiết bị viễn thông chính hãng",
    template: "%s | Quang Thang Telecom",
  },
  icons: { icon: "/logoqt.png", shortcut: "/logoqt.png", apple: "/logoqt.png" },
  description:
    "Kho thiết bị viễn thông chính hãng: cáp mạng, cáp quang, switch PoE, camera quan sát, thiết bị quang, tủ rack, thang máng cáp. Tư vấn kỹ thuật, giao hàng toàn quốc. Hotline 094.710.6161.",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "Quang Thang Telecom",
    title: "Viễn Thông Quang Thắng — Thiết bị viễn thông chính hãng",
    description: "Cáp mạng • Cáp quang • Switch • Camera • Thiết bị quang • Tủ rack — chính hãng, tư vấn kỹ thuật, giao nhanh.",
  },
};

export const viewport: Viewport = {
  themeColor: "#EAF4FF",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <ShopProvider>{children}</ShopProvider>
        <GoogleAnalytics />
        <LeadEvents />
      </body>
    </html>
  );
}
