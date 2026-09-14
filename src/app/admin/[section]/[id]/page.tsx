import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  articles,
  banners,
  brands,
  categories,
  productCategories,
  productImages,
  productSpecifications,
  products,
  promotions,
  pages,
} from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { getOrders } from "@/lib/data";
import { getOrderWithItems } from "@/lib/data";
import { AdminShell } from "@/components/admin/shell";
import {
  ArticleForm,
  BannerForm,
  BrandForm,
  CategoryForm,
  OrderDetail,
  PageForm,
  ProductForm,
  PromotionForm,
  type OrderLite,
} from "@/components/admin/sections";

export const dynamic = "force-dynamic";

function toBasePriceInput(value: number | null): string {
  if (value == null) return "";
  return String(Math.round(value / 1.2));
}

export default async function AdminEntityPage({ params }: { params: Promise<{ section: string; id: string }> }) {
  const { section, id } = await params;
  await requireAdmin();

  if (section === "orders") {
    const data = await getOrderWithItems(id);
    if (!data) notFound();
    const o = data.order;
    return (
      <AdminShell title={`Đơn hàng ${o.orderCode}`}>
        <OrderDetail
          order={{
            id: o.id, orderCode: o.orderCode, customerName: o.customerName, phone: o.phone, email: o.email,
            address: o.address, province: o.province, district: o.district, ward: o.ward, note: o.note,
            paymentMethod: o.paymentMethod, status: o.status, subtotal: o.subtotal, shippingFee: o.shippingFee,
            discount: o.discount, total: o.total, createdAt: o.createdAt, updatedAt: o.updatedAt,
          }}
          items={data.items.map((it) => ({
            id: it.id, productName: it.productName, sku: it.sku, productImage: it.productImage,
            unitPrice: it.unitPrice, quantity: it.quantity, subtotal: it.subtotal,
          }))}
        />
      </AdminShell>
    );
  }

  /* ---------------- product form ---------------- */
  if (section === "products") {
    const [allBrands, allCats] = await Promise.all([
      db.select({ id: brands.id, name: brands.name }).from(brands).orderBy(asc(brands.name)),
      db.select({ id: categories.id, name: categories.name }).from(categories).orderBy(asc(categories.sortOrder), asc(categories.name)),
    ]);
    let initial;
    if (id !== "new") {
      const rows = await db.select().from(products).where(eq(products.id, id)).limit(1);
      const p = rows[0];
      if (!p) notFound();
      const [imgs, specs, extraCats] = await Promise.all([
        db.select().from(productImages).where(eq(productImages.productId, p.id)).orderBy(asc(productImages.sortOrder)),
        db.select().from(productSpecifications).where(eq(productSpecifications.productId, p.id)).orderBy(asc(productSpecifications.sortOrder)),
        db.select({ categoryId: productCategories.categoryId }).from(productCategories).where(eq(productCategories.productId, p.id)),
      ]);
      initial = {
        id: p.id,
        name: p.name,
        slug: p.slug,
        sku: p.sku ?? "",
        shortDescription: p.shortDescription ?? "",
        description: p.description ?? "",
        priceType: (p.priceType === "fixed" ? "fixed" : "contact") as "fixed" | "contact",
        price: toBasePriceInput(p.price),
        salePrice: toBasePriceInput(p.salePrice),
        stock: String(p.stock),
        brandId: p.brandId ?? "",
        categoryId: p.categoryId ?? "",
        categoryIds: extraCats.map((c) => c.categoryId),
        status: p.status,
        featured: p.featured,
        bestseller: p.bestseller,
        sale: p.sale,
        warranty: p.warranty ?? "",
        seoTitle: p.seoTitle ?? "",
        seoDescription: p.seoDescription ?? "",
        images: imgs.length ? imgs.map((i) => ({ url: i.url, isMain: i.isMain })) : [{ url: "", isMain: true }],
        specs: specs.length ? specs.map((s) => ({ name: s.name, value: s.value })) : [{ name: "", value: "" }],
      };
    } else {
      initial = {
        name: "", slug: "", sku: "", shortDescription: "", description: "", priceType: "contact" as const,
        price: "", salePrice: "", stock: "0", brandId: "", categoryId: "", categoryIds: [] as string[],
        status: "draft", featured: false, bestseller: false, sale: false, warranty: "", seoTitle: "",
        seoDescription: "", images: [{ url: "", isMain: true }], specs: [{ name: "", value: "" }],
      };
    }
    return (
      <AdminShell title={id === "new" ? "Thêm sản phẩm" : "Chỉnh sửa sản phẩm"}>
        <ProductForm initial={initial} brands={allBrands} categories={allCats} />
      </AdminShell>
    );
  }

  /* ---------------- categories ---------------- */
  if (section === "categories") {
    const all = await db.select().from(categories);
    let initial;
    if (id !== "new") {
      const rows = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
      const c = rows[0];
      if (!c) notFound();
      initial = {
        id: c.id, name: c.name, slug: c.slug, description: c.description ?? "", image: c.image ?? "",
        parentId: c.parentId ?? "", sortOrder: String(c.sortOrder), active: c.active,
        seoTitle: c.seoTitle ?? "", seoDescription: c.seoDescription ?? "",
      };
    } else {
      initial = { name: "", slug: "", description: "", image: "", parentId: "", sortOrder: "0", active: true, seoTitle: "", seoDescription: "" };
    }
    return (
      <AdminShell title={id === "new" ? "Thêm danh mục" : "Chỉnh sửa danh mục"}>
        <CategoryForm initial={initial} parents={all.filter((c) => c.id !== id).map((c) => ({ id: c.id, name: c.name }))} />
      </AdminShell>
    );
  }

  /* ---------------- brands ---------------- */
  if (section === "brands") {
    let initial;
    if (id !== "new") {
      const rows = await db.select().from(brands).where(eq(brands.id, id)).limit(1);
      const b = rows[0];
      if (!b) notFound();
      initial = {
        id: b.id, name: b.name, slug: b.slug, logo: b.logo ?? "", description: b.description ?? "",
        website: b.website ?? "", active: b.active, seoTitle: b.seoTitle ?? "", seoDescription: b.seoDescription ?? "",
      };
    } else {
      initial = { name: "", slug: "", logo: "", description: "", website: "", active: true, seoTitle: "", seoDescription: "" };
    }
    return (
      <AdminShell title={id === "new" ? "Thêm thương hiệu" : "Chỉnh sửa thương hiệu"}>
        <BrandForm initial={initial} />
      </AdminShell>
    );
  }

  /* ---------------- articles ---------------- */
  if (section === "articles") {
    let initial;
    if (id !== "new") {
      const rows = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
      const a = rows[0];
      if (!a) notFound();
      initial = {
        id: a.id, title: a.title, slug: a.slug, excerpt: a.excerpt ?? "", content: a.content ?? "",
        coverImage: a.coverImage ?? "", category: a.category ?? "", tags: a.tags ?? "", status: a.status,
        seoTitle: a.seoTitle ?? "", seoDescription: a.seoDescription ?? "",
      };
    } else {
      initial = { title: "", slug: "", excerpt: "", content: "", coverImage: "", category: "", tags: "", status: "draft", seoTitle: "", seoDescription: "" };
    }
    return (
      <AdminShell title={id === "new" ? "Viết bài mới" : "Chỉnh sửa bài viết"}>
        <ArticleForm initial={initial} />
      </AdminShell>
    );
  }

  /* ---------------- banners ---------------- */
  if (section === "banners") {
    let initial;
    if (id !== "new") {
      const rows = await db.select().from(banners).where(eq(banners.id, id)).limit(1);
      const b = rows[0];
      if (!b) notFound();
      initial = {
        id: b.id, title: b.title, subtitle: b.subtitle ?? "", image: b.image ?? "", mobileImage: b.mobileImage ?? "",
        buttonText: b.buttonText ?? "", buttonUrl: b.buttonUrl ?? "", active: b.active,
        sortOrder: String(b.sortOrder), startDate: b.startDate ?? "", endDate: b.endDate ?? "",
      };
    } else {
      initial = { title: "", subtitle: "", image: "", mobileImage: "", buttonText: "", buttonUrl: "", active: true, sortOrder: "0", startDate: "", endDate: "" };
    }
    return (
      <AdminShell title={id === "new" ? "Thêm banner" : "Chỉnh sửa banner"}>
        <BannerForm initial={initial} />
      </AdminShell>
    );
  }

  /* ---------------- promotions ---------------- */
  if (section === "promotions") {
    let initial;
    if (id !== "new") {
      const rows = await db.select().from(promotions).where(eq(promotions.id, id)).limit(1);
      const p = rows[0];
      if (!p) notFound();
      initial = {
        id: p.id, title: p.title, description: p.description ?? "", badge: p.badge ?? "", image: p.image ?? "",
        url: p.url ?? "", active: p.active, sortOrder: String(p.sortOrder), startDate: p.startDate ?? "", endDate: p.endDate ?? "",
      };
    } else {
      initial = { title: "", description: "", badge: "", image: "", url: "", active: true, sortOrder: "0", startDate: "", endDate: "" };
    }
    return (
      <AdminShell title={id === "new" ? "Thêm khuyến mãi" : "Chỉnh sửa khuyến mãi"}>
        <PromotionForm initial={initial} />
      </AdminShell>
    );
  }

  /* ---------------- pages ---------------- */
  if (section === "pages") {
    let initial;
    if (id !== "new") {
      const rows = await db.select().from(pages).where(eq(pages.id, id)).limit(1);
      const p = rows[0];
      if (!p) notFound();
      initial = { id: p.id, title: p.title, slug: p.slug, content: p.content ?? "", seoTitle: p.seoTitle ?? "", seoDescription: p.seoDescription ?? "" };
    } else {
      initial = { title: "", slug: "", content: "", seoTitle: "", seoDescription: "" };
    }
    return (
      <AdminShell title={id === "new" ? "Thêm trang" : "Chỉnh sửa trang"}>
        <PageForm initial={initial} />
      </AdminShell>
    );
  }

  notFound();
}
