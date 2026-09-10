"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon, Spinner } from "@/components/ui";
import { deleteAddressAction, logoutAction, saveAddressAction, updateProfileAction } from "@/lib/actions";
import { PROVINCES, type Address } from "@/lib/types";

export function ProfileForm({ name, phone }: { name: string; phone: string }) {
  const [f, setF] = useState({ name, phone: phone ?? "" });
  const [state, setState] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [error, setError] = useState("");
  const router = useRouter();
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    const res = await updateProfileAction(f);
    setState(res.ok ? "ok" : "err");
    setError(res.error ?? "");
    if (res.ok) router.refresh();
  }
  return (
    <form onSubmit={submit} className="grid max-w-md gap-4">
      <div>
        <label className="label" htmlFor="pf-name">Họ và tên</label>
        <input id="pf-name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className="input" />
      </div>
      <div>
        <label className="label" htmlFor="pf-phone">Số điện thoại</label>
        <input id="pf-phone" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} className="input" />
      </div>
      {error && <p className="text-[13px] font-medium text-sale-600">{error}</p>}
      {state === "ok" && <p className="text-[13px] font-medium text-success-600">Đã lưu thông tin.</p>}
      <button type="submit" disabled={state === "loading"} className="btn-primary w-fit">
        {state === "loading" && <Spinner />}
        Lưu thay đổi
      </button>
    </form>
  );
}

export function LogoutButton() {
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function logout() {
    setBusy(true);
    await logoutAction();
    router.push("/");
    router.refresh();
  }
  return (
    <button onClick={logout} disabled={busy} className="btn-outline h-10 border-sale-500/40 text-sale-600 hover:border-sale-600 hover:text-sale-700">
      {busy ? <Spinner /> : <Icon name="logout" className="h-4 w-4" />}
      Đăng xuất
    </button>
  );
}

export function AddressManager({ addresses }: { addresses: Address[] }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ label: "", name: "", phone: "", address: "", province: "TP. Hồ Chí Minh", district: "", ward: "" });
  const [editId, setEditId] = useState<string | undefined>(undefined);
  const [state, setState] = useState<"idle" | "loading">("idle");
  const router = useRouter();

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    const res = await saveAddressAction({ ...f, id: editId });
    setState("idle");
    if (res.ok) {
      setOpen(false);
      setEditId(undefined);
      setF({ label: "", name: "", phone: "", address: "", province: "TP. Hồ Chí Minh", district: "", ward: "" });
      router.refresh();
    }
  }

  return (
    <div className="max-w-2xl">
      {addresses.length > 0 && (
        <ul className="mb-4 space-y-2">
          {addresses.map((a) => (
            <li key={a.id} className="card flex items-start justify-between gap-3 p-4">
              <div>
                <p className="text-sm font-bold text-ink-900">
                  {a.label || "Địa chỉ"} — {a.name}
                </p>
                <p className="mt-0.5 text-[13px] text-ink-500">
                  {a.ward}, {a.district}, {a.province} — {a.address} • {a.phone}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => {
                    setEditId(a.id);
                    setF({ label: a.label ?? "", name: a.name, phone: a.phone, address: a.address, province: a.province ?? "TP. Hồ Chí Minh", district: a.district ?? "", ward: a.ward ?? "" });
                    setOpen(true);
                  }}
                  className="text-[12px] font-semibold text-brand-700 hover:underline"
                >
                  Sửa
                </button>
                <button
                  onClick={async () => {
                    await deleteAddressAction(a.id);
                    router.refresh();
                  }}
                  className="text-[12px] font-semibold text-sale-600 hover:underline"
                >
                  Xoá
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {open ? (
        <form onSubmit={save} className="card grid gap-3 p-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Nhãn</label>
            <input value={f.label} onChange={(e) => setF({ ...f, label: e.target.value })} className="input" placeholder="VD: Nhà công ty" />
          </div>
          <div>
            <label className="label">Người nhận *</label>
            <input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">Điện thoại *</label>
            <input required value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} className="input" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Địa chỉ *</label>
            <input required value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">Tỉnh / thành phố</label>
            <select value={f.province} onChange={(e) => setF({ ...f, province: e.target.value })} className="input">
              {PROVINCES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Quận / huyện</label>
            <input value={f.district} onChange={(e) => setF({ ...f, district: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">Phường / xã</label>
            <input value={f.ward} onChange={(e) => setF({ ...f, ward: e.target.value })} className="input" />
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <button type="submit" disabled={state === "loading"} className="btn-primary h-10">
              {state === "loading" && <Spinner />}
              Lưu địa chỉ
            </button>
            <button type="button" onClick={() => { setOpen(false); setEditId(undefined); }} className="btn-outline h-10">
              Huỷ
            </button>
          </div>
        </form>
      ) : (
        <button onClick={() => setOpen(true)} className="btn-outline h-10">
          <Icon name="plus" className="h-4 w-4" />
          Thêm địa chỉ
        </button>
      )}
    </div>
  );
}
