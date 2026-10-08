"use client";

import { Icon } from "@/components/ui";

export default function StoreError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="wrap flex flex-col items-center justify-center py-24 text-center">
      <span className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-sale-50 text-sale-600">
        <Icon name="alert-circle" className="h-9 w-9" />
      </span>
      <h1 className="text-2xl font-extrabold text-ink-950">Đã có lỗi xảy ra</h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-ink-500">
        Chúng tôi đã ghi nhận sự cố. Vui lòng thử lại, hoặc liên hệ hotline 0947.106.161 nếu vấn đề vẫn tiếp diễn.
      </p>
      <button onClick={reset} className="btn-primary mt-6">
        Thử lại
      </button>
    </div>
  );
}
