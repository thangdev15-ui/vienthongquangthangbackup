"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon, Price, Spinner, StatusBadge, type IconName } from "@/components/ui";
import {
  deleteBrandAction, deleteArticleAction, deleteBannerAction, deleteCategoryAction,
  saveBannerBatchAction,
  deleteProductAction, deletePromotionAction, deleteReviewAction, saveArticleAction, saveBannerAction,
  saveBrandAction, saveCategoryAction, saveProductAction, savePromotionAction,
  updateProductQuickAction,
  saveSettingsAction, setOrderStatusAction, setReviewStatusAction, registerMediaAsset,
  type ArticleForm, type BannerForm, type BrandForm, type CategoryForm, type ProductForm, type PromotionForm,
} from "@/lib/actions";
import { AdminTable, ConfirmButton, Field, SaveBar, type Column } from "@/components/admin/shell";
import { useShop } from "@/components/store/shops";
import { formatDate, formatVND, ORDER_STATUS, ORDER_STATUS_FLOW, PAYMENT_METHODS, type ActionResult } from "@/lib/types";

/* --------------------------------- helpers --------------------------------- */

function useSave() {
  const router = useRouter();
  const { toast } = useShop();
  const [saving, setSaving] = useState(false);
  async function run(fn: () => Promise<ActionResult>, backHref: string, successMsg = "Đã lưu.") {
    setSaving(true);
    const res = await fn();
    setSaving(false);
    if (res.ok) {
      toast(successMsg);
      router.push(backHref);
      router.refresh();
    } else {
      toast(res.error ?? "Có lỗi xảy ra.", "error");
    }
  }
  return { saving, run };
}

function ImageInput({ value, onChange, label = "Ảnh" }: { value: string; onChange: (v: string) => void; label?: string }) {
  const [up, setUp] = useState(false);
  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn tệp hình ảnh.");
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Ảnh tối đa 5MB. File trên khoảng 4.5MB có thể bị Vercel từ chối.");
      e.target.value = "";
      return;
    }
    setUp(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const raw = await res.text();
      let json: { url?: string; error?: string } = {};
      try { json = JSON.parse(raw); } catch { /* Vercel may return a plain error page. */ }
      if (!res.ok) throw new Error(json.error || ("Upload thất bại (" + res.status + ")"));
      if (json.url) onChange(json.url);
      else throw new Error(json.error || "Upload thất bại");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Upload thất bại");
    }
    setUp(false);
  }
  return (
    <div>
      <div className="flex gap-2">
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://… hoặc /uploads/…" className="input flex-1" aria-label={label} />
        <label className="btn-outline h-10 shrink-0 cursor-pointer px-3">
          {up ? <Spinner /> : <Icon name="upload" className="h-4 w-4" />}
          Upload
          <input type="file" accept="image/*" className="hidden" onChange={upload} />
        </label>
      </div>
      {value && (
        <div className="relative mt-2 h-24 w-24 overflow-hidden rounded-md border border-line bg-ink-50">
          <img src={value} alt="" className="h-full w-full object-contain p-1" />
        </div>
      )}
    </div>
  );
}

function RichTextEditor({ value, onChange, minHeight = 220 }: { value: string; onChange: (v: string) => void; minHeight?: number }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) editorRef.current.innerHTML = value || "";
  }, [value]);

  function command(name: string, arg?: string) {
    editorRef.current?.focus();
    document.execCommand(name, false, arg);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }

  function selectedImage() {
    const selection = window.getSelection();
    const node = selection?.anchorNode;
    const element = node instanceof HTMLElement ? node : node?.parentElement;
    return element?.closest("img") as HTMLImageElement | null;
  }

  function insertImage(src: string) {
    editorRef.current?.focus();
    document.execCommand("insertHTML", false, `<img src="${src.replace(/"/g, "&quot;")}" alt="" style="display:block;max-width:100%;height:auto;margin:16px 0;" />`);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }

  async function uploadImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      alert("Ảnh phải đúng định dạng và tối đa 5MB. File trên khoảng 4.5MB có thể bị Vercel từ chối.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/upload", { method: "POST", body: formData });
    const result = await response.json();
    if (result.url) insertImage(result.url);
    else alert(result.error ?? "Upload ảnh thất bại");
  }

  function setImageStyle(property: "width" | "align", value: string) {
    const image = selectedImage();
    if (!image) return;
    if (property === "width") image.style.width = value;
    else image.style.margin = value === "center" ? "16px auto" : value === "right" ? "16px 0 16px auto" : "16px 0";
    image.style.display = "block";
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }

  return (
    <div className="overflow-hidden rounded-md border border-line bg-white">
      <div className="flex flex-wrap items-center gap-1 border-b border-line bg-ink-50 p-1.5">
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => command("bold")} className="btn-outline h-8 w-8 px-0 text-sm font-bold" title="In đậm">B</button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => command("italic")} className="btn-outline h-8 w-8 px-0 text-sm italic" title="In nghiêng">I</button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => command("formatBlock", "<h2>")} className="btn-outline h-8 px-2 text-xs font-bold" title="Tiêu đề lớn">H2</button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => command("formatBlock", "<h3>")} className="btn-outline h-8 px-2 text-xs font-bold" title="Tiêu đề nhỏ">H3</button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => command("insertUnorderedList")} className="btn-outline h-8 px-2 text-xs" title="Danh sách">Danh sách</button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => command("formatBlock", "<blockquote>")} className="btn-outline h-8 px-2 text-xs" title="Trích dẫn">Trích dẫn</button>
        <button type="button" onClick={() => { const src = window.prompt("URL hình ảnh"); if (src?.trim()) insertImage(src.trim()); }} className="btn-outline inline-flex h-8 items-center gap-1 px-2 text-xs" title="Chèn ảnh"><Icon name="image" className="h-3.5 w-3.5" />Ảnh</button>
        <button type="button" onClick={() => uploadRef.current?.click()} className="btn-outline inline-flex h-8 items-center gap-1 px-2 text-xs" title="Tải ảnh lên"><Icon name="upload" className="h-3.5 w-3.5" />Upload</button>
        <input ref={uploadRef} type="file" accept="image/*" onChange={uploadImage} className="hidden" />
        <select defaultValue="" onChange={(e) => { if (e.target.value) setImageStyle("width", e.target.value); e.target.value = ""; }} className="input h-8 w-auto min-w-28 px-2 text-xs" aria-label="Kích thước ảnh">
          <option value="">Kích thước ảnh</option><option value="100%">Rộng 100%</option><option value="75%">Rộng 75%</option><option value="50%">Rộng 50%</option><option value="25%">Rộng 25%</option>
        </select>
        <select defaultValue="" onChange={(e) => { if (e.target.value) setImageStyle("align", e.target.value); e.target.value = ""; }} className="input h-8 w-auto min-w-28 px-2 text-xs" aria-label="Căn ảnh">
          <option value="">Căn ảnh</option><option value="left">Căn trái</option><option value="center">Căn giữa</option><option value="right">Căn phải</option>
        </select>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => command("removeFormat")} className="btn-outline h-8 px-2 text-xs" title="Xoá định dạng">Bỏ định dạng</button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        className="rich-editor p-3 text-sm leading-6 text-ink-800 outline-none"
        style={{ minHeight }}
      />
    </div>
  );
}

