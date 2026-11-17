import { pool } from "@/db";

export type SeoEntry = {
  slug: string;
  path: string;
  kind: "product" | "category" | "article" | "brand" | "page";
  modified: Date | null;
};

export type PublicRecordKind = "product" | "category" | "article" | "brand";

let cached: { entries: SeoEntry[]; expires: number } | undefined;
let pending: Promise<SeoEntry[]> | undefined;
const recordCache = new Map<string, { exists: boolean; expires: number }>();
const CATALOG_CACHE_MS = 10 * 60_000;

const RECORD_LOOKUPS: Record<PublicRecordKind, { table: string; status: string }> = {
  product: { table: "products", status: "status = 'published'" },
  category: { table: "categories", status: "active = true" },
  article: { table: "articles", status: "status = 'published'" },
  brand: { table: "brands", status: "active = true" },
};

export async function publicRecordExists(kind: PublicRecordKind, slug: string): Promise<boolean> {
  const key = `${kind}:${slug}`;
  const now = Date.now();
  const hit = recordCache.get(key);
  if (hit && hit.expires > now) return hit.exists;

  const lookup = RECORD_LOOKUPS[kind];
  const { rowCount } = await pool.query(
    `select 1 from ${lookup.table} where slug = $1 and ${lookup.status} limit 1`,
    [slug],
  );
  const exists = rowCount === 1;
  recordCache.set(key, { exists, expires: now + CATALOG_CACHE_MS });
  return exists;
}

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
    cached = { entries: rows, expires: Date.now() + CATALOG_CACHE_MS };
    return rows;
  }).finally(() => { pending = undefined; });
  return pending;
}
