import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { articles, banners, brands, categories, mediaAssets, promotions } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { getAdminProducts, getCustomers, getMediaAssets, getOrders, getSettings } from "@/lib/data";
import { AdminShell } from "@/components/admin/shell";
import {
  ArticlesSection, BannersSection, BrandsSection, CategoriesSection, CustomersSection,
  MediaSection, OrdersSection, ProductsSection, PromotionsSection,
  ReviewsSection, SettingsForm,
} from "@/components/admin/sections";
import { Icon } from "@/components/ui";
import { getReviewsAll } from "./queries";

export const dynamic = "force-dynamic";

const TITLES: Record<string, string> = {
  products: "Sản phẩm",
  categories: "Danh mục",
  brands: "Thương hiệu",
  orders: "Đơn hàng",
  customers: "Khách hàng",
  articles: "Bài viết",
  promotions: "Khuyến mãi",
  banners: "Banner",
  reviews: "Đánh giá",
  media: "Media",
  settings: "Cài đặt",
};

function AddButton({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="btn-primary h-9">
      <Icon name="plus" className="h-4 w-4" />
      {label}
    </Link>
  );
}

export default async function AdminSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  await requireAdmin();
  const title = TITLES[section];
  if (!title) notFound();

  if (section === "products") {
    const [rows, allBrands] = await Promise.all([
      getAdminProducts(),
      db.select({ id: brands.id, name: brands.name }).from(brands).where(eq(brands.active, true)).orderBy(asc(brands.name)),
    ]);
    return (
      <AdminShell title={title} action={<AddButton href="/admin/products/new" label="Thêm sản phẩm" />}>
        <ProductsSection
          brands={allBrands}
          rows={rows.map((r) => ({
            id: r.id, name: r.name, slug: r.slug, sku: r.sku, price: r.price, salePrice: r.salePrice,
            priceType: r.priceType, stock: r.stock, status: r.status, brandId: r.brandId, brandName: r.brandName || "",
            categoryName: r.categoryName || "", featured: r.featured, bestseller: r.bestseller, sale: r.sale,
            createdAt: r.createdAt,
          }))}
        />
      </AdminShell>
    );
  }

  if (section === "categories") {
    const rows = await db.select().from(categories).orderBy(asc(categories.sortOrder), asc(categories.name));
    return (
      <AdminShell title={title} action={<AddButton href="/admin/categories/new" label="Thêm danh mục" />}>
        <CategoriesSection
          rows={rows.map((c) => ({
            id: c.id, name: c.name, slug: c.slug, parentId: c.parentId, active: c.active,
            sortOrder: c.sortOrder, description: c.description,
          }))}
        />
      </AdminShell>
    );
  }

  if (section === "brands") {
    const rows = await db.select().from(brands).orderBy(asc(brands.name));
    return (
      <AdminShell title={title} action={<AddButton href="/admin/brands/new" label="Thêm thương hiệu" />}>
        <BrandsSection
          rows={rows.map((b) => ({ id: b.id, name: b.name, slug: b.slug, active: b.active, website: b.website }))}
        />
      </AdminShell>
    );
  }

  if (section === "orders") {
    const { items } = await getOrders({ limit: 200 });
    return (
      <AdminShell title={title}>
        <OrdersSection
          rows={items.map((o) => ({
            id: o.id, orderCode: o.orderCode, customerName: o.customerName, phone: o.phone,
            total: o.total, status: o.status, paymentMethod: o.paymentMethod, createdAt: o.createdAt,
          }))}
        />
      </AdminShell>
    );
  }

  if (section === "customers") {
    const rows = await getCustomers();
    return (
      <AdminShell title={title}>
        <CustomersSection rows={rows.map((c) => ({ id: c.id, name: c.name, email: c.email, phone: c.phone, createdAt: c.createdAt }))} />
      </AdminShell>
    );
  }

  if (section === "articles") {
    const rows = await db.select().from(articles).orderBy(desc(articles.publishedAt)).limit(200);
    return (
      <AdminShell title={title} action={<AddButton href="/admin/articles/new" label="Viết bài" />}>
        <ArticlesSection
          rows={rows.map((a) => ({ id: a.id, title: a.title, slug: a.slug, category: a.category, status: a.status, publishedAt: a.publishedAt }))}
        />
      </AdminShell>
    );
  }

  if (section === "banners") {
    const rows = await db.select().from(banners).orderBy(asc(banners.sortOrder));
    return (
      <AdminShell title={title} action={<AddButton href="/admin/banners/new" label="Thêm banner" />}>
        <BannersSection
          rows={rows.map((b) => ({ id: b.id, title: b.title, active: b.active, sortOrder: b.sortOrder, buttonUrl: b.buttonUrl, image: b.image }))}
        />
      </AdminShell>
    );
  }

  if (section === "promotions") {
    const rows = await db.select().from(promotions).orderBy(asc(promotions.sortOrder));
    return (
      <AdminShell title={title} action={<AddButton href="/admin/promotions/new" label="Thêm khuyến mãi" />}>
        <PromotionsSection
          rows={rows.map((p) => ({ id: p.id, title: p.title, badge: p.badge, active: p.active, startDate: p.startDate, endDate: p.endDate }))}
        />
      </AdminShell>
    );
  }

  if (section === "reviews") {
    const rows = await getReviewsAll();
    return (
      <AdminShell title={title}>
        <ReviewsSection rows={rows} />
      </AdminShell>
    );
  }

  if (section === "media") {
    const rows = await getMediaAssets();
    return (
      <AdminShell title={title}>
        <MediaSection rows={rows.map((m) => ({ id: m.id, url: m.url, filename: m.filename, createdAt: m.createdAt }))} />
      </AdminShell>
    );
  }

  if (section === "settings") {
    const settings = await getSettings();
    return (
      <AdminShell title={title}>
        <SettingsForm initial={settings} />
      </AdminShell>
    );
  }

  notFound();
}
