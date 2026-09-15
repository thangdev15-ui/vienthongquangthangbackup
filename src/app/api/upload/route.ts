import { randomBytes } from "node:crypto";
import { db } from "@/db";
import { mediaAssets } from "@/db/schema";
import { getAdminOrThrow } from "@/lib/auth";

export const dynamic = "force-dynamic";

const storageUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "admin-media";

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

export async function POST(req: Request) {
  const admin = await getAdminOrThrow();
  if (!admin) return Response.json({ error: "Không có quyền." }, { status: 403 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return Response.json({ error: "Không nhận được tệp." }, { status: 400 });
  if (file.size > 5 * 1024 * 1024) return Response.json({ error: "Tệp tối đa 5MB." }, { status: 400 });

  const ext = EXT_BY_MIME[file.type] ?? "jpg";
  const yearMonth = new Date().toISOString().slice(0, 7).replace("-", "");
  const filename = `${yearMonth}-${randomBytes(6).toString("hex")}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  if (!storageUrl || !serviceRoleKey) {
    return Response.json({ error: "Thiếu cấu hình Supabase Storage trên máy chủ." }, { status: 500 });
  }

  const authHeaders = { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` };
  await fetch(`${storageUrl}/storage/v1/bucket`, {
    method: "POST",
    headers: { ...authHeaders, "Content-Type": "application/json" },
    body: JSON.stringify({ id: bucket, name: bucket, public: true }),
  });
  await fetch(`${storageUrl}/storage/v1/bucket/${bucket}`, {
    method: "PUT",
    headers: { ...authHeaders, "Content-Type": "application/json" },
    body: JSON.stringify({ public: true }),
  });
  const upload = await fetch(`${storageUrl}/storage/v1/object/${bucket}/${filename}`, {
    method: "POST",
    headers: { ...authHeaders, "Content-Type": file.type || "application/octet-stream", "x-upsert": "true", "Cache-Control": "31536000" },
    body: buf,
  });
  if (!upload.ok) {
    console.error("Supabase Storage upload failed", upload.status, await upload.text().catch(() => ""));
    return Response.json({ error: "Không thể tải ảnh lên Supabase Storage." }, { status: 502 });
  }

  const url = `${storageUrl}/storage/v1/object/public/${bucket}/${filename}`;
  try {
    await db.insert(mediaAssets).values({ url, filename, mimeType: file.type, size: file.size });
  } catch {
    /* media registry is non-critical */
  }
  return Response.json({ url, data: [{ src: url }] });
}
