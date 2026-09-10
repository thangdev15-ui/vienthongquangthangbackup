import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const assets = [
  ["qt-cable-6-web-1.png", "https://vienthongquangthang.com/wp-content/uploads/2021/06/qt-cable-6-web-1.png"],
  ["ava1.png", "https://vienthongquangthang.com/wp-content/uploads/2022/05/ava1.png"],
  ["ava2.png", "https://vienthongquangthang.com/wp-content/uploads/2022/05/ava2.png"],
  ["av3.png", "https://vienthongquangthang.com/wp-content/uploads/2022/05/av3.png"],
];

async function main() {
  const dir = path.join(process.cwd(), "public/imported/old-site/company");
  await mkdir(dir, { recursive: true });
  for (const [name, url] of assets) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Cannot download ${url}: ${res.status}`);
    await writeFile(path.join(dir, name), Buffer.from(await res.arrayBuffer()));
    console.log(`[company-media] ${name}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
