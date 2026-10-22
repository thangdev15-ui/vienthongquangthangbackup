import { pool } from "@/db";

export type SeoEntry = {
  slug: string;
  path: string;
  kind: "product" | "category" | "article" | "brand" | "page";
  modified: Date | null;
};

let cached: { entries: SeoEntry[]; expires: number } | undefined;
let pending: Promise<SeoEntry[]> | undefined;

// Share a small public URL inventory across legacy lookups in a server instance.
// Never cache database failures as an empty inventory (that would invent 404s).
export async function getSeoCatalog(): Promise<SeoEntry[]> {
  if (cached && cached.expires > Date.now()) return cached.entries;
  if (pending) return pending;
  pending = pool.query<SeoEntry>(`
    select slug, '/san-pham/' || slug as path, 'product' as kind, updated_at as modified
    from products where status = 'published'
    union all
    select slug, '/danh-muc/' || slug, 'category', null from categories where active = true
    union all
    select slug, '/tin-tuc/' || slug, 'article', null from articles where status = 'published'
    union all
    select slug, '/thuong-hieu/' || slug, 'brand', null from brands where active = true
    union all
    select slug, '/' || slug, 'page', updated_at from pages
  `).then(({ rows }) => {
    cached = { entries: rows, expires: Date.now() + 60_000 };
    return rows;
  }).finally(() => { pending = undefined; });
  return pending;
}
