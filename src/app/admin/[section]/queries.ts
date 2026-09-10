import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { products, reviews } from "@/db/schema";

export async function getReviewsAll() {
  const rows = await db
    .select({
      id: reviews.id,
      customerName: reviews.customerName,
      rating: reviews.rating,
      status: reviews.status,
      content: reviews.content,
      createdAt: reviews.createdAt,
      productName: products.name,
    })
    .from(reviews)
    .leftJoin(products, eq(reviews.productId, products.id))
    .orderBy(desc(reviews.createdAt))
    .limit(300);
  return rows.map((r) => ({ ...r, productName: r.productName ?? "Sản phẩm đã xoá" }));
}
