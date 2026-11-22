import "server-only";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { and, asc, count, desc, eq, gte, ilike, inArray, isNotNull, isNull, lte, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import {
  products,
  brands,
  categories,
  productImages,
  productCategories,
  productSpecifications,
  orders,
  orderItems,
  articles,
  banners,
  promotions,
  pages,
  reviews,
  profiles,
  addresses,
  wishlists,
  adminSettings,
  mediaAssets,
  contactMessages,
} from "@/db/schema";
import type {
  ProductRow,
  Category,
  Brand,
  ProductImage,
  Review,
  Article,
  Banner,
  Promotion,
  Page,
  Order,
  OrderItem,
  Address,
} from "./types";
import { BUSINESS } from "./types";
import { parseCompanyProfile } from "./company-profile";

const STORE_CACHE_SECONDS = 600;

/* ------------------------------- categories ------------------------------- */

async function loadActiveCategories(): Promise<Category[]> {
  const headerPriority = sql`case ${categories.slug}
    when 'day-cap-mang' then 1
    when 'cap-mang' then 1
    when 'day-cap-quang' then 2
    when 'cap-quang' then 2
    when 'thiet-bi-mang' then 3
    when 'thiet-bi-quang' then 4
    when 'tu-mang' then 5
    when 'camera-quan-sat' then 6
    when 'camera' then 6
    when 'den-nang-luong-mat-troi' then 7
    when 'den-nlmt' then 7
    when 'phu-kien-quang' then 8
    when 'phu-kien-camera' then 9
    else 100
  end`;
  return db
    .select()
    .from(categories)
    .where(eq(categories.active, true))
    .orderBy(asc(headerPriority), asc(categories.sortOrder), asc(categories.name));
}


export async function getActiveCategories() {
  return unstable_cache(loadActiveCategories, ["store-v2-active-categories"], { revalidate: STORE_CACHE_SECONDS, tags: ["store-catalog"] })();
}
async function loadCategoryBySlug(slug: string): Promise<Category | null> {
  const rows = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return rows[0] ?? null;
}

const getCachedCategoryBySlug = unstable_cache(loadCategoryBySlug, ["store-v3-category-by-slug"], {
  revalidate: STORE_CACHE_SECONDS,
  tags: ["store-catalog"],
});

export const getCategoryBySlug = cache(getCachedCategoryBySlug);

export async function getCategoryById(id: string): Promise<Category | null> {
  const rows = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return rows[0] ?? null;
}

async function loadDescendantIds(categoryId: string): Promise<string[]> {
  const all = await db.select({ id: categories.id, parentId: categories.parentId }).from(categories);
  const byParent = new Map<string, string[]>();
  for (const c of all) {
    if (c.parentId) {
      const list = byParent.get(c.parentId) ?? [];
      list.push(c.id);
      byParent.set(c.parentId, list);
    }
  }
  const out: string[] = [categoryId];
  const queue = [categoryId];
  while (queue.length) {
    const cur = queue.shift()!;
    for (const k of byParent.get(cur) ?? []) {
      out.push(k);
      queue.push(k);
    }
  }
  return out;
}

const getCachedDescendantIds = unstable_cache(loadDescendantIds, ["store-v2-category-descendants"], {
  revalidate: STORE_CACHE_SECONDS,
  tags: ["store-catalog"],
});

export const getDescendantIds = cache(getCachedDescendantIds);

/* --------------------------------- brands --------------------------------- */

async function loadActiveBrands(): Promise<Brand[]> {
  return db.select().from(brands).where(eq(brands.active, true)).orderBy(asc(brands.name));
}


export async function getActiveBrands() {
  return unstable_cache(loadActiveBrands, ["store-v2-active-brands"], { revalidate: STORE_CACHE_SECONDS, tags: ["store-catalog"] })();
}
async function loadBrandBySlug(slug: string): Promise<Brand | null> {
  const rows = await db.select().from(brands).where(eq(brands.slug, slug)).limit(1);
  return rows[0] ?? null;
}

const getCachedBrandBySlug = unstable_cache(loadBrandBySlug, ["store-v2-brand-by-slug"], {
  revalidate: STORE_CACHE_SECONDS,
  tags: ["store-catalog"],
});

export const getBrandBySlug = cache(getCachedBrandBySlug);

async function loadPublishedProductCountsByBrand() {
  return db
    .select({ brandId: products.brandId, n: sql<number>`count(*)` })
    .from(products)
    .where(eq(products.status, "published"))
    .groupBy(products.brandId);
}

export async function getPublishedProductCountsByBrand() {
  return unstable_cache(loadPublishedProductCountsByBrand, ["store-v2-brand-product-counts"], {
    revalidate: STORE_CACHE_SECONDS,
    tags: ["store-products", "store-catalog"],
  })();
}

export async function getBrandById(id: string): Promise<Brand | null> {
  const rows = await db.select().from(brands).where(eq(brands.id, id)).limit(1);
  return rows[0] ?? null;
}

/* -------------------------------- products -------------------------------- */

function productBaseSelect() {
  return {
    id: products.id,
    name: products.name,
    slug: products.slug,
    sku: products.sku,
    shortDescription: products.shortDescription,
    price: products.price,
    salePrice: products.salePrice,
    priceType: products.priceType,
    stock: products.stock,
    status: products.status,
    featured: products.featured,
    bestseller: products.bestseller,
    sale: products.sale,
    rating: products.rating,
    reviewCount: products.reviewCount,
    warranty: products.warranty,
    brandId: products.brandId,
    categoryId: products.categoryId,
    brandName: sql<string>`coalesce(${brands.name}, '')`,
    categoryName: sql<string>`coalesce(${categories.name}, '')`,
    image: sql<string | null> `(select pi.url from product_images pi where pi.product_id = ${products.id} order by pi.is_main desc, pi.sort_order asc limit 1)`,
    createdAt: products.createdAt,
  };
}

async function fetchRows(where: SQL | undefined, orderBy: SQL[], limit: number, offset = 0) {
  return (await db
    .select(productBaseSelect())
    .from(products)
    .leftJoin(brands, eq(products.brandId, brands.id))
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(where ?? sql`true`)
    .orderBy(...orderBy)
    .limit(limit)
    .offset(offset)) as unknown as ProductRow[];
}

async function fetchCount(where: SQL | undefined) {
  const rows = await db.select({ n: count() }).from(products).where(where ?? sql`true`);
  return rows[0]?.n ?? 0;
}

export type ProductFilters = {
  categorySlug?: string;
  brandSlug?: string;
  q?: string;
  min?: number;
  max?: number;
  inStock?: boolean;
  sort?: "newest" | "price_asc" | "price_desc" | "bestselling" | "rating";
  page?: number;
  pageSize?: number;
  only?: "featured" | "bestseller" | "sale" | undefined;
  brandId?: string;
  excludeId?: string;
  limit?: number;
  includeTotal?: boolean;
};

async function queryProductsUncached(f: ProductFilters): Promise<{ items: ProductRow[]; total: number; pages: number }> {
  const pageSize = f.limit ?? f.pageSize ?? 12;
  const page = Math.max(1, f.page ?? 1);

  const parts: (SQL | undefined)[] = [eq(products.status, "published")];

  if (f.categorySlug) {
    const cat = await getCategoryBySlug(f.categorySlug);
    if (!cat) return { items: [], total: 0, pages: 1 };
    const ids = await getDescendantIds(cat.id);
    const pcRows = await db
      .select({ productId: productCategories.productId })
      .from(productCategories)
      .where(inArray(productCategories.categoryId, ids));
    const extraIds = Array.from(new Set(pcRows.map((r) => r.productId)));
    parts.push(
      extraIds.length
        ? or(inArray(products.categoryId, ids), inArray(products.id, extraIds))
        : inArray(products.categoryId, ids),
    );
  }
  if (f.brandId) parts.push(eq(products.brandId, f.brandId));
  if (f.brandSlug) {
    const b = await getBrandBySlug(f.brandSlug);
    if (!b) return { items: [], total: 0, pages: 1 };
    parts.push(eq(products.brandId, b.id));
  }
  if (f.q) {
    const like = `%${f.q.replace(/[%_]/g, "")}%`;
    parts.push(or(ilike(products.name, like), ilike(products.sku, like), ilike(products.shortDescription, like)));
  }
  if (f.min || f.max) {
    parts.push(isNotNull(products.price));
    const eff: SQL = sql`coalesce(${products.salePrice}, ${products.price})`;
    if (f.min) parts.push(gte(eff, f.min));
    if (f.max) parts.push(sql`coalesce(${products.salePrice}, ${products.price}) <= ${f.max}`);
  }
  if (f.inStock) parts.push(sql`${products.stock} > 0`);
  if (f.only === "featured") parts.push(eq(products.featured, true));
  if (f.only === "bestseller") parts.push(eq(products.bestseller, true));
  if (f.only === "sale") parts.push(eq(products.sale, true));
  if (f.excludeId) parts.push(sql`${products.id} != ${f.excludeId}`);

  const where = and(...parts);
  const nullsLast: SQL = sql`case when ${products.price} is null then 1 else 0 end`;
  const effPrice: SQL = sql`coalesce(${products.salePrice}, ${products.price})`;
  let orderBy: SQL[] = [desc(products.createdAt)];
  switch (f.sort) {
    case "price_asc":
      orderBy = [asc(nullsLast), asc(effPrice)];
      break;
    case "price_desc":
      orderBy = [asc(nullsLast), desc(effPrice)];
      break;
    case "bestselling":
      orderBy = [sql`case when ${products.bestseller} then 0 else 1 end`, desc(products.reviewCount), desc(products.createdAt)];
      break;
    case "rating":
      orderBy = [desc(products.rating), desc(products.reviewCount)];
      break;
    default:
      orderBy = [desc(products.createdAt)];
  }

  const [items, total] = await Promise.all([
    fetchRows(where, orderBy, pageSize, (page - 1) * pageSize),
    f.includeTotal === false ? Promise.resolve(0) : fetchCount(where),
  ]);
  return { items, total, pages: Math.max(1, Math.ceil(total / pageSize)) };
}


export async function queryProducts(f: ProductFilters): Promise<{ items: ProductRow[]; total: number; pages: number }> {
  const key = JSON.stringify(f);
  return unstable_cache(() => queryProductsUncached(f), ["store-v2-products-query", key], { revalidate: STORE_CACHE_SECONDS, tags: ["store-products"] })();
}
export async function getAdminProducts(): Promise<ProductRow[]> {
  // Admin needs the complete catalog so search can find products shown on the storefront.
  return fetchRows(undefined, [asc(brands.name), asc(products.name)], 5000);
}

async function loadProductBySlug(slug: string) {
  const rows = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  const product = rows[0];
  if (!product) return null;
  const imagesPromise = db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, product.id))
    .orderBy(asc(productImages.sortOrder));
  const specsPromise = db
    .select()
    .from(productSpecifications)
    .where(eq(productSpecifications.productId, product.id))
    .orderBy(asc(productSpecifications.sortOrder));
  const [images, specs, brand, category] = await Promise.all([
    imagesPromise,
    specsPromise,
    product.brandId ? getBrandById(product.brandId) : Promise.resolve(null),
    product.categoryId ? getCategoryById(product.categoryId) : Promise.resolve(null),
  ]);
  const orderedImages: ProductImage[] = [...images].sort(
    (a, b) => Number(b.isMain) - Number(a.isMain) || a.sortOrder - b.sortOrder,
  );
  return { product, images: orderedImages, specs, brand, category };
}