function StatCard({ icon, label, value, tone = "brand" }: { icon: IconName; label: string; value: string | number; tone?: string }) {
  const tones: Record<string, string> = {
    brand: "bg-brand-50 text-brand-700",
    green: "bg-success-50 text-success-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-sale-50 text-sale-600",
    ink: "bg-ink-50 text-ink-600",
  };
  return (
    <div className="card flex items-center gap-3.5 p-4">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md ${tones[tone]}`}>
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[12px] font-medium text-ink-500">{label}</p>
        <p className="text-xl font-extrabold text-ink-950">{value}</p>
      </div>
    </div>
  );
}

/* --------------------------------- Dashboard --------------------------------- */

export function DashboardView({
  stats,
}: {
  stats: {
    totalProducts: number; activeProducts: number; totalCategories: number; ordersToday: number;
    pendingOrders: number; completedOrders: number; revenue: number; pendingReviews: number;
    recentOrders: { id: string; orderCode: string; customerName: string; total: number; status: string; createdAt: Date }[];
    recentProducts: { id: string; name: string; status: string; createdAt: Date }[];
    recentArticles: { id: string; title: string; status: string; createdAt: Date }[];
  };
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <StatCard icon="box" label="Tổng sản phẩm" value={stats.totalProducts} />
        <StatCard icon="check-circle" label="Đang bán" value={stats.activeProducts} tone="green" />
        <StatCard icon="layers" label="Danh mục" value={stats.totalCategories} tone="ink" />
        <StatCard icon="cart" label="Đơn hôm nay" value={stats.ordersToday} tone="amber" />
        <StatCard icon="clock" label="Chờ xác nhận" value={stats.pendingOrders} tone="red" />
        <StatCard icon="zap" label="Doanh thu" value={formatVND(stats.revenue)} tone="green" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <h2 className="text-sm font-bold text-ink-950">Đơn hàng gần đây</h2>
            <Link href="/admin/orders" className="text-[13px] font-semibold text-brand-700 hover:underline">Xem tất cả</Link>
          </div>
          {stats.recentOrders.length === 0 ? (
            <p className="p-6 text-center text-sm text-ink-400">Chưa có đơn hàng. Đơn hàng mới sẽ hiển thị tại đây.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-admin min-w-[560px]">
                <thead>
                  <tr><th>Mã đơn</th><th>Khách hàng</th><th>Tổng tiền</th><th>Trạng thái</th><th>Ngày</th></tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((o) => (
                    <tr key={o.id} className="cursor-pointer" onClick={() => (window.location.href = `/admin/orders/${o.id}`)}>
                      <td className="font-semibold text-brand-700">{o.orderCode}</td>
                      <td>{o.customerName}</td>
                      <td className="font-semibold">{formatVND(o.total)}</td>
                      <td><StatusBadge label={ORDER_STATUS[o.status]?.label ?? o.status} tone={ORDER_STATUS[o.status]?.tone} /></td>
                      <td className="text-ink-500">{formatDate(o.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="space-y-4">
          <div className="card p-4">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-bold text-ink-950">Sản phẩm mới</h2>
              <Link href="/admin/products" className="text-[12px] font-semibold text-brand-700">Quản lý</Link>
            </div>
            <ul className="space-y-2">
              {stats.recentProducts.map((p) => (
                <li key={p.id} className="text-[13px]">
                  <Link href={`/admin/products/${p.id}`} className="line-clamp-1 text-ink-800 hover:text-brand-700">{p.name}</Link>
                  <span className={`ml-1 text-[11px] ${p.status === "published" ? "text-success-600" : "text-amber-600"}`}>
                    {p.status === "published" ? "Đang bán" : "Bản nháp"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-4">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-bold text-ink-950">Bài viết mới</h2>
              <Link href="/admin/articles" className="text-[12px] font-semibold text-brand-700">Quản lý</Link>
            </div>
            <ul className="space-y-2">
              {stats.recentArticles.map((a) => (
                <li key={a.id} className="text-[13px]">
                  <Link href={`/admin/articles/${a.id}`} className="line-clamp-1 text-ink-800 hover:text-brand-700">{a.title}</Link>
                </li>
              ))}
            </ul>
          </div>
          {stats.pendingReviews > 0 && (
            <Link href="/admin/reviews" className="card flex items-center gap-3 border-amber-200 bg-amber-50/60 p-4 text-sm font-medium text-amber-800 hover:border-amber-300">
              <Icon name="star" className="h-5 w-5" />
              {stats.pendingReviews} đánh giá chờ duyệt
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- Products --------------------------------- */

export type ProductRowLite = {
  id: string; name: string; slug: string; sku: string | null; price: number | null; salePrice: number | null;
  priceType: string; stock: number; status: string; brandId: string | null; brandName: string; categoryName: string;
  featured: boolean; bestseller: boolean; sale: boolean; createdAt: Date;
};

function QuickProductFields({ row, brands }: { row: ProductRowLite; brands: { id: string; name: string }[] }) {
  const { toast } = useShop();
  const [brandId, setBrandId] = useState(row.brandId ?? "");
  const [stock, setStock] = useState(String(row.stock));
  const [saving, setSaving] = useState(false);

  async function save(e: React.MouseEvent) {
    e.stopPropagation();
    setSaving(true);
    const result = await updateProductQuickAction({ id: row.id, brandId, stock: Number(stock) });
    setSaving(false);
    toast(result.ok ? "Đã cập nhật thương hiệu và tồn kho." : result.error ?? "Không thể cập nhật.", result.ok ? "success" : "error");
  }

  return (
    <div className="flex min-w-[230px] items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      <select value={brandId} onChange={(e) => setBrandId(e.target.value)} className="input h-8 min-w-0 flex-1 px-2 text-xs" aria-label="Thương hiệu">
        <option value="">Chưa chọn</option>
        {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
      </select>
      <input value={stock} onChange={(e) => setStock(e.target.value)} type="number" min={0} className="input h-8 w-16 px-2 text-xs" aria-label="Tồn kho" />
      <button type="button" onClick={save} disabled={saving} className="btn-primary h-8 w-8 shrink-0 px-0" title="Lưu nhanh" aria-label="Lưu nhanh">
        {saving ? <Spinner /> : <Icon name="check" className="h-4 w-4" />}
      </button>
    </div>
  );
}

export function ProductsSection({ rows, brands }: { rows: ProductRowLite[]; brands: { id: string; name: string }[] }) {
  const [brandFilter, setBrandFilter] = useState("");
  const filteredRows = brandFilter ? rows.filter((row) => row.brandId === brandFilter) : rows;
  const columns: Column<ProductRowLite>[] = [
    { key: "name", label: "Sản phẩm", sortable: true, value: (r) => r.name, render: (r) => (
      <div>
        <span className="font-semibold text-ink-900">{r.name}</span>
        {r.sku && <p className="text-[11px] text-ink-400">{r.sku}</p>}
      </div>
    ) },
    { key: "price", label: "Giá", render: (r) => (
      <Price price={r.priceType === "fixed" ? r.price : null} salePrice={r.salePrice} priceType={r.priceType} size="sm" />
    ) },
    { key: "brand", label: "Thương hiệu / tồn kho", value: (r) => r.brandName, render: (r) => <QuickProductFields row={r} brands={brands} /> },
    { key: "status", label: "Trạng thái", value: (r) => r.status, render: (r) => (
      r.status === "published" ? <StatusBadge label="Đang bán" tone="green" /> : <StatusBadge label="Bản nháp" tone="amber" />
    ) },
    { key: "flags", label: "Cờ", render: (r) => (
      <span className="flex gap-1">
        {r.featured && <StatusBadge label="Nổi bật" tone="blue" />}
        {r.bestseller && <StatusBadge label="Bán chạy" tone="violet" />}
        {r.sale && <StatusBadge label="Khuyến mãi" tone="red" />}
      </span>
    ) },
  ];
  return (
    <AdminTable
      columns={columns}
      rows={filteredRows}
      toolbar={
        <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)} className="input h-9 w-52 text-xs" aria-label="Lọc theo thương hiệu">
          <option value="">Tất cả thương hiệu</option>
          {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
        </select>
      }
      onRowClick={(r, page) => (window.location.href = `/admin/products/${r.id}?returnPage=${page}`)}
    />
  );
}

export function ProductForm({
  initial, brands, categories,
}: {
  initial: ProductForm & { id?: string };
  brands: { id: string; name: string }[];
  categories: { id: string; name: string }[];
}) {
  const [f, setF] = useState<ProductForm>({ ...initial });
  const { saving, run } = useSave();
  const returnPage = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("returnPage") : null;
  const backHref = returnPage ? `/admin/products?page=${returnPage}` : "/admin/products";
  const set = <K extends keyof ProductForm>(k: K, v: ProductForm[K]) => setF((p) => ({ ...p, [k]: v }));
  const isEdit = !!initial.id;

  function submit() {
    run(() => saveProductAction(f), "/admin/products", "Đã lưu sản phẩm.");
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        <div className="card grid gap-4 p-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Tên sản phẩm" required>
              <input value={f.name} onChange={(e) => set("name", e.target.value)} className="input" />
            </Field>
          </div>
          <Field label="Slug" hint="Dành cho SEO. Bỏ trống = tự tạo.">
            <input value={f.slug} onChange={(e) => set("slug", e.target.value)} className="input" placeholder="tu-dong-tao" />
          </Field>
          <Field label="SKU / Mã hàng">
            <input value={f.sku} onChange={(e) => set("sku", e.target.value)} className="input" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Mô tả ngắn">
              <textarea value={f.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} rows={2} className="textarea" />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Mô tả chi tiết">
              <RichTextEditor value={f.description} onChange={(v) => set("description", v)} />
            </Field>
          </div>
        </div>

        <div className="card p-4">
          <h3 className="mb-3 text-sm font-bold text-ink-950">Giá bán</h3>
          <div className="mb-3 flex gap-4">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="radio" checked={f.priceType === "fixed"} onChange={() => set("priceType", "fixed")} className="accent-brand-700" />
              Giá cố định
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="radio" checked={f.priceType === "contact"} onChange={() => set("priceType", "contact")} className="accent-brand-700" />
              Giá &quot;Liên hệ&quot; (báo giá qua điện thoại/Zalo)
            </label>
          </div>
          {f.priceType === "fixed" && (
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Giá gốc / giá hiện tại (VNĐ)" hint="Sản phẩm mới: nhập giá gốc. Sản phẩm cũ: đây là giá đang lưu trên web." required>
                <input type="number" min={0} value={f.price ?? ""} onChange={(e) => set("price", e.target.value)} className="input" />
              </Field>
              <Field label="Tăng giá (%)" hint="Ví dụ 15, 18 hoặc 20. Sản phẩm cũ để trống để giữ nguyên giá hiện tại.">
                <input type="number" min={0} step="0.01" value={f.markupPercent ?? ""} onChange={(e) => set("markupPercent", e.target.value)} className="input" placeholder="0" />
              </Field>
              <Field label="Giá khuyến mãi gốc (VNĐ)" hint="Nếu nhập, cùng phần trăm tăng giá sẽ được áp dụng.">
                <input type="number" min={0} value={f.salePrice ?? ""} onChange={(e) => set("salePrice", e.target.value)} className="input" />
              </Field>
              <Field label="Tồn kho">
                <input type="number" min={0} value={f.stock ?? ""} onChange={(e) => set("stock", e.target.value)} className="input" />
              </Field>
            </div>
          )}
          {f.priceType === "contact" && (
            <p className="rounded-md bg-ink-50 p-3 text-[13px] text-ink-500">
              Sản phẩm giá &quot;Liên hệ&quot; không thể đặt trực tiếp trên web — khách hàng nhận báo giá qua hotline/Zalo.
            </p>
          )}
        </div>

        <div className="card p-4">
          <h3 className="mb-3 text-sm font-bold text-ink-950">Thông số kỹ thuật</h3>
          <div className="space-y-2">
            {f.specs.map((s, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={s.name}
                  onChange={(e) => set("specs", f.specs.map((x, xi) => (xi === i ? { ...x, name: e.target.value } : x)))}
                  className="input w-1/3"
                  placeholder="Thuộc tính (VD: Độ phân giải)"
                  aria-label={`Thuộc tính ${i + 1}`}
                />
                <input
                  value={s.value}
                  onChange={(e) => set("specs", f.specs.map((x, xi) => (xi === i ? { ...x, value: e.target.value } : x)))}
                  className="input flex-1"
                  placeholder="Giá trị (VD: 4MP)"
                  aria-label={`Giá trị ${i + 1}`}
                />
                <button onClick={() => set("specs", f.specs.filter((_, xi) => xi !== i))} className="btn-outline h-10 w-10 shrink-0 px-0" aria-label="Xoá dòng">
                  <Icon name="trash" className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <button onClick={() => set("specs", [...f.specs, { name: "", value: "" }])} className="btn-ghost mt-2 h-9 text-[13px]">
            <Icon name="plus" className="h-4 w-4" /> Thêm thông số
          </button>
        </div>

        <div className="card p-4">
          <h3 className="mb-3 text-sm font-bold text-ink-950">Hình ảnh</h3>
          <div className="space-y-3">
            {f.images.map((img, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex-1">
                  <ImageInput value={img.url} onChange={(v) => set("images", f.images.map((x, xi) => (xi === i ? { ...x, url: v } : x)))} label={`Ảnh ${i + 1}`} />
                </div>
                <label className="flex shrink-0 items-center gap-1.5 text-[13px] font-medium">
                  <input
                    type="radio"
                    checked={img.isMain}
                    onChange={() => set("images", f.images.map((x, xi) => ({ ...x, isMain: xi === i })))}
                    className="accent-brand-700"
                  />
                  Ảnh chính
                </label>
                <button onClick={() => set("images", f.images.filter((_, xi) => xi !== i))} className="btn-outline h-9 w-9 shrink-0 px-0" aria-label="Xoá ảnh">
                  <Icon name="trash" className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <button onClick={() => set("images", [...f.images, { url: "", isMain: f.images.length === 0 }])} className="btn-ghost mt-3 h-9 text-[13px]">
            <Icon name="plus" className="h-4 w-4" /> Thêm ảnh
          </button>
        </div>
      </div>

      <div className="space-y-5">
        <div className="card space-y-4 p-4">
          <h3 className="text-sm font-bold text-ink-950">Công bố</h3>
          <Field label="Trạng thái">
            <select value={f.status} onChange={(e) => set("status", e.target.value)} className="input">
              <option value="published">Đang bán (Công khai)</option>
              <option value="draft">Bản nháp (Ẩn)</option>
            </select>
          </Field>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={f.featured} onChange={(e) => set("featured", e.target.checked)} className="accent-brand-700" /> Sản phẩm nổi bật (trang chủ)</label>
            <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={f.bestseller} onChange={(e) => set("bestseller", e.target.checked)} className="accent-brand-700" /> Bán chạy</label>
            <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={f.sale} onChange={(e) => set("sale", e.target.checked)} className="accent-brand-700" /> Đang khuyến mãi</label>
          </div>
        </div>
        <div className="card space-y-4 p-4">
          <h3 className="text-sm font-bold text-ink-950">Phân loại</h3>
          <Field label="Thương hiệu">
            <select value={f.brandId ?? ""} onChange={(e) => set("brandId", e.target.value)} className="input">
              <option value="">— Không có —</option>
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </Field>
          <Field label="Danh mục chính">
            <select value={f.categoryId ?? ""} onChange={(e) => set("categoryId", e.target.value)} className="input">
              <option value="">— Không có —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Danh mục bổ sung">
            <div className="max-h-44 space-y-1.5 overflow-y-auto rounded-md border border-line p-2.5 thin-scrollbar">
              {categories.map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-[13px]">
                  <input
                    type="checkbox"
                    checked={f.categoryIds.includes(c.id)}
                    onChange={(e) => set("categoryIds", e.target.checked ? [...f.categoryIds, c.id] : f.categoryIds.filter((x) => x !== c.id))}
                    className="accent-brand-700"
                  />
                  {c.name}
                </label>
              ))}
            </div>
          </Field>
        </div>
        <div className="card space-y-3 p-4">
          <h3 className="text-sm font-bold text-ink-950">Bảo hành &amp; SEO</h3>
          <Field label="Bảo hành">
            <input value={f.warranty} onChange={(e) => set("warranty", e.target.value)} className="input" placeholder="VD: 12 tháng 1 đổi 1" />
          </Field>
          <Field label="SEO Title">
            <input value={f.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} className="input" />
          </Field>
          <Field label="SEO Description">
            <textarea value={f.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} rows={2} className="textarea" />
          </Field>
        </div>
        {isEdit && (
          <DeleteProductBtn id={f.id!} />
        )}
      </div>
      <SaveBar saving={saving} onSave={submit} backHref={backHref} />
    </div>
  );
}

function DeleteProductBtn({ id }: { id: string }) {
  const router = useRouter();
  const { toast } = useShop();
  const [busy, setBusy] = useState(false);
  return (
    <div className="card border-sale-500/30 p-4">
      <h3 className="mb-2 text-sm font-bold text-sale-700">Vùng nguy hiểm</h3>
      <button
        disabled={busy}
        onClick={async () => {
          if (!confirm("Xoá sản phẩm này? Hành động không thể hoàn tác.")) return;
          setBusy(true);
          const res = await deleteProductAction(id);
          setBusy(false);
          if (res.ok) {
            toast("Đã xoá sản phẩm.");
            router.push("/admin/products");
            router.refresh();
          } else toast(res.error ?? "Lỗi", "error");
        }}
        className="inline-flex h-9 items-center gap-2 rounded-md border border-sale-500/40 px-3 text-sm font-semibold text-sale-600 hover:bg-sale-50"
      >
        {busy ? <Spinner /> : <Icon name="trash" className="h-4 w-4" />} Xoá sản phẩm
      </button>
    </div>
  );
}

/* --------------------------------- Categories -------------------------------- */

export type CategoryLite = { id: string; name: string; slug: string; parentId: string | null; active: boolean; sortOrder: number; description: string | null };

export function CategoriesSection({ rows }: { rows: CategoryLite[] }) {
  const byId = new Map(rows.map((r) => [r.id, r]));
  const columns: Column<CategoryLite>[] = [
    { key: "name", label: "Danh mục", sortable: true, value: (r) => r.name, render: (r) => (
      <span className="font-semibold">{r.parentId ? "— " : ""}{r.name}</span>
    ) },
    { key: "slug", label: "Slug", render: (r) => <code className="text-[12px] text-ink-500">/danh-muc/{r.slug}</code> },
    { key: "parent", label: "Cha", render: (r) => (r.parentId && byId.get(r.parentId)?.name) || "—" },
    { key: "sort", label: "Thứ tự", value: (r) => r.sortOrder },
    { key: "active", label: "Trạng thái", render: (r) => (r.active ? <StatusBadge label="Hoạt động" tone="green" /> : <StatusBadge label="Tắt" tone="gray" />) },
  ];
  return <AdminTable columns={columns} rows={rows} onRowClick={(r) => (window.location.href = `/admin/categories/${r.id}`)} />;
}

export function CategoryForm({ initial, parents = [] }: { initial: CategoryForm & { id?: string }; parents?: { id: string; name: string }[] }) {
  const [f, setF] = useState<CategoryForm>(initial);
  const { saving, run } = useSave();
  const set = <K extends keyof CategoryForm>(k: K, v: CategoryForm[K]) => setF((p) => ({ ...p, [k]: v }));
  return (
    <div className="grid max-w-3xl gap-5">
      <div className="card grid gap-4 p-4 sm:grid-cols-2">
        <Field label="Tên danh mục" required><input value={f.name} onChange={(e) => set("name", e.target.value)} className="input" /></Field>
        <Field label="Slug"><input value={f.slug} onChange={(e) => set("slug", e.target.value)} className="input" /></Field>
        <Field label="Danh mục cha"><select value={f.parentId ?? ""} onChange={(e) => set("parentId", e.target.value)} className="input"><option value="">— Cấp trên cùng —</option>{parents.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field>
        <Field label="Thứ tự hiển thị"><input type="number" value={f.sortOrder ?? ""} onChange={(e) => set("sortOrder", e.target.value)} className="input" /></Field>
        <div className="sm:col-span-2"><Field label="Mô tả"><textarea value={f.description} onChange={(e) => set("description", e.target.value)} rows={3} className="textarea" /></Field></div>
        <div className="sm:col-span-2"><Field label="Ảnh đại diện"><ImageInput value={f.image} onChange={(v) => set("image", v)} /></Field></div>
        <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={f.active} onChange={(e) => set("active", e.target.checked)} className="accent-brand-700" /> Hiển thị trên website</label>
        <div className="sm:col-span-2"><Field label="SEO Title"><input value={f.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} className="input" /></Field></div>
        <div className="sm:col-span-2"><Field label="SEO Description"><textarea value={f.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} rows={2} className="textarea" /></Field></div>
      </div>
      {initial.id && (
        <div className="card border-sale-500/30 p-4">
          <h3 className="mb-2 text-sm font-bold text-sale-700">Vùng nguy hiểm</h3>
          <DeleteRow action={deleteCategoryAction} id={initial.id} back="/admin/categories" label="Xoá danh mục (các danh mục con sẽ lên cấp trên)" />
        </div>
      )}
      <SaveBar saving={saving} onSave={() => run(() => saveCategoryAction(f), "/admin/categories", "Đã lưu danh mục.")} backHref="/admin/categories" />
    </div>
  );
}

/* --------------------------------- Brands -------------------------------- */

export type BrandLite = { id: string; name: string; slug: string; active: boolean; website: string | null };

export function BrandsSection({ rows }: { rows: BrandLite[] }) {
  const columns: Column<BrandLite>[] = [
    { key: "name", label: "Thương hiệu", sortable: true, value: (r) => r.name, render: (r) => <span className="font-semibold">{r.name}</span> },
    { key: "slug", label: "Slug", render: (r) => <code className="text-[12px] text-ink-500">/thuong-hieu/{r.slug}</code> },
    { key: "website", label: "Website", render: (r) => (r.website ? <a href={r.website} target="_blank" rel="noopener" className="text-brand-700 hover:underline">{r.website.replace("https://", "")}</a> : "—") },
    { key: "active", label: "Trạng thái", render: (r) => (r.active ? <StatusBadge label="Hoạt động" tone="green" /> : <StatusBadge label="Tắt" tone="gray" />) },
  ];
  return <AdminTable columns={columns} rows={rows} onRowClick={(r) => (window.location.href = `/admin/brands/${r.id}`)} />;
}

export function BrandForm({ initial }: { initial: BrandForm & { id?: string } }) {
  const [f, setF] = useState<BrandForm>(initial);
  const { saving, run } = useSave();
  const set = <K extends keyof BrandForm>(k: K, v: BrandForm[K]) => setF((p) => ({ ...p, [k]: v }));
  return (
    <div className="grid max-w-3xl gap-5">
      <div className="card grid gap-4 p-4 sm:grid-cols-2">
        <Field label="Tên thương hiệu" required><input value={f.name} onChange={(e) => set("name", e.target.value)} className="input" /></Field>
        <Field label="Slug"><input value={f.slug} onChange={(e) => set("slug", e.target.value)} className="input" /></Field>
        <div className="sm:col-span-2"><Field label="Logo / Ảnh"><ImageInput value={f.logo} onChange={(v) => set("logo", v)} /></Field></div>
        <div className="sm:col-span-2"><Field label="Mô tả"><textarea value={f.description} onChange={(e) => set("description", e.target.value)} rows={3} className="textarea" /></Field></div>
        <Field label="Website"><input value={f.website} onChange={(e) => set("website", e.target.value)} className="input" placeholder="https://…" /></Field>
        <label className="flex items-center gap-2 self-end pb-2 text-sm font-medium"><input type="checkbox" checked={f.active} onChange={(e) => set("active", e.target.checked)} className="accent-brand-700" /> Hiển thị</label>
        <Field label="SEO Title"><input value={f.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} className="input" /></Field>
        <Field label="SEO Description"><input value={f.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} className="input" /></Field>
      </div>
      {initial.id && (
        <div className="card border-sale-500/30 p-4">
          <DeleteRow action={deleteBrandAction} id={initial.id} back="/admin/brands" label="Xoá thương hiệu" />
        </div>
      )}
      <SaveBar saving={saving} onSave={() => run(() => saveBrandAction(f), "/admin/brands", "Đã lưu thương hiệu.")} backHref="/admin/brands" />
    </div>
  );
}

function DeleteRow({ action, id, back, label }: { action: (id: string) => Promise<ActionResult>; id: string; back: string; label: string }) {
  const router = useRouter();
  const { toast } = useShop();
  const [busy, setBusy] = useState(false);
  return (
    <button
      disabled={busy}
      onClick={async () => {
        if (!confirm(label + "? Hành động không thể hoàn tác.")) return;
        setBusy(true);
        const res = await action(id);
        setBusy(false);
        if (res.ok) {
          toast("Đã xoá.");
          router.push(back);
          router.refresh();
        } else toast(res.error ?? "Lỗi", "error");
      }}
      className="inline-flex h-9 items-center gap-2 rounded-md border border-sale-500/40 px-3 text-sm font-semibold text-sale-600 hover:bg-sale-50"
    >
      {busy ? <Spinner /> : <Icon name="trash" className="h-4 w-4" />} {label}
    </button>
  );
}

/* --------------------------------- Orders -------------------------------- */

export type OrderLite = {
  id: string; orderCode: string; customerName: string; phone: string; total: number; status: string;
  paymentMethod: string; createdAt: Date;
};

export function OrdersSection({ rows }: { rows: OrderLite[] }) {
  const [statusFilter, setStatusFilter] = useState("");
  const filtered = statusFilter ? rows.filter((r) => r.status === statusFilter) : rows;
  const columns: Column<OrderLite>[] = [
    { key: "orderCode", label: "Mã đơn", sortable: true, value: (r) => r.orderCode, render: (r) => <span className="font-bold text-brand-700">{r.orderCode}</span> },
    { key: "customerName", label: "Khách hàng", value: (r) => r.customerName },
    { key: "phone", label: "SĐT", value: (r) => r.phone },
    { key: "total", label: "Tổng tiền", sortable: true, value: (r) => r.total, render: (r) => <b>{formatVND(r.total)}</b> },
    { key: "paymentMethod", label: "Thanh toán", render: (r) => PAYMENT_METHODS[r.paymentMethod] ?? r.paymentMethod },
    { key: "status", label: "Trạng thái", value: (r) => r.status, render: (r) => <StatusBadge label={ORDER_STATUS[r.status]?.label ?? r.status} tone={ORDER_STATUS[r.status]?.tone} /> },
    { key: "createdAt", label: "Ngày đặt", sortable: true, value: (r) => r.createdAt.getTime(), render: (r) => <span className="text-ink-500">{formatDate(r.createdAt)}</span> },
  ];
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        <button onClick={() => setStatusFilter("")} className={`chip ${!statusFilter ? "!border-brand-600 !text-brand-700" : ""}`}>Tất cả</button>
        {Object.entries(ORDER_STATUS).map(([k, v]) => (
          <button key={k} onClick={() => setStatusFilter(k)} className={`chip ${statusFilter === k ? "!border-brand-600 !text-brand-700" : ""}`}>{v.label}</button>
        ))}
      </div>
      <AdminTable columns={columns} rows={filtered} onRowClick={(r) => (window.location.href = `/admin/orders/${r.id}`)} pageSize={20} />
    </div>
  );
}

export function OrderDetail({
  order, items,
}: {
  order: { id: string; orderCode: string; customerName: string; phone: string; email: string | null; address: string; province: string | null; district: string | null; ward: string | null; note: string | null; paymentMethod: string; status: string; subtotal: number; shippingFee: number; discount: number; total: number; createdAt: Date; updatedAt: Date };
  items: { id: string; productName: string; sku: string | null; productImage: string | null; unitPrice: number; quantity: number; subtotal: number }[];
}) {
  const router = useRouter();
  const { toast } = useShop();
  const [busy, setBusy] = useState<string | null>(null);
  async function changeStatus(s: string) {
    setBusy(s);
    const res = await setOrderStatusAction(order.id, s);
    setBusy(null);
    if (res.ok) {
      toast(`Đã chuyển sang: ${ORDER_STATUS[s].label}`);
      router.refresh();
    } else toast(res.error ?? "Lỗi", "error");
  }
  const currentIdx = ORDER_STATUS_FLOW.indexOf(order.status);
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-admin min-w-[560px]">
              <thead><tr><th>Sản phẩm</th><th>SKU</th><th>Đơn giá</th><th>SL</th><th>Tạm tính</th></tr></thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        {it.productImage && (
                          <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-ink-100">
                            <Image src={it.productImage} alt="" fill sizes="40px" className="object-cover" />
                          </span>
                        )}
                        <span className="font-medium">{it.productName}</span>
                      </div>
                    </td>
                    <td className="text-ink-500">{it.sku ?? "—"}</td>
                    <td>{formatVND(it.unitPrice)}</td>
                    <td>x{it.quantity}</td>
                    <td className="font-semibold">{formatVND(it.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <dl className="space-y-1.5 border-t border-line bg-ink-50/50 p-4 text-sm">
            <div className="flex justify-between"><dt className="text-ink-500">Tạm tính</dt><dd className="font-semibold">{formatVND(order.subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-500">Vận chuyển</dt><dd className="font-semibold">{order.shippingFee > 0 ? formatVND(order.shippingFee) : "Miễn phí"}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-500">Giảm giá</dt><dd className="font-semibold">-{formatVND(order.discount)}</dd></div>
            <div className="flex justify-between border-t border-line pt-2 text-base"><dt className="font-bold">Tổng cộng</dt><dd className="font-extrabold text-brand-700">{formatVND(order.total)}</dd></div>
          </dl>
        </div>
        <div className="card p-4">
          <h3 className="mb-3 text-sm font-bold text-ink-950">Trình duyệt trạng thái</h3>
          <ol className="flex flex-wrap items-center gap-y-3">
            {ORDER_STATUS_FLOW.map((s, i) => (
              <li key={s} className="flex items-center">
                <button
                  onClick={() => changeStatus(s)}
                  disabled={order.status === s || busy != null}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-semibold transition-colors ${
                    i <= currentIdx ? "border-brand-600 bg-brand-700 text-white" : "border-line bg-white text-ink-500 hover:border-brand-400"
                  }`}
                >
                  {i <= currentIdx && <Icon name="check" className="h-3.5 w-3.5" />}
                  {busy === s && <Spinner className="h-3.5 w-3.5" />}
                  {ORDER_STATUS[s].label}
                </button>
                {i < ORDER_STATUS_FLOW.length - 1 && <span className="mx-2 h-px w-5 bg-ink-200" />}
              </li>
            ))}
          </ol>
          <div className="mt-4 flex gap-2">
            {order.status !== "cancelled" && (
              <button onClick={() => changeStatus("cancelled")} disabled={busy != null} className="btn-outline h-9 border-sale-500/40 text-sale-600 hover:border-sale-600">
                Huỷ đơn hàng
              </button>
            )}
            <a href={`tel:${order.phone.replace(/\D/g, "")}`} className="btn-outline h-9">
              <Icon name="phone" className="h-4 w-4" /> Gọi {order.phone}
            </a>
          </div>
        </div>
      </div>
      <div className="space-y-5">
        <div className="card space-y-2.5 p-4 text-sm">
          <h3 className="text-sm font-bold text-ink-950">Thông tin khách hàng</h3>
          <p><span className="text-ink-400">Họ tên:</span> <b>{order.customerName}</b></p>
          <p><span className="text-ink-400">SĐT:</span> <a href={`tel:${order.phone}`} className="font-semibold text-brand-700">{order.phone}</a></p>
          {order.email && <p><span className="text-ink-400">Email:</span> {order.email}</p>}
          <p><span className="text-ink-400">Địa chỉ:</span> {order.ward}, {order.district}, {order.province} — {order.address}</p>
          <p><span className="text-ink-400">Thanh toán:</span> {PAYMENT_METHODS[order.paymentMethod]}</p>
          {order.note && <p className="rounded-md bg-amber-50 p-2.5 text-[13px] text-amber-800"><b>Ghi chú:</b> {order.note}</p>}
        </div>
        <div className="card space-y-1.5 p-4 text-[13px] text-ink-500">
          <p>Mã đơn: <b className="text-ink-900">{order.orderCode}</b></p>
          <p>Đặt lúc: {formatDate(order.createdAt)}</p>
          <p>Cập nhật: {formatDate(order.updatedAt)}</p>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- Customers -------------------------------- */

