import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { ShopProvider } from "@/components/store/shops";
import { BASE_URL } from "@/lib/types";

const beVietnam = Be_Vietnam_Pro({
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-be-vietnam",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Viễn Thông Quang Thắng — Tổng kho thiết bị viễn thông, cáp mạng & camera TP.HCM",
    template: "%s | Viễn Thông Quang Thắng",
  },
  description:
    "Kho thiết bị viễn thông chính hãng: cáp mạng, cáp quang, switch PoE, camera quan sát, thiết bị quang, tủ rack, thang máng cáp. Tư vấn kỹ thuật, giao hàng toàn quốc. Hotline 0941.74.6161.",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "Viễn Thông Quang Thắng",
    title: "Viễn Thông Quang Thắng — Thiết bị viễn thông chính hãng",
    description: "Cáp mạng • Cáp quang • Switch • Camera • Thiết bị quang • Tủ rack — chính hãng, tư vấn kỹ thuật, giao nhanh.",
  },
};

export const viewport: Viewport = {
  themeColor: "#f6f8fb",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={beVietnam.variable}>
      <body>
        <ShopProvider>{children}</ShopProvider>
      </body>
    </html>
  );
}
