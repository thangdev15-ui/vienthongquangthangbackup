# SEO Audit Report - vienthongquangthang.com

**Ngày audit:** 10/11/2026  
**Phạm vi:** Google Search Console API, sitemap/robots, HTTP/canonical, mã Next.js, dữ liệu catalogue, Lighthouse desktop và đối chiếu lịch sử triển khai.  
**Lưu ý:** Đây là báo cáo chẩn đoán. Chưa thay đổi URL, redirect hay mã nguồn trong pha audit này.

## Kết luận điều hành

Traffic organic giảm mạnh là có thật và chủ yếu do **mất hiển thị sau quá trình chuyển đổi URL/website**, không phải vì CTR sụt hay robots.txt đang chặn toàn site.

| Giai đoạn | Click | Impressions | CTR | Vị trí TB |
| --- | ---: | ---: | ---: | ---: |
| 11/10-07/11/2026 | 247 | 8.452 | 2,92% | 9,97 |
| 13/09-10/10/2026 | 817 | 27.831 | 2,94% | 8,36 |
| Chênh lệch | **-69,8%** | **-69,6%** | gần như không đổi | giảm 1,61 vị trí |

Google vẫn crawl được trang chủ, robots.txt, sitemap và các URL đích quan trọng. Các bài từng mất hiển thị như `tong-hop-day-cap-mang-ngoai-troi`, so sánh Cat6/Cat6e và cáp đồng trục hiện đều có trạng thái **PASS / Submitted and indexed** qua URL Inspection. Vì vậy, không được đảo URL về cấu trúc WordPress cũ: đó sẽ là một lần migration thứ hai và có khả năng kéo dài tổn thất.

## Bằng chứng chính

### 1. Mốc giảm khớp với migration

Theo Search Console, click/hiển thị bắt đầu giảm từ tuần 21/09 và lao dốc trong tháng 10. Lịch sử repo cho thấy migration giao diện, chuyển namespace URL từ URL gốc WordPress sang `/tin-tuc/` và `/san-pham/`, cùng các đợt sửa canonical/redirect/sitemap diễn ra trong giai đoạn 09-10/2026. Đây là nguyên nhân được dữ liệu ủng hộ mạnh nhất; không phải kết luận rằng một commit đơn lẻ gây ra toàn bộ thiệt hại.

Các redirect cũ đã kiểm tra đang đúng, ví dụ URL bài cũ trả 301 tới URL `/tin-tuc/` tương ứng. Nhưng Google cần thời gian đánh giá lại cụm URL, tín hiệu liên kết và chất lượng trang đích.

### 2. Các trang từng kéo traffic mất visibility

Trong so sánh 28 ngày trước/sau (07/09-04/10 so với 05/10-01/11), một số URL giảm rất mạnh:

| URL đích hiện tại | Impressions trước -> sau | Click trước -> sau |
| --- | ---: | ---: |
| `/tin-tuc/cach-noi-day-mang-cap-quang-bi-dut` | 2.365 -> 313 | 39 -> 4 |
| `/tin-tuc/tong-hop-day-cap-mang-ngoai-troi` | 1.646 -> 4 | 86 -> 0 |
| `/tin-tuc/cap-mang-cat6-va-cap-mang-cat6e-khac-nhau-o-cho-nao` | 1.605 -> 22 | 65 -> 0 |
| `/tin-tuc/cach-lap-bo-chuyen-doi-quang-dien` | 1.677 -> 269 | 30 -> 2 |
| `/tin-tuc/cap-dong-truc-la-gi-cau-tao-cap-dong-truc` | 1.102 -> 0 | n/a -> 0 |

Những truy vấn mất hiển thị lớn gồm `dây cáp mạng cat6a commscope`, `bộ chuyển đổi quang điện`, `cáp đồng trục`. Đây là nhóm phải được phục hồi trước, thay vì dàn trải viết nội dung mới.

### 3. Crawl và index hiện tại

- `robots.txt`: HTTP 200, cho phép crawl toàn site ngoại trừ `/admin`, `/api`, `/tai-khoan`; sitemap khai báo đúng.
- `/sitemap.xml`: HTTP 200, 1.159 URL; Search Console tải lần gần nhất 09/11, không báo lỗi/cảnh báo.
- Các URL bài ưu tiên kiểm tra trực tiếp có canonical tự trỏ và trả HTTP 200.
- URL sản phẩm không tồn tại `/san-pham/seo-audit-url-khong-ton-tai` trả **HTTP 200 kèm `noindex`** thay vì 404. Đây là soft-404 thực tế, cần sửa ở tầng response trước khi render.
- `/llms.txt` trả HTML trang fallback thay vì text/plain. Đây chỉ ảnh hưởng điểm Agentic Browsing, **không phải nguyên nhân traffic Google sụt**.

### 4. Catalogue và trang danh mục

| Hạng mục | Kết quả |
| --- | ---: |
| Sản phẩm published | 960 |
| Sản phẩm tồn kho 0 | 845 (88,0%) |
| Sản phẩm dạng liên hệ (`price_type=contact`) | 787 (82,0%) |
| Sản phẩm chỉ có 1 ảnh | 959 |
| Danh mục active | 101 |
| Danh mục thiếu SEO title + description | 101/101 |
| Danh mục thiếu description nội dung | 65/101 |