export type CustomerLite = { id: string; name: string; email: string; phone: string | null; createdAt: Date };

export function CustomersSection({ rows }: { rows: CustomerLite[] }) {
  const columns: Column<CustomerLite>[] = [
    { key: "name", label: "Họ tên", sortable: true, value: (r) => r.name, render: (r) => <b>{r.name}</b> },
    { key: "email", label: "Email", value: (r) => r.email },
    { key: "phone", label: "SĐT", value: (r) => r.phone ?? "—" },
    { key: "createdAt", label: "Đăng ký", sortable: true, value: (r) => r.createdAt.getTime(), render: (r) => formatDate(r.createdAt) },
  ];
  return <AdminTable columns={columns} rows={rows} />;
}

/* --------------------------------- Articles -------------------------------- */

export type ArticleLite = { id: string; title: string; slug: string; category: string | null; status: string; publishedAt: Date };

export function ArticlesSection({ rows }: { rows: ArticleLite[] }) {
  const columns: Column<ArticleLite>[] = [
    { key: "title", label: "Tiêu đề", sortable: true, value: (r) => r.title, render: (r) => <Link href={`/admin/articles/${r.id}`} className="font-semibold text-ink-900 hover:text-brand-700">{r.title}</Link> },
    { key: "category", label: "Chuyên mục", value: (r) => r.category ?? "—" },
    { key: "status", label: "Trạng thái", render: (r) => (r.status === "published" ? <StatusBadge label="Đã đăng" tone="green" /> : <StatusBadge label="Bản nháp" tone="amber" />) },
    { key: "publishedAt", label: "Ngày đăng", sortable: true, value: (r) => r.publishedAt.getTime(), render: (r) => formatDate(r.publishedAt) },
  ];
  return <AdminTable columns={columns} rows={rows} onRowClick={(r) => (window.location.href = `/admin/articles/${r.id}`)} />;
}

