import dotenv from "dotenv";
import { and, eq, isNull, or } from "drizzle-orm";

dotenv.config({ path: ".env.local" });

const apply = process.argv.includes("--apply");
let pool: { end: () => Promise<void> } | undefined;

function metadata(name: string) {
  return {
    seoTitle: `${name} chính hãng - Tư vấn lựa chọn | Quang Thắng`,
    seoDescription: `Khám phá ${name} tại Viễn Thông Quang Thắng. Xem thông số, lựa chọn giải pháp phù hợp và nhận tư vấn kỹ thuật, báo giá theo nhu cầu thực tế.`,
  };
}

async function main() {
  const [{ db, pool: connectedPool }, { categories }] = await Promise.all([
    import("../src/db"),
    import("../src/db/schema"),
  ]);
  pool = connectedPool;
  const missing = await db
    .select({ id: categories.id, name: categories.name, slug: categories.slug })
    .from(categories)
    .where(and(eq(categories.active, true), or(isNull(categories.seoTitle), isNull(categories.seoDescription))));

  console.log(`${apply ? "Applying" : "Dry run"}: ${missing.length} active categories missing SEO metadata.`);
  console.table(missing.slice(0, 15).map((category) => ({ slug: category.slug, ...metadata(category.name) })));
  if (!apply) return;

  for (const category of missing) {
    const values = metadata(category.name);
    await db
      .update(categories)
      .set(values)
      .where(eq(categories.id, category.id));
  }
  console.log(`Updated ${missing.length} category records without changing names, slugs, products, prices, or stock.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool?.end();
  });
