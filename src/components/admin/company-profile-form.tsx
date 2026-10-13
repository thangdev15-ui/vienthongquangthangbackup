"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Field, SaveBar } from "@/components/admin/shell";
import { useShop } from "@/components/store/shops";
import { Icon, Spinner } from "@/components/ui";
import { saveCompanyProfileAction } from "@/lib/actions";
import type { CompanyProfile, ProfileCertificate, ProfileFeature, ProfileProject } from "@/lib/company-profile";

function ProfileImage({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useShop();
  async function upload(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 4 * 1024 * 1024) {
      toast("Chọn ảnh hợp lệ, tối đa 4MB.", "error");
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", body: form });
      const result = await response.json();
      if (!response.ok || !result.url) throw new Error(result.error || "Không tải được ảnh.");
      onChange(result.url);
    } catch (error) {
      toast(error instanceof Error ? error.message : "Không tải được ảnh.", "error");
    } finally { setUploading(false); }
  }
  return <Field label={label} hint="Dán URL ảnh hoặc tải ảnh lên. Tối đa 4MB.">
    <div className="flex gap-2"><input value={value} onChange={(event) => onChange(event.target.value)} className="input" />
      <label className="btn-outline shrink-0 cursor-pointer px-3">{uploading ? <Spinner /> : <Icon name="upload" className="h-4 w-4" />}<span className="sr-only">Tải ảnh</span><input type="file" accept="image/*" className="hidden" onChange={(event) => { void upload(event.target.files?.[0]); event.target.value = ""; }} /></label>
    </div>
    {value && <img src={value} alt="Xem trước" className="mt-2 h-24 w-40 rounded-md border border-line bg-white object-cover" />}
  </Field>;
}

function FeatureEditor({ title, rows, onChange }: { title: string; rows: ProfileFeature[]; onChange: (rows: ProfileFeature[]) => void }) {
  function update(index: number, key: keyof ProfileFeature, value: string) {
    onChange(rows.map((row, i) => i === index ? { ...row, [key]: value } : row));
  }
  return <section className="space-y-3 border-t border-line pt-5">
    <div className="flex items-center justify-between"><h3 className="text-sm font-bold text-ink-950">{title}</h3><button type="button" className="btn-outline h-8 px-2 text-xs" onClick={() => onChange([...rows, { title: "", description: "" }])}><Icon name="plus" className="h-4 w-4" />Thêm mục</button></div>
    {rows.map((row, index) => <div key={index} className="grid gap-2 rounded-md border border-line p-3 sm:grid-cols-[1fr_2fr_auto]"><input className="input" aria-label={title + " tiêu đề"} value={row.title} onChange={(e) => update(index, "title", e.target.value)} placeholder="Tiêu đề"/><textarea className="textarea min-h-10" aria-label={title + " mô tả"} value={row.description} onChange={(e) => update(index, "description", e.target.value)} placeholder="Mô tả"/><button type="button" className="btn-ghost h-10 px-2 text-sale-600" aria-label="Xoá mục" onClick={() => onChange(rows.filter((_, i) => i !== index))}><Icon name="trash" className="h-4 w-4" /></button></div>)}
  </section>;
}

function SolutionEditor({ rows, onChange }: { rows: ProfileFeature[]; onChange: (rows: ProfileFeature[]) => void }) {
  function update(index: number, key: keyof ProfileFeature, value: string) { onChange(rows.map((row, i) => i === index ? { ...row, [key]: value } : row)); }
  return <section className="space-y-3 border-t border-line pt-5"><div className="flex items-center justify-between"><h3 className="text-sm font-bold text-ink-950">Các giải pháp</h3><button type="button" className="btn-outline h-8 px-2 text-xs" onClick={() => onChange([...rows, { title: "", description: "", image: "", href: "/san-pham" }])}><Icon name="plus" className="h-4 w-4" />Thêm giải pháp</button></div>{rows.map((row, index) => <div key={index} className="grid gap-3 border border-line p-3 md:grid-cols-[12rem_1fr_auto]"><ProfileImage label={`Ảnh giải pháp ${index + 1}`} value={row.image || ""} onChange={(value) => update(index, "image", value)} /><div className="space-y-3"><Field label="Tiêu đề"><input className="input" value={row.title} onChange={(e) => update(index, "title", e.target.value)} /></Field><Field label="Mô tả"><textarea className="textarea" rows={3} value={row.description} onChange={(e) => update(index, "description", e.target.value)} /></Field><Field label="Link danh mục / sản phẩm"><input className="input" value={row.href || "/san-pham"} onChange={(e) => update(index, "href", e.target.value)} placeholder="/danh-muc/cap-mang" /></Field></div><button type="button" className="btn-ghost h-10 px-2 text-sale-600" aria-label="Xoá giải pháp" onClick={() => onChange(rows.filter((_, i) => i !== index))}><Icon name="trash" className="h-4 w-4" /></button></div>)}</section>;
}

