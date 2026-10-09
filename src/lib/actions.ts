"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import type { CompanyProfile } from "./company-profile";
import { eq, inArray, and, asc } from "drizzle-orm";
import { db } from "@/db";
import {
  profiles,
  products,
  productImages,
  productCategories,
  productSpecifications,
  categories,
  brands,
  orders,
  orderItems,
  articles,
  banners,
  promotions,
  reviews,
  addresses,
  adminSettings,
  mediaAssets,
  contactMessages,
  newsletterSubscribers,
} from "@/db/schema";
import {
  hashPassword,
  verifyPassword,
  setSession,
  clearSession,
  getSessionProfile,
  getAdminOrThrow,
  createResetRecord,
  consumeReset,
  syncWishlistToDb,
} from "./auth";
import { notify } from "./notifications";
import { getSettings, nextOrderCode, getApprovedReviews } from "./data";
import { slugify, type ActionResult } from "./types";

function revalidateStore() {
  revalidateTag("store-catalog", "max");
  revalidateTag("store-products", "max");
  revalidateTag("store-content", "max");
  revalidateTag("store-articles", "max");
  revalidateTag("store-settings", "max");
  revalidatePath("/");
  revalidatePath("/san-pham");
  revalidatePath("/danh-muc");
  revalidatePath("/thuong-hieu");
  revalidatePath("/tin-tuc");
  revalidatePath("/khuyen-mai");
}

/* ================================== AUTH ================================== */

export async function loginAction(input: { email: string; password: string }): Promise<ActionResult> {
  const email = input.email.trim().toLowerCase();
  if (!email || !input.password) return { ok: false, error: "Vui lòng nhập email và mật khẩu." };
  const rows = await db.select().from(profiles).where(eq(profiles.email, email)).limit(1);
  const user = rows[0];
  if (!user || !verifyPassword(input.password, user.passwordHash)) {
    return { ok: false, error: "Email hoặc mật khẩu không đúng." };
  }
  await setSession(user.id);
  revalidatePath("/tai-khoan");
  return { ok: true, redirect: user.role === "admin" ? "/admin" : "/tai-khoan" };
}

export async function registerAction(input: { name: string; email: string; phone: string; password: string }): Promise<ActionResult> {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  if (!name || !email || input.password.length < 6) {
    return { ok: false, error: "Họ tên, email bắt buộc và mật khẩu tối thiểu 6 ký tự." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "Email không hợp lệ." };
  const existing = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.email, email)).limit(1);
  if (existing[0]) return { ok: false, error: "Email đã được đăng ký. Vui lòng đăng nhập." };
  const [created] = await db
    .insert(profiles)
    .values({ name, email, phone: input.phone.trim() || null, passwordHash: hashPassword(input.password), role: "customer" })
    .returning();
  await setSession(created.id);
  revalidatePath("/tai-khoan");
  return { ok: true, redirect: "/tai-khoan" };
}

export async function logoutAction(): Promise<ActionResult> {
  await clearSession();
  revalidatePath("/");
  revalidatePath("/tai-khoan");
  return { ok: true, redirect: "/" };
}

export async function requestResetAction(email: string): Promise<ActionResult> {
  const e = email.trim().toLowerCase();
  const rows = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.email, e)).limit(1);
  if (!rows[0]) return { ok: true, code: "NOT_FOUND" };
  const token = await createResetRecord(e);
  await notify("password.reset_requested", { toEmail: e, subject: "Quên mật khẩu", data: { token } });
  // Khi chưa kết nối email provider (Resend), hiển thị mã để hoàn tất quy trình.
  return { ok: true, code: token };
}

export async function resetPasswordAction(input: { email: string; token: string; password: string }): Promise<ActionResult> {
  if (input.password.length < 6) return { ok: false, error: "Mật khẩu mới tối thiểu 6 ký tự." };
  const ok = await consumeReset(input.email.trim().toLowerCase(), input.token);
  if (!ok) return { ok: false, error: "Mã khôi phục không hợp lệ hoặc đã hết hạn." };
  const rows = await db.select().from(profiles).where(eq(profiles.email, input.email.trim().toLowerCase())).limit(1);
  if (rows[0]) {
    await db.update(profiles).set({ passwordHash: hashPassword(input.password), updatedAt: new Date() }).where(eq(profiles.id, rows[0].id));
  }
  return { ok: true, redirect: "/dang-nhap" };
}

