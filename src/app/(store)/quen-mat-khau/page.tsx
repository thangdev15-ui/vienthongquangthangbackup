"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon, Spinner } from "@/components/ui";
import { requestResetAction, resetPasswordAction } from "@/lib/actions";

export default function QuenMatKhauPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [demoToken, setDemoToken] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState("");
  const router = useRouter();

  async function step1(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setError("");
    const res = await requestResetAction(email);
    setState("idle");
    if (res.ok) {
      if (res.code === "NOT_FOUND") {
        setError("Không tìm thấy tài khoản với email này. Vui lòng kiểm tra lại hoặc đăng ký tài khoản mới.");
      } else {
        // Khi chưa kết nối email provider, hiển thị mã khôi phục trực tiếp.
        setDemoToken(res.code ?? "");
        setStep(2);
      }
    } else {
      setError(res.error ?? "Có lỗi xảy ra.");
    }
  }

  async function step2(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setError("");
    const res = await resetPasswordAction({ email, token, password });
    setState("idle");
    if (res.ok) router.push("/dang-nhap");
    else setError(res.error ?? "Có lỗi xảy ra.");
  }

  return (
    <div className="wrap py-10">
      <div className="mx-auto max-w-md">
        <div className="card p-6">
          <h1 className="mb-1 flex items-center gap-2 text-lg font-extrabold text-ink-950">
            <Icon name="shield" className="h-5 w-5 text-brand-700" />
            Quên mật khẩu
          </h1>
          <p className="mb-5 text-[13px] text-ink-500">Nhập email đăng ký để nhận mã khôi phục mật khẩu.</p>

          {step === 1 ? (
            <form onSubmit={step1} className="space-y-4">
              <div>
                <label className="label" htmlFor="rq-email">Email</label>
                <input id="rq-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
              </div>
              {error && <p className="rounded-md bg-sale-50 px-3 py-2 text-[13px] font-medium text-sale-700">{error}</p>}
              <button type="submit" disabled={state === "loading"} className="btn-primary h-11 w-full">
                {state === "loading" && <Spinner />}
                Gửi mã khôi phục
              </button>
            </form>
          ) : (
            <form onSubmit={step2} className="space-y-4">
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-[13px] text-amber-800">
                Hệ thống đang ở chế độ demo — mã khôi phục của bạn: <b className="text-base tracking-widest">{demoToken}</b>
                <span className="mt-1 block text-[12px]">(Sau khi kết nối Resend, mã sẽ được gửi qua email.)</span>
              </div>
              <div>
                <label className="label" htmlFor="rq-token">Mã khôi phục *</label>
                <input id="rq-token" required value={token} onChange={(e) => setToken(e.target.value.toUpperCase())} className="input uppercase" />
              </div>
              <div>
                <label className="label" htmlFor="rq-pass">Mật khẩu mới * (tối thiểu 6 ký tự)</label>
                <input id="rq-pass" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="input" autoComplete="new-password" />
              </div>
              {error && <p className="rounded-md bg-sale-50 px-3 py-2 text-[13px] font-medium text-sale-700">{error}</p>}
              <button type="submit" disabled={state === "loading"} className="btn-primary h-11 w-full">
                {state === "loading" && <Spinner />}
                Đặt lại mật khẩu
              </button>
            </form>
          )}
          <p className="mt-4 text-center text-[13px]">
            <Link href="/dang-nhap" className="font-semibold text-brand-700 hover:underline">
              ← Quay lại đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
