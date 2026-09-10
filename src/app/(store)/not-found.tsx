import Link from "next/link";
import { Icon } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="wrap flex flex-col items-center justify-center py-24 text-center">
      <span className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-ink-50 text-ink-300">
        <Icon name="search" className="h-9 w-9" />
      </span>
      <h1 className="text-3xl font-extrabold text-ink-950">404 — Không tìm thấy trang</h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-ink-500">
        Trang hoặc sản phẩm bạn tìm kiếm không tồn tại hoặc đã bị di chuyển. Hãy quay lại trang chủ, tìm kiếm sản phẩm,
        hoặc gọi <a href="tel:0941746161" className="font-bold text-brand-700">0941.74.6161</a> để được hỗ trợ.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-primary">
          <Icon name="home" className="h-4 w-4" />
          Về trang chủ
        </Link>
        <Link href="/san-pham" className="btn-outline">
          Xem sản phẩm
        </Link>
        <a href="https://zalo.me/0941746161" target="_blank" rel="noopener" className="btn-zalo">
          <Icon name="message" className="h-4 w-4" />
          Chat Zalo
        </a>
      </div>
    </div>
  );
}
