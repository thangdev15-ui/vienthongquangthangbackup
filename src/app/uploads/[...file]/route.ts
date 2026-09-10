import { promises as fs } from "node:fs";
import path from "node:path";

export const dynamic = "force-dynamic";

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
};

export async function GET(_req: Request, { params }: { params: Promise<{ file: string[] }> }) {
  const { file } = await params;
  const relative = file.join("/");
  if (relative.includes("..") || path.isAbsolute(relative)) {
    return new Response("Not found", { status: 404 });
  }
  const target = path.join(process.cwd(), "data", "uploads", relative);
  try {
    const buf = await fs.readFile(target);
    const ext = path.extname(target).slice(1).toLowerCase();
    return new Response(new Uint8Array(buf), {
      headers: {
        "Content-Type": MIME[ext] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
