import type { MetadataRoute } from "next";
import { BASE_URL } from "@/lib/types";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: ["/admin/", "/api/", "/tai-khoan/"] }, sitemap: `${BASE_URL}/sitemap.xml` };
}
