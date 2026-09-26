import { randomBytes } from "node:crypto";
import { db } from "@/db";
import { mediaAssets } from "@/db/schema";
import { getAdminOrThrow } from "@/lib/auth";
import { uploadToR2 } from "@/lib/r2";

export const dynamic = "force-dynamic";

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
  if (file.size > 4 * 1024 * 1024) return Response.json({ error: "Tệp tối đa 4MB để tương thích giới hạn upload của Vercel." }, { status: 413 });

  const ext = EXT_BY_MIME[file.type] ?? "jpg";
  const yearMonth = new Date().toISOString().slice(0, 7).replace("-", "");
  const filename = `${yearMonth}-${randomBytes(6).toString("hex")}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  let url: string;
  try {
    url = await uploadToR2({ key: `uploads/${filename}`, body: buf, contentType: file.type });
  } catch (error) {
    console.error("R2 upload failed", error);
    return Response.json({ error: "Không thể tải ảnh lên Cloudflare R2." }, { status: 502 });
  }
  try {
    await db.insert(mediaAssets).values({ url, filename, mimeType: file.type, size: file.size });
  } catch {
    /* media registry is non-critical */
  }
  return Response.json({ url, data: [{ src: url }] });
}
