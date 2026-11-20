import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { articles, categories, products } from "@/db/schema";

const cat6eContent = `
<h2>Cat6e là gì?</h2>
<p>Cat6e là tên thương mại thường dùng cho dòng dây mạng có thông số cao hơn Cat6 phổ thông. Tuy nhiên, tên gọi Cat6e không phải một chuẩn TIA độc lập như Cat6 hay Cat6A, vì vậy cần xem kỹ thông số của từng nhà sản xuất thay vì chỉ nhìn tên trên vỏ cáp.</p>
<h2>So sánh cáp mạng Cat6 và Cat6e</h2>
<table><thead><tr><th>Tiêu chí</th><th>Cat6</th><th>Cat6e</th></tr></thead><tbody><tr><td>Băng thông công bố</td><td>Thường 250 MHz</td><td>Tuỳ hãng, thường công bố cao hơn Cat6</td></tr><tr><td>Ứng dụng phù hợp</td><td>Camera IP, mạng gia đình, văn phòng</td><td>Mạng cần dư băng thông hoặc đi dây mới</td></tr><tr><td>Cách chọn</td><td>Đủ khi hệ thống và chiều dài tuyến phù hợp</td><td>Ưu tiên kiểm tra lõi đồng/CCA, tiết diện và chứng nhận</td></tr></tbody></table>
<h2>Nên chọn loại nào?</h2>
<p>Với camera IP hoặc mạng văn phòng thông thường, một cuộn Cat6 đúng thông số, lõi đồng và thi công chuẩn thường quan trọng hơn nhãn Cat6e. Khi cần đi dây mới cho nhiều năm sử dụng, hãy chọn sản phẩm có thông số rõ ràng, phù hợp môi trường lắp đặt và thiết bị mạng thực tế.</p>
<h2>Lưu ý khi mua dây mạng Cat6e</h2>
<ul><li>Kiểm tra vật liệu lõi: đồng nguyên chất phù hợp tuyến cần độ ổn định cao; CCA phù hợp nhu cầu và ngân sách khác.</li><li>Đối chiếu tiết diện lõi, chiều dài cuộn, vỏ PVC/PE/LSZH và nhu cầu trong nhà hay ngoài trời.</li><li>Không chỉ dựa vào tốc độ ghi trên nhãn; switch, card mạng, đầu bấm và thi công đều ảnh hưởng kết quả.</li></ul>
<p>Xem thêm <a href="/danh-muc/day-cap-mang">dây cáp mạng</a> và liên hệ Viễn Thông Quang Thắng để đối chiếu loại cáp phù hợp hệ thống.</p>`;

const brokenLatchContent = `
<h2>Đầu dây mạng bị hỏng hoặc gãy lẫy cài có sửa được không?</h2>
<p>Lẫy nhựa trên đầu RJ45 bị gãy khiến dây dễ tuột khỏi modem, switch hoặc máy tính. Cách bền vững nhất là cắt bỏ đầu cũ và bấm đầu RJ45 mới. Giải pháp chèn tạm chỉ phù hợp khi cần duy trì kết nối trong thời gian ngắn.</p>
<h2>Khi nào cần thay đầu dây mạng?</h2>
<ul><li>Dây liên tục mất kết nối khi rung hoặc chạm nhẹ vào đầu cắm.</li><li>Lẫy cài gãy, chân đồng bị oxy hoá hoặc đầu nhựa nứt.</li><li>Đầu cắm nóng, không nhận tốc độ mạng ổn định hoặc lỗi sau khi đổi cổng switch.</li></ul>
<h2>Cách bấm lại đầu RJ45</h2>
<ol><li>Chuẩn bị kìm bấm mạng, đầu RJ45 và dụng cụ tuốt vỏ cáp.</li><li>Cắt bỏ đầu hỏng, tuốt vỏ ngoài vừa đủ và giữ nguyên các cặp xoắn càng gần đầu cắm càng tốt.</li><li>Sắp xếp dây theo một chuẩn thống nhất ở hai đầu, thường là T568B: trắng cam, cam, trắng xanh lá, xanh dương, trắng xanh dương, xanh lá, trắng nâu, nâu.</li><li>Cắt đều đầu lõi, đẩy sát vào đầu RJ45 rồi dùng kìm bấm chặt.</li><li>Dùng thiết bị test cáp hoặc kiểm tra lại kết nối, tốc độ và độ ổn định.</li></ol>
<h2>Lưu ý để không phải thay lại</h2>
<p>Không bẻ gập dây sát đầu cắm, không kéo dây bằng đầu RJ45 và nên dùng đầu bấm phù hợp loại lõi đặc hoặc lõi mềm. Với đường dây âm tường, camera hoặc tuyến dài, nên kiểm tra cả hạt mạng, patch panel và switch thay vì chỉ thay đầu cắm.</p>
<p>Tham khảo <a href="/danh-muc/dau-bam-mang-rj45">đầu bấm mạng RJ45</a> và <a href="/danh-muc/day-cap-mang">dây cáp mạng</a> phù hợp trước khi thi công.</p>`;