export function ArticleForm({ initial, categories }: { initial: ArticleForm & { id?: string }; categories: string[] }) {
  const [f, setF] = useState<ArticleForm>(initial);
  const { saving, run } = useSave();
  const set = <K extends keyof ArticleForm>(k: K, v: ArticleForm[K]) => setF((p) => ({ ...p, [k]: v }));
  return (
    <div className="grid max-w-4xl gap-5">
      <div className="card grid gap-4 p-4 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <Field label="Tiêu đề" required><input value={f.title} onChange={(e) => set("title", e.target.value)} className="input" /></Field>
        </div>
        <Field label="Slug"><input value={f.slug} onChange={(e) => set("slug", e.target.value)} className="input" /></Field>
        <Field label="Chuyên mục"><select value={f.category} onChange={(e) => set("category", e.target.value)} className="input"><option value="">Chọn chuyên mục</option>{categories.map((category) => <option key={category} value={category}>{category}</option>)}{f.category && !categories.includes(f.category) && <option value={f.category}>{f.category}</option>}</select></Field>
        <Field label="Tags (phân cách bằng dấu phẩy)"><input value={f.tags} onChange={(e) => set("tags", e.target.value)} className="input" placeholder="cat6, cáp quang, poe" /></Field>
        <Field label="Trạng thái">
          <select value={f.status} onChange={(e) => set("status", e.target.value)} className="input">
            <option value="published">Đã đăng</option>
            <option value="draft">Bản nháp</option>
          </select>
        </Field>
        <div className="sm:col-span-3"><Field label="Ảnh bìa"><ImageInput value={f.coverImage} onChange={(v) => set("coverImage", v)} /></Field></div>
        <div className="sm:col-span-3"><Field label="Tóm tắt"><textarea value={f.excerpt} onChange={(e) => set("excerpt", e.target.value)} rows={2} className="textarea" /></Field></div>
        <div className="sm:col-span-3">
          <Field label="Nội dung bài viết">
            <RichTextEditor value={f.content} onChange={(v) => set("content", v)} minHeight={420} />
          </Field>
        </div>
        <Field label="SEO Title"><input value={f.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} className="input" /></Field>
        <Field label="SEO Description"><input value={f.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} className="input" /></Field>
      </div>
      {initial.id && (
        <div className="card border-sale-500/30 p-4">
          <DeleteRow action={deleteArticleAction} id={initial.id} back="/admin/articles" label="Xoá bài viết" />
        </div>
      )}
      <SaveBar saving={saving} onSave={() => run(() => saveArticleAction(f), "/admin/articles", "Đã lưu bài viết.")} backHref="/admin/articles" />
    </div>
  );
}

