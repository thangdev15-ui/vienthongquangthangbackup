import dotenv from "dotenv";
import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { Pool } from "pg";

dotenv.config({ path: ".env.local" });
dotenv.config();

const OLD_SITE = "https://vienthongquangthang.com";
const USER_AGENT = "Mozilla/5.0 (compatible; QT migration importer)";
const PUBLIC_DIR = path.join(process.cwd(), "public");
const IMAGE_ROOT = path.join(PUBLIC_DIR, "imported", "old-site");
const PRODUCT_IMAGE_DIR = path.join(IMAGE_ROOT, "products");
const CONTENT_IMAGE_DIR = path.join(IMAGE_ROOT, "content");

type WpRendered = { rendered: string };
type WpCategory = {
  id: number;
  name: string;
  slug: string;
  description: string;
  parent: number;
  count: number;
};
type WpProduct = {
  id: number;
  slug: string;
  link: string;
  title: WpRendered;
  content: WpRendered;
  excerpt: WpRendered;
  date: string;
  modified: string;
  featured_media: number;
  product_cat: number[];
  _embedded?: {
    "wp:featuredmedia"?: Array<{ source_url?: string; media_details?: { sizes?: Record<string, { source_url?: string }> } }>;
    "wp:term"?: Array<Array<{ taxonomy: string; id: number; name: string; slug: string; parent?: number }>>;
  };
};

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required in .env.local");

const pool = new Pool({ connectionString: databaseUrl });
const downloaded = new Map<string, string>();

function stripHtml(html = "") {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#8211;/g, "–")
    .replace(/&#8217;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 140) || "item";
}

function imageExt(url: string, contentType?: string | null) {
  if (contentType?.includes("png")) return "png";
  if (contentType?.includes("webp")) return "webp";
  if (contentType?.includes("gif")) return "gif";
  const pathname = new URL(url).pathname;
  const ext = path.extname(pathname).replace(".", "").toLowerCase();
  if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) return ext === "jpeg" ? "jpg" : ext;
  return "jpg";
}

async function wpFetch<T>(url: string): Promise<{ data: T; totalPages: number; total: number }> {
  const res = await fetch(url, { headers: { "user-agent": USER_AGENT } });
  if (!res.ok) throw new Error(`Fetch failed ${res.status}: ${url}`);
  return {
    data: (await res.json()) as T,
    totalPages: Number(res.headers.get("x-wp-totalpages") ?? "1"),
    total: Number(res.headers.get("x-wp-total") ?? "0"),
  };
}

async function fetchAll<T>(endpoint: string) {
  const firstUrl = `${OLD_SITE}/wp-json/wp/v2/${endpoint}${endpoint.includes("?") ? "&" : "?"}per_page=100&page=1`;
  const first = await wpFetch<T[]>(firstUrl);
  const out = [...first.data];
  for (let page = 2; page <= first.totalPages; page++) {
    const url = `${OLD_SITE}/wp-json/wp/v2/${endpoint}${endpoint.includes("?") ? "&" : "?"}per_page=100&page=${page}`;
    const next = await wpFetch<T[]>(url);
    out.push(...next.data);
  }
  return out;
}

async function downloadImage(sourceUrl: string | undefined, folder: string, ownerSlug: string) {
  if (!sourceUrl) return null;
  const absolute = sourceUrl.startsWith("http") ? sourceUrl : new URL(sourceUrl, OLD_SITE).toString();
  if (!absolute.startsWith(OLD_SITE)) return absolute;
  if (downloaded.has(absolute)) return downloaded.get(absolute)!;

  const res = await fetch(absolute, { headers: { "user-agent": USER_AGENT } });
  if (!res.ok) {
    console.warn(`Skip image ${res.status}: ${absolute}`);
    return null;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const hash = createHash("sha1").update(absolute).digest("hex").slice(0, 10);
  const ext = imageExt(absolute, res.headers.get("content-type"));
  const safeOwner = slugify(ownerSlug).slice(0, 80);
  const filename = `${safeOwner}-${hash}.${ext}`;
  const targetDir = folder === "products" ? PRODUCT_IMAGE_DIR : CONTENT_IMAGE_DIR;
  await fs.mkdir(targetDir, { recursive: true });
  await fs.writeFile(path.join(targetDir, filename), buf);
  const publicUrl = `/imported/old-site/${folder}/${filename}`;
  downloaded.set(absolute, publicUrl);
  return publicUrl;
}

async function rewriteContentImages(html: string, slug: string) {
  const urls = Array.from(html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)).map((m) => m[1]);
  let out = html;
  for (const url of urls) {
    const local = await downloadImage(url, "content", slug);
    if (local) out = out.split(url).join(local);
  }
  return out;
}