export async function updateProfileAction(input: { name: string; phone: string }): Promise<ActionResult> {
  const user = await getSessionProfile();
  if (!user) return { ok: false, error: "Vui lòng đăng nhập." };
  if (!input.name.trim()) return { ok: false, error: "Họ tên không được để trống." };
  await db.update(profiles).set({ name: input.name.trim(), phone: input.phone.trim() || null, updatedAt: new Date() }).where(eq(profiles.id, user.id));
  revalidatePath("/tai-khoan");
  return { ok: true };
}

export async function syncWishlistAction(ids: string[]): Promise<ActionResult> {
  const n = await syncWishlistToDb(ids);
  revalidatePath("/tai-khoan");
  return { ok: true, code: String(n) };
}

/* ================================== CART / ORDER ================================== */

export type PlaceOrderInput = {
  items: { productId: string; quantity: number }[];
  customerName: string;
  phone: string;
  email: string;
  address: string;
  province: string;
  district: string;
  ward: string;
  note: string;
  paymentMethod: string;
};

export async function placeOrderAction(input: PlaceOrderInput): Promise<ActionResult> {
  try {
    const name = input.customerName.trim();
    const phone = input.phone.trim();
    const address = input.address.trim();
    if (!name || !phone || !address) return { ok: false, error: "Vui lòng điền đủ họ tên, số điện thoại và địa chỉ." };
    if (!/^0\d{8,10}$/.test(phone.replace(/\s/g, ""))) return { ok: false, error: "Số điện thoại không hợp lệ." };
    if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) return { ok: false, error: "Email không hợp lệ." };
    if (!input.items.length) return { ok: false, error: "Giỏ hàng trống." };
    if (!["cod", "bank", "contact"].includes(input.paymentMethod)) return { ok: false, error: "Hình thức thanh toán không hợp lệ." };

    const user = (await getSessionProfile()) ?? null;
    const settings = await getSettings();
    const trackStock = settings.track_stock === "1";
    const shippingFee = Math.max(0, Number(settings.shipping_fee) || 0);

    const ids = input.items.map((i) => i.productId);
    const dbProducts = await db.select().from(products).where(inArray(products.id, ids));
    const byId = new Map(dbProducts.map((p) => [p.id, p]));

    let subtotal = 0;
    const lineItems: { p: (typeof dbProducts)[number]; qty: number; unit: number }[] = [];
    for (const item of input.items) {
      const p = byId.get(item.productId);
      if (!p || p.status !== "published") return { ok: false, error: "Một sản phẩm trong giỏ không còn khả dụng." };
      const unit = p.priceType === "fixed" ? (p.salePrice ?? p.price ?? 0) : 0;
      let qty = Math.min(999, Math.max(1, Math.floor(item.quantity) || 1));
      if (trackStock && p.priceType === "fixed" && p.stock > 0 && qty > p.stock) qty = p.stock;
      if (trackStock && p.priceType === "fixed" && p.stock <= 0) return { ok: false, error: `${p.name} hiện tạm hết hàng.` };
      subtotal += unit * qty;
      lineItems.push({ p, qty, unit });
    }

    const hasContactItem = lineItems.some((item) => item.p.priceType !== "fixed");
    const appliedShippingFee = hasContactItem ? 0 : shippingFee;
    const discount = 0; // Coupon: kiến trúc hỗ trợ, sẽ bật ở phiên bản tiếp theo
    const total = Math.max(0, subtotal + appliedShippingFee - discount);
    const orderCode = await nextOrderCode();

    const [order] = await db.insert(orders).values({
      orderCode,
      profileId: user?.id ?? null,
      customerName: name,
      phone,
      email: input.email.trim() || null,
      address,
      province: input.province,
      district: input.district,
      ward: input.ward,
      note: input.note.trim() || null,
      paymentMethod: input.paymentMethod,
      status: "pending",
      subtotal,
      shippingFee: appliedShippingFee,
      discount,
      total,
    }).returning();

    const imageByProduct = new Map<string, string>();
    const imgs = await db.select().from(productImages).where(inArray(productImages.productId, ids)).orderBy(asc(productImages.sortOrder));
    for (const img of imgs) if (!imageByProduct.has(img.productId)) imageByProduct.set(img.productId, img.url);

    for (const li of lineItems) {
      await db.insert(orderItems).values({
        orderId: order.id,
        productId: li.p.id,
        productName: li.p.name,
        sku: li.p.sku,
        productImage: imageByProduct.get(li.p.id) ?? null,
        unitPrice: li.unit,
        quantity: li.qty,
        subtotal: li.unit * li.qty,
      });
      if (trackStock) {
        await db.update(products).set({ stock: Math.max(0, li.p.stock - li.qty) }).where(eq(products.id, li.p.id));
      }
    }

    // --- notification abstraction (future: Resend) ---
    await notify("order.created", {
      toEmail: input.email.trim() || "admin",
      subject: `Đơn hàng ${orderCode} — ${name}`,
      data: { orderCode, name, phone, total, paymentMethod: input.paymentMethod, items: lineItems.length },
    });

    clearSession();
    return { ok: true, code: orderCode };
  } catch (e) {
    console.error("placeOrder failed", e);
    return { ok: false, error: "Đặt hàng thất bại. Vui lòng thử lại hoặc gọi hotline 094.710.6161." };
  }
}