async function main() {
  await db.transaction(async (tx) => {
    await tx.update(categories).set({
      seoTitle: "Dây cáp quang chính hãng | Singlemode, Multimode, 1FO-24FO",
      seoDescription: "Dây cáp quang Singlemode và Multimode cho mạng nội bộ, camera, FTTH và công trình. Tư vấn chọn số lõi, kiểu vỏ, khoảng cách truyền và báo giá.",
    }).where(eq(categories.slug, "day-cap-quang"));

    await tx.update(products).set({
      seoTitle: "Dây cáp mạng Cat6A CommScope 23AWG chống nhiễu LSZH 305m",
      seoDescription: "Dây cáp mạng Cat6A CommScope 23AWG chống nhiễu, vỏ LSZH, cuộn 305m. Phù hợp phòng server, data center và hạ tầng mạng doanh nghiệp.",
      updatedAt: new Date(),
    }).where(eq(products.slug, "cap-mang-commscope-cat6a-23awg-lszh-chong-nhieu-305m"));

    await tx.update(products).set({
      seoTitle: "Hộp Box Camera 11x11x5cm ren đồng ngoài trời | Báo giá",
      seoDescription: "Hộp box camera 11x11x5cm ren đồng, nhựa ABS, hỗ trợ bảo vệ jack kết nối và adapter camera khi lắp ngoài trời. Liên hệ để nhận báo giá.",
      updatedAt: new Date(),
    }).where(eq(products.slug, "hop-box-camera-11-11-5-ren-dong"));

    await tx.update(articles).set({
      title: "Cat6e là gì? So sánh cáp mạng Cat6 và Cat6e, nên chọn loại nào?",
      excerpt: "Cat6e là gì? So sánh Cat6 và Cat6e về thông số, ứng dụng, cách chọn dây mạng cho camera, gia đình và văn phòng.",
      seoTitle: "Cat6e là gì? So sánh Cat6 và Cat6e, nên chọn loại nào?",
      seoDescription: "So sánh cáp mạng Cat6 và Cat6e: thông số, ứng dụng, điểm cần kiểm tra khi mua và cách chọn dây phù hợp cho camera, gia đình, văn phòng.",
      content: cat6eContent,
      tags: "cat6e,cat6,cáp mạng,dây mạng",
    }).where(eq(articles.slug, "cap-mang-cat6-va-cap-mang-cat6e-khac-nhau-o-cho-nao"));

    await tx.update(articles).set({
      title: "Thay đầu dây mạng bị hỏng: Cách xử lý lẫy cài gãy và bấm lại RJ45",
      excerpt: "Hướng dẫn thay đầu dây mạng bị hỏng hoặc gãy lẫy cài: nhận biết lỗi, chuẩn bị dụng cụ, cách bấm lại đầu RJ45 và kiểm tra kết nối.",
      seoTitle: "Thay đầu dây mạng bị hỏng: Cách xử lý lẫy cài gãy RJ45",
      seoDescription: "Cách thay đầu dây mạng bị hỏng, gãy lẫy cài hoặc chập chờn. Hướng dẫn bấm lại đầu RJ45 đúng chuẩn và các lưu ý kiểm tra kết nối.",
      content: brokenLatchContent,
      tags: "đầu mạng rj45,bấm mạng,dây mạng,thi công mạng",
    }).where(eq(articles.slug, "dau-cap-mang-bi-gay-lay-cai"));
  });

  console.log("Updated five high-opportunity SEO records.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