function bestFeaturedUrl(product: WpProduct) {
  const media = product._embedded?.["wp:featuredmedia"]?.[0];
  return (
    media?.media_details?.sizes?.woocommerce_thumbnail?.source_url ??
    media?.media_details?.sizes?.medium_large?.source_url ??
    media?.source_url ??
    null
  );
}

const brandRules = [
  ["commscope", "COMMSCOPE/AMP"],
  ["amp", "COMMSCOPE/AMP"],
  ["ls-dvh", "LS-PURENET"],
  ["purenet", "LS-PURENET"],
  ["vcom", "Vcom"],
  ["hikvision", "Hikvision"],
  ["tp-link", "TP-Link"],
  ["tplink", "TP-Link"],
  ["ruijie", "Ruijie"],
  ["onv", "Onv"],
  ["aptek", "Aptek"],
  ["apteck", "Aptek"],
  ["draytek", "Draytek"],
  ["tenda", "Tenda"],
  ["dahua", "Dahua"],
  ["tiandy", "Tiandy"],
  ["ezviz", "Ezviz"],
  ["imou", "Imou"],
  ["netlink", "Netlink"],
  ["b&ton", "B&Ton"],
  ["bton", "B&Ton"],
  ["wintop", "Wintop"],
  ["unitek", "Unitek"],
  ["angel", "Angel Lighting"],
  ["jindian", "Jindian"],
] as const;

function inferBrandId(title: string, content: string, brandBySlug: Map<string, string>) {
  const haystack = `${title} ${stripHtml(content)}`.toLowerCase();
  for (const [needle, brandName] of brandRules) {
    if (haystack.includes(needle)) return brandBySlug.get(slugify(brandName)) ?? null;
  }
  return null;
}

function categoryDepth(cat: WpCategory, catsByOldId: Map<number, WpCategory>) {
  let n = 0;
  let cur: WpCategory | undefined = cat;
  while (cur?.parent) {
    n++;
    cur = catsByOldId.get(cur.parent);
  }
  return n;
}

async function upsertCategory(cat: WpCategory, sortOrder: number) {
  const result = await pool.query<{ id: string }>(
    `insert into categories (name, slug, description, sort_order, active)
     values ($1, $2, $3, $4, true)
     on conflict (slug) do update set
       name = excluded.name,
       description = excluded.description,
       sort_order = excluded.sort_order,
       active = true
     returning id`,
    [cat.name, cat.slug, stripHtml(cat.description || "") || null, sortOrder],
  );
  return result.rows[0].id;
}

async function upsertBrand(name: string) {
  const slug = slugify(name);
  const result = await pool.query<{ id: string }>(
    `insert into brands (name, slug, active)
     values ($1, $2, true)
     on conflict (slug) do update set name = excluded.name, active = true
     returning id`,
    [name, slug],
  );
  return result.rows[0].id;
}

