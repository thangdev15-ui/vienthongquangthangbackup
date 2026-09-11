import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/data";
import { Breadcrumbs } from "@/components/ui";

export const dynamic = "force-dynamic";

const ALLOWED: Record<string, string> = {
  "huong-dan-mua-hang": "Hướng dẫn mua hàng online",
  "hinh-thuc-thanh-toan": "Hình thức thanh toán",
  "chinh-sach-bao-hanh": "Chính sách bảo hành",
  "chinh-sach-doi-tra": "Chính sách đổi trả",
  "chinh-sach-giao-nhan": "Chính sách giao nhận",
  "chinh-sach-bao-mat": "Chính sách bảo mật",
  "doi-tac-chien-luoc": "Đối tác chiến lược",
};

const STATIC_PAGES: Record<string, { title: string; seoTitle: string; seoDescription: string; content: string }> = {
  "huong-dan-mua-hang": {
    title: "Hướng dẫn mua hàng online",
    seoTitle: "Hướng dẫn mua hàng online - Viễn Thông Quang Thắng",
    seoDescription: "Các bước đặt mua cáp mạng, thiết bị mạng, camera và phụ kiện viễn thông tại Viễn Thông Quang Thắng.",
    content: `<p><strong>Viễn Thông Quang Thắng</strong> hỗ trợ đặt hàng trực tuyến, đặt hàng qua Zalo/điện thoại và báo giá riêng cho đơn công trình. Quy trình dưới đây giúp bạn chọn đúng sản phẩm, xác nhận tồn kho và nhận hàng nhanh hơn.</p>
<h2>1. Chọn sản phẩm cần mua</h2>
<p>Bạn có thể tìm theo tên sản phẩm, mã SKU, thương hiệu hoặc đi từ danh mục như cáp mạng, cáp quang, switch PoE, camera quan sát, tủ rack và phụ kiện thi công. Với sản phẩm hiển thị giá, bạn có thể thêm trực tiếp vào giỏ. Với sản phẩm để giá “Liên hệ”, hãy gửi mã sản phẩm qua Zalo để được báo giá theo số lượng.</p>
<h2>2. Kiểm tra giỏ hàng</h2>
<p>Sau khi thêm sản phẩm, mở giỏ hàng để kiểm tra số lượng, chủng loại, đơn giá và ghi chú thêm nếu đơn hàng cần xuất hóa đơn VAT, giao công trình hoặc tách kiện.</p>
<h2>3. Điền thông tin giao hàng</h2>
<p>Tại trang thanh toán, nhập họ tên, số điện thoại, địa chỉ nhận hàng và phương thức thanh toán mong muốn. Đơn hàng công trình nên bổ sung thời gian cần hàng, yêu cầu chứng từ và người phụ trách nhận hàng.</p>
<h2>4. Xác nhận với nhân viên kinh doanh</h2>
<p>Nhân viên Quang Thắng sẽ liên hệ để xác nhận tồn kho, phí giao hàng, thời gian giao và phương án thanh toán. Đối với hàng cồng kềnh như cuộn cáp, tủ rack, thang máng cáp, phí vận chuyển được báo cụ thể trước khi giao.</p>
<h2>5. Nhận hàng và kiểm tra</h2>
<p>Khi nhận hàng, vui lòng kiểm tra tình trạng kiện hàng, số lượng, model và phụ kiện đi kèm. Nếu phát hiện móp méo, thiếu hàng hoặc sai model, hãy báo ngay cho bộ phận hỗ trợ để được xử lý kịp thời.</p>`,
  },
  "hinh-thuc-thanh-toan": {
    title: "Hình thức thanh toán",
    seoTitle: "Hình thức thanh toán - Viễn Thông Quang Thắng",
    seoDescription: "Các phương thức thanh toán khi mua thiết bị viễn thông tại Viễn Thông Quang Thắng.",
    content: `<p>Viễn Thông Quang Thắng hỗ trợ nhiều hình thức thanh toán linh hoạt cho khách lẻ, đại lý, nhà thầu và đơn vị thi công.</p>
<h2>Thanh toán tiền mặt</h2>
<p>Áp dụng khi mua hàng trực tiếp tại cửa hàng hoặc thanh toán cho nhân viên giao hàng theo thỏa thuận. Khách hàng nên kiểm tra đủ hàng hóa, chứng từ và phiếu bảo hành trước khi hoàn tất thanh toán.</p>
<h2>Thanh toán khi nhận hàng</h2>
<p>Đối với một số đơn nội thành hoặc đơn gửi qua đơn vị vận chuyển có hỗ trợ COD, bạn có thể thanh toán khi nhận hàng. Điều kiện áp dụng sẽ được xác nhận trước khi giao.</p>
<h2>Chuyển khoản ngân hàng</h2>
<p>Thông tin tài khoản được gửi sau khi đơn hàng được xác nhận. Khi chuyển khoản, vui lòng ghi rõ mã đơn hàng hoặc số điện thoại đặt hàng để kế toán đối chiếu nhanh.</p>
<h2>Thanh toán cho đơn công trình</h2>
<p>Với đơn hàng số lượng lớn, hàng đặt trước hoặc cần hợp đồng/hóa đơn VAT, đội ngũ kinh doanh sẽ thống nhất điều khoản thanh toán, thời gian giao và chứng từ liên quan trước khi triển khai.</p>`,
  },
  "chinh-sach-giao-nhan": {
    title: "Chính sách giao nhận",
    seoTitle: "Chính sách giao nhận - Viễn Thông Quang Thắng",
    seoDescription: "Chính sách giao hàng TP.HCM và toàn quốc của Viễn Thông Quang Thắng.",
    content: `<p>Viễn Thông Quang Thắng giao hàng toàn quốc. Hàng hóa được đóng gói theo quy cách phù hợp với từng nhóm sản phẩm và kèm chứng từ cần thiết như đơn hàng, phiếu xuất kho, phiếu bảo hành hoặc hóa đơn VAT khi khách hàng yêu cầu.</p>
<h2>Khu vực TP.HCM</h2>
<p>Với đơn hàng trong bán kính gần cửa hàng hoặc kho, chúng tôi ưu tiên giao nhanh trong ngày khi sản phẩm có sẵn. Một số đơn hàng đạt giá trị phù hợp có thể được hỗ trợ miễn phí giao hàng theo xác nhận của nhân viên kinh doanh.</p>
<h2>Tỉnh thành khác</h2>
<p>Đơn hàng toàn quốc được gửi qua chành xe, nhà xe hoặc đơn vị vận chuyển phù hợp. Thời gian giao thường phụ thuộc vào khu vực, loại hàng và lịch vận chuyển. Phí giao hàng cho hàng nặng/cồng kềnh như tủ rack, cuộn cáp, thang máng cáp sẽ được báo trước.</p>
<h2>Kiểm tra khi nhận hàng</h2>
<p>Khách hàng vui lòng kiểm tra ngoại quan kiện hàng, số lượng, model và phụ kiện trước khi ký nhận. Nếu kiện hàng bị móp méo, rách vỡ hoặc có dấu hiệu thất lạc, hãy chụp ảnh và liên hệ ngay để được hỗ trợ xử lý.</p>
<h2>Hàng đặt trước</h2>
<p>Với sản phẩm cần đặt trước, thời gian giao có thể dài hơn. Nhân viên phụ trách sẽ thông báo lịch dự kiến và cập nhật khi hàng về kho.</p>`,
  },
  "chinh-sach-bao-hanh": {
    title: "Chính sách bảo hành",
    seoTitle: "Chính sách bảo hành sản phẩm - Viễn Thông Quang Thắng",
    seoDescription: "Điều kiện bảo hành và quy trình hỗ trợ bảo hành sản phẩm chính hãng tại Viễn Thông Quang Thắng.",
    content: `<p>Viễn Thông Quang Thắng phân phối sản phẩm chính hãng và áp dụng bảo hành theo chính sách của nhà sản xuất hoặc nhà nhập khẩu. Sau thời hạn bảo hành, chúng tôi vẫn hỗ trợ kiểm tra, tư vấn phương án sửa chữa với chi phí hợp lý.</p>
<h2>Điều kiện bảo hành miễn phí</h2>
<p>Sản phẩm còn thời hạn bảo hành, lỗi phát sinh do nhà sản xuất, số serial/tem niêm phong còn nguyên vẹn và thông tin trên sản phẩm khớp với phiếu bảo hành hoặc chứng từ mua hàng.</p>
<h2>Hồ sơ cần chuẩn bị</h2>
<p>Khi yêu cầu bảo hành, vui lòng cung cấp mã đơn hàng, hóa đơn hoặc phiếu bảo hành, kèm mô tả lỗi và hình ảnh/video nếu có. Việc này giúp bộ phận kỹ thuật kiểm tra nhanh hơn.</p>
<h2>Trường hợp không bảo hành miễn phí</h2>
<p>Sản phẩm hết hạn bảo hành, mất tem/serial, phiếu bảo hành bị tẩy xóa, sản phẩm hư hỏng do dùng sai hướng dẫn, nguồn điện không phù hợp, rơi vỡ, vô nước, cháy nổ, thiên tai hoặc có dấu hiệu tự ý tháo lắp/sửa chữa.</p>
<h2>Quy trình tiếp nhận</h2>
<p>Khách hàng gửi sản phẩm về cửa hàng hoặc điểm tiếp nhận được hướng dẫn. Sau khi kiểm tra, Quang Thắng sẽ thông báo tình trạng, thời gian xử lý dự kiến và phương án hỗ trợ phù hợp.</p>`,
  },
  "chinh-sach-doi-tra": {
    title: "Chính sách đổi trả",
    seoTitle: "Chính sách đổi trả - Viễn Thông Quang Thắng",
    seoDescription: "Điều kiện đổi trả sản phẩm khi mua hàng tại Viễn Thông Quang Thắng.",
    content: `<p>Chính sách đổi trả được áp dụng nhằm bảo vệ quyền lợi khách hàng khi sản phẩm phát sinh lỗi do nhà sản xuất hoặc giao nhầm chủng loại so với đơn hàng đã xác nhận.</p>
<h2>Điều kiện đổi trả</h2>
<p>Sản phẩm còn nguyên tem, nguyên số serial, đầy đủ phụ kiện, bao bì và chứng từ mua hàng. Lỗi hoặc sai lệch cần được thông báo sớm sau khi nhận hàng để việc đối chiếu và xử lý thuận lợi.</p>
<h2>Không áp dụng đổi trả</h2>
<p>Không áp dụng với hàng đã cắt mét, bấm đầu, đặt theo yêu cầu riêng, hàng đã thi công lắp đặt hoặc sản phẩm hư hỏng do sử dụng sai kỹ thuật. Các trường hợp này sẽ được hỗ trợ theo chính sách bảo hành/kỹ thuật nếu đủ điều kiện.</p>
<h2>Phí vận chuyển đổi trả</h2>
<p>Nếu lỗi do Quang Thắng hoặc nhà sản xuất, chúng tôi sẽ hỗ trợ phương án đổi trả phù hợp. Nếu đổi trả phát sinh từ nhu cầu cá nhân và được chấp thuận, phí vận chuyển hai chiều có thể do khách hàng thanh toán.</p>
<h2>Thời gian xử lý</h2>
<p>Sau khi nhận lại hàng, bộ phận kỹ thuật sẽ kiểm tra tình trạng thực tế và phản hồi kết quả. Với trường hợp hoàn tiền, thời gian xử lý phụ thuộc vào phương thức thanh toán và xác nhận cuối cùng giữa hai bên.</p>`,
  },
};

