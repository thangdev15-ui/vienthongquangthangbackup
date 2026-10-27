import { NextResponse, type NextRequest } from "next/server";
import { getSeoCatalog } from "@/lib/seo-catalog";
import { BASE_URL } from "@/lib/types";

const NEW_ROUTES = new Set([
  "san-pham", "danh-muc", "thuong-hieu", "tin-tuc", "khuyen-mai", "ho-so-nang-luc",
  "lien-he", "tai-khoan", "dang-nhap", "dang-ky", "quen-mat-khau", "gio-hang",
  "thanh-toan", "dat-hang-thanh-cong", "so-sanh", "tim-kiem", "admin", "api",
  "uploads", "_next", "static", "huong-dan-mua-hang", "hinh-thuc-thanh-toan",
  "chinh-sach-giao-nhan", "chinh-sach-bao-hanh", "chinh-sach-doi-tra",
]);

const PAGE_REDIRECTS: Record<string, string> = {
  "index.html": "/",
  "tin-tuc-cong-nghe": "/tin-tuc",
  "tin-khuyen-mai-hot": "/khuyen-mai",
  "san-pham-noi-bat": "/san-pham",
  "huong-dan-mua-hang-online": "/huong-dan-mua-hang",
  "gioi-thieu": "/ho-so-nang-luc",
  "cua-hang": "/san-pham",
  "cap-mang-aipoo-link": "/san-pham",
  "chinh-sach-doi-tra-2": "/chinh-sach-doi-tra",
  "tong-hop-cac-loai-cap-mang-chong-nhieu-tot-nhat-hien-nay": "/tin-tuc/cap-mang-chong-nhieu-tot-nhat-hien-nay",
  "tu-rack-15u-d800-tu-mang-15u-d800-19p/feed": "/danh-muc/tu-rack-15u",
  "shop-2": "/san-pham",
  "shop": "/san-pham",
  "wishlist": "/tai-khoan?tab=wishlist",
  "tai-khoan/lost-password": "/quen-mat-khau",
  "sitemap_index.xml": "/sitemap.xml",
  "wp-sitemap.xml": "/sitemap.xml",
};
const LEGACY_PREFIXES: Record<string, string> = { product: "product", shop: "product", "product-category": "category" };

function redirect(request: NextRequest, path: string, status = 301) {
  const origin = ["www.vienthongquangthang.com", "test.vienthongquangthang.com"].includes(request.nextUrl.hostname)
    ? BASE_URL : request.nextUrl.origin;
  return NextResponse.redirect(new URL(path, origin), status);
}

function missing(request: NextRequest) {
  // Streaming notFound() can arrive after the HTML 200 headers have been sent.
  // Resolve missing public records before rendering so crawlers get a real 404.
  const url = request.nextUrl.clone();
  url.pathname = "/_not-found";
  url.search = "";
  return NextResponse.rewrite(url, { status: 404 });
}

function gone() {
  // WordPress RSS endpoints that no longer have a matching public record are
  // intentionally retired. A 410 prevents crawlers from repeatedly treating
  // them as broken product pages.
  return new NextResponse(null, { status: 410, headers: { "X-Robots-Tag": "noindex, follow" } });
}

