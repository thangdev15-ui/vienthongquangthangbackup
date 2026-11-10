import { NextResponse } from "next/server";
import { BASE_URL } from "@/lib/types";

export const dynamic = "force-static";

export function GET() {
  const content = `# Viễn Thông Quang Thắng

> Nhà cung cấp thiết bị viễn thông, hạ tầng mạng, cáp quang, camera và phụ kiện tại Việt Nam.

## Trang chính
- [Trang chủ](${BASE_URL}/): Danh mục thiết bị và thông tin tư vấn.
- [Hồ sơ năng lực](${BASE_URL}/ho-so-nang-luc): Thông tin doanh nghiệp, năng lực và dự án.
- [Sản phẩm](${BASE_URL}/san-pham): Danh mục sản phẩm.
- [Tin tức kỹ thuật](${BASE_URL}/tin-tuc): Hướng dẫn lựa chọn và sử dụng thiết bị.
- [Liên hệ](${BASE_URL}/lien-he): Kênh tư vấn kỹ thuật và báo giá.

## Chính sách
- [Hướng dẫn mua hàng](${BASE_URL}/huong-dan-mua-hang)
- [Giao nhận](${BASE_URL}/chinh-sach-giao-nhan)
- [Bảo hành](${BASE_URL}/chinh-sach-bao-hanh)

Thông tin giá, tồn kho và thông số cần được đối chiếu trên trang sản phẩm hoặc qua bộ phận tư vấn trước khi sử dụng.`;
  return new NextResponse(content, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=86400, s-maxage=86400" },
  });
}