function CertificateEditor({ rows, onChange }: { rows: ProfileCertificate[]; onChange: (rows: ProfileCertificate[]) => void }) {
  function update(index: number, key: keyof ProfileCertificate, value: string) { onChange(rows.map((row, i) => i === index ? { ...row, [key]: value } : row)); }
  return <section className="card space-y-4 p-4"><div className="flex items-center justify-between gap-3"><div><h2 className="text-sm font-bold text-ink-950">Chứng chỉ & giấy phép</h2><p className="mt-1 text-xs text-ink-500">Tải ảnh lên, đặt tiêu đề và mô tả cho từng chứng chỉ.</p></div><button type="button" className="btn-outline h-8 px-2 text-xs" onClick={() => onChange([...rows, { title: "", description: "", image: "" }])}><Icon name="plus" className="h-4 w-4" />Thêm chứng chỉ</button></div>{rows.map((row, index) => <div key={index} className="grid gap-3 border-t border-line pt-4 md:grid-cols-[11rem_1fr_auto]"><ProfileImage label={`Ảnh chứng chỉ ${index + 1}`} value={row.image} onChange={(value) => update(index, "image", value)} /><div className="space-y-3"><Field label="Tiêu đề"><input className="input" value={row.title} onChange={(e) => update(index, "title", e.target.value)} /></Field><Field label="Mô tả"><textarea className="textarea" rows={3} value={row.description} onChange={(e) => update(index, "description", e.target.value)} /></Field></div><button type="button" className="btn-ghost h-10 px-2 text-sale-600" aria-label="Xoá chứng chỉ" onClick={() => onChange(rows.filter((_, i) => i !== index))}><Icon name="trash" className="h-4 w-4" /></button></div>)}</section>;
}

function ImageListEditor({ title, images, onChange, limit = 8 }: { title: string; images: string[]; onChange: (images: string[]) => void; limit?: number }) {
  return <section className="card space-y-3 p-4"><div className="flex items-center justify-between"><h2 className="text-sm font-bold text-ink-950">{title}</h2><button type="button" className="btn-outline h-8 px-2 text-xs" onClick={() => images.length < limit && onChange([...images, ""])}><Icon name="plus" className="h-4 w-4" />Thêm ảnh</button></div>{images.map((image, index) => <div key={index} className="flex items-start gap-2"><div className="min-w-0 flex-1"><ProfileImage label={`Ảnh ${index + 1}`} value={image} onChange={(value) => onChange(images.map((item, i) => i === index ? value : item))} /></div><button type="button" className="btn-ghost mt-7 h-10 px-2 text-sale-600" aria-label="Xoá ảnh" onClick={() => onChange(images.filter((_, i) => i !== index))}><Icon name="trash" className="h-4 w-4" /></button></div>)}</section>;
}

function ProjectEditor({ rows, onChange }: { rows: ProfileProject[]; onChange: (rows: ProfileProject[]) => void }) {
  function update(index: number, key: keyof ProfileProject, value: string | string[]) { onChange(rows.map((row, i) => i === index ? { ...row, [key]: value } : row)); }
  return <section className="card space-y-4 p-4"><div className="flex items-center justify-between gap-3"><div><h2 className="text-sm font-bold text-ink-950">Dự án & hoạt động</h2><p className="mt-1 text-xs text-ink-500">Mỗi dự án có thể thêm tối đa 8 ảnh.</p></div><button type="button" className="btn-outline h-8 px-2 text-xs" onClick={() => onChange([...rows, { category: "", title: "", description: "", images: [] }])}><Icon name="plus" className="h-4 w-4" />Thêm dự án</button></div>{rows.map((row, index) => <div key={index} className="space-y-3 border-t border-line pt-4"><div className="flex justify-end"><button type="button" className="btn-ghost h-9 px-2 text-sale-600" onClick={() => onChange(rows.filter((_, i) => i !== index))}><Icon name="trash" className="h-4 w-4" />Xoá dự án</button></div><div className="grid gap-3 sm:grid-cols-2"><Field label="Nhóm dự án"><input className="input" value={row.category} onChange={(e) => update(index, "category", e.target.value)} /></Field><Field label="Tiêu đề"><input className="input" value={row.title} onChange={(e) => update(index, "title", e.target.value)} /></Field></div><Field label="Mô tả"><textarea className="textarea" rows={3} value={row.description} onChange={(e) => update(index, "description", e.target.value)} /></Field><ImageListEditor title="Ảnh dự án" images={row.images} onChange={(images) => update(index, "images", images)} /></div>)}</section>;
}