/* --------------------------------- Banners / Promotions / Pages -------------------------------- */

export function BannersSection({ rows }: { rows: { id: string; title: string; active: boolean; sortOrder: number; buttonUrl: string | null; image: string | null }[] }) {
  const columns: Column<{ id: string; title: string; active: boolean; sortOrder: number; buttonUrl: string | null; image: string | null }>[] = [
    { key: "title", label: "Banner", value: (r) => r.title, render: (r) => (
      <div className="flex items-center gap-3">
        {r.image && <span className="relative h-10 w-20 shrink-0 overflow-hidden rounded bg-ink-100"><Image src={r.image} alt="" fill sizes="80px" className="object-cover" /></span>}
        <b>{r.title}</b>
      </div>
    ) },
    { key: "sort", label: "Thứ tự", value: (r) => r.sortOrder },
    { key: "url", label: "Link", render: (r) => r.buttonUrl ?? "—" },
    { key: "active", label: "Trạng thái", render: (r) => (r.active ? <StatusBadge label="Đang chạy" tone="green" /> : <StatusBadge label="Tắt" tone="gray" />) },
  ];
  return (
    <div className="space-y-5">
      <BannerBulkUpload nextSortOrder={rows.length ? Math.max(...rows.map((row) => row.sortOrder)) + 1 : 0} />
      <AdminTable columns={columns} rows={rows} onRowClick={(r) => (window.location.href = "/admin/banners/" + r.id)} />
    </div>
  );
}

