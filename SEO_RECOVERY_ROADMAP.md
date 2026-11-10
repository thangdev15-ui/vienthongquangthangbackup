# SEO Recovery Roadmap - vienthongquangthang.com

**Mục tiêu:** dừng mất visibility, củng cố migration hiện tại và phục hồi các landing page từng mang traffic. Không có mốc thời gian nào bảo đảm vì Google quyết định crawl/ranking; kỳ vọng hợp lý là thấy tín hiệu impressions ổn định sau 2-6 tuần kể từ khi các sửa P0 được deploy và crawl, còn phục hồi cạnh tranh thường cần 2-4 tháng.

## 0-7 ngày: dừng thất thoát kỹ thuật (P0)

1. Sửa response cho `/san-pham/[slug]` không tồn tại thành HTTP 404 thật, có trang 404 hữu ích; kiểm thử cả `curl -I`, trình duyệt và URL Inspection sau deploy.
2. Giữ cấu trúc `/tin-tuc/` và `/san-pham/`. Lập bảng mapping URL cũ -> URL mới cho các URL từng có click/backlink; mỗi URL cũ chỉ 301 một bước tới trang tương đương nhất.
3. Rà 50 URL cũ có traffic/backlink cao: không chain, không redirect homepage hàng loạt, không 200/noindex ở URL lẽ ra phải 404.
4. Bổ sung dữ liệu SEO cho 15 danh mục doanh thu/hiển thị cao nhất: title riêng, meta description riêng, đoạn mở đầu 250-500 từ, FAQ kỹ thuật có câu trả lời thật và internal link tới subcategory/sản phẩm còn kinh doanh.
5. Xác minh website đang deploy từ revision nào. Push hiện bị chặn vì remote GitHub không tồn tại/quyền không hợp lệ và Vercel token không hợp lệ; không thể coi thay đổi local là đã có trên production trước khi khôi phục luồng deploy.

**Tiêu chí xong:** URL giả 404 thật; sitemap 0 error; 15 category có metadata/nội dung; URL đích quan trọng vẫn PASS trong URL Inspection.

**Trạng thái 10/11/2026:** HTTP 404 thật, sitemap 0 errors, xử lý lỗi `5xx` trang chủ, chặn vòng lặp redirect product canonical và backfill metadata cho `101/101` category đã hoàn thành/live. Nội dung chuyên sâu theo danh mục, cập nhật 5 landing page mất traffic và data sales vẫn chưa hoàn tất.

## 8-30 ngày: phục hồi demand đã mất (P1)

1. Làm mới trước 5 URL mất impressions trong audit. Bổ sung bảng so sánh, tiêu chí chọn, ảnh/sơ đồ thật, FAQ theo truy vấn, liên kết sang danh mục và sản phẩm còn bán. Giữ slug/canonical.
2. Xây cụm nội dung cho 3 chủ đề đã mất demand: cáp mạng ngoài trời, Cat6/Cat6e/Commscope, cáp đồng trục/bộ chuyển đổi quang điện.
3. Liên kết nội bộ theo chủ đề: category -> guide -> product; guide -> 3-5 sản phẩm phù hợp; product -> category/guide. Không dùng danh sách bài mới nhất làm “liên quan” duy nhất.
4. Sales xác nhận cho SKU: còn hàng, có thể báo giá, thay thế hoặc ngừng bán. Trang ngừng bán vĩnh viễn phải 301 tới model thay thế gần nhất hoặc 410/404, không để “liên hệ” vô thời hạn.
5. Sửa ảnh hero/logo/ảnh nhân viên sang kích thước responsive hiện đại; preload một hero LCP duy nhất; xử lý footer shift để CLS < 0,1.

**KPI theo tuần:** impressions của 5 URL ưu tiên, click, position các truy vấn đã mất, tỷ lệ URL hợp lệ 200/404, LCP/CLS field data khi đủ mẫu. CTR không phải KPI gốc lúc này vì CTR đang ổn định.

## 31-60 ngày: tăng chất lượng trang thương mại (P1)

1. Hoàn thành metadata và mô tả cho 101 danh mục theo thứ tự demand/doanh thu.
2. Đưa tồn kho, giá hoặc cơ chế báo giá có thời hạn rõ ràng cho nhóm SKU chủ lực. Không phát schema Offer khi không có dữ liệu bán hợp lệ.
3. Nâng trang sản phẩm chủ lực: nhiều ảnh đúng tỷ lệ, thông số kỹ thuật đầy đủ, tài liệu datasheet/CO-CQ khi có, ứng dụng thực tế, FAQ và link sản phẩm tương thích.
4. Thêm `BreadcrumbList` JSON-LD nếu chưa có trong HTML production; giữ Product/Article schema chính xác.
5. Có tác giả/chuyên môn/đơn vị kiểm duyệt thực, ngày cập nhật đúng thực tế cho các guide kỹ thuật.

## 61-90 ngày: xây lại tín hiệu cạnh tranh (P2)

1. Xuất bản nội dung theo khoảng trống từ GSC: chỉ viết khi có intent, trang đích và sản phẩm/dịch vụ đáp ứng.
2. Tạo tài sản có thể được dẫn nguồn: catalogue kỹ thuật, bảng chọn cáp theo khoảng cách/môi trường, hướng dẫn thi công có ảnh công trình thật.
3. Xây đề cập/backlink chất lượng qua nhà sản xuất, đại lý, hồ sơ dự án, hiệp hội/ngành; không mua link số lượng lớn.
4. Theo dõi competitor SERP cho từng cụm thay vì dùng một chỉ số traffic ước tính từ công cụ bên thứ ba.

## Dashboard kiểm tra hằng tuần

- Search Console Performance: so sánh 7 ngày và 28 ngày với kỳ trước; tách theo query/page/device/country.
- Indexing: sitemap download, Page indexing, 5 URL phục hồi, URL 404 thật.
- Availability: uptime, 4xx/5xx, TTFB p75 và cache hit rate từ hosting/logs.
- Core Web Vitals: dữ liệu field, nhất là CLS và mobile LCP; không dùng một lần Lighthouse làm bằng chứng duy nhất.
- Commerce: số sản phẩm còn bán, tỷ lệ giá hợp lệ, số ảnh/SKU, conversion từ organic trong GA4.

## Quy tắc quyết định

- Chỉ cân nhắc đổi URL lần nữa sau ít nhất 4-6 tuần dữ liệu hậu-sửa và khi có mapping/backlink evidence rõ ràng. Mặc định là **không đổi lại**.
- Mỗi thay đổi phải deploy được, ghi revision/ngày, rồi theo dõi 14-28 ngày. Không sửa nhiều biến cùng lúc.
- Search Console phản ánh chậm; trạng thái “xác thực không thành công” của URL cũ có thể chỉ là Google vẫn thấy URL cũ redirect/404 như thiết kế, không tự động nghĩa là lỗi cần ép validate.

