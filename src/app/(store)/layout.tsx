import { getActiveCategories, getSettings } from "@/lib/data";
import { buildCategoryTree } from "@/lib/types";
import { StoreShell } from "@/components/store/store-shell";

// Public catalog/settings data is tag-invalidated after admin changes. Allow ISR
// to serve repeated crawls without opening a database connection for every visit.
export const revalidate = 600;

const NAV_ROOT_SLUGS = new Set([
  "camera-quan-sat",
  "day-cap-mang",
  "thiet-bi-mang",
  "thiet-bi-quang",
  "day-cap-quang",
  "tu-mang",
  "phu-kien-mang",
  "phu-kien-quang",
  "thang-mang-cap",
  "den-nang-luong-mat-troi",
]);

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [categories, settings] = await Promise.all([getActiveCategories(), getSettings()]);
  const rootIds = new Set(categories.filter((c) => NAV_ROOT_SLUGS.has(c.slug)).map((c) => c.id));
  const allowed = new Set(rootIds);
  let changed = true;
  while (changed) {
    changed = false;
    for (const c of categories) {
      if (c.parentId && allowed.has(c.parentId) && !allowed.has(c.id)) {
        allowed.add(c.id);
        changed = true;
      }
    }
  }
  const navCategories = categories.filter((c) => allowed.has(c.id));
  return <StoreShell categories={buildCategoryTree(navCategories)} settings={settings}>{children}</StoreShell>;
}
