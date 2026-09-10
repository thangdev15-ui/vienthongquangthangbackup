// Kept as a legacy endpoint so old cached clients receive a clear response.
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ error: "Tính năng so sánh sản phẩm đã được gỡ bỏ." }, { status: 410 });
}