const getCachedProductBySlug = unstable_cache(loadProductBySlug, ["store-v2-product-by-slug"], {
  revalidate: STORE_CACHE_SECONDS,
  tags: ["store-products", "store-catalog"],
});

export const getProductBySlug = cache(getCachedProductBySlug);

async function loadRelatedProducts(id: string, categoryId: string | null, brandId: string | null): Promise<ProductRow[]> {
  const rows = await db
    .select({ id: products.id, categoryId: products.categoryId, brandId: products.brandId })
    .from(products)
    .where(eq(products.status, "published"))
    .limit(300);
  const relatedIds = rows
    .filter((r) => r.id !== id && (r.categoryId === categoryId || (brandId !== null && r.brandId === brandId)))
    .slice(0, 8)
    .map((r) => r.id);
  if (!relatedIds.length) return [];
  return fetchRows(inArray(products.id, relatedIds), [desc(products.createdAt)], 8);
}

const getCachedRelatedProducts = unstable_cache(loadRelatedProducts, ["store-v2-related-products"], {
  revalidate: STORE_CACHE_SECONDS,
  tags: ["store-products", "store-catalog"],
});

export const getRelatedProducts = cache(async (product: { id: string; categoryId: string | null; brandId: string | null }) =>
  getCachedRelatedProducts(product.id, product.categoryId, product.brandId),
);

