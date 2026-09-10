"use client";

import { useState } from "react";
import { Icon, Spinner } from "@/components/ui";
import { contactAction } from "@/lib/actions";

export function ContactForm() {
  const [f, setF] = useState({ name: "", phone: "", email: "", message: "" });
  const [state, setState] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setError("");
    const res = await contactAction(f);
    if (res.ok) {
      setState("ok");
      setF({ name: "", phone: "", email: "", message: "" });
    } else {
      setState("err");
      setError(res.error ?? "Có lỗi xảy ra.");
    }
  }

  if (state === "ok") {
    return (
      <div className="rounded-md border border-success-600/20 bg-success-50 p-4 text-sm text-success-700">
        <b>Cảm ơn bạn!</b> Chúng tôi đã nhận được lời nhắn và sẽ phản hồi sớm nhất qua số điện thoại / email bạn để lại.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <div>
        <label className="label" htmlFor="ct-name">Họ và tên *</label>
        <input id="ct-name" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className="input" />
      </div>
      <div>
        <label className="label" htmlFor="ct-phone">Số điện thoại</label>
        <input id="ct-phone" type="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} className="input" />
      </div>
      <div className="sm:col-span-2">
        <label className="label" htmlFor="ct-email">Email</label>
        <input id="ct-email" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className="input" />
      </div>
      <div className="sm:col-span-2">
        <label className="label" htmlFor="ct-msg">Nội dung *</label>
        <textarea id="ct-msg" required rows={5} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} className="textarea" placeholder="Bạn cần tư vấn / báo giá thiết bị gì?" />
      </div>
      {error && <p className="text-[13px] font-medium text-sale-600 sm:col-span-2">{error}</p>}
      <button type="submit" disabled={state === "loading"} className="btn-primary sm:col-span-2">
        {state === "loading" && <Spinner />}
        Gửi lời nhắn
      </button>
    </form>
  );
}
