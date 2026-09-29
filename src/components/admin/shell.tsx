"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Icon, Spinner, StatusBadge, type IconName } from "@/components/ui";
import { useShop } from "@/components/store/shops";

const NAV: { href: string; label: string; icon: IconName }[] = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/products", label: "Sản phẩm", icon: "box" },
  { href: "/admin/categories", label: "Danh mục", icon: "layers" },
  { href: "/admin/brands", label: "Thương hiệu", icon: "tag" },
  { href: "/admin/orders", label: "Đơn hàng", icon: "cart" },
  { href: "/admin/customers", label: "Khách hàng", icon: "user" },
  { href: "/admin/articles", label: "Bài viết", icon: "file-text" },
  { href: "/admin/promotions", label: "Khuyến mãi", icon: "zap" },
  { href: "/admin/banners", label: "Banner", icon: "image" },
  { href: "/admin/reviews", label: "Đánh giá", icon: "star" },
  { href: "/admin/media", label: "Media", icon: "image" },
  { href: "/admin/settings", label: "Cài đặt", icon: "settings" },
];

export function AdminShell({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { toast } = useShop();
  const router = useRouter();

  function logout() {
    import("@/lib/actions").then((m) =>
      m.logoutAction().then(() => {
        toast("Đã đăng xuất.");
        router.push("/admin/login");
      }),
    );
  }

  return (
    <div className="flex min-h-screen bg-paper">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 transform border-r border-line bg-ink-950 transition-all lg:static lg:translate-x-0 ${collapsed ? "lg:w-[72px]" : "lg:w-60"} ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className={`flex h-14 items-center border-b border-white/10 px-4 ${collapsed ? "justify-center" : "gap-2.5"}`}>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-600 text-sm font-extrabold text-white">QT</span>
          <div className={`leading-tight ${collapsed ? "hidden" : ""}`}>
            <p className="text-[13px] font-bold text-white">Quang Thắng</p>
            <p className="text-[10px] font-medium uppercase tracking-wider text-ink-400">Admin CMS</p>
          </div>
          <button onClick={() => setOpen(false)} className="ml-auto text-ink-300 lg:hidden" aria-label="Đóng menu">
            <Icon name="x" className="h-5 w-5" />
          </button>
          <button onClick={() => setCollapsed((v) => !v)} className="ml-auto hidden text-ink-300 transition-colors hover:text-white lg:block" aria-label={collapsed ? "Mở rộng menu" : "Thu gọn menu"} title={collapsed ? "Mở rộng menu" : "Thu gọn menu"}>
            <Icon name={collapsed ? "chevron-right" : "chevron-left"} className="h-5 w-5" />
          </button>
        </div>
        <nav className={`space-y-0.5 p-3 ${collapsed ? "lg:px-2" : ""}`} aria-label="Menu quản trị">
          {NAV.map((n) => {
            const active = n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium transition-colors ${collapsed ? "lg:justify-center lg:px-2" : ""} ${
                  active ? "bg-brand-600 text-white" : "text-ink-300 hover:bg-white/5 hover:text-white"
                }`}
                title={collapsed ? n.label : undefined}
              >
                <Icon name={n.icon} className="h-4 w-4" />
                <span className={collapsed ? "lg:hidden" : ""}>{n.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className={`absolute bottom-0 left-0 right-0 space-y-0.5 border-t border-white/10 p-3 ${collapsed ? "lg:px-2" : ""}`}>
          <Link href="/" target="_blank" title={collapsed ? "Xem website" : undefined} className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium text-ink-300 hover:bg-white/5 hover:text-white ${collapsed ? "lg:justify-center lg:px-2" : ""}`}>
            <Icon name="external" className="h-4 w-4" />
            <span className={collapsed ? "lg:hidden" : ""}>Xem website</span>
          </Link>
          <button onClick={logout} title={collapsed ? "Đăng xuất" : undefined} className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium text-ink-300 hover:bg-white/5 hover:text-white ${collapsed ? "lg:justify-center lg:px-2" : ""}`}>
            <Icon name="logout" className="h-4 w-4" />
            <span className={collapsed ? "lg:hidden" : ""}>Đăng xuất</span>
          </button>
        </div>
      </aside>
      {open && <div className="fixed inset-0 z-40 bg-ink-950/50 lg:hidden" onClick={() => setOpen(false)} aria-hidden="true" />}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-white px-4 sm:px-6">
          <button onClick={() => setOpen(true)} className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-ink-50 lg:hidden" aria-label="Mở menu">
            <Icon name="menu" className="h-5 w-5" />
          </button>
          <h1 className="truncate text-base font-bold text-ink-950">{title}</h1>
          <div className="ml-auto flex items-center gap-2">{action}</div>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

/* ------------------------------- Data table ------------------------------- */

export type Column<T> = {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  value?: (row: T) => string | number;
};

export function AdminTable<T extends { id: string }>({
  columns,
  rows,
  onRowClick,
  toolbar,
  pageSize = 15,
}: {
  columns: Column<T>[];
  rows: T[];
  onRowClick?: (row: T, page: number) => void;
  toolbar?: React.ReactNode;
  pageSize?: number;
}) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(() => {
    if (typeof window === "undefined") return 1;
    const value = Number(new URLSearchParams(window.location.search).get("page"));
    return value > 0 ? value : 1;
  });
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<1 | -1>(1);

  function goToPage(next: number) {
    const value = Math.max(1, next);
    setPage(value);
    const url = new URL(window.location.href);
    if (value === 1) url.searchParams.delete("page");
    else url.searchParams.set("page", String(value));
    window.history.replaceState({}, "", url);
  }

  const filtered = useMemo(() => {
    if (!q.trim()) return rows;
    const needle = q.toLowerCase();
    return rows.filter((r) => JSON.stringify(r).toLowerCase().includes(needle));
  }, [rows, q]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.value) return filtered;
    return [...filtered].sort((a, b) => {
      const av = col.value!(a);
      const bv = col.value!(b);
      if (av === bv) return 0;
      return (av > bv ? 1 : -1) * sortDir;
    });
  }, [filtered, sortKey, sortDir, columns]);

  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const cur = Math.min(page, pages);
  const slice = sorted.slice((cur - 1) * pageSize, cur * pageSize);

  function toggleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === 1 ? -1 : 1));
    } else {
      setSortKey(key);
      setSortDir(1);
    }
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 border-b border-line p-3">
        <div className="relative">
          <Icon name="search" className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              goToPage(1);
            }}
            placeholder="Tìm kiếm…"
            aria-label="Tìm kiếm trong bảng"
            className="input h-9 w-64 pl-8"
          />
        </div>
        {toolbar}
        <span className="ml-auto text-[13px] text-ink-500">{sorted.length} bản ghi</span>
      </div>
      <div className="overflow-x-auto">
        <table className="table-admin min-w-[720px]">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key}>
                  {c.sortable ? (
                    <button onClick={() => toggleSort(c.key)} className="inline-flex items-center gap-1 hover:text-brand-700">
                      {c.label}
                      {sortKey === c.key && <Icon name="chevron-down" className={`h-3 w-3 ${sortDir === -1 ? "rotate-180" : ""}`} />}
                    </button>
                  ) : (
                    c.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="py-10 text-center text-ink-400">
                  Không có dữ liệu.
                </td>
              </tr>
            )}
            {slice.map((row) => (
              <tr key={row.id} onClick={onRowClick ? () => onRowClick(row, cur) : undefined} className={onRowClick ? "cursor-pointer" : ""}>
                {columns.map((c) => (
                  <td key={c.key}>{c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? "")}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div className="flex items-center justify-between border-t border-line p-3 text-sm">
          <button onClick={() => goToPage(cur - 1)} disabled={cur <= 1} className="btn-outline h-8 px-3 disabled:opacity-40">
            Trước
          </button>
          <span className="text-[13px] text-ink-500">
            Trang {cur} / {pages}
          </span>
          <button onClick={() => goToPage(cur + 1)} disabled={cur >= pages} className="btn-outline h-8 px-3 disabled:opacity-40">
            Sau
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------- Form helpers ------------------------------- */

export function Field({ label, children, hint, required }: { label: string; children: React.ReactNode; hint?: string; required?: boolean }) {
  return (
    <div>
      <span className="label">
        {label} {required && <span className="text-sale-600">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[12px] text-ink-400">{hint}</span>}
    </div>
  );
}

export function SaveBar({ saving, onSave, backHref, backLabel }: { saving: boolean; onSave: () => void; backHref: string; backLabel?: string }) {
  return (
    <div className="sticky bottom-4 z-20 mt-6 flex items-center gap-3 rounded-lg border border-line bg-white/95 p-3 shadow-lg backdrop-blur">
      <button type="button" onClick={onSave} disabled={saving} className="btn-primary h-10 px-6">
        {saving && <Spinner />}
        Lưu thay đổi
      </button>
      <Link href={backHref} className="btn-outline h-10">
        {backLabel ?? "Quay lại"}
      </Link>
    </div>
  );
}

export function ConfirmButton({ label, onConfirm, className = "text-sale-600" }: { label: string; onConfirm: () => void; className?: string }) {
  const [arm, setArm] = useState(false);
  const { toast } = useShop();
  if (arm) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <button onClick={() => { onConfirm(); setArm(false); }} className={`text-[12px] font-bold ${className}`}>
          Xác nhận xoá?
        </button>
        <button onClick={() => setArm(false)} className="text-[12px] text-ink-400">
          Huỷ
        </button>
      </span>
    );
  }
  return (
    <button onClick={() => setArm(true)} className={`text-[12px] font-semibold ${className} hover:underline`} onMouseUp={() => void toast}>
      {label}
    </button>
  );
}

export function StatusTone({ label, tone }: { label: string; tone: string }) {
  return <StatusBadge label={label} tone={tone} />;
}