/* ------------------------------- reviews ---------------------------------- */

async function loadApprovedReviews(productId: string): Promise<Review[]> {
  return db
    .select()
    .from(reviews)
    .where(and(inArray(reviews.status, ["approved", "featured"]), eq(reviews.productId, productId)))
    .orderBy(desc(reviews.createdAt))
    .limit(30);
}

const getCachedApprovedReviews = unstable_cache(loadApprovedReviews, ["store-v2-approved-reviews"], {
  revalidate: STORE_CACHE_SECONDS,
  tags: ["store-products"],
});

export const getApprovedReviews = cache(getCachedApprovedReviews);

/* ---------------------------------- orders ---------------------------------- */

export async function getOrders(opts: { status?: string; q?: string; limit?: number; offset?: number } = {}) {
  const parts: (SQL | undefined)[] = [];
  if (opts.status) parts.push(eq(orders.status, opts.status));
  if (opts.q) {
    const like = `%${opts.q.replace(/[%_]/g, "")}%`;
    parts.push(or(ilike(orders.orderCode, like), ilike(orders.customerName, like), ilike(orders.phone, like)));
  }
  const where = parts.length ? and(...parts) : undefined;
  const items = await db
    .select()
    .from(orders)
    .where(where ?? sql`true`)
    .orderBy(desc(orders.createdAt))
    .limit(opts.limit ?? 200)
    .offset(opts.offset ?? 0);
  const c = await db.select({ n: count() }).from(orders).where(where ?? sql`true`);
  return { items, total: c[0]?.n ?? 0 };
}