/* =============================== WISHLIST (DB) =============================== */

export async function wishlistDbAction(productId: string, on: boolean): Promise<ActionResult> {
  const user = await getSessionProfile();
  if (!user) return { ok: false, error: "Vui lòng đăng nhập để lưu yêu thích." };
  const { wishlists } = await import("@/db/schema");
  if (on) {
    await db.insert(wishlists).values({ profileId: user.id, productId }).onConflictDoNothing();
  } else {
    await db.delete(wishlists).where(and(eq(wishlists.profileId, user.id), eq(wishlists.productId, productId)));
  }
  revalidatePath("/tai-khoan");
  return { ok: true };
}

/* =============================== REVIEWS =============================== */

export async function submitReviewAction(input: { productId: string; rating: number; name: string; content: string }): Promise<ActionResult> {
  const user = await getSessionProfile();
  const name = (user?.name || input.name).trim();
  const content = input.content.trim();
  if (!name || !content) return { ok: false, error: "Vui lòng nhập họ tên và nội dung đánh giá." };
  const rating = Math.min(5, Math.max(1, Math.floor(input.rating) || 5));
  const prod = await db.select({ id: products.id }).from(products).where(eq(products.id, input.productId)).limit(1);
  if (!prod[0]) return { ok: false, error: "Sản phẩm không tồn tại." };
  await db.insert(reviews).values({
    productId: input.productId,
    profileId: user?.id ?? null,
    customerName: name,
    rating,
    content: content.slice(0, 2000),
    status: "pending",
  });
  await recomputeRating(input.productId);
  revalidatePath(`/san-pham`);
  return { ok: true };
}

async function recomputeRating(productId: string) {
  const approved = await getApprovedReviews(productId);
  const avg = approved.length ? approved.reduce((s, r) => s + r.rating, 0) / approved.length : 0;
  await db
    .update(products)
    .set({ rating: Math.round(avg * 100) / 100, reviewCount: approved.length, updatedAt: new Date() })
    .where(eq(products.id, productId));
}

/* =============================== NEWSLETTER / CONTACT =============================== */

export async function subscribeAction(email: string): Promise<ActionResult> {
  const e = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return { ok: false, error: "Email không hợp lệ." };
  await db.insert(newsletterSubscribers).values({ email: e }).onConflictDoNothing();
  await notify("newsletter.subscribed", { toEmail: e, subject: "Xác nhận đăng ký nhận tin", data: { email: e } });
  return { ok: true };
}

export async function contactAction(input: { name: string; phone: string; email: string; message: string }): Promise<ActionResult> {
  if (!input.name.trim() || !input.message.trim()) return { ok: false, error: "Vui lòng điền họ tên và nội dung." };
  await db.insert(contactMessages).values({
    name: input.name.trim(),
    phone: input.phone.trim() || null,
    email: input.email.trim() || null,
    message: input.message.trim().slice(0, 4000),
  });
  await notify("contact.message", { toEmail: input.email || undefined, subject: `Lời nhắn từ ${input.name}`, data: { name: input.name } });
  revalidatePath("/lien-he");
  return { ok: true };
}

/* =============================== ADDRESSES =============================== */

export async function saveAddressAction(input: { id?: string; label: string; name: string; phone: string; address: string; province: string; district: string; ward: string }): Promise<ActionResult> {
  const user = await getSessionProfile();
  if (!user) return { ok: false, error: "Vui lòng đăng nhập." };
  if (!input.name.trim() || !input.phone.trim() || !input.address.trim()) return { ok: false, error: "Vui lòng điền đủ thông tin." };
  if (input.id) {
    await db.update(addresses).set({ label: input.label, name: input.name, phone: input.phone, address: input.address, province: input.province, district: input.district, ward: input.ward }).where(eq(addresses.id, input.id));
  } else {
    await db.insert(addresses).values({ profileId: user.id, label: input.label || "Mặc định", name: input.name, phone: input.phone, address: input.address, province: input.province, district: input.district, ward: input.ward });
  }
  revalidatePath("/tai-khoan");
  return { ok: true };
}

