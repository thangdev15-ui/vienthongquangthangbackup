import dotenv from "dotenv";
import { promises as fs } from "node:fs";
import path from "node:path";
import { Pool } from "pg";

dotenv.config({ path: ".env.local" });
dotenv.config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required in .env.local");

const pool = new Pool({ connectionString: databaseUrl });
const OUT_DIR = path.join(process.cwd(), "public", "imported", "brand-logos");

function esc(input: string) {
  return input.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function initials(name: string) {
  const clean = name.replace(/COMMSCOPE\/AMP/i, "COMMSCOPE AMP").replace(/LS-PURENET/i, "LS");
  const words = clean.split(/[\s/&-]+/).filter(Boolean);
  return (words.length > 1 ? words.map((w) => w[0]).join("") : clean.slice(0, 3)).slice(0, 4).toUpperCase();
}

function svg(name: string, slug: string) {
  const mark = initials(name);
  const palette = [
    ["#1237d6", "#eaf0ff"],
    ["#0f766e", "#ecfdf5"],
    ["#9a3412", "#fff7ed"],
    ["#6d28d9", "#f5f3ff"],
    ["#be123c", "#fff1f2"],
    ["#0369a1", "#eff6ff"],
  ];
  const [fg, bg] = palette[Math.abs(slug.split("").reduce((s, ch) => s + ch.charCodeAt(0), 0)) % palette.length];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="160" viewBox="0 0 320 160" role="img" aria-label="${esc(name)}">
  <rect width="320" height="160" rx="22" fill="${bg}"/>
  <rect x="18" y="18" width="124" height="124" rx="20" fill="${fg}"/>
  <text x="80" y="93" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${mark.length > 2 ? 34 : 42}" font-weight="800" fill="white">${esc(mark)}</text>
  <text x="160" y="77" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="800" fill="#111827">${esc(name)}</text>
  <text x="160" y="105" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="700" fill="#64748b">AUTHORIZED PARTNER</text>
</svg>`;
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const brands = (await pool.query<{ id: string; name: string; slug: string }>("select id, name, slug from brands order by name")).rows;
  for (const b of brands) {
    const filename = `${b.slug}.svg`;
    await fs.writeFile(path.join(OUT_DIR, filename), svg(b.name, b.slug), "utf8");
    await pool.query("update brands set logo = $1 where id = $2", [`/imported/brand-logos/${filename}`, b.id]);
  }
  console.log(`Generated ${brands.length} brand logos.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