function BannerBulkUpload({ nextSortOrder }: { nextSortOrder: number }) {
  const [title, setTitle] = useState("Banner trang chủ");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useShop();
  const router = useRouter();

  async function upload() {
    if (!files.length || uploading) return;
    const oversized = files.find((file) => file.size > 5 * 1024 * 1024);
    if (oversized) {
      toast(oversized.name + " vượt quá 5MB.", "error");
      return;
    }
    setUploading(true);
    try {
      const uploaded: { url: string; name?: string }[] = [];
      for (const file of files) {
        const form = new FormData();
        form.append("file", file);
        const response = await fetch("/api/upload", { method: "POST", body: form });
        const result = await response.json();
        if (!response.ok || !result.url) throw new Error(result.error || "Không thể tải " + file.name);
        uploaded.push({ url: result.url, name: file.name.replace(/\.[^.]+$/, "") });
      }
      const result = await saveBannerBatchAction({ images: uploaded, titlePrefix: title, startSortOrder: nextSortOrder });
      if (!result.ok) throw new Error(result.error || "Không thể tạo banner");
      setFiles([]);
      toast("Đã tạo " + uploaded.length + " slide banner.");
      router.refresh();
    } catch (error) {
      toast(error instanceof Error ? error.message : "Upload banner thất bại.", "error");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="card border-brand-200 bg-brand-50/50 p-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-56 flex-1">
          <Field label="Tên nhóm banner"><input value={title} onChange={(e) => setTitle(e.target.value)} className="input bg-white" placeholder="Banner trang chủ" /></Field>
        </div>
        <label className="btn-outline inline-flex h-10 cursor-pointer items-center gap-2 bg-white">
          <Icon name="image" className="h-4 w-4" />
          Chọn nhiều ảnh
          <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => setFiles(Array.from(e.target.files ?? []))} />
        </label>
        <button type="button" onClick={upload} disabled={!files.length || uploading} className="btn-primary h-10 disabled:cursor-not-allowed disabled:opacity-50">
          {uploading ? <Spinner /> : <Icon name="upload" className="h-4 w-4" />}
          {uploading ? "Đang tải..." : "Tải lên & tạo slide"}
        </button>
      </div>
      <p className="mt-2 text-xs text-ink-500">Chọn nhiều ảnh cùng lúc. Mỗi ảnh sẽ thành một slide và được xếp tiếp từ thứ tự {nextSortOrder}.</p>
      {files.length > 0 && <p className="mt-1 text-xs font-semibold text-brand-700">Đã chọn {files.length} ảnh: {files.map((file) => file.name).join(", ")}</p>}
    </div>
  );
}

