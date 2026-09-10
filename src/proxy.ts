import { NextResponse, type NextRequest } from "next/server";

/**
 * Legacy SEO redirects — the old WordPress site served products, categories
 * and articles at the top level. Map those URLs to the new structure with 301.
 */

const NEW_ROUTES = new Set([
  "san-pham", "danh-muc", "thuong-hieu", "tin-tuc", "khuyen-mai", "gioi-thieu",
  "lien-he", "tai-khoan", "dang-nhap", "dang-ky", "quen-mat-khau", "gio-hang",
  "thanh-toan", "dat-hang-thanh-cong", "so-sanh", "tim-kiem", "admin", "api",
  "uploads", "_next", "static", "favicon.ico", "robots.txt", "sitemap.xml",
  "wishlist", "cua-hang", "page", "author",
]);

const CATEGORY_SLUGS = new Set([
  "day-cap-mang", "day-cap-quang", "phu-kien-mang", "phu-kien-quang", "thiet-bi-mang",
  "thiet-bi-quang", "camera-quan-sat", "den-nang-luong-mat-troi", "tu-mang", "thang-mang-cap",
  "cap-mang-vcom", "cap-mang-viet-han", "cap-mang-hikvision", "cap-mang-amp", "cap-mang-ls",
  "cap-vinh-thinh", "day-nhay-mang", "cap-quang-multimode", "cap-quang-singlemode",
  "dau-bam-mang-rj45", "kim-bam-mang", "nguon-12v", "phu-kien-camera",
  "bo-chia-quang-plc", "day-han-quang", "day-nhay-quang", "dung-cu-thi-cong-cap-quang",
  "dau-fast-connect-sc", "switch-chia-mang", "switch-poe-dahua", "switch-tp-link",
  "switch-poe-aptek", "switch-poe-edaco", "switch-poe-onv", "switch-tenda",
  "bo-phat-wifi-khong-day", "tplink", "draytek", "ruijie", "tenda",
  "bo-chuyen-doi-quang-dien", "bton", "netlink", "cvt-wintop", "cvt-tp-link", "cvt-aptek",
  "bo-chuyen-doi-video-sang-quang", "bo-chuyen-doi-hdmi-sang-quang",
  "hop-phoi-quang-odf-ngoai-troi", "hop-phoi-quang-odf-trong-nha", "hop-otb-quang",
  "hop-phoi-quang", "module-quang-cac-loai", "vo-hop-phoi-quang-odf",
  "camera-tiandy", "camera-hikvision", "camera-analog-tvi", "camera-ip-hikvision",
  "dau-ghi-camera-dvr-hikvision", "dau-ghi-camera-ip-nvr-hikvision", "camera-dahua",
  "camera-analog-hdcvi-dahua", "camera-ip-dahua", "dau-ghi-camera-xvr-dahua",
  "dau-ghi-camera-ip-nvr-dahua", "camera-wifi", "camera-ezviz", "camera-imou",
  "tu-rack-cac-loai", "tu-rack-4u", "tu-rack-6u", "tu-rack-9u", "tu-rack-10u",
  "tu-rack-12u", "tu-rack-15u", "tu-rack-20u", "tu-rack-27u", "tu-rack-32u",
  "tu-rack-36u", "tu-rack-42u", "tu-dung-dau-ghi", "tu-thiet-bi-mang-ngoai-troi",
  "phu-kien-tu-mang", "thang-cap", "mang-cap",
  "den-hieu-angel-lighting", "den-hieu-jindian", "thiet-bi-phat-song-wifi", "dau-mang-rj45",
]);

const ARTICLE_SLUGS = new Set([
  "cach-thiet-lap-modem-wifi-don-gian",
  "cap-dong-truc-la-gi-cau-tao-cap-dong-truc",
  "cap-quang-la-gi-cau-tao-cap-quang",
  "phan-loai-cap-quang",
  "so-sanh-cap-mang-cat5e-va-cat6-2",
  "day-cap-mang-ls-dvh-cap-mang-chat-luong",
  "cach-doc-thong-so-in-tren-day-cap-mang",
  "cap-mang-chong-nhieu-tot-nhat-hien-nay",
  "tim-hieu-vai-tro-cap-mang-trong-he-thong-camera-ip",
  "cap-mang-cat6-va-cap-mang-cat6e-khac-nhau-o-cho-nao",
]);

const PAGE_REDIRECTS: Record<string, string> = {
  "tin-tuc-cong-nghe": "/tin-tuc",
  "tin-khuyen-mai-hot": "/khuyen-mai",
  "san-pham-noi-bat": "/san-pham",
  "huong-dan-mua-hang-online": "/huong-dan-mua-hang",
  "hinh-thuc-thanh-toan": "/hinh-thuc-thanh-toan",
  "chinh-sach-giao-nhan": "/chinh-sach-giao-nhan",
  "chinh-sach-bao-hanh": "/chinh-sach-bao-hanh",
  "chinh-sach-doi-tra": "/chinh-sach-doi-tra",
  "chinh-sach-bao-mat": "/chinh-sach-bao-mat",
  "doi-tac-chien-luoc": "/doi-tac-chien-luoc",
};

function redirect(request: NextRequest, path: string, permanent = true) {
  const url = request.nextUrl.clone();
  url.pathname = path;
  if (url.search) url.search = "";
  return NextResponse.redirect(url, permanent ? 301 : 307);
}

export default function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Old search: /?s=...
  const s = searchParams.get("s");
  if (s) {
    const url = request.nextUrl.clone();
    url.pathname = "/tim-kiem";
    url.search = "";
    url.searchParams.set("q", s);
    return NextResponse.redirect(url, 307);
  }

  const seg = pathname.split("/").filter(Boolean);
  if (seg.length === 0) return NextResponse.next();

  if (pathname === "/cua-hang" || pathname === "/cua-hang/") return redirect(request, "/san-pham");
  if (pathname === "/wishlist" || pathname === "/wishlist/") return redirect(request, "/tai-khoan?tab=wishlist");
  if (pathname === "/tai-khoan/lost-password" || pathname === "/tai-khoan/lost-password/") {
    return redirect(request, "/quen-mat-khau");
  }
  if (seg[0] === "product" && seg.length >= 2) return redirect(request, `/san-pham/${seg[1]}`);
  if (seg[0] === "shop" && seg.length >= 2) return redirect(request, `/san-pham/${seg[1]}`);

  if (seg.length === 1 && !NEW_ROUTES.has(seg[0])) {
    const slug = seg[0].toLowerCase();
    if (PAGE_REDIRECTS[slug]) return redirect(request, PAGE_REDIRECTS[slug]);
    if (CATEGORY_SLUGS.has(slug)) return redirect(request, `/danh-muc/${slug}`);
    if (ARTICLE_SLUGS.has(slug)) return redirect(request, `/tin-tuc/${slug}`);
    // Old catalog served products at the top level
    return redirect(request, `/san-pham/${slug}`);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
