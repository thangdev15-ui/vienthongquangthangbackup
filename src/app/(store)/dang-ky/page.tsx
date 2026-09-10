"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon, Spinner } from "@/components/ui";
import { registerAction, syncWishlistAction } from "@/lib/actions";

export default function DangKyPage() {
  const [f, setF] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [state, setState] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState("");
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (f.password !== f.confirm) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    setState("loading");
    setError("");
    const res = await registerAction({ name: f.name, email: f.email, phone: f.phone, password: f.password });
    if (res.ok) {
      try {
        const raw = localStorage.getItem("qt_wishlist");
        const ids: string[] = raw ? JSON.parse(raw) : [];
        if (ids.length) await syncWishlistAction(ids);
      } catch {
        /* best effort */
      }
      router.push("/tai-khoan");
      router.refresh();
    } else {
      setState("idle");
      setError(res.error ?? "Đăng ký thất bại.");
    }
  }

  return (
    <div className="wrap py-10">
      <div className="mx-auto max-w-md">
        <div className="card p-6">
          <h1 className="mb-5 flex items-center gap-2 text-lg font-extrabold text-ink-950">
            <Icon name="user" className="h-5 w-5 text-brand-700" />
            Tạo tài khoản
          </h1>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label" htmlFor="rg-name">Họ và tên *</label>
              <input id="rg-name" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className="input" autoComplete="name" />
            </div>
            <div>
              <label className="label" htmlFor="rg-email">Email *</label>
              <input id="rg-email" type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className="input" autoComplete="email" />
            </div>
            <div>
              <label className="label" htmlFor="rg-phone">Số điện thoại</label>
              <input id="rg-phone" type="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} className="input" autoComplete="tel" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="rg-pass">Mật khẩu *</label>
                <input id="rg-pass" type="password" required minLength={6} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} className="input" autoComplete="new-password" />
              </div>
              <div>
                <label className="label" htmlFor="rg-confirm">Xác nhận *</label>
                <input id="rg-confirm" type="password" required value={f.confirm} onChange={(e) => setF({ ...f, confirm: e.target.value })} className="input" autoComplete="new-password" />
              </div>
            </div>
            {error && <p className="rounded-md bg-sale-50 px-3 py-2 text-[13px] font-medium text-sale-700">{error}</p>}
            <button type="submit" disabled={state === "loading"} className="btn-primary h-11 w-full">
              {state === "loading" && <Spinner />}
              Đăng ký
            </button>
          </form>
          <p className="mt-4 text-center text-[13px] text-ink-500">
            Đã có tài khoản?{" "}
            <Link href="/dang-nhap" className="font-semibold text-brand-700 hover:underline">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
