import type { MetadataRoute } from "next";
import { BASE_URL } from "@/lib/types";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    "", "/gioi-thieu", "/ho-so-nang-luc", "/san-pham", "/thuong-hieu", "/khuyen-mai", "/tin-tuc", "/lien-he",
  ].map((path) => ({ url: `${BASE_URL}${path}`, lastModified: now, changeFrequency: "weekly" as const, priority: path === "" ? 1 : 0.7 }));
}