export async function getOrderWithItems(idOrCode: string) {
  const cond = idOrCode.startsWith("QT-") ? eq(orders.orderCode, idOrCode) : eq(orders.id, idOrCode);
  const rows = await db.select().from(orders).where(cond).limit(1);
  const order = rows[0];
  if (!order) return null;
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  return { order, items };
}

export async function nextOrderCode(): Promise<string> {
  const now = new Date();
  const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const rows = await db.select({ n: count() }).from(orders).where(gte(orders.createdAt, start));
  return `QT-${ymd}-${String((rows[0]?.n ?? 0) + 1).padStart(4, "0")}`;
}

export async function getProfileOrders(profileId: string): Promise<{ order: Order; items: OrderItem[] }[]> {
  const list = await db.select().from(orders).where(eq(orders.profileId, profileId)).orderBy(desc(orders.createdAt));
  const out: { order: Order; items: OrderItem[] }[] = [];
  for (const o of list) {
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, o.id));
    out.push({ order: o, items });
  }
  return out;
}

export async function getDashboardStats() {
  const [totalProducts, activeProducts, totalCategories] = await Promise.all([
    db.select({ n: count() }).from(products),
    db.select({ n: count() }).from(products).where(eq(products.status, "published")),
    db.select({ n: count() }).from(categories),
  ]);
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const [ordersToday, pending, completed, revenue] = await Promise.all([
    db.select({ n: count() }).from(orders).where(gte(orders.createdAt, startOfDay)),
    db.select({ n: count() }).from(orders).where(eq(orders.status, "pending")),
    db.select({ n: count() }).from(orders).where(eq(orders.status, "completed")),
    db.select({ sum: sql<number>`coalesce(sum(${orders.total}) filter (where ${orders.status} != 'cancelled'), 0)` }).from(orders),
  ]);
  const [recentOrders, recentProducts, recentArticles, pendingReviews] = await Promise.all([
    db.select().from(orders).orderBy(desc(orders.createdAt)).limit(6),
    db.select().from(products).orderBy(desc(products.createdAt)).limit(5),
    db.select().from(articles).orderBy(desc(articles.createdAt)).limit(4),
    db.select({ n: count() }).from(reviews).where(eq(reviews.status, "pending")),
  ]);
  return {
    totalProducts: totalProducts[0]?.n ?? 0,
    activeProducts: activeProducts[0]?.n ?? 0,
    totalCategories: totalCategories[0]?.n ?? 0,
    ordersToday: ordersToday[0]?.n ?? 0,
    pendingOrders: pending[0]?.n ?? 0,
    completedOrders: completed[0]?.n ?? 0,
    revenue: revenue[0]?.sum ?? 0,
    pendingReviews: pendingReviews[0]?.n ?? 0,
    recentOrders,
    recentProducts,
    recentArticles,
  };
}