async function main() {
  const limitArg = process.argv.find((x) => x.startsWith("--limit="));
  const limit = limitArg ? Number(limitArg.split("=")[1]) : 0;

  console.log("Fetching categories...");
  const oldCategories = (await fetchAll<WpCategory>("product_cat?orderby=count&order=desc")).filter((c) => c.slug !== "uncategorized");
  const catsByOldId = new Map(oldCategories.map((c) => [c.id, c]));
  const categoryIdByOldId = new Map<number, string>();
  for (const [idx, cat] of oldCategories.entries()) {
    categoryIdByOldId.set(cat.id, await upsertCategory(cat, idx));
  }
  for (const cat of oldCategories) {
    const parentId = cat.parent ? categoryIdByOldId.get(cat.parent) : null;
    if (parentId) await pool.query(`update categories set parent_id = $1 where slug = $2`, [parentId, cat.slug]);
  }

  console.log("Upserting brands...");
  const brandBySlug = new Map<string, string>();
  for (const [, name] of brandRules) {
    if (!brandBySlug.has(slugify(name))) brandBySlug.set(slugify(name), await upsertBrand(name));
  }

  console.log("Fetching products...");
  let products = await fetchAll<WpProduct>("product?_embed=1&orderby=date&order=desc");
  if (limit > 0) products = products.slice(0, limit);
  console.log(`Importing ${products.length} products...`);

  let imported = 0;
  for (const product of products) {
    const title = stripHtml(product.title.rendered);
    const content = await rewriteContentImages(product.content.rendered || "", product.slug);
    const excerpt = stripHtml(product.excerpt.rendered || "").slice(0, 500) || null;
    const productCats = product.product_cat
      .map((id) => catsByOldId.get(id))
      .filter((cat): cat is WpCategory => Boolean(cat));
    const mainCat = productCats.sort((a, b) => categoryDepth(b, catsByOldId) - categoryDepth(a, catsByOldId))[0] ?? null;
    const categoryId = mainCat ? categoryIdByOldId.get(mainCat.id) ?? null : null;
    const brandId = inferBrandId(title, content, brandBySlug);
    const featured = await downloadImage(bestFeaturedUrl(product) ?? undefined, "products", product.slug);

    const row = await pool.query<{ id: string }>(
      `insert into products (
        name, slug, sku, short_description, description, price, sale_price, price_type, stock,
        brand_id, category_id, status, featured, bestseller, sale, rating, review_count,
        warranty, seo_title, seo_description, created_at, updated_at
      )
      values ($1, $2, $3, $4, $5, null, null, 'contact', 0,
        $6, $7, 'published', $8, $9, $10, 0, 0,
        null, $11, $12, $13, $14)
      on conflict (slug) do update set
        name = excluded.name,
        short_description = excluded.short_description,
        description = excluded.description,
        brand_id = excluded.brand_id,
        category_id = excluded.category_id,
        status = 'published',
        featured = excluded.featured,
        bestseller = excluded.bestseller,
        sale = excluded.sale,
        seo_title = excluded.seo_title,
        seo_description = excluded.seo_description,
        updated_at = excluded.updated_at
      returning id`,
      [
        title,
        product.slug,
        `OLD-${product.id}`,
        excerpt,
        content,
        brandId,
        categoryId,
        imported < 24,
        imported < 36,
        false,
        title,
        excerpt,
        new Date(product.date),
        new Date(product.modified),
      ],
    );
    const productId = row.rows[0].id;

    await pool.query(`delete from product_categories where product_id = $1`, [productId]);
    for (const cat of productCats) {
      const catId = categoryIdByOldId.get(cat.id);
      if (catId && catId !== categoryId) {
        await pool.query(
          `insert into product_categories (product_id, category_id) values ($1, $2) on conflict do nothing`,
          [productId, catId],
        );
      }
    }

    await pool.query(`delete from product_images where product_id = $1`, [productId]);
    if (featured) {
      await pool.query(
        `insert into product_images (product_id, url, sort_order, is_main) values ($1, $2, 0, true)`,
        [productId, featured],
      );
    }

    imported++;
    if (imported % 25 === 0 || imported === products.length) console.log(`Imported ${imported}/${products.length}`);
  }

  console.log(`Done. Categories: ${oldCategories.length}, products: ${imported}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