export function BannerForm({ initial }: { initial: BannerForm & { id?: string } }) {
  const [f, setF] = useState<BannerForm>(initial);
  const { saving, run } = useSave();
  const set = <K extends keyof BannerForm>(k: K, v: BannerForm[K]) => setF((p) => ({ ...p, [k]: v }));
  return (
    <div className="grid max-w-3xl gap-5">
      <div className="card grid gap-4 p-4 sm:grid-cols-2">
        <Field label="Tiêu đề" required><input value={f.title} onChange={(e) => set("title", e.target.value)} className="input" /></Field>
        <Field label="Phụ đề"><input value={f.subtitle} onChange={(e) => set("subtitle", e.target.value)} className="input" /></Field>
        <Field label="Ảnh desktop"><ImageInput value={f.image} onChange={(v) => set("image", v)} /></Field>
        <Field label="Ảnh mobile"><ImageInput value={f.mobileImage} onChange={(v) => set("mobileImage", v)} /></Field>
        <Field label="Nút bấm — text"><input value={f.buttonText} onChange={(e) => set("buttonText", e.target.value)} className="input" /></Field>
        <Field label="Nút bấm — link"><input value={f.buttonUrl} onChange={(e) => set("buttonUrl", e.target.value)} className="input" /></Field>
        <Field label="Thứ tự"><input type="number" value={f.sortOrder ?? ""} onChange={(e) => set("sortOrder", e.target.value)} className="input" /></Field>
        <div className="flex items-center gap-6">
          <Field label="Từ ngày"><input type="date" value={f.startDate ?? ""} onChange={(e) => set("startDate", e.target.value)} className="input" /></Field>
          <Field label="Đến ngày"><input type="date" value={f.endDate ?? ""} onChange={(e) => set("endDate", e.target.value)} className="input" /></Field>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={f.active} onChange={(e) => set("active", e.target.checked)} className="accent-brand-700" /> Hiển thị</label>
      </div>
      {initial.id && <div className="card border-sale-500/30 p-4"><DeleteRow action={deleteBannerAction} id={initial.id} back="/admin/banners" label="Xoá banner" /></div>}
      <SaveBar saving={saving} onSave={() => run(() => saveBannerAction(f), "/admin/banners", "Đã lưu banner.")} backHref="/admin/banners" />
    </div>
  );
}

export function PromotionsSection({ rows }: { rows: { id: string; title: string; badge: string | null; active: boolean; startDate: string | null; endDate: string | null }[] }) {
  const columns: Column<{ id: string; title: string; badge: string | null; active: boolean; startDate: string | null; endDate: string | null }>[] = [
    { key: "title", label: "Khuyến mãi", value: (r) => r.title, render: (r) => <b>{r.title}</b> },
    { key: "badge", label: "Huy hiệu", render: (r) => r.badge ?? "—" },
    { key: "period", label: "Thời gian", render: (r) => `${r.startDate ?? "…"} → ${r.endDate ?? "…"}` },
    { key: "active", label: "Trạng thái", render: (r) => (r.active ? <StatusBadge label="Đang chạy" tone="green" /> : <StatusBadge label="Tắt" tone="gray" />) },
  ];
  return <AdminTable columns={columns} rows={rows} onRowClick={(r) => (window.location.href = `/admin/promotions/${r.id}`)} />;
}

export function PromotionForm({ initial }: { initial: PromotionForm & { id?: string } }) {
  const [f, setF] = useState<PromotionForm>(initial);
  const { saving, run } = useSave();
  const set = <K extends keyof PromotionForm>(k: K, v: PromotionForm[K]) => setF((p) => ({ ...p, [k]: v }));
  return (
    <div className="grid max-w-3xl gap-5">
      <div className="card grid gap-4 p-4 sm:grid-cols-2">
        <Field label="Tên khuyến mãi" required><input value={f.title} onChange={(e) => set("title", e.target.value)} className="input" /></Field>
        <Field label="Huy hiệu (badge)"><input value={f.badge} onChange={(e) => set("badge", e.target.value)} className="input" placeholder="VD: FLASH SALE" /></Field>
        <div className="sm:col-span-2"><Field label="Mô tả"><textarea value={f.description} onChange={(e) => set("description", e.target.value)} rows={2} className="textarea" /></Field></div>
        <Field label="Ảnh"><ImageInput value={f.image} onChange={(v) => set("image", v)} /></Field>
        <Field label="Link"><input value={f.url} onChange={(e) => set("url", e.target.value)} className="input" placeholder="/danh-muc/…" /></Field>
        <Field label="Thứ tự"><input type="number" value={f.sortOrder ?? ""} onChange={(e) => set("sortOrder", e.target.value)} className="input" /></Field>
        <div className="flex items-center gap-6">
          <Field label="Từ ngày"><input type="date" value={f.startDate ?? ""} onChange={(e) => set("startDate", e.target.value)} className="input" /></Field>
          <Field label="Đến ngày"><input type="date" value={f.endDate ?? ""} onChange={(e) => set("endDate", e.target.value)} className="input" /></Field>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={f.active} onChange={(e) => set("active", e.target.checked)} className="accent-brand-700" /> Hiển thị</label>
      </div>
      {initial.id && <div className="card border-sale-500/30 p-4"><DeleteRow action={deletePromotionAction} id={initial.id} back="/admin/promotions" label="Xoá khuyến mãi" /></div>}
      <SaveBar saving={saving} onSave={() => run(() => savePromotionAction(f), "/admin/promotions", "Đã lưu khuyến mãi.")} backHref="/admin/promotions" />
    </div>
  );
}

/* --------------------------------- Reviews -------------------------------- */

export type ReviewLite = { id: string; customerName: string; rating: number; status: string; content: string; productName: string; createdAt: Date };