export async function getCustomers() {
  return db.select().from(profiles).where(eq(profiles.role, "customer")).orderBy(desc(profiles.createdAt)).limit(300);
}

/* --------------------------------- articles --------------------------------- */

export type ArticleListRow = Omit<Article, "content">;

function articleListSelect() {
  return {
    id: articles.id,
    title: articles.title,
    slug: articles.slug,
    excerpt: articles.excerpt,
    coverImage: articles.coverImage,
    category: articles.category,
    tags: articles.tags,
    status: articles.status,
    seoTitle: articles.seoTitle,
    seoDescription: articles.seoDescription,
    publishedAt: articles.publishedAt,
    createdAt: articles.createdAt,
  };
}

async function getArticlesUncached(opts: { status?: string; category?: string; limit?: number; offset?: number; excludeId?: string } = {}) {
  const parts: (SQL | undefined)[] = [eq(articles.status, opts.status ?? "published")];
  if (opts.category) parts.push(eq(articles.category, opts.category));
  if (opts.excludeId) parts.push(sql`${articles.id} != ${opts.excludeId}`);
  const where = and(...parts);
  const items = await db
    .select(articleListSelect())
    .from(articles)
    .where(where ?? sql`true`)
    .orderBy(desc(articles.publishedAt))
    .limit(opts.limit ?? 50)
    .offset(opts.offset ?? 0);
  const c = await db.select({ n: count() }).from(articles).where(where ?? sql`true`);
  return { items: items as ArticleListRow[], total: c[0]?.n ?? 0 };
}


export async function getArticles(opts: { status?: string; category?: string; limit?: number; offset?: number; excludeId?: string } = {}) {
  const key = JSON.stringify(opts);
  return unstable_cache(() => getArticlesUncached(opts), ["store-v2-articles-query", key], { revalidate: STORE_CACHE_SECONDS, tags: ["store-articles"] })();
}

