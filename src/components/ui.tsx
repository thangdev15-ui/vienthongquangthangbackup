import Link from "next/link";
import { formatVND, discountPercent } from "@/lib/types";

/* ---------------------------------- Icons ---------------------------------- */

const PATHS = {
  search: (<><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></>),
  cart: (<><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></>),
  user: (<><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>),
  heart: (<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />),
  compare: (<><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" /><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" /><path d="M7 21h10" /><path d="M12 3v18" /><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" /></>),
  phone: (<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />),
  mail: (<><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 5L2 7" /></>),
  pin: (<><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>),
  clock: (<><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>),
  menu: (<><line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" /></>),
  x: (<><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>),
  "chevron-down": (<polyline points="6 9 12 15 18 9" />),
  "chevron-right": (<polyline points="9 18 15 12 9 6" />),
  "chevron-left": (<polyline points="15 18 9 12 15 6" />),
  star: (<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />),
  check: (<polyline points="20 6 9 17 4 12" />),
  truck: (<><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" /><path d="M15 18H9" /><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14" /><circle cx="17" cy="18" r="2" /><circle cx="7" cy="18" r="2" /></>),
  shield: (<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />),
  headset: (<><path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm18 0h-3a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-5Z" /><path d="M21 11a9 9 0 0 0-18 0" /><path d="M21 16v2a4 4 0 0 1-4 4h-5" /></>),
  box: (<><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></>),
  tag: (<><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" /><circle cx="7.5" cy="7.5" r="1" /></>),
  grid: (<><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></>),
  "file-text": (<><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" /></>),
  image: (<><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></>),
  settings: (<><line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /><line x1="2" y1="14" x2="6" y2="14" /><line x1="10" y1="8" x2="14" y2="8" /><line x1="18" y1="16" x2="22" y2="16" /></>),
  logout: (<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>),
  edit: (<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />),
  trash: (<><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></>),
  plus: (<><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>),
  minus: (<line x1="5" y1="12" x2="19" y2="12" />),
  upload: (<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></>),
  eye: (<><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></>),
  zap: (<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />),
  copy: (<><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>),
  "arrow-right": (<><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></>),
  external: (<><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></>),
  filter: (<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />),
  home: (<><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>),
  layers: (<><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></>),
  message: (<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />),
  facebook: (<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />),
  youtube: (<><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" /><path d="m10 15 5-3-5-3z" /></>),
  wifi: (<><path d="M5 13a10 10 0 0 1 14 0" /><path d="M8.5 16.5a5 5 0 0 1 7 0" /><path d="M2 8.82a15 15 0 0 1 20 0" /><line x1="12" y1="20" x2="12.01" y2="20" /></>),
  sun: (<><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></>),
  server: (<><rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" /><line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" /></>),
  "alert-circle": (<><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>),
  "check-circle": (<><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>),
  "dashboard": (<><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></>),
  "credit-card": (<><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></>),
  cable: (<><path d="M4 20c6 0 4-8 10-8" /><path d="M20 4c-6 0-4 8-10 8" /><circle cx="4" cy="20" r="2" /><circle cx="20" cy="4" r="2" /></>),
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, className = "h-5 w-5", filled = false }: { name: IconName; className?: string; filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}

/* ---------------------------------- Stars ---------------------------------- */

export function Stars({ rating, className = "h-4 w-4" }: { rating: number; className?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`Đánh giá ${rating} trên 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Icon
          key={i}
          name="star"
          filled={i <= Math.round(rating)}
          className={`${className} ${i <= Math.round(rating) ? "text-amber-400" : "text-ink-200"}`}
        />
      ))}
    </span>
  );
}

/* ----------------------------------- Price ----------------------------------- */

export function Price({
  price,
  salePrice,
  priceType,
  size = "md",
  className = "",
}: {
  price: number | null;
  salePrice: number | null;
  priceType: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = { sm: "text-[15px]", md: "text-lg", lg: "text-2xl" };
  if (priceType !== "fixed" || price == null) {
    return (
      <span className={`font-bold tracking-wide text-ink-500 ${sizes[size]} ${className}`}>
        LIÊN HỆ
      </span>
    );
  }
  const off = discountPercent(price, salePrice);
  return (
    <span className={`inline-flex flex-wrap items-baseline gap-x-2 ${className}`}>
      <span className={`${sizes[size]} font-bold ${off ? "text-sale-600" : "text-ink-900"}`}>
        {formatVND(salePrice ?? price)}
      </span>
      {off != null && <s className="text-sm text-ink-400">{formatVND(price)}</s>}
    </span>
  );
}

/* --------------------------------- Breadcrumbs -------------------------------- */

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-[13px] text-ink-500">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link href="/" className="hover:text-brand-700">
            Trang chủ
          </Link>
        </li>
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <Icon name="chevron-right" className="h-3.5 w-3.5 text-ink-300" />
            {it.href ? (
              <Link href={it.href} className="hover:text-brand-700">
                {it.label}
              </Link>
            ) : (
              <span className="font-medium text-ink-800">{it.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/* --------------------------------- Pagination -------------------------------- */

export function Pagination({
  page,
  pages,
  hrefFor,
}: {
  page: number;
  pages: number;
  hrefFor: (p: number) => string;
}) {
  if (pages <= 1) return null;
  const nums: (number | "…")[] = [];
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - page) <= 1) nums.push(i);
    else if (nums[nums.length - 1] !== "…") nums.push("…");
  }
  return (
    <nav aria-label="Phân trang" className="mt-8 flex items-center justify-center gap-1.5">
      {page > 1 && (
        <Link href={hrefFor(page - 1)} className="btn-outline h-9 px-3" aria-label="Trang trước">
          <Icon name="chevron-left" className="h-4 w-4" />
        </Link>
      )}
      {nums.map((n, i) =>
        n === "…" ? (
          <span key={`e${i}`} className="px-1 text-ink-400">
            …
          </span>
        ) : (
          <Link
            key={n}
            href={hrefFor(n)}
            aria-current={n === page ? "page" : undefined}
            className={`h-9 min-w-9 rounded-md px-2 text-center text-sm font-semibold transition-colors ${
              n === page ? "bg-brand-700 text-white" : "border border-line bg-white text-ink-700 hover:border-brand-600 hover:text-brand-700"
            }`}
          >
            {n}
          </Link>
        ),
      )}
      {page < pages && (
        <Link href={hrefFor(page + 1)} className="btn-outline h-9 px-3" aria-label="Trang sau">
          <Icon name="chevron-right" className="h-4 w-4" />
        </Link>
      )}
    </nav>
  );
}

/* -------------------------------- EmptyState -------------------------------- */

export function EmptyState({
  icon = "box",
  title,
  description,
  action,
}: {
  icon?: IconName;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-ink-50 text-ink-400">
        <Icon name={icon} className="h-7 w-7" />
      </div>
      <h3 className="text-base font-bold text-ink-900">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-ink-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* --------------------------------- Skeletons -------------------------------- */

export function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-square animate-pulse bg-ink-100" />
      <div className="space-y-2 p-3">
        <div className="h-3 w-1/3 animate-pulse rounded bg-ink-100" />
        <div className="h-4 w-full animate-pulse rounded bg-ink-100" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-ink-100" />
        <div className="h-5 w-1/2 animate-pulse rounded bg-ink-100" />
      </div>
    </div>
  );
}

/* ------------------------------- Section header ------------------------------ */

export function SectionHeader({
  title,
  subtitle,
  href,
  hrefLabel,
  dark = false,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  hrefLabel?: string;
  dark?: boolean;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h2 className={`text-xl font-bold sm:text-2xl ${dark ? "text-white" : "text-ink-950"}`}>{title}</h2>
        {subtitle && <p className={`mt-1 text-sm ${dark ? "text-ink-300" : "text-ink-500"}`}>{subtitle}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className={`hidden shrink-0 items-center gap-1.5 text-sm font-semibold sm:inline-flex ${dark ? "text-brand-300 hover:text-brand-200" : "text-brand-700 hover:text-brand-800"}`}
        >
          {hrefLabel ?? "Xem tất cả"}
          <Icon name="arrow-right" className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

/* ---------------------------------- Spinner ---------------------------------- */

export function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
    </svg>
  );
}

/* ------------------------------- Status badge -------------------------------- */

const TONE_CLASSES: Record<string, string> = {
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  blue: "bg-brand-50 text-brand-700 border-brand-200",
  indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
  violet: "bg-violet-50 text-violet-700 border-violet-200",
  green: "bg-success-50 text-success-700 border-emerald-200",
  red: "bg-sale-50 text-sale-700 border-red-200",
  gray: "bg-ink-50 text-ink-600 border-line",
};

export function StatusBadge({ label, tone = "gray" }: { label: string; tone?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[12px] font-semibold whitespace-nowrap ${TONE_CLASSES[tone] ?? TONE_CLASSES.gray}`}>
      {label}
    </span>
  );
}