export function ReviewsSection({ rows }: { rows: ReviewLite[] }) {
  const [filter, setFilter] = useState("");
  const filtered = filter ? rows.filter((r) => r.status === filter) : rows;
  const { toast } = useShop();
  const router = useRouter();
  async function act(id: string, status: string) {
    const res = await setReviewStatusAction(id, status);
    if (res.ok) router.refresh();
    else toast(res.error ?? "Lỗi", "error");
  }
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {[["", "Tất cả"], ["pending", "Chờ duyệt"], ["approved", "Đã duyệt"], ["featured", "Nổi bật"], ["hidden", "Ẩn"]].map(([k, v]) => (
          <button key={k} onClick={() => setFilter(k)} className={`chip ${filter === k ? "!border-brand-600 !text-brand-700" : ""}`}>{v}</button>
        ))}
      </div>
      <div className="space-y-3">
        {filtered.length === 0 && <div className="card p-8 text-center text-sm text-ink-400">Không có đánh giá.</div>}
        {filtered.map((r) => (
          <div key={r.id} className="card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-ink-900">
                  {"★".repeat(r.rating)}<span className="text-ink-200">{"★".repeat(5 - r.rating)}</span> — {r.customerName}
                </p>
                <p className="text-[12px] text-ink-400">{r.productName} • {formatDate(r.createdAt)}</p>
                <p className="mt-1.5 max-w-2xl text-sm text-ink-700">{r.content}</p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <StatusBadge label={r.status} tone={r.status === "approved" || r.status === "featured" ? "green" : r.status === "pending" ? "amber" : "gray"} />
                {r.status !== "approved" && <button onClick={() => act(r.id, "approved")} className="rounded-md bg-success-50 px-2.5 py-1 text-[12px] font-bold text-success-700 hover:bg-success-600 hover:text-white">Duyệt</button>}
                {r.status !== "featured" && <button onClick={() => act(r.id, "featured")} className="rounded-md bg-brand-50 px-2.5 py-1 text-[12px] font-bold text-brand-700 hover:bg-brand-700 hover:text-white">Nổi bật</button>}
                {r.status !== "hidden" && <button onClick={() => act(r.id, "hidden")} className="rounded-md bg-ink-50 px-2.5 py-1 text-[12px] font-bold text-ink-600 hover:bg-ink-200">Ẩn</button>}
                <ConfirmButton label="Xoá" onConfirm={async () => { await setReviewStatusAction(r.id, "hidden"); const res = await import("@/lib/actions").then((m) => m.deleteReviewAction(r.id)); if (res.ok) router.refresh(); }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* --------------------------------- Media -------------------------------- */

export function MediaSection({ rows }: { rows: { id: string; url: string; filename: string | null; createdAt: Date }[] }) {
  const [url, setUrl] = useState("");
  const [up, setUp] = useState(false);
  const { toast } = useShop();
  const router = useRouter();
  async function add() {
    if (!url.trim()) return;
    const res = await registerMediaAsset(url.trim());
    if (res.ok) {
      setUrl("");
      router.refresh();
      toast("Đã thêm vào thư viện media.");
    } else toast(res.error ?? "Lỗi", "error");
  }
  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUp(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (json.url) {
        await registerMediaAsset(json.url, file.name).then(() => router.refresh());
      }
    } finally {
      setUp(false);
    }
  }
  return (
    <div className="space-y-5">
      <div className="card flex flex-wrap items-end gap-3 p-4">
        <div className="min-w-64 flex-1">
          <Field label="Thêm ảnh theo URL"><input value={url} onChange={(e) => setUrl(e.target.value)} className="input" placeholder="https://…" /></Field>
        </div>
        <button onClick={add} className="btn-primary h-10">Thêm</button>
        <label className="btn-outline h-10 cursor-pointer">
          {up ? <Spinner /> : <Icon name="upload" className="h-4 w-4" />} Upload tệp
          <input type="file" accept="image/*" className="hidden" onChange={upload} />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {rows.map((m) => (
          <div key={m.id} className="card overflow-hidden">
            <div className="relative aspect-square bg-ink-50">
              <Image src={m.url} alt={m.filename ?? "media"} fill sizes="200px" className="object-contain p-2" />
            </div>
            <p className="truncate p-2 text-[11px] text-ink-500" title={m.url}>{m.url}</p>
          </div>
        ))}
      </div>
      <p className="text-[13px] text-ink-400">
        Gợi ý: sau khi kết nối Supabase Storage, thay /api/upload bằng upload vào bucket (products, articles, banners, brands, pages) — cấu trúc dữ liệu không đổi.
      </p>
    </div>
  );
}

/* --------------------------------- Settings -------------------------------- */

export function SettingsForm({ initial }: { initial: Record<string, string> }) {
  const [f, setF] = useState<Record<string, string>>(initial);
  const { saving, run } = useSave();
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));
  return (
    <div className="max-w-3xl space-y-5">
      <div className="card grid gap-4 p-4 sm:grid-cols-2">
        <div className="sm:col-span-2"><h3 className="text-sm font-bold text-ink-950">Thông tin doanh nghiệp</h3></div>
        <Field label="Tên website"><input value={f.site_name ?? ""} onChange={(e) => set("site_name", e.target.value)} className="input" /></Field>
        <Field label="Dòng thông báo (announcement)"><input value={f.announcement ?? ""} onChange={(e) => set("announcement", e.target.value)} className="input" /></Field>
        <Field label="Điện thoại tư vấn"><input value={f.phone ?? ""} onChange={(e) => set("phone", e.target.value)} className="input" /></Field>
        <Field label="Số điện thoại bán hàng" hint="Mỗi số một dòng"><textarea value={f.sales_phones ?? ""} onChange={(e) => set("sales_phones", e.target.value)} className="textarea" rows={3} /></Field>
        <Field label="Hotline CSKH"><input value={f.cs_kh ?? ""} onChange={(e) => set("cs_kh", e.target.value)} className="input" /></Field>
        <Field label="Zalo (link)"><input value={f.zalo ?? ""} onChange={(e) => set("zalo", e.target.value)} className="input" /></Field>
        <Field label="Email"><input value={f.email ?? ""} onChange={(e) => set("email", e.target.value)} className="input" /></Field>
        <div className="sm:col-span-2"><Field label="Địa chỉ"><input value={f.address ?? ""} onChange={(e) => set("address", e.target.value)} className="input" /></Field></div>
        <Field label="Giờ làm việc"><input value={f.hours ?? ""} onChange={(e) => set("hours", e.target.value)} className="input" /></Field>
        <Field label="Mã số thuế / GPKD"><input value={f.mst ?? ""} onChange={(e) => set("mst", e.target.value)} className="input" /></Field>
        <Field label="Facebook"><input value={f.facebook ?? ""} onChange={(e) => set("facebook", e.target.value)} className="input" /></Field>
      </div>
      <div className="card grid gap-4 p-4 sm:grid-cols-2">
        <div className="sm:col-span-2"><h3 className="text-sm font-bold text-ink-950">Đơn hàng &amp; thanh toán</h3></div>
        <Field label="Phí vận chuyển mặc định (VNĐ)" hint="0 = Miễn phí"><input type="number" value={f.shipping_fee ?? "0"} onChange={(e) => set("shipping_fee", e.target.value)} className="input" /></Field>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={f.track_stock === "1"} onChange={(e) => set("track_stock", e.target.checked ? "1" : "0")} className="accent-brand-700" />
            Bật theo dõi tồn kho (giảm kho khi đặt hàng)
          </label>
        </div>
        <Field label="Ngân hàng nhận chuyển khoản"><input value={f.bank_name ?? ""} onChange={(e) => set("bank_name", e.target.value)} className="input" placeholder="VD: Techcombank" /></Field>
        <Field label="Số tài khoản"><input value={f.bank_account ?? ""} onChange={(e) => set("bank_account", e.target.value)} className="input" /></Field>
        <Field label="Chủ tài khoản"><input value={f.bank_owner ?? ""} onChange={(e) => set("bank_owner", e.target.value)} className="input" /></Field>
      </div>
      <SaveBar saving={saving} onSave={() => run(() => saveSettingsAction(f), "/admin/settings", "Đã lưu cài đặt.")} backHref="/admin/settings" />
    </div>
  );
}
