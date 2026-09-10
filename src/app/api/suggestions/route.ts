import { searchAll } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  if (q.length < 2) return Response.json({ products: [], categories: [] });
  const res = await searchAll(q);
  return Response.json({
    products: res.products.slice(0, 6).map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      image: p.image,
      price: p.price,
      salePrice: p.salePrice,
      priceType: p.priceType,
      categoryName: p.categoryName || "Sản phẩm",
    })),
    categories: res.categories.slice(0, 4).map((c) => ({ name: c.name, slug: c.slug })),
  });
}