export default async function proxy(request: NextRequest) {
  const { pathname, searchParams, hostname } = request.nextUrl;
  const key = pathname.replace(/^\/+|\/+$/g, "");
  if (PAGE_REDIRECTS[key]) return redirect(request, PAGE_REDIRECTS[key]);
  if (!key && (searchParams.has("wc-ajax") || searchParams.has("elementor_page_id"))) {
    return redirect(request, "/");
  }
  // Legacy WordPress pagination and numeric page IDs generated duplicate
  // homepage URLs. They have stable current destinations in the rebuilt site.
  if (!key && searchParams.has("product-page")) return redirect(request, "/san-pham");
  if (!key && searchParams.has("page_id")) return redirect(request, "/");
  const search = searchParams.get("s");
  if (!key && search) return redirect(request, `/tim-kiem?${new URLSearchParams({ q: search })}`, 307);

  // Only map published content, including products/articles absent from the
  // old hardcoded list. Never redirect unrelated missing pages to the homepage.
  const segments = key.split("/");
  const catalog = key && !NEW_ROUTES.has(segments[0]) && !/\.[^/]+$/.test(pathname)
    ? await getSeoCatalog()
    : undefined;

  // Legacy WordPress feeds inherited a product/article slug. Keep the SEO
  // value when that record still exists; explicitly retire obsolete feeds.
  if (segments.length === 2 && segments[1] === "feed") {
    const match = catalog?.find(entry => entry.slug === segments[0] && ["product", "article", "category"].includes(entry.kind));
    return match ? redirect(request, match.path) : gone();
  }

  // WooCommerce product-tag archives have no equivalent standalone route.
  // Preserve a matching category when one exists; otherwise use the catalog
  // landing page rather than serving a noindex 404 to Google.
  if (segments[0] === "product-tag" && segments[1]) {
    const category = catalog?.find(entry => entry.kind === "category" && entry.slug === segments[1]);
    return redirect(request, category?.path ?? "/san-pham");
  }

  // Old category pagination and hierarchical product links were emitted by
  // WooCommerce. Pagination settings are obsolete; product slugs retain a
  // specific destination even when a former category appears in the path.
  if (segments.length === 3 && segments[1] === "page") {
    const category = catalog?.find(entry => entry.kind === "category" && entry.slug === segments[0]);
    if (category) return redirect(request, category.path);
    if (segments[0] === "cua-hang") return redirect(request, "/san-pham");
  }

  // Two old product URLs had a phone number appended to the product permalink.
  if (segments.length === 2 && /^\d{8,}$/.test(segments[1])) {
    const product = catalog?.find(entry => entry.kind === "product" && entry.slug === segments[0]);
    if (product) return redirect(request, product.path);
  }
  if (segments.length === 2 && !LEGACY_PREFIXES[segments[0]]) {
    const product = catalog?.find(entry => entry.kind === "product" && entry.slug === segments[1]);
    if (product) return redirect(request, product.path);
  }

  if (key && !NEW_ROUTES.has(segments[0]) && !/\.[^/]+$/.test(pathname)) {
    const kind = LEGACY_PREFIXES[segments[0]];
    if (segments.length === 1 || (segments.length === 2 && kind)) {
      const slug = segments.at(-1)!;
      const legacyCatalog = catalog ?? await getSeoCatalog();
      const match = kind
        ? legacyCatalog.find(entry => entry.kind === kind && entry.slug === slug)
        : ["page", "category", "article", "product", "brand"]
          .map(type => legacyCatalog.find(entry => entry.kind === type && entry.slug === slug)).find(Boolean);
      if (match && match.path !== pathname.replace(/\/$/, "")) return redirect(request, match.path);
      if (!match) return missing(request);
    }
  }

  if (segments.length === 2 && ["san-pham", "danh-muc", "tin-tuc", "thuong-hieu"].includes(segments[0])) {
    const catalog = await getSeoCatalog();
    if (!catalog.some(entry => entry.path === `/${key}`)) return missing(request);
  }

  if (hostname === "www.vienthongquangthang.com") {
    return NextResponse.redirect(new URL((pathname.replace(/\/$/, "") || "/") + request.nextUrl.search, BASE_URL), 301);
  }
  if (pathname !== "/" && pathname.endsWith("/")) return redirect(request, pathname.slice(0, -1) + request.nextUrl.search);
  // These staging headers apply only if its DNS points to this deployment.
  if (hostname === "test.vienthongquangthang.com") {
    const response = NextResponse.next();
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }
  if (/^\/(admin|api|tai-khoan|gio-hang|thanh-toan|dat-hang-thanh-cong|dang-nhap|dang-ky|quen-mat-khau|tim-kiem)(\/|$)/.test(pathname)) {
    const response = NextResponse.next();
    response.headers.set("X-Robots-Tag", "noindex, follow");
    return response;
  }
  return NextResponse.next();
}

export const config = {
  // The old escaped-dot expression lost its escape during compilation and
  // excluded almost every non-root URL. Check static extensions in code above.
  matcher: ["/((?!_next/|uploads/|favicon.ico).*)"],
};