Mẫu template danh mục đang dùng title/description fallback rất chung và không render phần mô tả danh mục hữu ích. Đây là khoảng trống lớn cho các truy vấn thương mại theo nhóm sản phẩm. Tỷ lệ hàng hết/tình trạng “liên hệ” quá cao cũng làm tín hiệu ý định mua và trải nghiệm landing page yếu hơn; cần xác nhận từ bộ phận bán hàng, không nên bịa giá hay trạng thái hàng.

### 5. Hiệu suất thực tế

Lighthouse desktop ngày 10/11: Performance **88**, Accessibility 92, Best Practices 100, SEO 100; FCP 0,6s, LCP 0,8s, TBT 0ms, CLS **0,211**. Kết quả tương thích với PageSpeed desktop người dùng cung cấp (Performance 87, LCP 0,9s, CLS 0,211).

Các điểm cần xử lý:

- LCP hero bị phát hiện muộn (resource load delay khoảng 836ms); ảnh hero đầu tiên chưa được ưu tiên rõ ràng.
- CLS 0,211, vượt ngưỡng tốt 0,1, chủ yếu liên quan footer render muộn.
- Có thể tiết kiệm khoảng 1,5 MiB ảnh: ảnh nhân viên và logo hãng đang gửi ảnh rất lớn cho vùng hiển thị nhỏ.
- Tồn tại JS không dùng/legacy và request render-blocking nhỏ. Đây là tối ưu hỗ trợ, không giải thích mức giảm hiển thị 70%.
- Route `/tin-tuc` có một lần kiểm tra tổng thời gian gần 3 giây. Cần giám sát TTFB liên tục theo cache-hit/cold start trước khi kết luận đây là nguyên nhân.

## Top 10 vấn đề và ưu tiên

| Ưu tiên | Vấn đề | Ảnh hưởng | Căn cứ |
| --- | --- | --- | --- |
| P0 | Mất tín hiệu migration/URL cluster | Rất cao | Impressions -69,6%, mốc giảm trùng migration |
| P0 | Soft-404 sản phẩm không tồn tại | Cao | URL giả trả 200 noindex |
| P0 | 101 danh mục không có SEO metadata | Cao | Audit DB/template |
| P1 | 88% sản phẩm hết hàng, 82% “liên hệ” | Cao | Audit catalogue |
| P1 | Landing category thiếu nội dung hữu ích | Cao | Template hiện tại |
| P1 | 5 bài từng tạo demand mất visibility | Cao | GSC page/query comparison |
| P1 | LCP hero discovery và ảnh quá khổ | Trung bình | Lighthouse/PageSpeed |
| P1 | CLS 0,211 | Trung bình | Lighthouse layout-shift audit |
| P2 | Liên kết bài liên quan chưa theo topical cluster | Trung bình | `getArticles` lấy bài mới nhất |
| P2 | `llms.txt` fallback HTML, Article dateModified không phản ánh cập nhật | Thấp | HTTP/source audit |

## Những điều không nên làm

1. Không đổi toàn bộ URL về URL WordPress cũ lúc này.
2. Không validate hàng loạt nhóm “404”, “redirect”, tag/feed cũ trong Search Console. Chỉ validate khi URL đích/lý do thực sự đã được sửa.
3. Không yêu cầu index từng URL bằng dịch vụ bên thứ ba hay Indexing API; Google Indexing API không dùng cho trang sản phẩm/bài viết thông thường.
4. Không thêm hàng loạt bài AI mỏng, backlink mua số lượng lớn, hoặc schema giá/tồn kho không đúng.

## Cập nhật triển khai sau audit - 10/11/2026

Các hạng mục an toàn đã được triển khai và xác minh trên production:

- Dynamic product URL không tồn tại hiện trả HTTP `404` thật thay cho `200 + noindex`.
- Trang danh mục có fallback metadata theo tên danh mục, mô tả hiển thị, `CollectionPage` và `BreadcrumbList` JSON-LD.
- Header/menu mobile đã có trang Hồ sơ năng lực.
- Trình biên tập bài viết đã có nút chèn internal/external link.
- Logo header và các logo thương hiệu thuộc nguồn nội bộ/CDN được chuyển sang Next Image.
- `sitemap.xml` đã submit lại; Sitemaps API ghi nhận tải lại ngày 10/11 với 0 warnings/0 errors.

Các thay đổi không thay thế việc viết metadata/nội dung riêng cho 101 danh mục, xác nhận data thương mại và cập nhật 5 URL từng mất traffic. Đây vẫn là các ưu tiên phục hồi tiếp theo.

## Giới hạn audit

Không có quyền truy cập GA4/raw server logs, nên không thể tách hoàn toàn organic khỏi direct/referral hoặc đo tỷ lệ Googlebot 5xx theo thời gian. Không có dữ liệu manual action/security report qua API đã dùng. Cần kiểm tra trực tiếp các mục này trong Search Console khi có giao diện tài khoản.

