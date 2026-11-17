import type { MetadataRoute } from "next";
import { BASE_URL } from "@/lib/types";
import { getSeoCatalog } from "@/lib/seo-catalog";

export const revalidate = 3600;
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = [
    "", "/ho-so-nang-luc", "/san-pham", "/thuong-hieu", "/khuyen-mai", "/tin-tuc", "/lien-he",
    "/huong-dan-mua-hang", "/hinh-thuc-thanh-toan", "/chinh-sach-giao-nhan",
    "/chinh-sach-bao-hanh", "/chinh-sach-doi-tra",
  ];
  const entries: MetadataRoute.Sitemap = staticPaths.map(path => ({ url: `${BASE_URL}${path}` }));
  for (const entry of await getSeoCatalog()) {
    entries.push({ url: `${BASE_URL}${entry.path}`, ...(entry.modified ? { lastModified: entry.modified } : {}) });
  }
  return Array.from(new Map(entries.map(entry => [entry.url, entry])).values());
}
