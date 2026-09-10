"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Icon, Spinner } from "@/components/ui";
import { loginAction, syncWishlistAction } from "@/lib/actions";

function LoginForm() {
  const sp = useSearchParams();
  const next = sp.get("next") ?? "/tai-khoan";
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
    if (res.ok) {
      try {
        const raw = localStorage.getItem("qt_wishlist");
        const ids: string[] = raw ? JSON.parse(raw) : [];
        if (ids.length) await syncWishlistAction(ids);
      } catch {
        /* wishlist sync is best-effort */
      }
      router.push(res.redirect ?? next);
      router.refresh();
    } else {
      setState("idle");
      setError(res.error ?? "Đăng nhập thất bại.");
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="card p-6">
        <h1 className="mb-5 flex items-center gap-2 text-lg font-extrabold text-ink-950">
          <Icon name="user" className="h-5 w-5 text-brand-700" />
          Đăng nhập
        </h1>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label" htmlFor="ln-email">Email</label>
            <input id="ln-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" autoComplete="username" />
          </div>
          <div>
            <label className="label" htmlFor="ln-pass">Mật khẩu</label>
            <input id="ln-pass" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input" autoComplete="current-password" />
          </div>
          {error && <p className="rounded-md bg-sale-50 px-3 py-2 text-[13px] font-medium text-sale-700">{error}</p>}
          <button type="submit" disabled={state === "loading"} className="btn-primary h-11 w-full">
            {state === "loading" && <Spinner />}
            Đăng nhập
          </button>
        </form>
        <div className="mt-4 flex items-center justify-between text-[13px]">
          <Link href="/quen-mat-khau" className="font-medium text-brand-700 hover:underline">
            Quên mật khẩu?
          </Link>
          <Link href="/dang-ky" className="font-semibold text-brand-700 hover:underline">
            Tạo tài khoản mới →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function DangNhapPage() {
  return (
    <div className="wrap py-10">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
