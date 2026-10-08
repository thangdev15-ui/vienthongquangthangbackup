import type {
  products,
  brands,
  categories,
  productImages,
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
} from "@/db/schema";

export type Product = typeof products.$inferSelect;
export type Brand = typeof brands.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type ProductImage = typeof productImages.$inferSelect;
export type ProductSpec = typeof productSpecifications.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Article = typeof articles.$inferSelect;
export type Banner = typeof banners.$inferSelect;
export type Promotion = typeof promotions.$inferSelect;
export type Page = typeof pages.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type Address = typeof addresses.$inferSelect;

export type ProductRow = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  shortDescription: string | null;
  price: number | null;
  salePrice: number | null;
  priceType: string;
  stock: number;
  status: string;
  featured: boolean;
  bestseller: boolean;
  sale: boolean;
  rating: number;
  reviewCount: number;
  warranty: string | null;
  brandId: string | null;
  categoryId: string | null;
  brandName: string | null;
  categoryName: string | null;
  image: string | null;
  createdAt: Date;
};

/* ----------------------------- Business constants ----------------------------- */
// Nguồn: website hiện tại vienthongquangthang.com — chỉnh sửa trong Admin → Cài đặt
export const BUSINESS = {
  name: "Viễn Thông Quang Thắng",
  phone: "094.710.6161",
  salesPhones: "094.710.6161",
  phoneHref: "tel:0947106161",
  csKh: "094.710.6161",
  zalo: "https://zalo.me/0947106161",
  zaloLabel: "Zalo 094.710.6161 — Quang Thắng",
  email: "vienthongquangthang@gmail.com",
  address: "435/26 Thống Nhất, P. Thông Tây Hội, TP. Hồ Chí Minh",
  hours: "08:00 - 17:00 (Thứ 2 - Thứ 7)",
  mst: "0315327471",
  facebook: "https://www.facebook.com/vienthongquangthang",
  mapEmbed:
    "https://www.google.com/maps?q=435%2F26%20Thong%20Nhat%2C%20Thuong%20Tay%20Hoi%2C%20Go%20Vap%2C%20Ho%20Chi%20Minh&output=embed",
};

export const BASE_URL =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_SITE_URL) ||
  "https://vienthongquangthang.com";

export type Price = number | null;

export function formatVND(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "Liên hệ";
  return value.toLocaleString("vi-VN") + " ₫";
}

export function discountPercent(price: number | null, salePrice: number | null): number | null {
  if (price && salePrice && salePrice < price) {
    return Math.round(((price - salePrice) / price) * 100);
  }
  return null;
}

export const ORDER_STATUS: Record<string, { label: string; tone: string }> = {
  pending: { label: "Chờ xác nhận", tone: "amber" },
  confirmed: { label: "Đã xác nhận", tone: "blue" },
  processing: { label: "Đang xử lý", tone: "indigo" },
  shipping: { label: "Đang giao hàng", tone: "violet" },
  completed: { label: "Hoàn thành", tone: "green" },
  cancelled: { label: "Đã huỷ", tone: "red" },
};

export const ORDER_STATUS_FLOW = ["pending", "confirmed", "processing", "shipping", "completed"];

export const PAYMENT_METHODS: Record<string, string> = {
  cod: "Thanh toán khi nhận hàng",
  bank: "Chuyển khoản ngân hàng",
  contact: "Liên hệ xác nhận",
};

export function formatDate(d: Date | string): string {
  const dt = typeof d === "string" ? new Date(d) : d;
  return dt.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateShort(d: Date | string): string {
  const dt = typeof d === "string" ? new Date(d) : d;
  return dt.toLocaleDateString("vi-VN");
}

/* ----------------------------- Vietnam provinces ----------------------------- */
export const PROVINCES = [
  "TP. Hồ Chí Minh","TP. Hà Nội","An Giang","Bình Dương","Bình Định","Bình Phước","Bình Thuận","Cà Mau","Cần Thơ","Cao Bằng","Đà Lạt","Đà Nẵng","Đắc Lắk","Đắc Nông","Điện Biên","Đồng Nai","Đồng Tháp","Gia Lai","Hà Giang","Hà Nam","Hà Tĩnh","Hải Dương","Hải Phòng","Hậu Giang","Hoa Lư","Hòa Bình","Huế","Hưng Yên","Khánh Hòa","Kiên Giang","Kon Tum","Lai Châu","Lâm Đồng","Lạng Sơn","Long An","Nam Định","Nghệ An","Ninh Bình","Ninh Thuận","Phú Thọ","Phú Yên","Quảng Bình","Quảng Nam","Quảng Ngãi","Quảng Ninh","Quảng Trị","Sơn La","Tây Ninh","Thái Bình","Thái Nguyên","Thanh Hóa","Tiền Giang","Trà Vinh","Tuyên Quang","Vĩnh Long","Vĩnh Phúc","Yên Bái",
];

export type NavCategoryTree = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  children: NavCategoryTree[];
};

export function buildCategoryTree(cats: { id: string; name: string; slug: string; image: string | null; parentId: string | null }[]): NavCategoryTree[] {
  const map = new Map<string, NavCategoryTree>();
  cats.forEach((c) => map.set(c.id, { id: c.id, name: c.name, slug: c.slug, image: c.image, children: [] }));
  const tops: NavCategoryTree[] = [];
  cats.forEach((c) => {
    const node = map.get(c.id)!;
    if (c.parentId && map.has(c.parentId)) map.get(c.parentId)!.children.push(node);
    else tops.push(node);
  });
  return tops;
}

export function slugify(input: string): string {
  const s = input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s || "sp";
}

export type ActionResult = { ok: boolean; error?: string; code?: string; redirect?: string };