export async function generateMetadata({ params }: { params: Promise<Record<string, string | undefined>> }): Promise<Metadata> {
  const p = await params;
  const slug = Object.values(p)[0] as string;
  const title = ALLOWED[slug];
  if (!title) return { title: "Trang không tồn tại" };
  const staticPage = STATIC_PAGES[slug];
  if (staticPage) return { title: staticPage.seoTitle, description: staticPage.seoDescription };
  const page = await getPageBySlug(slug);
  return { title: page?.seoTitle ?? title, description: page?.seoDescription ?? title };
}

export default async function CmsPage({ params }: { params: Promise<Record<string, string | undefined>> }) {
  const p = await params;
  const slug = Object.values(p)[0] as string;
  const fallbackTitle = ALLOWED[slug];
  if (!fallbackTitle) notFound();
  const staticPage = STATIC_PAGES[slug];
  const page = staticPage ?? await getPageBySlug(slug);
  if (!page) notFound();
  return (
    <div className="wrap py-6">
      <Breadcrumbs items={[{ label: page.title }]} />
      <h1 className="mt-3 text-2xl font-extrabold text-ink-950">{page.title}</h1>
      <div className="rich-content mt-5 max-w-3xl" dangerouslySetInnerHTML={{ __html: page.content }} />
    </div>
  );
}
