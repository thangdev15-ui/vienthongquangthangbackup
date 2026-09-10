import { promises as fs } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { db } from "@/db";
import { mediaAssets } from "@/db/schema";
import { getAdminOrThrow } from "@/lib/auth";

export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");

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
  const target = path.join(UPLOAD_DIR, filename);
  const buf = Buffer.from(await file.arrayBuffer());
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(target, buf);

  const url = `/uploads/${filename}`;
  try {
    await db.insert(mediaAssets).values({ url, filename, mimeType: file.type, size: file.size });
  } catch {
    /* media registry is non-critical */
  }
  return Response.json({ url });
}
