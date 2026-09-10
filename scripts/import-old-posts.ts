import dotenv from "dotenv";
import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { Pool } from "pg";

dotenv.config({ path: ".env.local" });
dotenv.config();

const OLD_SITE = "https://vienthongquangthang.com";
const USER_AGENT = "Mozilla/5.0 (compatible; QT article importer)";
const POST_IMAGE_DIR = path.join(process.cwd(), "public", "imported", "old-site", "articles");
const CONTENT_IMAGE_DIR = path.join(process.cwd(), "public", "imported", "old-site", "content");

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required in .env.local");
const pool = new Pool({ connectionString: databaseUrl });
const downloaded = new Map<string, string>();

type WpPost = {
  id: number;
  slug: string;
  date: string;
  modified: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  categories: number[];
  _embedded?: {
    "wp:featuredmedia"?: Array<{ source_url?: string; media_details?: { sizes?: Record<string, { source_url?: string }> } }>;
    "wp:term"?: Array<Array<{ taxonomy: string; id: number; name: string; slug: string }>>;
  };
};

function decode(input = "") {
  return input
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#8211;/g, "–")
    .replace(/&#8221;|&#8243;/g, '"')
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
    .slice(0, 140) || "bai-viet";
}

function ext(url: string, contentType?: string | null) {
  if (contentType?.includes("png")) return "png";
  if (contentType?.includes("webp")) return "webp";
  const e = path.extname(new URL(url).pathname).replace(".", "").toLowerCase();
  return ["jpg", "jpeg", "png", "webp", "gif"].includes(e) ? (e === "jpeg" ? "jpg" : e) : "jpg";
}

async function wpFetch<T>(url: string): Promise<{ data: T; totalPages: number }> {
  const res = await fetch(url, { headers: { "user-agent": USER_AGENT } });
  if (!res.ok) throw new Error(`Fetch failed ${res.status}: ${url}`);
  return { data: (await res.json()) as T, totalPages: Number(res.headers.get("x-wp-totalpages") ?? "1") };
}

async function fetchAllPosts() {
  const first = await wpFetch<WpPost[]>(`${OLD_SITE}/wp-json/wp/v2/posts?_embed=1&per_page=100&page=1`);
  const out = [...first.data];
  for (let page = 2; page <= first.totalPages; page++) {
    const next = await wpFetch<WpPost[]>(`${OLD_SITE}/wp-json/wp/v2/posts?_embed=1&per_page=100&page=${page}`);
    out.push(...next.data);
  }
  return out;
}

async function downloadImage(sourceUrl: string | undefined, folder: "articles" | "content", ownerSlug: string) {
  if (!sourceUrl) return null;
  const absolute = sourceUrl.startsWith("http") ? sourceUrl : new URL(sourceUrl, OLD_SITE).toString();
  if (!absolute.startsWith(OLD_SITE)) return absolute;
  if (downloaded.has(absolute)) return downloaded.get(absolute)!;
  const res = await fetch(absolute, { headers: { "user-agent": USER_AGENT } });
  if (!res.ok) return null;
  const hash = createHash("sha1").update(absolute).digest("hex").slice(0, 10);
  const filename = `${slugify(ownerSlug)}-${hash}.${ext(absolute, res.headers.get("content-type"))}`;
  const dir = folder === "articles" ? POST_IMAGE_DIR : CONTENT_IMAGE_DIR;
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, filename), Buffer.from(await res.arrayBuffer()));
  const publicUrl = `/imported/old-site/${folder}/${filename}`;
  downloaded.set(absolute, publicUrl);
  return publicUrl;
}

async function rewriteImages(html: string, slug: string) {
  const urls = Array.from(html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)).map((m) => m[1]);
  let out = html;
  for (const url of urls) {
    const local = await downloadImage(url, "content", slug);
    if (local) out = out.split(url).join(local);
  }
  return out;
}

function featuredUrl(post: WpPost) {
  const media = post._embedded?.["wp:featuredmedia"]?.[0];
  return media?.media_details?.sizes?.medium_large?.source_url ?? media?.source_url ?? undefined;
}

function categoryName(post: WpPost) {
  return post._embedded?.["wp:term"]?.flat().find((t) => t.taxonomy === "category")?.name ?? "Tin tức";
}

async function main() {
  const posts = await fetchAllPosts();
  let imported = 0;
  for (const post of posts) {
    const title = decode(post.title.rendered);
    const slug = slugify(decode(post.slug || title));
    const content = await rewriteImages(post.content.rendered || "", slug);
    const excerpt = decode(post.excerpt.rendered).slice(0, 500) || null;
    const cover = await downloadImage(featuredUrl(post), "articles", slug);
    const category = decode(categoryName(post)) || "Tin tức";
    await pool.query(
      `insert into articles (title, slug, excerpt, content, cover_image, category, tags, status, seo_title, seo_description, published_at, created_at)
       values ($1,$2,$3,$4,$5,$6,null,'published',$7,$8,$9,$10)
       on conflict (slug) do update set
         title = excluded.title,
         excerpt = excluded.excerpt,
         content = excluded.content,
         cover_image = excluded.cover_image,
         category = excluded.category,
         status = 'published',
         seo_title = excluded.seo_title,
         seo_description = excluded.seo_description,
         published_at = excluded.published_at`,
      [title, slug, excerpt, content, cover, category, title, excerpt, new Date(post.date), new Date(post.modified)],
    );
    imported++;
  }
  console.log(`Imported ${imported} articles.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