async function loadArticleCategories() {
  const rows = await db
    .selectDistinct({ category: articles.category })
    .from(articles)
    .where(and(eq(articles.status, "published"), isNotNull(articles.category)))
    .orderBy(asc(articles.category));
  return rows.flatMap((row) => row.category ? [row.category] : []);
}

export async function getArticleCategories() {
  return unstable_cache(loadArticleCategories, ["store-v2-article-categories"], {
    revalidate: STORE_CACHE_SECONDS,
    tags: ["store-articles"],
  })();
}

function normalizedTags(value: string | null) {
  return new Set((value ?? "").split(",").map((tag) => tag.trim().toLocaleLowerCase("vi-VN")).filter(Boolean));
}

async function loadRelatedArticles(article: Article, limit: number) {
  const candidates = await db
    .select(articleListSelect())
    .from(articles)
    .where(and(eq(articles.status, "published"), sql`${articles.id} != ${article.id}`))
    .orderBy(desc(articles.publishedAt))
    .limit(100);
  const sourceTags = normalizedTags(article.tags);
  return candidates
    .map((candidate) => {
      const sharedTags = [...normalizedTags(candidate.tags)].filter((tag) => sourceTags.has(tag)).length;
      const sameCategory = candidate.category && candidate.category === article.category ? 1 : 0;
      return { candidate, score: sameCategory * 100 + sharedTags * 10 };
    })
    .sort((a, b) => b.score - a.score || b.candidate.publishedAt.getTime() - a.candidate.publishedAt.getTime())
    .slice(0, limit)
    .map(({ candidate }) => candidate as ArticleListRow);
}

export const getRelatedArticles = cache(async (article: Article, limit = 3): Promise<ArticleListRow[]> =>
  unstable_cache(() => loadRelatedArticles(article, limit), ["store-v2-related-articles", article.id, String(limit)], {
    revalidate: STORE_CACHE_SECONDS,
    tags: ["store-articles"],
  })(),
);
async function loadArticleBySlug(slug: string): Promise<Article | null> {
  const rows = await db.select().from(articles).where(eq(articles.slug, slug)).limit(1);
  return rows[0] ?? null;
}

const getCachedArticleBySlug = unstable_cache(loadArticleBySlug, ["store-v2-article-by-slug"], {
  revalidate: STORE_CACHE_SECONDS,
  tags: ["store-articles"],
});

export const getArticleBySlug = cache(getCachedArticleBySlug);

/* --------------------------- banners / promos / pages --------------------------- */

async function loadActiveBanners(): Promise<Banner[]> {
  const today = new Date().toISOString().slice(0, 10);
  return db.select().from(banners).where(and(
    eq(banners.active, true),
    or(isNull(banners.startDate), lte(banners.startDate, today)),
    or(isNull(banners.endDate), gte(banners.endDate, today)),
  )).orderBy(asc(banners.sortOrder));
}


export async function getActiveBanners() {
  return unstable_cache(loadActiveBanners, ["store-v2-active-banners"], { revalidate: STORE_CACHE_SECONDS, tags: ["store-content"] })();
}
async function loadActivePromotions(): Promise<Promotion[]> {
  const today = new Date().toISOString().slice(0, 10);
  return db.select().from(promotions).where(and(
    eq(promotions.active, true),
    or(isNull(promotions.startDate), lte(promotions.startDate, today)),
    or(isNull(promotions.endDate), gte(promotions.endDate, today)),
  )).orderBy(asc(promotions.sortOrder));
}