export function CompanyProfileForm({ initial }: { initial: CompanyProfile }) {
  const [profile, setProfile] = useState(initial);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { toast } = useShop();
  function set<K extends keyof CompanyProfile>(key: K, value: CompanyProfile[K]) { setProfile((current) => ({ ...current, [key]: value })); }
  async function save() {
    setSaving(true);
    try {
      const result = await saveCompanyProfileAction(profile);
      if (!result.ok) { toast(result.error || "Không lưu được nội dung.", "error"); return; }
      toast("Đã lưu hồ sơ năng lực.");
      router.refresh();
    } finally { setSaving(false); }
  }
  return <div className="max-w-5xl space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-ink-500">Chỉnh từng khối hiển thị trên trang hồ sơ năng lực.</p><a href="/ho-so-nang-luc" target="_blank" rel="noreferrer" className="btn-outline h-9"><Icon name="external" className="h-4 w-4"/>Xem trang</a></div>
    <section className="card grid gap-4 p-4 sm:grid-cols-2"><h2 className="sm:col-span-2 text-sm font-bold text-ink-950">Mở đầu</h2><Field label="Nhãn nhỏ"><input className="input" value={profile.heroEyebrow} onChange={(e) => set("heroEyebrow", e.target.value)} /></Field><Field label="Tiêu đề"><textarea className="textarea" rows={2} value={profile.heroTitle} onChange={(e) => set("heroTitle", e.target.value)} /></Field><div className="sm:col-span-2"><Field label="Mô tả"><textarea className="textarea" rows={3} value={profile.heroDescription} onChange={(e) => set("heroDescription", e.target.value)} /></Field></div><ProfileImage label="Ảnh mở đầu" value={profile.heroImage} onChange={(v) => set("heroImage", v)} /></section>
    <section className="card grid gap-4 p-4 sm:grid-cols-2"><h2 className="sm:col-span-2 text-sm font-bold text-ink-950">Giới thiệu doanh nghiệp</h2><Field label="Tiêu đề"><input className="input" value={profile.introTitle} onChange={(e) => set("introTitle", e.target.value)} /></Field><ProfileImage label="Ảnh giới thiệu" value={profile.introImage} onChange={(v) => set("introImage", v)} /><div className="sm:col-span-2"><Field label="Nội dung"><textarea className="textarea" rows={5} value={profile.introDescription} onChange={(e) => set("introDescription", e.target.value)} /></Field></div></section>
    <section className="card grid gap-4 p-4 sm:grid-cols-2"><h2 className="sm:col-span-2 text-sm font-bold text-ink-950">Hình ảnh các khu vực</h2><ProfileImage label="Ảnh CEO" value={profile.directorImage} onChange={(v) => set("directorImage", v)} /><ProfileImage label="Ảnh đội ngũ" value={profile.teamImage} onChange={(v) => set("teamImage", v)} /><ProfileImage label="Ảnh văn phòng" value={profile.officeImage} onChange={(v) => set("officeImage", v)} /><ProfileImage label="Ảnh cung ứng & giao hàng" value={profile.logisticsImage} onChange={(v) => set("logisticsImage", v)} /><div className="sm:col-span-2"><ProfileImage label="Ảnh nền liên hệ cuối trang" value={profile.closingImage} onChange={(v) => set("closingImage", v)} /></div></section>
    <section className="card space-y-4 p-4"><Field label="Tiêu đề phần giải pháp"><input className="input" value={profile.solutionsTitle} onChange={(e) => set("solutionsTitle", e.target.value)} /></Field><Field label="Mô tả"><textarea className="textarea" rows={2} value={profile.solutionsDescription} onChange={(e) => set("solutionsDescription", e.target.value)} /></Field><SolutionEditor rows={profile.solutions} onChange={(v) => set("solutions", v)} /></section>
    <ProjectEditor rows={profile.projects} onChange={(v) => set("projects", v)} />
    <CertificateEditor rows={profile.certificates} onChange={(v) => set("certificates", v)} />
    <section className="card space-y-4 p-4"><Field label="Tiêu đề quy trình"><input className="input" value={profile.processTitle} onChange={(e) => set("processTitle", e.target.value)} /></Field><FeatureEditor title="Các bước triển khai" rows={profile.process} onChange={(v) => set("process", v)} /></section>
    <ImageListEditor title="Ảnh các bước quy trình" images={profile.processImages} onChange={(v) => set("processImages", v)} limit={8} />
    <section className="card grid gap-4 p-4 sm:grid-cols-2"><h2 className="sm:col-span-2 text-sm font-bold text-ink-950">Liên hệ cuối trang</h2><Field label="Tiêu đề"><input className="input" value={profile.closingTitle} onChange={(e) => set("closingTitle", e.target.value)} /></Field><Field label="Mô tả"><textarea className="textarea" rows={2} value={profile.closingDescription} onChange={(e) => set("closingDescription", e.target.value)} /></Field></section>
    <SaveBar saving={saving} onSave={() => void save()} backHref="/admin" backLabel="Quản trị" />
  </div>;
}