export async function deleteAddressAction(id: string): Promise<ActionResult> {
  const user = await getSessionProfile();
  if (!user) return { ok: false, error: "Vui lòng đăng nhập." };
  await db.delete(addresses).where(and(eq(addresses.id, id), eq(addresses.profileId, user.id)));
  revalidatePath("/tai-khoan");
  return { ok: true };
}

/* ================================ MEDIA ================================ */

export async function registerMediaAsset(url: string, filename?: string): Promise<ActionResult> {
  const admin = await getAdminOrThrow();
  if (!admin) return { ok: false, error: "Không có quyền." };
  if (!/^https?:\/\//.test(url) && !url.startsWith("/uploads/")) return { ok: false, error: "URL ảnh không hợp lệ." };
  await db.insert(mediaAssets).values({ url, filename: filename ?? url.split("/").pop() ?? null });
  revalidatePath("/admin/media");
  return { ok: true };
}

/* ================================ ADMIN: PRODUCTS ================================ */

export type ProductForm = {
  id?: string;
  name: string;
  slug: string;
  sku: string;
  shortDescription: string;
  description: string;
  priceType: "fixed" | "contact";
  price?: string;
  salePrice?: string;
  markupPercent?: string;
  stock?: string;
  brandId?: string;
  categoryId?: string;
  categoryIds: string[];
  status: string;
  featured: boolean;
  bestseller: boolean;
  sale: boolean;
  warranty: string;
  seoTitle: string;
  seoDescription: string;
  images: { url: string; isMain: boolean }[];
  specs: { name: string; value: string }[];
};

function roundedWebPriceFromBase(value: string | undefined, markupPercent: string | undefined): number {
  const base = Math.max(0, Number(value) || 0);
  const markup = Math.max(0, Number(markupPercent) || 0);
  return Math.round((base * (1 + markup / 100)) / 1000) * 1000;
}

async function uniqueSlug(table: "products" | "categories" | "brands" | "articles", base: string, excludeId?: string): Promise<string> {
  const t =
    table === "products" ? products : table === "categories" ? categories : table === "brands" ? brands : articles;
  let slug = slugify(base || "sp");
  for (let i = 0; i < 5; i++) {
    const candidate = i === 0 ? slug : `${slug}-${i + 1}`;
    const rows = await db.select({ id: t.id }).from(t).where(eq(t.slug as never, candidate as never)).limit(1);
    if (!rows[0] || rows[0].id === excludeId) return candidate;
  }
  return `${slug}-${Date.now()}`;
}

export async function saveProductAction(form: ProductForm): Promise<ActionResult> {
  const admin = await getAdminOrThrow();
  if (!admin) return { ok: false, error: "Không có quyền." };
  if (!form.name.trim()) return { ok: false, error: "Tên sản phẩm bắt buộc." };

  const hasMarkup = form.markupPercent !== undefined && form.markupPercent.trim() !== "";
  const markupPercent = form.priceType === "fixed" && hasMarkup ? Math.max(0, Number(form.markupPercent) || 0) : null;
  // Legacy products have no markup value. Preserve their stored web price exactly when edited.
  const price = form.priceType === "fixed"
    ? (hasMarkup ? roundedWebPriceFromBase(form.price, form.markupPercent) : Math.max(0, Math.floor(Number(form.price) || 0)))
    : null;
  const salePrice = form.priceType === "fixed" && form.salePrice
    ? (hasMarkup ? roundedWebPriceFromBase(form.salePrice, form.markupPercent) : Math.max(0, Math.floor(Number(form.salePrice) || 0))) || null
    : null;
  const stock = Math.max(0, Math.floor(Number(form.stock) || 0));
  const slug = form.slug.trim() ? await uniqueSlug("products", form.slug.trim(), form.id) : await uniqueSlug("products", form.name, form.id);

  const data = {
    name: form.name.trim(),
    slug,
    sku: form.sku.trim() || null,
    shortDescription: form.shortDescription.trim() || null,
    description: form.description || null,
    price,
    salePrice,
    markupPercent,
    priceType: form.priceType,
    stock,
    brandId: form.brandId || null,
    categoryId: form.categoryId || null,
    status: form.status === "published" ? "published" : "draft",
    featured: !!form.featured,
    bestseller: !!form.bestseller,
    sale: !!form.sale,
    warranty: form.warranty.trim() || null,
    seoTitle: form.seoTitle.trim() || null,
    seoDescription: form.seoDescription.trim() || null,
    updatedAt: new Date(),
  };

  let id: string;
  if (form.id) {
    id = form.id;
    await db.update(products).set(data).where(eq(products.id, id));
  } else {
    const [row] = await db.insert(products).values(data).returning();
    id = row.id;
  }

  // images
  await db.delete(productImages).where(eq(productImages.productId, id));
  const hasMainImage = form.images.some((x) => x.url.trim() && x.isMain);
  await Promise.all(
    form.images
      .filter((i) => i.url.trim())
      .map((img, idx) =>
        db.insert(productImages).values({
          productId: id,
          url: img.url.trim(),
          sortOrder: idx,
          isMain: img.isMain || (idx === 0 && !hasMainImage),
        }),
      ),
  );
  // extra categories
  await db.delete(productCategories).where(eq(productCategories.productId, id));
  const extraCats = Array.from(new Set(form.categoryIds.filter((c) => c && c !== form.categoryId)));
  await Promise.all(extraCats.map((c) => db.insert(productCategories).values({ productId: id, categoryId: c })));
  // specs
  await db.delete(productSpecifications).where(eq(productSpecifications.productId, id));
  await Promise.all(
    form.specs
      .filter((s) => s.name.trim() && s.value.trim())
      .map((s, idx) =>
        db.insert(productSpecifications).values({ productId: id, name: s.name.trim(), value: s.value.trim(), sortOrder: idx }),
      ),
  );

  revalidateStore();
  revalidatePath("/admin/products");
  return { ok: true, code: slug };
}

export async function updateProductQuickAction(input: { id: string; brandId: string; stock: number }): Promise<ActionResult> {
  const admin = await getAdminOrThrow();
  if (!admin) return { ok: false, error: "Không có quyền." };
  const stock = Math.max(0, Math.floor(Number(input.stock) || 0));
  await db.update(products).set({ brandId: input.brandId || null, stock, updatedAt: new Date() }).where(eq(products.id, input.id));
  revalidateStore();
  revalidatePath("/admin/products");
  return { ok: true };
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  const admin = await getAdminOrThrow();
  if (!admin) return { ok: false, error: "Không có quyền." };
  await db.delete(products).where(eq(products.id, id));
  revalidateStore();
  revalidatePath("/admin/products");
  return { ok: true };
}

/* ================================ ADMIN: CATEGORIES ================================ */

export type CategoryForm = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  parentId?: string;
  sortOrder?: string;
  active: boolean;
  seoTitle: string;
  seoDescription: string;
};