export async function getActivePromotions() {
  return unstable_cache(loadActivePromotions, ["store-v2-active-promotions"], { revalidate: STORE_CACHE_SECONDS, tags: ["store-content"] })();
}
export async function getPageBySlug(slug: string): Promise<Page | null> {
  const rows = await db.select().from(pages).where(eq(pages.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function getAllPages(): Promise<Page[]> {
  return db.select().from(pages).orderBy(asc(pages.slug));
}

/* --------------------------------- settings --------------------------------- */

async function loadSettings(): Promise<Record<string, string>> {
  const rows = await db.select().from(adminSettings);
  const out: Record<string, string> = {
    site_name: BUSINESS.name,
    phone: BUSINESS.phone,
    sales_phones: BUSINESS.salesPhones,
    cs_kh: BUSINESS.csKh,
    zalo: BUSINESS.zalo,
    email: BUSINESS.email,
    address: BUSINESS.address,
    hours: BUSINESS.hours,
    mst: BUSINESS.mst,
    facebook: BUSINESS.facebook,
    announcement: "Thiết bị chính hãng • Tư vấn kỹ thuật • Giao hàng toàn quốc",
    shipping_fee: "0",
    bank_name: "",
    bank_account: "",
    bank_owner: "",
    track_stock: "0",
  };
  for (const r of rows) if (r.value != null) out[r.key] = r.value;
  // Preserve editable settings, but replace the retired support number stored in older installations.
  if (out.phone.replace(/\D/g, "") === "0941746161") out.phone = BUSINESS.phone;
  if (out.sales_phones.includes("0941.74.6161")) out.sales_phones = BUSINESS.salesPhones;
  if (out.cs_kh.replace(/\D/g, "") === "0941746161") out.cs_kh = BUSINESS.csKh;
  if (out.zalo.includes("0941746161")) out.zalo = BUSINESS.zalo;
  return out;
}

/* ---------------------------------- misc ---------------------------------- */


export async function getSettings() {
  return unstable_cache(loadSettings, ["store-v2-settings"], { revalidate: STORE_CACHE_SECONDS, tags: ["store-settings"] })();
}

async function loadCompanyProfile() {
  const rows = await db.select({ value: adminSettings.value }).from(adminSettings).where(eq(adminSettings.key, "company_profile")).limit(1);
  return parseCompanyProfile(rows[0]?.value);
}

export async function getCompanyProfile() {
  return unstable_cache(loadCompanyProfile, ["store-company-profile-v2"], { revalidate: STORE_CACHE_SECONDS, tags: ["company-profile"] })();
}
export async function getWishlistProducts(profileId: string): Promise<ProductRow[]> {
  const rows = await db.select({ productId: wishlists.productId }).from(wishlists).where(eq(wishlists.profileId, profileId));
  const ids = rows.map((r) => r.productId);
  if (!ids.length) return [];
  return fetchRows(inArray(products.id, ids), [asc(products.createdAt)], ids.length);
}

export async function getProfileAddresses(profileId: string): Promise<Address[]> {
  return db.select().from(addresses).where(eq(addresses.profileId, profileId));
}

async function searchAllUncached(q: string) {
  const like = `%${q.replace(/[%_]/g, "")}%`;
  const [productsRes, catRows, articleRows] = await Promise.all([
    fetchRows(and(eq(products.status, "published"), or(ilike(products.name, like), ilike(products.sku, like), ilike(products.shortDescription, like))), [desc(products.createdAt)], 24),
    db.select().from(categories).where(and(ilike(categories.name, like), eq(categories.active, true))).limit(8),
    db.select(articleListSelect()).from(articles).where(and(ilike(articles.title, like), eq(articles.status, "published"))).orderBy(desc(articles.publishedAt)).limit(5),
  ]);
  return { products: productsRes, categories: catRows, articles: articleRows };
}

export async function searchAll(q: string) {
  const normalized = q.trim().toLowerCase();
  return unstable_cache(() => searchAllUncached(normalized), ["store-search", normalized], { revalidate: 60, tags: ["store-search"] })();
}

export async function getMediaAssets() {
  return db.select().from(mediaAssets).orderBy(desc(mediaAssets.createdAt)).limit(200);
}

export async function getContactMessages() {
  return db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)).limit(100);
}

export function stripHtml(html: string): string {
  return html
    .replace(/\[(?:\/?caption|gallery|\/gallery)[^\]]*\]/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#039;|&apos;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}
