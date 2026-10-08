/**
 * Seed — Viễn Thông Quang Thắng
 * -----------------------------
 * Dữ liệu: danh mục / thương hiệu / sản phẩm / bài viết được lấy từ website
 * hiện tại vienthongquangthang.com (audit ngày 2026). Giá của sản phẩm thật
 * trên web hiện tại là "Liên hệ" — giữ nguyên priceType = contact, KHÔNG bịa giá.
 *
 * 3 sản phẩm (Demo) có giá cố định, được đánh dấu rõ trong tên sản phẩm và
 * SKU DEMO-*: DUY NHĨM để kiểm thử luồng đặt hàng (cart → checkout → order).
 * Xoá chúng khi chạy migration dữ liệu thật.
 */
import "dotenv/config";
import { randomBytes, scryptSync } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "../src/db/index";
import {
  articles,
  banners,
  brands,
  categories,
  pages,
  products,
  promotions,
  productImages,
  productSpecifications,
  profiles,
} from "../src/db/schema";

function hashPassword(pw: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(pw, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

const P = "https://images.pexels.com/photos";
const img = (id: number, w = 800, h = 800) =>
  `${P}/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=${w}&h=${h}`;

/* ------------------------------ categories ------------------------------ */

type Cat = { slug: string; name: string; parent?: string; sort?: number; desc?: string };
const CATS: Cat[] = [
  { slug: "day-cap-mang", name: "Dây cáp mạng", sort: 1, desc: "Cáp mạng Cat5e, Cat6, Cat6A, Cat6e các loại: Vcom, Commscope, LS-DVH, Việt Hàn, Vĩnh Thịnh… Cuộn 305m chính hãng." },
  { slug: "cap-mang-vcom", name: "Cáp Vcom", parent: "day-cap-mang" },
  { slug: "cap-mang-amp", name: "Cáp Commscope", parent: "day-cap-mang" },
  { slug: "cap-mang-ls", name: "Cáp LS – PURENET", parent: "day-cap-mang" },
  { slug: "cap-mang-viet-han", name: "Cáp Việt Hàn", parent: "day-cap-mang" },
  { slug: "cap-vinh-thinh", name: "Cáp Vĩnh Thịnh", parent: "day-cap-mang" },
  { slug: "cap-mang-hikvision", name: "Cáp Hikvision", parent: "day-cap-mang" },
  { slug: "day-nhay-mang", name: "Dây nhảy mạng", parent: "day-cap-mang" },

  { slug: "day-cap-quang", name: "Dây cáp quang", sort: 2, desc: "Cáp quang Singlemode, Multimode GYXTW outdoor, trong nhà, ống lỏng ngầm — nguồn hàng chính hãng." },
  { slug: "cap-quang-singlemode", name: "Cáp quang Singlemode", parent: "day-cap-quang" },
  { slug: "cap-quang-multimode", name: "Cáp quang Multimode", parent: "day-cap-quang" },

  { slug: "thiet-bi-mang", name: "Thiết bị mạng", sort: 3, desc: "Switch PoE, switch chia mạng, bộ phát WiFi không dây: TP-Link, Ruijie, Onv, Aptek, Draytek, Tenda, Dahua." },
  { slug: "switch-chia-mang", name: "Switch chia mạng", parent: "thiet-bi-mang" },
  { slug: "switch-poe-dahua", name: "Switch PoE Dahua", parent: "switch-chia-mang" },
  { slug: "switch-tp-link", name: "Switch TP-Link", parent: "switch-chia-mang" },
  { slug: "switch-poe-aptek", name: "Switch PoE Aptek", parent: "thiet-bi-mang" },
  { slug: "switch-poe-edaco", name: "Switch PoE Edaco", parent: "thiet-bi-mang" },
  { slug: "switch-poe-onv", name: "Switch PoE Onv", parent: "thiet-bi-mang" },
  { slug: "switch-tenda", name: "Switch Tenda", parent: "thiet-bi-mang" },
  { slug: "bo-phat-wifi-khong-day", name: "Bộ Phát Wifi Không Dây", parent: "thiet-bi-mang" },
  { slug: "tplink", name: "TP-Link", parent: "bo-phat-wifi-khong-day" },
  { slug: "draytek", name: "Draytek", parent: "bo-phat-wifi-khong-day" },
  { slug: "ruijie", name: "Ruijie", parent: "bo-phat-wifi-khong-day" },
  { slug: "tenda", name: "Tenda", parent: "bo-phat-wifi-khong-day" },

  { slug: "thiet-bi-quang", name: "Thiết bị quang", sort: 4, desc: "Bộ chuyển đổi quang điện, chuyển đổi video/HDMI sang quang, hộp phối quang ODF, module quang: Netlink, B&Ton, Wintop, TP-Link, Aptek." },
  { slug: "bo-chuyen-doi-quang-dien", name: "Bộ chuyển đổi quang điện", parent: "thiet-bi-quang" },
  { slug: "bton", name: "CVT B&Ton", parent: "bo-chuyen-doi-quang-dien" },
  { slug: "netlink", name: "CVT Netlink", parent: "bo-chuyen-doi-quang-dien" },
  { slug: "cvt-wintop", name: "CVT Wintop", parent: "bo-chuyen-doi-quang-dien" },
  { slug: "cvt-tp-link", name: "CVT TP-Link", parent: "bo-chuyen-doi-quang-dien" },
  { slug: "cvt-aptek", name: "CVT Aptek", parent: "bo-chuyen-doi-quang-dien" },
  { slug: "bo-chuyen-doi-video-sang-quang", name: "Bộ chuyển đổi video sang quang", parent: "thiet-bi-quang" },
  { slug: "bo-chuyen-doi-hdmi-sang-quang", name: "Bộ chuyển đổi HDMI sang quang", parent: "thiet-bi-quang" },
  { slug: "hop-phoi-quang-odf-ngoai-troi", name: "Hộp phối quang ODF ngoài trời", parent: "thiet-bi-quang" },
  { slug: "hop-phoi-quang-odf-trong-nha", name: "Hộp phối quang ODF trong nhà", parent: "thiet-bi-quang" },
  { slug: "hop-otb-quang", name: "Hộp OTB quang", parent: "thiet-bi-quang" },
  { slug: "hop-phoi-quang", name: "Hộp phối quang", parent: "thiet-bi-quang" },
  { slug: "module-quang-cac-loai", name: "Module quang các loại", parent: "thiet-bi-quang" },
  { slug: "vo-hop-phoi-quang-odf", name: "Vỏ hộp phối quang ODF", parent: "thiet-bi-quang" },

  { slug: "camera-quan-sat", name: "Camera quan sát", sort: 5, desc: "Camera analog, camera IP, đầu ghi DVR/NVR/XVR: Hikvision, Dahua, Tiandy, Ezviz, Imou, camera WiFi." },
  { slug: "camera-tiandy", name: "Camera Tiandy", parent: "camera-quan-sat" },
  { slug: "camera-hikvision", name: "Camera Hikvision", parent: "camera-quan-sat" },
  { slug: "camera-analog-tvi", name: "Camera Analog TVI", parent: "camera-hikvision" },
  { slug: "camera-ip-hikvision", name: "Camera IP Hikvision", parent: "camera-hikvision" },
  { slug: "dau-ghi-camera-dvr-hikvision", name: "Đầu ghi camera DVR", parent: "camera-hikvision" },
  { slug: "dau-ghi-camera-ip-nvr-hikvision", name: "Đầu ghi camera NVR", parent: "camera-hikvision" },
  { slug: "camera-dahua", name: "Camera Dahua", parent: "camera-quan-sat" },
  { slug: "camera-analog-hdcvi-dahua", name: "Camera Analog HDCVI", parent: "camera-dahua" },
  { slug: "camera-ip-dahua", name: "Camera IP Dahua", parent: "camera-dahua" },
  { slug: "dau-ghi-camera-xvr-dahua", name: "Đầu ghi camera XVR", parent: "camera-dahua" },
  { slug: "dau-ghi-camera-ip-nvr-dahua", name: "Đầu ghi camera NVR (Dahua)", parent: "camera-dahua" },
  { slug: "camera-wifi", name: "Camera WiFi", parent: "camera-quan-sat" },
  { slug: "camera-ezviz", name: "Camera Ezviz", parent: "camera-quan-sat" },
  { slug: "camera-imou", name: "Camera Imou", parent: "camera-quan-sat" },

  { slug: "tu-mang", name: "Tủ mạng", sort: 6, desc: "Tủ rack 4U–42U, tủ đựng đầu ghi, tủ thiết bị mạng ngoài trời, phụ kiện tủ mạng." },
  { slug: "tu-rack-cac-loai", name: "Tủ Rack các loại", parent: "tu-mang" },
  { slug: "tu-rack-4u", name: "Tủ rack 4U", parent: "tu-rack-cac-loai" },
  { slug: "tu-rack-6u", name: "Tủ rack 6U", parent: "tu-rack-cac-loai" },
  { slug: "tu-rack-9u", name: "Tủ rack 9U", parent: "tu-rack-cac-loai" },
  { slug: "tu-rack-10u", name: "Tủ rack 10U", parent: "tu-rack-cac-loai" },
  { slug: "tu-rack-12u", name: "Tủ rack 12U", parent: "tu-rack-cac-loai" },
  { slug: "tu-rack-15u", name: "Tủ rack 15U", parent: "tu-rack-cac-loai" },
  { slug: "tu-rack-20u", name: "Tủ rack 20U", parent: "tu-rack-cac-loai" },
  { slug: "tu-rack-27u", name: "Tủ rack 27U", parent: "tu-rack-cac-loai" },
  { slug: "tu-rack-32u", name: "Tủ rack 32U", parent: "tu-rack-cac-loai" },
  { slug: "tu-rack-36u", name: "Tủ rack 36U", parent: "tu-rack-cac-loai" },
  { slug: "tu-rack-42u", name: "Tủ rack 42U", parent: "tu-rack-cac-loai" },
  { slug: "tu-dung-dau-ghi", name: "Tủ đựng đầu ghi", parent: "tu-mang" },
  { slug: "tu-thiet-bi-mang-ngoai-troi", name: "Tủ thiết bị mạng ngoài trời", parent: "tu-mang" },
  { slug: "phu-kien-tu-mang", name: "Phụ kiện tủ mạng", parent: "tu-mang" },

  { slug: "phu-kien-mang", name: "Phụ kiện mạng", sort: 7, desc: "Đầu bấm mạng RJ45, kìm bấm mạng, nguồn 12V, phụ kiện camera." },
  { slug: "dau-bam-mang-rj45", name: "Đầu bấm mạng RJ45", parent: "phu-kien-mang" },
  { slug: "kim-bam-mang", name: "Kìm bấm mạng", parent: "phu-kien-mang" },
  { slug: "nguon-12v", name: "Nguồn 12V", parent: "phu-kien-mang" },
  { slug: "phu-kien-camera", name: "Phụ kiện camera", parent: "phu-kien-mang" },

  { slug: "phu-kien-quang", name: "Phụ kiện quang", sort: 8, desc: "Bộ chia quang PLC, dây hàn quang, dây nhảy quang, đầu fast connect SC, dụng cụ thi công cáp quang." },
  { slug: "bo-chia-quang-plc", name: "Bộ chia quang PLC", parent: "phu-kien-quang" },
  { slug: "day-han-quang", name: "Dây hàn quang", parent: "phu-kien-quang" },
  { slug: "day-nhay-quang", name: "Dây nhảy quang", parent: "phu-kien-quang" },
  { slug: "dung-cu-thi-cong-cap-quang", name: "Dụng cụ thi công cáp quang", parent: "phu-kien-quang" },
  { slug: "dau-fast-connect-sc", name: "Đầu Fast connect SC", parent: "phu-kien-quang" },

  { slug: "den-nang-luong-mat-troi", name: "Đèn, quạt năng lượng mặt trời", sort: 9, desc: "Đèn hiệu, quạt năng lượng mặt trời Angel Lighting, Jindian." },
  { slug: "den-hieu-angel-lighting", name: "Đèn hiệu Angel Lighting", parent: "den-nang-luong-mat-troi" },
  { slug: "den-hieu-jindian", name: "Đèn hiệu Jindian", parent: "den-nang-luong-mat-troi" },

  { slug: "thang-mang-cap", name: "Thang máng cáp", sort: 10, desc: "Thang cáp, máng cáp các loại cho hạ tầng kỹ thuật công trình." },
  { slug: "mang-cap", name: "Máng cáp", parent: "thang-mang-cap" },
  { slug: "thang-cap", name: "Thang cáp", parent: "thang-mang-cap" },
];

const CAT_IMAGES: Record<string, string> = {
  "day-cap-mang": img(97975),
  "day-cap-quang": img(2420212, 900, 600),
  "thiet-bi-mang": img(2881232, 900, 600),
  "thiet-bi-quang": img(4486718, 900, 600),
  "camera-quan-sat": img(25384403, 900, 600),
  "tu-mang": img(2881229, 900, 600),
  "phu-kien-mang": img(28248555, 900, 600),
  "phu-kien-quang": img(4373998, 900, 600),
  "thang-mang-cap": img(5050305, 900, 600),
};

/* --------------------------------- brands --------------------------------- */

const BRANDS: { slug: string; name: string; desc: string }[] = [
  { slug: "vcom", name: "Vcom", desc: "Thương hiệu cáp mạng Vcom — các dòng cáp Cat5e, Cat6 FTP/UTP cho công trình." },
  { slug: "commscope-amp", name: "COMMSCOPE/AMP", desc: "Cáp mạng COMMSCOPE/AMP chuẩn quốc tế cho hạ tầng mạng chuyên nghiệp." },
  { slug: "ls-purenet", name: "LS-PURENET", desc: "Cáp mạng LS-PURENET dòng chất lượng cao." },
  { slug: "viet-han", name: "Việt Hàn", desc: "Dây cáp mạng LS-DVH của công ty Việt Hàn — truyền dẫn tín hiệu tốt." },
  { slug: "vinh-thinh", name: "Vĩnh Thịnh", desc: "Cáp mạng Vĩnh Thịnh cho công trình dân dụng và doanh nghiệp." },
  { slug: "hikvision", name: "Hikvision", desc: "Camera, đầu ghi, cáp mạng Hikvision — hệ sinh thái an ninh tổng thể." },
  { slug: "tp-link", name: "TP-Link", desc: "Switch, router, bộ phát WiFi, module quang TP-Link." },
  { slug: "ruijie", name: "Ruijie", desc: "Thiết bị mạng Ruijie cho doanh nghiệp và campus." },
  { slug: "onv", name: "Onv", desc: "Switch PoE Onv cho hệ thống camera IP." },
  { slug: "apteck", name: "Aptek", desc: "Switch PoE, bộ chuyển đổi quang Aptek." },
  { slug: "draytek", name: "Draytek", desc: "Router, bộ phát WiFi Draytek cho doanh nghiệp." },
  { slug: "tenda", name: "Tenda", desc: "Switch, router, thiết bị phát sóng WiFi Tenda." },
  { slug: "dahua", name: "Dahua", desc: "Camera, đầu ghi, switch PoE Dahua." },
  { slug: "tiandy", name: "Tiandy", desc: "Camera Tiandy cho nhà ở và văn phòng." },
  { slug: "ezviz", name: "Ezviz", desc: "Camera WiFi Ezviz cho gia đình." },
  { slug: "imou", name: "Imou", desc: "Camera WiFi Imou — giải pháp giám sát từ xa." },
  { slug: "netlink", name: "Netlink", desc: "Bộ chuyển đổi quang điện Netlink cho đường truyền dài." },
  { slug: "b-ton", name: "B&Ton", desc: "Bộ chuyển đổi quang điện B&Ton." },
  { slug: "wintop", name: "Wintop", desc: "Bộ chuyển đổi quang Wintop." },
  { slug: "unitek", name: "Unitek", desc: "Cáp HDMI, phụ kiện AV Unitek." },
  { slug: "angel-lighting", name: "Angel Lighting", desc: "Đèn hiệu năng lượng mặt trời Angel Lighting." },
  { slug: "jindian", name: "Jindian", desc: "Đèn hiệu Jindian." },
];

/* --------------------------------- products -------------------------------- */

type Prod = {
  slug: string;
  name: string;
  brand?: string;
  cat?: string;
  sku?: string;
  desc?: string;
  image: string;
  specs?: [string, string][];
  featured?: boolean;
  bestseller?: boolean;
  sale?: boolean;
  rating?: number;
  price?: number;
  salePrice?: number;
  stock?: number;
  warranty?: string;
};

const PRODUCTS: Prod[] = [
  {
    slug: "cap-mang-vcom-cat6-ftp-24awg-4prs-pe-ss",
    name: "Cáp mạng Vcom Cat6 FTP 24AWG 4PRS- PE – SS (ST 1.0mm)",
    brand: "vcom",
    cat: "cap-mang-vcom",
    sku: "VCM-C6FTP-SS",
    desc: "Cáp mạng Vcom chuẩn Cat6 có chống nhiễu FTP, dây đồng 24AWG, 4 cặp xoắn, vỏ PE có dây chống cháy ST 1.0mm — phù hợp đi âm tường, trần nhà và ngoài trời.",
    image: img(97975),
    specs: [["Chuẩn cáp", "Cat6 FTP"], ["Dây dẫn", "Đồng 24AWG"], ["Cấu trúc", "4 cặp xoắn (4PRS)"], ["Lớp chống nhiễu", "Foil (FTP)"], ["Vỏ cáp", "PE + dây chống cháy ST 1.0mm"], ["Cuộn", "305m"]],
    featured: true,
  },
  {
    slug: "cap-mang-cat5e-utp-vcom-25awg-4prs-pvc",
    name: "Cáp mạng Cat5E UTP 25AWG 4PRS Vcom – PVC",
    brand: "vcom",
    cat: "cap-mang-vcom",
    sku: "VCM-C5E-25-PVC",
    desc: "Cáp mạng Vcom Cat5e UTP 25AWG vỏ PVC — lựa chọn kinh tế cho mạng LAN văn phòng, trường học.",
    image: img(163047),
    specs: [["Chuẩn cáp", "Cat5e UTP"], ["Dây dẫn", "25AWG"], ["Cấu trúc", "4 cặp xoắn (4PRS)"], ["Vỏ cáp", "PVC"], ["Cuộn", "305m"]],
  },
  {
    slug: "cap-lan-cat6e-cca-ftp-23awg-vcom",
    name: "Cáp LAN CAT6E CCA FTP 23AWG 4PRS Solid – PVC",
    brand: "vcom",
    cat: "cap-mang-vcom",
    sku: "VCM-C6E-CCA-FTP",
    desc: "Cáp LAN Cat6e CCA FTP 23AWG Solid vỏ PVC, chống nhiễu tốt cho môi trường công nghiệp.",
    image: img(3541557),
    specs: [["Chuẩn cáp", "Cat6e FTP"], ["Dây dẫn", "CCA 23AWG Solid"], ["Cấu trúc", "4 cặp xoắn"], ["Vỏ cáp", "PVC"]],
  },
  {
    slug: "cap-lan-cat5e-utp-25awg-pe",
    name: "Cáp LAN CAT5E UTP 25AWG 4PRS – PE",
    brand: "vcom",
    cat: "cap-mang-vcom",
    sku: "VCM-C5E-25-PE",
    desc: "Cáp LAN Cat5e UTP 25AWG vỏ PE — chống tia UV, phù hợp đi nổi ngoài trời.",
    image: img(28248555),
    specs: [["Chuẩn cáp", "Cat5e UTP"], ["Dây dẫn", "25AWG"], ["Vỏ cáp", "PE"]],
  },
  {
    slug: "cap-lan-cat5e-utp-25awg-pe-ss",
    name: "Cáp LAN CAT5E UTP 25AWG 4PRS – PE – SS (St1.0mm) – VCOM",
    brand: "vcom",
    cat: "cap-mang-vcom",
    sku: "VCM-C5E-25-PSS",
    desc: "Cáp Cat5e UTP 25AWG vỏ PE có dây chống cháy ST 1.0mm.",
    image: img(1597776),
    specs: [["Chuẩn cáp", "Cat5e UTP"], ["Dây dẫn", "25AWG"], ["Vỏ cáp", "PE + ST 1.0mm"]],
  },
  {
    slug: "cap-lan-cat5e-cca-utp-24awg-vcom",
    name: "Cáp LAN CAT5E CCA UTP 24AWG 4PRS Solid – PVC",
    brand: "vcom",
    cat: "cap-mang-vcom",
    sku: "VCM-C5E-CCA-24",
    desc: "Cáp Cat5e CCA UTP 24AWG Solid PVC — giá tốt cho dự án số lượng lớn.",
    image: img(97975),
    specs: [["Chuẩn cáp", "Cat5e UTP"], ["Dây dẫn", "CCA 24AWG Solid"], ["Vỏ cáp", "PVC"]],
  },
  {
    slug: "cap-lan-cat6e-cca-utp-23awg-vcom",
    name: "Cáp LAN CAT6E CCA UTP 23AWG 4PRS Solid – PVC",
    brand: "vcom",
    cat: "cap-mang-vcom",
    sku: "VCM-C6E-CCA-23",
    desc: "Cáp Cat6e CCA UTP 23AWG Solid PVC.",
    image: img(163047),
    specs: [["Chuẩn cáp", "Cat6e UTP"], ["Dây dẫn", "CCA 23AWG Solid"], ["Vỏ cáp", "PVC"]],
  },
  {
    slug: "day-thue-bao-dong-ngam-co-dau",
    name: "Dây thuê bao đồng ngầm có dầu, chống nhiễu 2x2x0.5mm – PE",
    cat: "day-cap-mang",
    sku: "DTC-22-05-PE",
    desc: "Dây thuê bao đồng ngầm có dầu chống nhiễu 2x2x0.5mm vỏ PE — dùng cho đường dây thuê bao truyền thông.",
    image: img(2420212),
    specs: [["Cấu trúc", "2x2x0.5mm đồng"], ["Loại", "Ngầm có dầu"], ["Vỏ cáp", "PE"]],
  },
  {
    slug: "day-dropwire-camera-2x2x0-5cu-7-0-33st-pe",
    name: "Dây Dropwire Camera 2x(2×0.5)Cu + (7×0.33)St-PE",
    cat: "day-cap-mang",
    sku: "DW-CAM-2205",
    desc: "Dây Dropwire dùng cho camera và truyền thông, lõi đồng 2x(2×0.5)Cu kết hợp 7×0.33St chống kéo, vỏ PE.",
    image: img(3541557),
    specs: [["Lõi dẫn", "2x(2×0.5) Cu"], ["Chống kéo", "(7×0.33) St"], ["Vỏ cáp", "PE"]],
  },
  {
    slug: "bo-chuyen-doi-splitter-poe",
    name: "Bộ Chuyển Đổi Splitter POE 48v sang 12v",
    cat: "phu-kien-mang",
    sku: "SP-48-12",
    desc: "Bộ splitter PoE nhận nguồn 48V từ switch PoE và tách thành nguồn 12V cho camera không hỗ trợ PoE — tiết kiệm chi phí đi dây nguồn.",
    image: img(13963756),
    specs: [["Đầu vào", "48V PoE"], ["Đầu ra", "12V DC"], ["Ứng dụng", "Camera không PoE"]],
    bestseller: true,
  },
  {
    slug: "converter-quang-1-soi-netlink-3100b",
    name: "Converter quang 1 sợi Netlink 3100B, 25Km",
    brand: "netlink",
    cat: "netlink",
    sku: "NL-3100B",
    desc: "Bộ chuyển đổi quang điện Netlink 3100B 1 sợi, tầm xa 25Km — cầu nối giữa kết nối điện RJ45 và sợi quang đơn mode.",
    image: img(4373997),
    specs: [["Model", "Netlink 3100B"], ["Sợi quang", "1 sợi (Singlemode)"], ["Tầm xa", "25Km"], ["Cổng điện", "RJ45"]],
    featured: true,
    bestseller: true,
    rating: 5,
  },
  {
    slug: "switch-poe-8-port-onv-h1108pls-2-uplink",
    name: "Switch PoE 8 Port Onv H1108PLS + 2 Uplink",
    brand: "onv",
    cat: "switch-poe-onv",
    sku: "ONV-H1108PLS",
    desc: "Switch PoE 8 cổng + 2 uplink Onv H1108PLS — cấp nguồn cho camera IP, AP qua một cáp mạng duy nhất.",
    image: img(2881224),
    specs: [["Số cổng", "8 PoE + 2 uplink"], ["Chuẩn PoE", "802.3af/at"], ["Ứng dụng", "Camera IP, Access Point"]],
    featured: true,
    bestseller: true,
    rating: 5,
  },
  {
    slug: "cap-mang-commscope-amp-cat6-utp-23awg",
    name: "Cáp mạng COMMSCOPE/AMP Cat6 UTP 23AWG",
    brand: "commscope-amp",
    cat: "cap-mang-amp",
    sku: "AMP-C6-23",
    desc: "Cáp mạng COMMSCOPE/AMP Cat6 UTP 23AWG — tiêu chuẩn hạ tầng mạng cho công trình lớn.",
    image: img(163047),
    specs: [["Chuẩn cáp", "Cat6 UTP"], ["Dây dẫn", "23AWG"], ["Hãng", "COMMSCOPE/AMP"]],
    featured: true,
    bestseller: true,
  },
  {
    slug: "cap-quang-multimode-4fo-4-soi-gyxtw-om3",
    name: "Cáp quang Multimode 4FO – 4 sợi GYXTW OM3 50/125µm outdoor",
    cat: "cap-quang-multimode",
    sku: "FMM-4FO-OM3",
    desc: "Cáp quang multimode 4 sợi GYXTW chuẩn OM3 50/125µm, loại outdoor — cho các hệ thống FTTH, FTTB và mạng campus.",
    image: img(4425157),
    specs: [["Loại", "Multimode OM3"], ["Số sợi", "4FO"], ["Cấu trúc", "GYXTW outdoor"], ["Cỡ lõi", "50/125µm"]],
    featured: true,
    bestseller: true,
    rating: 5,
  },
  {
    slug: "cap-quang-2fo-ong-long-ngam",
    name: "Cáp quang 2FO Singlemode ống lỏng, ngầm",
    cat: "cap-quang-singlemode",
    sku: "FSM-2FO-LL",
    desc: "Cáp quang singlemode 2 sợi, cấu trúc ống lỏng (loose tube), thiết kế cho thi công ngầm.",
    image: img(2420212),
    specs: [["Loại", "Singlemode"], ["Số sợi", "2FO"], ["Cấu trúc", "Ống lỏng"], ["Thi công", "Ngầm"]],
    bestseller: true,
  },
  {
    slug: "cap-mang-cat5e-utp-vcom-24awg-4prs-pvc",
    name: "Cáp mạng Cat5E UTP Vcom 24AWG 4PRS – PVC",
    brand: "vcom",
    cat: "cap-mang-vcom",
    sku: "VCM-C5E-24-PVC",
    desc: "Cáp mạng Vcom Cat5e UTP 24AWG 4 cặp xoắn vỏ PVC — sản phẩm bán chạy cho dự án mạng LAN.",
    image: img(97975),
    specs: [["Chuẩn cáp", "Cat5e UTP"], ["Dây dẫn", "24AWG"], ["Cấu trúc", "4PRS"], ["Vỏ cáp", "PVC"]],
    bestseller: true,
    rating: 5,
  },
  {
    slug: "switch-5-port-tp-link-ls1005g",
    name: "Switch 5 Port TP-Link TL-SL1005G – Switch để bàn 5 cổng",
    brand: "tp-link",
    cat: "switch-tp-link",
    sku: "TL-SL1005G",
    desc: "Switch 5 cổng Gigabit TP-Link TL-SL1005G, không quạt, dùng cho gia đình và văn phòng nhỏ.",
    image: img(2881228),
    specs: [["Số cổng", "5 RJ45"], ["Tốc độ", "10/100/1000 Mbps"], ["Dung lượng", "Gigabit"]],
    bestseller: true,
    rating: 5,
  },
  {
    slug: "cap-mang-cat5e-utp-vcom-24awg-4prs-pe",
    name: "Cáp mạng Cat5e UTP Vcom 24AWG 4PRS Solid PE",
    brand: "vcom",
    cat: "cap-mang-vcom",
    sku: "VCM-C5E-24-PE",
    desc: "Cáp Vcom Cat5e UTP 24AWG Solid, vỏ PE chống tia UV — phù hợp đi nổi và ngoài trời.",
    image: img(3541557),
    specs: [["Chuẩn cáp", "Cat5e UTP"], ["Dây dẫn", "24AWG Solid"], ["Vỏ cáp", "PE"]],
    featured: true,
    bestseller: true,
    rating: 5,
  },
  {
    slug: "day-han-quang-multimode-sc-om3",
    name: "Dây hàn quang Multimode SC OM3",
    cat: "day-han-quang",
    sku: "FH-MM-SC-OM3",
    desc: "Dây hàn quang (pigtail) multimode đầu nối SC chuẩn OM3 — hàn trực tiếp vào sợi quang của cáp chính.",
    image: img(4280696),
    specs: [["Loại", "Multimode OM3"], ["Đầu nối", "SC"], ["Dùng cho", "Hàn quang"]],
  },
  {
    slug: "tu-rack-6u-d400-mau-trang",
    name: "Tủ Rack 6U-D400, Tủ mạng 6U-D400 19″ – Màu trắng",
    cat: "tu-rack-6u",
    sku: "TR-6U-D400",
    desc: "Tủ rack mạng 6U-D400 chuẩn 19 inch, màu trắng — để đầu ghi, modem, switch cho gia đình và văn phòng.",
    image: img(2881229),
    specs: [["Kích thước rack", "6U"], ["Chuẩn", "19 inch"], ["Màu", "Trắng"]],
  },
  {
    slug: "cap-mang-cat6a-ftp-23awg-nguon-viet-han",
    name: "Cáp mạng CAT6A FTP 23AWG LS-DVH – PVC",
    brand: "viet-han",
    cat: "cap-mang-viet-han",
    sku: "LS-DVH-C6A-23",
    desc: "Cáp mạng Cat6A FTP 23AWG dòng LS-DVH của Việt Hàn — truyền dẫn 10G, chống nhiễu cao cho data center.",
    image: img(1597776),
    specs: [["Chuẩn cáp", "Cat6A FTP"], ["Dây dẫn", "23AWG"], ["Dòng sản phẩm", "LS-DVH"], ["Vỏ cáp", "PVC"]],
    featured: true,
  },
  {
    slug: "cap-lan-lien-nguon-cat5e-utp-vcom-24awg",
    name: "Cáp Lan liền nguồn Cat5E UTP Vcom 24AWG PVC + 2VCm0.5mm2 – PE_OVAL",
    brand: "vcom",
    cat: "cap-mang-vcom",
    sku: "VCM-LAN-PWR-24",
    desc: "Cáp LAN liền nguồn Vcom: Cat5e UTP 24AWG + 2 lõi điện 0.5mm2 — tiết kiệm thi công cho camera ngoài trời.",
    image: img(28248555),
    specs: [["Cáp mạng", "Cat5e UTP 24AWG PVC"], ["Cáp nguồn", "2 lõi 0.5mm2"], ["Vỏ", "PE oval"]],
  },
  {
    slug: "cap-mang-vcom-cat5e-utp-24awg-4prs-pe-ss",
    name: "Cáp mạng Vcom Cat5e UTP 24AWG 4PRS- PE – SS (ST 1.0mm)",
    brand: "vcom",
    cat: "cap-mang-vcom",
    sku: "VCM-C5E-24-PSS",
    desc: "Cáp Vcom Cat5e UTP 24AWG vỏ PE có dây chống cháy ST 1.0mm.",
    image: img(163047),
    specs: [["Chuẩn cáp", "Cat5e UTP"], ["Dây dẫn", "24AWG"], ["Vỏ cáp", "PE + ST 1.0mm"]],
  },
  {
    slug: "cap-hdmi-10m-unitek-yc-142m",
    name: "Cáp HDMI 10M Unitek YC-142M",
    brand: "unitek",
    cat: "bo-chuyen-doi-hdmi-sang-quang",
    sku: "UNITEK-YC-142M",
    desc: "Cáp HDMI 10m Unitek YC-142M — truyền tín hiệu hình ảnh chất lượng cao qua khoảng cách dài.",
    image: img(28248555),
    specs: [["Chiều dài", "10m"], ["Chuẩn", "HDMI"]],
    sale: true,
  },
  {
    slug: "chuyen-doi-quang-dien-yt-8110sb-11-20b-1-soi-quang-100m",
    name: "Chuyển đổi quang điện YT-8110SB-11-20B, 1 sợi quang 100M",
    cat: "bo-chuyen-doi-quang-dien",
    sku: "YT-8110SB-20B",
    desc: "Bộ chuyển đổi quang điện 1 sợi quang, tầm xa 100M, model YT-8110SB-11-20B.",
    image: img(4864249),
    specs: [["Model", "YT-8110SB-11-20B"], ["Sợi quang", "1 sợi"], ["Tầm xa", "100M"]],
  },
  {
    slug: "chuyen-doi-quang-dien-yt-8110sb-11-20a-1-soi-quang-100m",
    name: "Chuyển đổi quang điện YT-8110SB-11-20A, 1 sợi quang 100M",
    cat: "bo-chuyen-doi-quang-dien",
    sku: "YT-8110SB-20A",
    desc: "Bộ chuyển đổi quang điện 1 sợi quang, tầm xa 100M, model YT-8110SB-11-20A.",
    image: img(4373998),
    specs: [["Model", "YT-8110SB-11-20A"], ["Sợi quang", "1 sợi"], ["Tầm xa", "100M"]],
  },

  /* ------------------------- DEMO (test order flow) ------------------------- */
  {
    slug: "day-nhay-mang-cat6-1m-demo",
    name: "Dây nhảy mạng Cat6 UTP 1m — (Demo kiểm tra)",
    brand: "vcom",
    cat: "day-nhay-mang",
    sku: "DEMO-PATCH-1M",
    desc: "Sản phẩm DEMO có giá cố định để kiểm tra luồng đặt hàng. Xoá khi migration dữ liệu thật.",
    image: img(97975),
    specs: [["Chuẩn cáp", "Cat6 UTP"], ["Chiều dài", "1m"]],
    price: 45000,
    salePrice: 35000,
    stock: 50,
    sale: true,
    featured: true,
    warranty: "12 tháng",
  },
  {
    slug: "nguồn-12v-1a-demo",
    name: "Nguồn 12V 1A cho camera — (Demo kiểm tra)",
    brand: "hikvision",
    cat: "nguon-12v",
    sku: "DEMO-PSU-12V",
    desc: "Sản phẩm DEMO có giá cố định để kiểm tra luồng đặt hàng. Xoá khi migration dữ liệu thật.",
    image: img(1597776),
    specs: [["Điện áp", "12V DC"], ["Dòng", "1A"]],
    price: 120000,
    stock: 30,
    featured: true,
    warranty: "6 tháng",
  },
  {
    slug: "dau-bam-rj45-cat6-hop-10-demo",
    name: "Đầu bấm mạng RJ45 Cat6 (hộp 10 cái) — (Demo kiểm tra)",
    brand: "vcom",
    cat: "dau-bam-mang-rj45",
    sku: "DEMO-RJ45-10",
    desc: "Sản phẩm DEMO có giá cố định để kiểm tra luồng đặt hàng. Xoá khi migration dữ liệu thật.",
    image: img(28248555),
    specs: [["Chuẩn", "Cat6"], ["Số lượng", "10 cái/hộp"]],
    price: 35000,
    salePrice: 28000,
    stock: 100,
    sale: true,
  },
];

/* --------------------------------- articles -------------------------------- */

type Art = { slug: string; title: string; category: string; tags: string; excerpt: string; cover: string; content: string };

const ARTICLES: Art[] = [
  {
    slug: "cach-thiet-lap-modem-wifi-don-gian",
    title: "Cách thiết lập Modem Wifi đơn giản ai cũng làm được",
    category: "Thiết bị mạng",
    tags: "modem, wifi, mạng gia đình",
    excerpt: "Nếu lần đầu tiên sử dụng bộ phát WiFi, chắc chắn bạn sẽ gặp không ít khó khăn trong việc cài đặt. Bài viết này hướng dẫn từng bước một cách dễ hiểu nhất.",
    cover: img(2881228, 900, 500),
    content: `<p>Nếu lần đầu tiên sử dụng bộ phát WiFi, chắc chắn bạn sẽ gặp không ít khó khăn trong việc cài đặt. Bài viết này hướng dẫn các bước thiết lập modem WiFi đơn giản, phù hợp với cả người dùng gia đình.</p>
<h2>Chuẩn bị trước khi cài đặt</h2>
<p>Trước tiên, kiểm tra modem đã được nhà cung cấp mạng (VNPT, FPT, Viettel…) kích hoạt hay chưa. Chuẩn bị một laptop hoặc máy tính có cổng LAN để kết nối trực tiếp với modem bằng cáp mạng — cách này ổn định hơn so với kết nối WiFi khi cấu hình ban đầu.</p>
<h2>Các bước thiết lập</h2>
<p><strong>Bước 1:</strong> Cắm nguồn và cáp mạng từ tường vào cổng WAN (Internet) của modem.<br />
<strong>Bước 2:</strong> Mở trình duyệt, nhập địa chỉ quản trị (thường là 192.168.1.1 hoặc 192.168.0.1).<br />
<strong>Bước 3:</strong> Đăng nhập bằng tài khoản mặc định in ở đáy modem, sau đó đổi mật khẩu quản trị.<br />
<strong>Bước 4:</strong> Đặt tên mạng WiFi (SSID) và mật khẩu WiFi (khuyến nghị chuẩn WPA2/WPA3, tối thiểu 8 ký tự).<br />
<strong>Bước 5:</strong> Lưu cấu hình và khởi động lại thiết bị.</p>
<h2>Lỗi thường gặp</h2>
<p>Truy cập không được trang quản trị: kiểm tra lại IP, thử cáp mạng khác hoặc reset modem. WiFi không phát sóng: kiểm tra mục vô tuyến (Wireless) trong cài đặt. Nếu tốc độ internet chậm bất thường, hãy kiểm tra kênh WiFi và vị trí đặt thiết bị.</p>`,
  },
  {
    slug: "cap-dong-truc-la-gi-cau-tao-cap-dong-truc",
    title: "Cáp đồng trục là gì? Cấu tạo và các loại cáp đồng trục phổ biến",
    category: "Cáp & Phụ kiện",
    tags: "cáp đồng trục, RG6, camera analog",
    excerpt: "Trong thời đại công nghệ thông tin phát triển, cáp đồng trục vẫn giữ vai trò quan trọng trong các hệ thống camera analog và truyền hình cáp. Hãy cùng tìm hiểu cấu tạo và phân loại.",
    cover: img(97975, 900, 500),
    content: `<p>Cáp đồng trục (coaxial cable) là loại cáp truyền tín hiệu điện dạng sóng liên tục, được sử dụng rộng rãi trong hệ thống camera analog và truyền hình cáp (cáp TV).</p>
<h2>Cấu tạo của cáp đồng trục</h2>
<p>Cáp gồm 4 lớp: <strong>(1) Lõi dẫn</strong> thường bằng đồng, <strong>(2) Lớp cách điện</strong> bằng nhựa PE/FOAM, <strong>(3) Lõi bện</strong> bằng nhôm/đồng làm lớp vỏ chắn nhiễu, <strong>(4) Vỏ nhựa bảo vệ</strong> ngoài cùng. Cấu trúc đồng trục giúp tín hiệu được truyền ở tần số cao với suy hao thấp.</p>
<h2>Các loại cáp đồng trục phổ biến</h2>
<p>RG59 — dùng cho camera analog HD-TVI/HDCVI; RG6 — phổ biến cho truyền hình cáp và camera IP-over-coax; RG58 — dùng trong mạng LAN cũ (10BASE2). Với hệ thống camera analog hiện nay, RG59 (lõi đồng đặc) là lựa chọn chuẩn.</p>`,
  },
  {
    slug: "cap-quang-la-gi-cau-tao-cap-quang",
    title: "Cáp quang là gì? Cấu tạo & ưu, nhược điểm của cáp quang",
    category: "Cáp & Phụ kiện",
    tags: "cáp quang, singlemode, multimode, FTTH",
    excerpt: "Ngày nay, dây cáp quang được sử dụng rất rộng rãi trong các lĩnh vực truyền tín hiệu đường dài, tốc độ cao. Bài viết giải thích cáp quang hoạt động như thế nào và vì sao nó thay thế cáp đồng.",
    cover: img(2420212, 900, 500),
    content: `<p>Cáp quang (fiber optic cable) là loại cáp truyền dữ liệu dưới dạng xung ánh sáng. Nhờ đó, cáp quang băng thông rất lớn, tốc độ cao và gần như không bị ảnh hưởng bởi nhiễu điện từ.</p>
<h2>Cấu tạo cáp quang</h2>
<p>Mỗi sợi quang gồm 3 phần: <strong>Lõi (core)</strong> bằng thủy tinh tinh khiết nơi ánh sáng truyền qua; <strong>Lớp bọc (cladding)</strong> có chiết suất thấp hơn để phản xạ toàn phần ánh sáng; <strong>Vỏ bảo vệ (coating)</strong> và các lớp gia cố bên ngoài. Cáp GYXTW dùng cho outdoor với cấu trúc xoắn ống lỏng chống kéo, chuột gặm.</p>
<h2>Ưu điểm và nhược điểm</h2>
<p><strong>Ưu điểm:</strong> băng thông lớn, truyền xa hàng chục km, miễn nhiễm nhiễu điện từ, đường kính và trọng lượng nhỏ hơn cáp đồng.<br />
<strong>Nhược điểm:</strong> chi phí đầu tư cao hơn, đòi hỏi kỹ thuật hàn/phối quang chuyên dụng, sợi quang giòn nên cần luộn ống khi thi công ngầm.</p>`,
  },
  {
    slug: "phan-loai-cap-quang",
    title: "Phân loại Cáp Quang — Cáp quang có những loại nào?",
    category: "Cáp & Phụ kiện",
    tags: "cáp quang, singlemode, multimode, GYXTW",
    excerpt: "Sau khi đã hiểu khái niệm và cấu tạo cáp quang, bước tiếp theo là phân loại để chọn đúng loại cho công trình: singlemode hay multimode, cấu trúc GYXTW hay ống lỏng…",
    cover: img(4486718, 900, 500),
    content: `<p>Tùy theo mục đích sử dụng, cáp quang được phân loại theo cách sau.</p>
<h2>Theo bước sóng truyền dẫn</h2>
<p><strong>Cáp quang Singlemode (SM):</strong> 1 mode truyền, lõi 9/125µm, màu vỏ thường vàng, truyền xa (10–100km) — dùng cho đường truyền chính, FTTH, viễn thông.<br />
<strong>Cáp quang Multimode (MM):</strong> nhiều mode truyền, lõi 50/125µm (OM3/OM4), màu vỏ aqua/xanh nhạt, khoảng cách ngắn (550m) — dùng trong data center, mạng LAN doanh nghiệp.</p>
<h2>Theo cấu trúc cơ khí</h2>
<p>GYXTW (cáp xoắn ống lỏng) — chuẩn outdoor chống nước; cáp ống lỏng (loose tube) — cho thi công ngầm; cáp ống chặt (tight buffer) — cho đi trong nhà; cáp mềm (patch cord, dây nhảy quang) — đấu nối thiết bị.</p>`,
  },
  {
    slug: "so-sanh-cap-mang-cat5e-va-cat6-2",
    title: "Dây cáp mạng Cat5e và Cat6 — Nên mua Cat5e hay Cat6?",
    category: "Cáp & Phụ kiện",
    tags: "cat5e, cat6, cáp mạng, so sánh",
    excerpt: "Dây cáp mạng Cat5e và Cat6 là hai loại phổ biến nhất hiện nay. Sự khác nhau giữa chúng ảnh hưởng trực tiếp đến tốc độ và chi phí công trình — nên chọn loại nào?",
    cover: img(163047, 900, 500),
    content: `<p>Cả Cat5e và Cat6 đều là cáp đồng 4 cặp xoắn, nhưng khác nhau về chuẩn kỹ thuật và khả năng chống nhiễu.</p>
<h2>Sự khác nhau chính</h2>
<p>Cat5e đạt chuẩn 1000 Mbps (Gigabit) trong 100m, tần số 100MHz, lõi thường 24AWG. Cat6 hỗ trợ 1000 Mbps trong 100m, 10Gbps trong 55m, tần số 250MHz, lõi đồng lớn hơn (23AWG) và có cross-filling giảm xoắn nhiễu. Cat6 cũng thường có lớp giáp (FTP/STP) ở các dòng chống nhiễu.</p>
<h2>Nên chọn loại nào?</h2>
<p>Với văn phòng, gia đình, camera 2–4MP: <strong>Cat5e</strong> hoàn toàn đủ và tiết kiệm. Với hệ thống camera IP 4K, AP WiFi 6, nhu cầu nâng cấp 10G trong tương lai: nên đi <strong>Cat6</strong> một lần để tránh phải đục phá thay cáp sau này.</p>`,
  },
  {
    slug: "day-cap-mang-ls-dvh-cap-mang-chat-luong",
    title: "Dây cáp mạng LS-DVH — dòng cáp chất lượng cao, truyền dẫn tín hiệu tốt",
    category: "Cáp & Phụ kiện",
    tags: "LS-DVH, Việt Hàn, cáp mạng",
    excerpt: "Dây cáp mạng LS-DVH là thương hiệu cáp mạng của công ty Việt Hàn, được người dùng ưa chuộng nhờ chất lượng đồng ổn định và giá cạnh tranh cho công trình.",
    cover: img(1597776, 900, 500),
    content: `<p>Dây cáp mạng LS-DVH là thương hiệu cáp mạng của công ty Việt Hàn, đang được người dùng và các đơn vị thi công ưa chuộng.</p>
<h2>Đặc điểm nổi bật</h2>
<p>Lõi đồng nguyên chất đạt chuẩn AWG giúp giảm suy hao tín hiệu; lớp vỏ PVC chống cháy theo chuẩn LSZH cho các dòng cao cấp; in thông số rõ ràng trên vỏ cáp (cat, AWG, chiều dài mét) giúp kiểm soát số lượng khi thi công.</p>
<h2>Ứng dụng</h2>
<p>Các dòng LS-DVH Cat5e, Cat6, Cat6A phù hợp cho hệ thống mạng văn phòng, camera IP, hệ thống âm thanh đa phòng và hạ tầng data center quy mô vừa.</p>`,
  },
  {
    slug: "cach-doc-thong-so-in-tren-day-cap-mang",
    title: "Cách đọc thông số in trên dây cáp mạng",
    category: "Cáp & Phụ kiện",
    tags: "cáp mạng, thông số, AWG",
    excerpt: "Bạn nhìn thấy những dòng chữ, số trên dây cáp mạng nhưng chưa hiểu hết ý nghĩa? Bài viết giải mã các thông số quan trọng: cat, AWG, PRS, loại vỏ…",
    cover: img(28248555, 900, 500),
    content: `<p>Trên vỏ mỗi cuộn cáp mạng đều có in một "dòng chữ kỹ thuật". Biết đọc chúng giúp bạn kiểm tra hàng đúng đơn hàng và phát hiện hàng nhái.</p>
<h2>Các thông số thường gặp</h2>
<p><strong>Cat (Cat5e/Cat6/Cat6A):</strong> thế hệ chuẩn cáp, quyết định băng thông.<br />
<strong>UTP/FTP/STP:</strong> cấu trúc chống nhiễu — UTP không giáp, FTP có lớp foil, STP có lớp bện.<br />
<strong>AWG (24AWG, 23AWG…):</strong> số AWG càng nhỏ, dây đồng càng dày, dẫn tốt hơn.<br />
<strong>4PRS:</strong> 4 cặp dây xoắn.<br />
<strong>CCA/BC:</strong> vật liệu lõi — BC (copper clad aluminum) rẻ hơn, BC nguyên chất (BC = Bare Copper) dẫn điện tốt hơn.<br />
<strong>PVC/PE/LSZH:</strong> loại vỏ; PE cho ngoài trời, LSZH chống cháy ít khói độc.<br />
<strong>Số mét in trên vỏ:</strong> giúp đối chiếu chiều dài cuộn 305m.</p>`,
  },
  {
    slug: "cap-mang-chong-nhieu-tot-nhat-hien-nay",
    title: "Tổng hợp các loại cáp mạng chống nhiễu tốt nhất hiện nay",
    category: "Cáp & Phụ kiện",
    tags: "cáp chống nhiễu, FTP, STP, SFTP",
    excerpt: "Đang tìm kiếm cáp mạng chống nhiễu cho môi trường nhiều thiết bị công suất lớn? Dưới đây là các cấu trúc chống nhiễu phổ biến và cách chọn phù hợp.",
    cover: img(2881232, 900, 500),
    content: `<p>Ở môi trường có máy bơm, động cơ, trạm biến áp, nhiễu điện từ có thể làm lỗi gói tin, giảm tốc độ mạng. Cáp chống nhiễu là giải pháp chuẩn.</p>
<h2>Các cấu trúc chống nhiễu</h2>
<p><strong>FTP (Foil Twisted Pair):</strong> mỗi cặp có lớp giáp foil, nhẹ và phổ biến nhất cho công trình.<br />
<strong>STP (Shielded Twisted Pair):</strong> có thêm lớp bện tổng, chống nhiễu mạnh hơn, khó thi công hơn.<br />
<strong>SFTP:</strong> kết hợp foil + bện tổng, dùng cho môi trường nhiễu cao.</p>
<h2>Lưu ý khi thi công cáp chống nhiễu</h2>
<p>Đầu bấm phải đúng chuẩn (mắt tiếp đất, vỏ giáp ép xuống đất tại đầu kết nối); dùng hộp và rack kim loại tiếp đất; tránh đi song song với cáp nguồn cao áp. Nếu không tiếp đất đúng cách, lớp giáp lại trở thành ăng-ten thu nhiễu.</p>`,
  },
  {
    slug: "tim-hieu-vai-tro-cap-mang-trong-he-thong-camera-ip",
    title: "Tìm hiểu vai trò cáp mạng trong hệ thống Camera IP",
    category: "Camera",
    tags: "camera ip, cáp mạng, poe",
    excerpt: "Khác với hệ thống camera analog dùng cáp đồng trục, hệ thống camera IP dùng cáp mạng để truyền cả hình ảnh lẫn nguồn điện (PoE). Chọn đúng cáp quyết định chất lượng hệ thống.",
    cover: img(25384403, 900, 500),
    content: `<p>Camera IP mã hóa hình ảnh thành gói tin IP truyền qua cáp mạng. Chất lượng cáp quyết định độ ổn định, tốc độ và khả năng cấp nguồn của toàn hệ thống.</p>
<h2>Vai trò của cáp mạng</h2>
<p>Truyền dữ liệu video 1–5Gbps; cấp nguồn PoE (802.3af 15.4W, 802.3at 30W) — một cáp làm cả hai việc, tiết kiệm đi dây nguồn; cấp nguồn cho Access Point, IP phone.</p>
<h2>Chọn cáp cho camera IP</h2>
<p>Camera 2–4MP: Cat5e BC đủ cho 100m. Camera 4K 8MP: nên dùng Cat6 để dự phòng băng thông. Ngoài trời: cáp PE hoặc Cat6 FTP PE. Khoảng cách camera tới switch không vượt 100m theo chuẩn; vượt cần dùng bộ chuyển đổi quang.</p>`,
  },
  {
    slug: "cap-mang-cat6-va-cap-mang-cat6e-khac-nhau-o-cho-nao",
    title: "Cáp mạng Cat6 và cáp mạng Cat6e khác nhau ở chỗ nào?",
    category: "Cáp & Phụ kiện",
    tags: "cat6, cat6e, cáp mạng",
    excerpt: "Nhìn bằng mắt thường rất khó để phân biệt cáp Cat6 và Cat6e. Bài viết chỉ ra các điểm khác nhau về cấu trúc, băng thông và cách kiểm tra nhanh trên công trình.",
    cover: img(3541557, 900, 500),
    content: `<p>Cat6e (Enhanced Cat6) là phiên bản cải tiến của Cat6, phổ biến ở thị trường Việt Nam với tên gọi "Cat6e 23AWG" hoặc "Cat6e CCA".</p>
<h2>Khác nhau về kỹ thuật</h2>
<p>Cat6: 250MHz, 10Gbps trong 55m. Cat6e: vẫn 250MHz theo tiêu chuẩn TIA-568 nhưng yêu cầu nghiêm ngặt hơn về crosstalk và return loss, thực tế cho phép 10Gbps ổn định hơn trong 100m. Lõi Cat6e thường dày hơn (23AWG so với 24AWG).</p>
<h2>Phân biệt nhanh trên công trình</h2>
<p>Xem in trên vỏ cáp (Cat6/Cat6e + AWG); đo bằng máy đo cáp (Fluke) để đối chiếu thông số thực tế; so sánh đường kính — cáp 23AWG to hơn cáp 24AWG. Với dự án, nên yêu cầu nhà cung cấp xuất chứng nhận xuất xứ.</p>`,
  },
];

/* ---------------------------------- pages ---------------------------------- */

const PAGES: { slug: string; title: string; content: string }[] = [
  {
    slug: "gioi-thieu",
    title: "Giới thiệu Viễn Thông Quang Thắng",
    content: `<p>Viễn Thông Quang Thắng là tổng kho thiết bị viễn thông, cáp mạng và camera tại TP. Hồ Chí Minh, cung cấp nguồn hàng chính hãng cho các nhà thầu, kỹ sư viễn thông và người dùng cuối trên toàn quốc.</p>
<h2>Lĩnh vực kinh doanh</h2>
<p>Chúng tôi chuyên cung cấp: cáp mạng (Vcom, Commscope, LS-DVH, Việt Hàn, Vĩnh Thịnh), cáp quang singlemode/multimode, thiết bị mạng (switch PoE, router, access point), thiết bị quang (bộ chuyển đổi quang điện, hộp ODF), camera quan sát, tủ rack, thang máng cáp và phụ kiện thi công.</p>
<h2>Ký cam kết</h2>
<p>Sản phẩm chính hãng, đầy đủ chứng từ; tư vấn kỹ thuật trực tiếp theo nhu cầu công trình; đóng gói và vận chuyển trong 24h; hỗ trợ sau bán hàng theo chính sách bảo hành của nhà sản xuất.</p>`,
  },
  {
    slug: "huong-dan-mua-hang",
    title: "Hướng dẫn mua hàng online",
    content: `<h2>Bước 1 — Chọn sản phẩm</h2>
<p>Truy cập danh mục hoặc dùng thanh tìm kiếm (hỗ trợ tìm theo tên sản phẩm, mã SKU, thương hiệu). Sản phẩm có giá hiển thị rõ; sản phẩm giá "Liên hệ" vui lòng gọi 094.710.6161 hoặc nhắn Zalo để được báo giá.</p>
<h2>Bước 2 — Thêm vào giỏ hàng</h2>
<p>Bấm "Thêm vào giỏ" trên thẻ sản phẩm hoặc trang chi tiết. Bạn có thể điều chỉnh số lượng, xoá sản phẩm trực tiếp trong giỏ hàng.</p>
<h2>Bước 3 — Thanh toán</h2>
<p>Vào "Thanh toán", điền đủ họ tên, số điện thoại, địa chỉ giao hàng và chọn hình thức thanh toán: chuyển khoản, thanh toán khi nhận hàng (COD) hoặc liên hệ xác nhận.</p>
<h2>Bước 4 — Xác nhận đơn hàng</h2>
<p>Nhân viên kỹ thuật sẽ gọi điện xác nhận thông tin, thời gian giao hàng và (nếu có) hướng dẫn chuyển khoản. Đơn hàng được đóng gói kỹ và giao theo địa chỉ.</p>`,
  },
  {
    slug: "hinh-thuc-thanh-toan",
    title: "Hình thức thanh toán",
    content: `<h2>Thanh toán khi nhận hàng (COD)</h2>
<p>Bạn kiểm tra hàng trước khi trả tiền. Phù hợp với các đơn hàng nội thành TP.HCM và các khu vực có đơn vị vận chuyển COD.</p>
<h2>Chuyển khoản ngân hàng</h2>
<p>Thông tin tài khoản được gửi qua điện thoại/Zalo sau khi xác nhận đơn hàng. Vui lòng ghi chú mã đơn hàng khi chuyển khoản để đối chiếu nhanh.</p>
<h2>Liên hệ xác nhận</h2>
<p>Đối với đơn hàng công trình, số lượng lớn hoặc sản phẩm giá "Liên hệ", đội ngũ kinh doanh sẽ liên hệ trực tiếp để chốt giá và phương thức thanh toán phù hợp.</p>`,
  },
  {
    slug: "chinh-sach-bao-hanh",
    title: "Chính sách bảo hành",
    content: `<p>Thời hạn và điều kiện bảo hành tuân theo chính sách của nhà sản xuất được ghi trên phiếu bảo hành/hộp sản phẩm.</p>
<h2>Các trường hợp được bảo hành</h2>
<p>Sản phẩm lỗi do nhà sản xuất trong thời hạn bảo hành; hư hỏng do vận chuyển (báo ngay khi nhận hàng); lỗi kỹ thuật không do tác động ngoại lực.</p>
<h2>Các trường hợp không bảo hành</h2>
<p>Hết thời hạn bảo hành; hư hỏng do sử dụng sai kỹ thuật, chập điện, ngập nước, rơi vỡ; tem bảo hành bị mất hoặc can thiệp; sản phẩm đã qua sửa chữa bởi đơn vị không được ủy quyền.</p>
<h2>Khiếu nại bảo hành</h2>
<p>Vui lòng liên hệ hotline 094.710.6161 (Quang Thắng) kèm mã đơn hàng hoặc phiếu bảo hành để được hỗ trợ nhanh nhất.</p>`,
  },
  {
    slug: "chinh-sach-doi-tra",
    title: "Chính sách đổi trả",
    content: `<p>Chúng tôi chỉ chấp nhận đổi trả sản phẩm khi có lỗi từ nhà sản xuất và còn nguyên tem, bao bì, phụ kiện kèm theo.</p>
<h2>Thời hạn đổi trả</h2>
<p>Đổi mới trong thời hạn theo phiếu bảo hành của sản phẩm; hoàn tiền (nếu có) được xử lý trong vòng 7–14 ngày làm việc sau khi nhận lại hàng và kiểm tra xác nhận lỗi.</p>
<h2>Lưu ý</h2>
<p>Với hàng công trình đã cắt, bấm đầu, thi công lắp đặt — không áp dụng đổi trả, chỉ áp dụng bảo hành kỹ thuật. Vui lòng kiểm tra kỹ số lượng và tình trạng sản phẩm khi nhận hàng.</p>`,
  },
  {
    slug: "chinh-sach-giao-nhan",
    title: "Chính sách giao nhận",
    content: `<h2>Khu vực nội thành TP.HCM</h2>
<p>Giao hàng trong 24h kể từ khi xác nhận đơn (giờ làm việc: 08h00–17h00, thứ 2 đến thứ 7). Miễn phí với một số sản phẩm hoặc đơn hàng theo quy định.</p>
<h2>Khảo tỉnh / toàn quốc</h2>
<p>Giao qua các đơn vị vận chuyển hoặc gửi hàng tại các kho. Thời gian 2–5 ngày tùy khu vực; phí vận chuyển đối với hàng cồng kềnh (cuộn cáp, tủ rack) được báo cụ thể khi xác nhận đơn.</p>
<h2>Kiểm hàng khi nhận</h2>
<p>Bạn được quyền kiểm tra tình trạng bên ngoài của kiện hàng trước khi ký nhận. Hư hỏng do vận chuyển: từ chối nhận hoặc chụp ảnh biên bản để được xử lý theo chính sách.</p>`,
  },
  {
    slug: "chinh-sach-bao-mat",
    title: "Chính sách bảo mật",
    content: `<p>Viễn Thông Quang Thắng cam kết bảo vệ thông tin cá nhân của khách hàng.</p>
<h2>Thông tin thu thập</h2>
<p>Chúng tôi chỉ thu thập thông tin cần thiết để xử lý đơn hàng: họ tên, số điện thoại, email, địa chỉ giao hàng.</p>
<h2>Mục đích sử dụng</h2>
<p>Xác nhận đơn hàng, giao hàng, bảo hành và (khi bạn đồng ý) gửi thông tin khuyến mãi. Thông tin không được bán hoặc chia sẻ cho bên thứ ba vì mục đích thương mại.</p>
<h2>An toàn thông tin</h2>
<p>Dữ liệu khách hàng được lưu trữ trên hệ thống có kiểm soát truy cập. Quý khách có quyền yêu cầu cập nhật hoặc xoá thông tin cá nhân bằng cách liên hệ hotline 094.710.6161.</p>`,
  },
  {
    slug: "doi-tac-chien-luoc",
    title: "Đối tác chiến lược",
    content: `<p>Viễn Thông Quang Thắng hợp tác với các nhà sản xuất và nhà phân phối cấp 1 trong lĩnh vực cáp mạng, cáp quang, thiết bị mạng và camera quan sát để mang tới giá tốt nhất cho khách hàng công trình.</p>
<p>Quý đại lý, nhà thầu, đơn vị thi công có nhu cầu hợp tác dài hạn vui lòng liên hệ hotline <strong>094.710.6161</strong> (Quang Thắng) để được báo giá theo chính sách đại lý.</p>`,
  },
];

/* ----------------------------------- seed ----------------------------------- */

async function main() {
  const counts = await db.select().from(products);
  const existing = counts.length;
  console.log(`[seed] existing products: ${existing}`);
  if (existing > 0) {
    console.log("[seed] database already has data — skip (idempotent guard).");
    await admin();
    return;
  }

  // admin
  await admin();

  // brands
  const brandId = new Map<string, string>();
  for (const b of BRANDS) {
    const [row] = await db.insert(brands).values({ name: b.name, slug: b.slug, description: b.desc }).onConflictDoNothing().returning();
    if (row) brandId.set(b.slug, row.id);
  }
  // fallback fetch
  const allBrands = await db.select().from(brands);
  for (const b of allBrands) brandId.set(b.slug, b.id);

  // categories (two passes for parent)
  for (const c of CATS) {
    await db.insert(categories)
      .values({ name: c.name, slug: c.slug, description: c.desc ?? null, sortOrder: c.sort ?? 0, image: CAT_IMAGES[c.slug] ?? null })
      .onConflictDoNothing();
  }
  const allCats = await db.select().from(categories);
  const catId = new Map(allCats.map((c) => [c.slug, c.id]));
  for (const c of CATS) {
    if (c.parent) {
      const pid = catId.get(c.parent);
      if (pid) await db.update(categories).set({ parentId: pid }).where(eq(categories.slug, c.slug));
    }
  }

  // products
  for (const p of PRODUCTS) {
    const isDemo = p.sku?.startsWith("DEMO-") ?? false;
    const [row] = await db
      .insert(products)
      .values({
        name: p.name,
        slug: p.slug,
        sku: p.sku ?? null,
        shortDescription: p.desc ?? null,
        description: p.desc ? `<p>${p.desc}</p>` : null,
        price: p.price ?? null,
        salePrice: p.salePrice ?? null,
        priceType: p.price != null ? "fixed" : "contact",
        stock: p.stock ?? 0,
        brandId: p.brand ? brandId.get(p.brand) ?? null : null,
        categoryId: p.cat ? catId.get(p.cat) ?? null : null,
        status: "published",
        featured: p.featured ?? false,
        bestseller: p.bestseller ?? false,
        sale: p.sale ?? false,
        rating: p.rating ?? 0,
        warranty: p.warranty ?? "Theo chính sách nhà sản xuất (ghi rõ trên phiếu bảo hành)",
      })
      .onConflictDoNothing()
      .returning();
    if (!row) continue;
    await db.insert(productImages).values({ productId: row.id, url: p.image, sortOrder: 0, isMain: true });
    if (p.specs) {
      for (let i = 0; i < p.specs.length; i++) {
        await db.insert(productSpecifications).values({ productId: row.id, name: p.specs[i][0], value: p.specs[i][1], sortOrder: i });
      }
    }
    if (isDemo) console.log(`[seed] demo product: ${p.name}`);
  }

  // articles
  for (const a of ARTICLES) {
    await db
      .insert(articles)
      .values({
        title: a.title,
        slug: a.slug,
        excerpt: a.excerpt,
        content: a.content,
        coverImage: a.cover,
        category: a.category,
        tags: a.tags,
        status: "published",
        publishedAt: new Date(),
      })
      .onConflictDoNothing();
  }

  // pages
  for (const pg of PAGES) {
    await db.insert(pages).values({ slug: pg.slug, title: pg.title, content: pg.content }).onConflictDoNothing();
  }

  // banner + promotion
  await db.insert(banners).values({
    title: "Giải pháp hạ tầng mạng cho công trình",
    subtitle: "Cáp — Thiết bị — Camera — Quang: nguồn hàng chính hãng, giá cạnh tranh, giao toàn quốc.",
    image: img(5073493, 1600, 640),
    buttonText: "Khám phá sản phẩm",
    buttonUrl: "/san-pham",
    active: true,
    sortOrder: 1,
  });
  await db.insert(promotions).values({
    title: "Ưu đãi đơn hàng công trình",
    description: "Báo giá đặc biệt cho đơn hàng số lượng lớn (cáp cuộn 305m, tủ rack, thiết bị số lượng). Gọi 094.710.6161 để nhận giá công trình.",
    badge: "ĐƠN LỚN",
    url: "/lien-he",
    active: true,
    sortOrder: 1,
  });

  console.log("[seed] done ✔  categories:", allCats.length, "| brands:", allBrands.length, "| products:", PRODUCTS.length, "| articles:", ARTICLES.length);
}

async function admin() {
  const rows = await db.select().from(profiles).limit(1);
  if (rows.length > 0) return;
  await db.insert(profiles).values({
    name: "Quản trị Quang Thắng",
    email: "admin@vienthongquangthang.com",
    phone: "0947106161",
    passwordHash: hashPassword("AdminQT2026!"),
    role: "admin",
  });
  console.log("[seed] admin created: admin@vienthongquangthang.com / AdminQT2026!");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("[seed] FAILED", e);
    process.exit(1);
  });