export async function saveCategoryAction(form: CategoryForm): Promise<ActionResult> {
  const admin = await getAdminOrThrow();
  if (!admin) return { ok: false, error: "Không có quyền." };
  if (!form.name.trim()) return { ok: false, error: "Tên danh mục bắt buộc." };
  const slug = form.slug.trim() ? await uniqueSlug("categories", form.slug.trim(), form.id) : await uniqueSlug("categories", form.name, form.id);
  const data = {
    name: form.name.trim(),
    slug,
    description: form.description.trim() || null,
    image: form.image.trim() || null,
    parentId: form.parentId || null,
    sortOrder: Math.floor(Number(form.sortOrder) || 0),
    active: !!form.active,
    seoTitle: form.seoTitle.trim() || null,
    seoDescription: form.seoDescription.trim() || null,
  };
  if (form.id) {
    if (form.parentId === form.id) return { ok: false, error: "Danh mục không thể là cha của chính nó." };
    await db.update(categories).set(data).where(eq(categories.id, form.id));
  } else {
    await db.insert(categories).values(data);
  }
  revalidateStore();
  revalidatePath("/admin/categories");
  return { ok: true };
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  const admin = await getAdminOrThrow();
  if (!admin) return { ok: false, error: "Không có quyền." };
  await db.update(categories).set({ parentId: null }).where(eq(categories.parentId, id));
  await db.update(products).set({ categoryId: null }).where(eq(products.categoryId, id));
  await db.delete(productCategories).where(eq(productCategories.categoryId, id));
  await db.delete(categories).where(eq(categories.id, id));
  revalidateStore();
  revalidatePath("/admin/categories");
  return { ok: true };
}

/* ================================ ADMIN: BRANDS ================================ */

export type BrandForm = {
  id?: string;
  name: string;
  slug: string;
  logo: string;
  description: string;
  website: string;
  active: boolean;
  seoTitle: string;
  seoDescription: string;
};

