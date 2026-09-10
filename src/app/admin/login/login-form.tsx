"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon, Spinner } from "@/components/ui";
import { loginAction } from "@/lib/actions";

export function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState("");
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setError("");
    const res = await loginAction({ email, password });
    if (res.ok && res.redirect) {
      router.push(res.redirect);
      router.refresh();
    } else {
      setState("idle");
      setError(res.error ?? "Đăng nhập thất bại.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2">
          <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-600 text-xl font-extrabold text-white">QT</span>
          <h1 className="text-lg font-bold text-white">Quản trị Viễn Thông Quang Thắng</h1>
          <p className="text-[13px] text-ink-400">Đăng nhập để quản lý cửa hàng</p>
        </div>
        <form onSubmit={submit} className="card space-y-4 p-5">
          <div>
            <label className="label" htmlFor="ad-email">Email</label>
            <input id="ad-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="admin@…" autoComplete="username" />
          </div>
          <div>
            <label className="label" htmlFor="ad-pass">Mật khẩu</label>
            <input id="ad-pass" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="••••••••" autoComplete="current-password" />
          </div>
          {error && <p className="rounded-md bg-sale-50 px-3 py-2 text-[13px] font-medium text-sale-700">{error}</p>}
          <button type="submit" disabled={state === "loading"} className="btn-primary h-11 w-full">
            {state === "loading" && <Spinner />}
            Đăng nhập
          </button>
        </form>
        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[12px] text-ink-500">
          <Icon name="shield" className="h-3.5 w-3.5" />
          Chỉ tài khoản được phân quyền mới truy cập được
        </p>
      </div>
    </div>
  );
}