export async function saveBrandAction(form: BrandForm): Promise<ActionResult> {
  const admin = await getAdminOrThrow();
  if (!admin) return { ok: false, error: "Không có quyền." };
  if (!form.name.trim()) return { ok: false, error: "Tên thương hiệu bắt buộc." };
  const slug = form.slug.trim() ? await uniqueSlug("brands", form.slug.trim(), form.id) : await uniqueSlug("brands", form.name, form.id);
  const data = {
    name: form.name.trim(),
    slug,
    logo: form.logo.trim() || null,
    description: form.description.trim() || null,
    website: form.website.trim() || null,
    active: !!form.active,
    seoTitle: form.seoTitle.trim() || null,
    seoDescription: form.seoDescription.trim() || null,
  };
  if (form.id) await db.update(brands).set(data).where(eq(brands.id, form.id));
  else await db.insert(brands).values(data);
  revalidateStore();
  revalidatePath("/admin/brands");
  return { ok: true };
}

export async function deleteBrandAction(id: string): Promise<ActionResult> {
  const admin = await getAdminOrThrow();
  if (!admin) return { ok: false, error: "Không có quyền." };
  await db.update(products).set({ brandId: null }).where(eq(products.brandId, id));
  await db.delete(brands).where(eq(brands.id, id));
  revalidateStore();
  revalidatePath("/admin/brands");
  return { ok: true };
}

/* ================================ ADMIN: ORDERS ================================ */

export async function setOrderStatusAction(orderId: string, status: string): Promise<ActionResult> {
  const admin = await getAdminOrThrow();
  if (!admin) return { ok: false, error: "Không có quyền." };
  if (!["pending", "confirmed", "processing", "shipping", "completed", "cancelled"].includes(status)) {
    return { ok: false, error: "Trạng thái không hợp lệ." };
  }
  const rows = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  const order = rows[0];
  if (!order) return { ok: false, error: "Không tìm thấy đơn hàng." };
  await db.update(orders).set({ status, updatedAt: new Date() }).where(eq(orders.id, order.id));
  await notify("order.status_changed", {
    toEmail: order.email ?? undefined,
    subject: `Đơn ${order.orderCode} — ${status}`,
    data: { orderCode: order.orderCode, status },
  });
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${order.id}`);
  revalidatePath("/tai-khoan");
  return { ok: true };
}

/* ================================ ADMIN: ARTICLES ================================ */

export type ArticleForm = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string;
  status: string;
  seoTitle: string;
  seoDescription: string;
};

export async function saveArticleAction(form: ArticleForm): Promise<ActionResult> {
  const admin = await getAdminOrThrow();
  if (!admin) return { ok: false, error: "Không có quyền." };
  if (!form.title.trim()) return { ok: false, error: "Tiêu đề bắt buộc." };
  const slug = form.slug.trim() ? await uniqueSlug("articles", form.slug.trim(), form.id) : await uniqueSlug("articles", form.title, form.id);
  const data = {
    title: form.title.trim(),
    slug,
    excerpt: form.excerpt.trim() || null,
    content: form.content || "",
    coverImage: form.coverImage.trim() || null,
    category: form.category.trim() || "Tổng hợp",
    tags: form.tags.trim() || null,
    status: form.status === "published" ? "published" : "draft",
    seoTitle: form.seoTitle.trim() || null,
    seoDescription: form.seoDescription.trim() || null,
  };
  if (form.id) await db.update(articles).set(data).where(eq(articles.id, form.id));
  else await db.insert(articles).values(data);
  revalidateStore();
  revalidatePath("/admin/articles");
  return { ok: true };
}

export async function deleteArticleAction(id: string): Promise<ActionResult> {
  const admin = await getAdminOrThrow();
  if (!admin) return { ok: false, error: "Không có quyền." };
  await db.delete(articles).where(eq(articles.id, id));
  revalidateStore();
  revalidatePath("/admin/articles");
  return { ok: true };
}

/* ================================ ADMIN: BANNERS & PROMOTIONS ================================ */

export type BannerForm = {
  id?: string;
  title: string;
  subtitle: string;
  image: string;
  mobileImage: string;
  buttonText: string;
  buttonUrl: string;
  active: boolean;
  sortOrder?: string;
  startDate?: string;
  endDate?: string;
};

export async function saveBannerAction(form: BannerForm): Promise<ActionResult> {
  const admin = await getAdminOrThrow();
  if (!admin) return { ok: false, error: "Không có quyền." };
  if (!form.title.trim()) return { ok: false, error: "Tiêu đề bắt buộc." };
  const data = {
    title: form.title.trim(),
    subtitle: form.subtitle.trim() || null,
    image: form.image.trim() || null,
    mobileImage: form.mobileImage.trim() || null,
    buttonText: form.buttonText.trim() || null,
    buttonUrl: form.buttonUrl.trim() || null,
    active: !!form.active,
    sortOrder: Math.floor(Number(form.sortOrder) || 0),
    startDate: form.startDate || null,
    endDate: form.endDate || null,
  };
  if (form.id) await db.update(banners).set(data).where(eq(banners.id, form.id));
  else await db.insert(banners).values(data);
  revalidateStore();
  revalidatePath("/admin/banners");
  return { ok: true };
}

export async function saveBannerBatchAction(input: { images: { url: string; name?: string }[]; titlePrefix?: string; startSortOrder?: number }): Promise<ActionResult> {
  const admin = await getAdminOrThrow();
  if (!admin) return { ok: false, error: "Không có quyền." };
  const images = input.images.filter((item) => /^https?:\/\//.test(item.url));
  if (!images.length) return { ok: false, error: "Chưa có ảnh banner hợp lệ." };
  const titlePrefix = input.titlePrefix?.trim() || "Banner trang chủ";
  const startSortOrder = Math.max(0, Math.floor(Number(input.startSortOrder) || 0));
  await db.insert(banners).values(images.map((item, index) => ({
    title: item.name?.trim() || `${titlePrefix} ${String(index + 1).padStart(2, "0")}`,
    image: item.url,
    mobileImage: null,
    subtitle: null,
    buttonText: null,
    buttonUrl: null,
    active: true,
    sortOrder: startSortOrder + index,
    startDate: null,
    endDate: null,
  })));
  revalidateStore();
  revalidatePath("/admin/banners");
  return { ok: true, code: String(images.length) };
}

export async function deleteBannerAction(id: string): Promise<ActionResult> {
  const admin = await getAdminOrThrow();
  if (!admin) return { ok: false, error: "Không có quyền." };
  await db.delete(banners).where(eq(banners.id, id));
  revalidateStore();
  revalidatePath("/admin/banners");
  return { ok: true };
}

export type PromotionForm = {
  id?: string;
  title: string;
  description: string;
  badge: string;
  image: string;
  url: string;
  active: boolean;
  sortOrder?: string;
  startDate?: string;
  endDate?: string;
};

export async function savePromotionAction(form: PromotionForm): Promise<ActionResult> {
  const admin = await getAdminOrThrow();
  if (!admin) return { ok: false, error: "Không có quyền." };
  if (!form.title.trim()) return { ok: false, error: "Tên khuyến mãi bắt buộc." };
  const data = {
    title: form.title.trim(),
    description: form.description.trim() || null,
    badge: form.badge.trim() || null,
    image: form.image.trim() || null,
    url: form.url.trim() || null,
    active: !!form.active,
    sortOrder: Math.floor(Number(form.sortOrder) || 0),
    startDate: form.startDate || null,
    endDate: form.endDate || null,
  };
  if (form.id) await db.update(promotions).set(data).where(eq(promotions.id, form.id));
  else await db.insert(promotions).values(data);
  revalidatePath("/");
  revalidatePath("/khuyen-mai");
  revalidatePath("/admin/promotions");
  return { ok: true };
}

export async function deletePromotionAction(id: string): Promise<ActionResult> {
  const admin = await getAdminOrThrow();
  if (!admin) return { ok: false, error: "Không có quyền." };
  await db.delete(promotions).where(eq(promotions.id, id));
  revalidatePath("/");
  revalidatePath("/admin/promotions");
  return { ok: true };
}

/* ================================ ADMIN: REVIEWS ================================ */

export async function setReviewStatusAction(id: string, status: string): Promise<ActionResult> {
  const admin = await getAdminOrThrow();
  if (!admin) return { ok: false, error: "Không có quyền." };
  if (!["pending", "approved", "hidden", "featured"].includes(status)) return { ok: false, error: "Trạng thái không hợp lệ." };
  const rows = await db.select().from(reviews).where(eq(reviews.id, id)).limit(1);
  const rev = rows[0];
  if (!rev) return { ok: false, error: "Không tìm thấy đánh giá." };
  await db.update(reviews).set({ status }).where(eq(reviews.id, id));
  if (status === "approved" || status === "featured" || status === "hidden") await recomputeRating(rev.productId);
  revalidateStore();
  revalidatePath("/admin/reviews");
  return { ok: true };
}

export async function deleteReviewAction(id: string): Promise<ActionResult> {
  const admin = await getAdminOrThrow();
  if (!admin) return { ok: false, error: "Không có quyền." };
  const rows = await db.select().from(reviews).where(eq(reviews.id, id)).limit(1);
  if (rows[0]) {
    await db.delete(reviews).where(eq(reviews.id, id));
    await recomputeRating(rows[0].productId);
  }
  revalidateStore();
  revalidatePath("/admin/reviews");
  return { ok: true };
}

/* ================================ ADMIN: SETTINGS & MEDIA ================================ */

export async function saveSettingsAction(settings: Record<string, string>): Promise<ActionResult> {
  const admin = await getAdminOrThrow();
  if (!admin) return { ok: false, error: "Không có quyền." };
  for (const [k, v] of Object.entries(settings)) {
    const cleanKey = k.trim().toLowerCase().replace(/\s+/g, "_");
    if (!cleanKey || cleanKey.length > 60) continue;
    await db.insert(adminSettings).values({ key: cleanKey, value: v ?? "", updatedAt: new Date() }).onConflictDoUpdate({
      target: adminSettings.key,
      set: { value: v ?? "", updatedAt: new Date() },
    });
  }
  revalidatePath("/");
  revalidatePath("/admin/settings");
  return { ok: true };
}

export async function saveCompanyProfileAction(profile: CompanyProfile): Promise<ActionResult> {
  const admin = await getAdminOrThrow();
  if (!admin) return { ok: false, error: "Không có quyền." };
  if (!profile.heroTitle.trim() || !profile.introTitle.trim()) return { ok: false, error: "Tiêu đề chính và giới thiệu không được để trống." };
  const cleanList = (items: CompanyProfile["solutions"]) => items.slice(0, 8).map((item) => ({ title: item.title.trim().slice(0, 120), description: item.description.trim().slice(0, 600), image: item.image?.trim().slice(0, 600) || "" })).filter((item) => item.title);
  const certificates = profile.certificates.slice(0, 30).map((item) => ({ title: item.title.trim().slice(0, 120), description: item.description.trim().slice(0, 400), image: item.image.trim().slice(0, 600) })).filter((item) => item.title && item.image);
  const imageList = (items: string[], max: number) => items.slice(0, max).map((item) => item.trim().slice(0, 600)).filter(Boolean);
  const projects = profile.projects.slice(0, 20).map((item) => ({ category: item.category.trim().slice(0, 100), title: item.title.trim().slice(0, 160), description: item.description.trim().slice(0, 700), images: imageList(item.images, 8) })).filter((item) => item.title && item.images.length);
  const clean: CompanyProfile = {
    ...profile,
    heroEyebrow: profile.heroEyebrow.trim().slice(0, 140), heroTitle: profile.heroTitle.trim().slice(0, 220),
    heroDescription: profile.heroDescription.trim().slice(0, 1200), heroImage: profile.heroImage.trim().slice(0, 600),
    introTitle: profile.introTitle.trim().slice(0, 180), introDescription: profile.introDescription.trim().slice(0, 1600), introImage: profile.introImage.trim().slice(0, 600),
    directorImage: profile.directorImage.trim().slice(0, 600), teamImage: profile.teamImage.trim().slice(0, 600), officeImage: profile.officeImage.trim().slice(0, 600), logisticsImage: profile.logisticsImage.trim().slice(0, 600), closingImage: profile.closingImage.trim().slice(0, 600),
    solutionsTitle: profile.solutionsTitle.trim().slice(0, 180), solutionsDescription: profile.solutionsDescription.trim().slice(0, 1000),
    solutions: cleanList(profile.solutions), solutionImages: imageList(profile.solutionImages, 8), projects, certificates, processTitle: profile.processTitle.trim().slice(0, 180), process: cleanList(profile.process), processImages: imageList(profile.processImages, 8),
    closingTitle: profile.closingTitle.trim().slice(0, 180), closingDescription: profile.closingDescription.trim().slice(0, 1000),
  };
  const value = JSON.stringify(clean);
  if (value.length > 50000) return { ok: false, error: "Nội dung quá dài." };
  await db.insert(adminSettings).values({ key: "company_profile", value, updatedAt: new Date() }).onConflictDoUpdate({ target: adminSettings.key, set: { value, updatedAt: new Date() } });
  revalidateTag("company-profile", "max");
  revalidatePath("/ho-so-nang-luc");
  revalidatePath("/admin/company-profile");
  return { ok: true };
}

export async function deleteMediaAssetAction(id: string): Promise<ActionResult> {
  const admin = await getAdminOrThrow();
  if (!admin) return { ok: false, error: "Không có quyền." };
  await db.delete(mediaAssets).where(eq(mediaAssets.id, id));
  revalidatePath("/admin/media");
  return { ok: true };
}
