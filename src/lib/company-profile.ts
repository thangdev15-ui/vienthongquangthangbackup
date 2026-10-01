export type ProfileFeature = { title: string; description: string };

export type CompanyProfile = {
  heroEyebrow: string; heroTitle: string; heroDescription: string; heroImage: string;
  introTitle: string; introDescription: string; introImage: string;
  solutionsTitle: string; solutionsDescription: string; solutions: ProfileFeature[];
  processTitle: string; process: ProfileFeature[];
  closingTitle: string; closingDescription: string;
};

export const DEFAULT_COMPANY_PROFILE: CompanyProfile = {
  heroEyebrow: "HỒ SƠ NĂNG LỰC | VIỄN THÔNG QUANG THẮNG",
  heroTitle: "Hạ tầng kết nối vững chắc, bắt đầu từ giải pháp đúng.",
  heroDescription: "Đồng hành cùng doanh nghiệp, nhà thầu và đơn vị thi công trong việc lựa chọn thiết bị, xây dựng hạ tầng mạng và triển khai hệ thống viễn thông phù hợp thực tế.",
  heroImage: "/quangthangshop.jpg",
  introTitle: "Năng lực được xây dựng từ từng nhu cầu thực tế",
  introDescription: "Viễn Thông Quang Thắng cung cấp thiết bị viễn thông, cáp mạng, cáp quang, thiết bị mạng và camera giám sát. Đội ngũ hỗ trợ từ khâu tư vấn chủng loại, kiểm tra tính tương thích đến phối hợp giao hàng cho công trình.",
  introImage: "/quanngthangnhanvien.jpeg",
  solutionsTitle: "Giải pháp cho hạ tầng kết nối",
  solutionsDescription: "Danh mục thiết bị và tư vấn được lựa chọn theo quy mô, môi trường lắp đặt và yêu cầu vận hành của từng dự án.",
  solutions: [
    { title: "Hạ tầng mạng nội bộ", description: "Cáp mạng, switch, Wi-Fi, tủ rack và phụ kiện cho văn phòng, cửa hàng, nhà xưởng." },
    { title: "Hệ thống camera", description: "Thiết bị camera, đầu ghi, lưu trữ và phụ kiện phục vụ nhu cầu giám sát." },
    { title: "Hạ tầng cáp quang", description: "Cáp quang, thiết bị quang và phụ kiện kết nối cho hệ thống truyền dẫn." },
    { title: "Vật tư công trình", description: "Thiết bị và vật tư viễn thông được tư vấn theo danh mục, số lượng và tiến độ dự án." },
  ],
  processTitle: "Một đầu mối đồng hành xuyên suốt",
  process: [
    { title: "Tiếp nhận nhu cầu", description: "Ghi nhận bản vẽ, số lượng, môi trường lắp đặt và tiến độ cần hàng." },
    { title: "Tư vấn cấu hình", description: "Đối chiếu thông số, khả năng tương thích và phương án thiết bị phù hợp." },
    { title: "Chuẩn bị & giao hàng", description: "Xác nhận hàng hóa, chứng từ và kế hoạch giao theo thỏa thuận." },
    { title: "Hỗ trợ sau bán", description: "Tiếp nhận yêu cầu kỹ thuật, bảo hành và hỗ trợ trong quá trình sử dụng." },
  ],
  closingTitle: "Cùng chuẩn bị giải pháp cho công trình của bạn",
  closingDescription: "Gửi danh mục thiết bị hoặc yêu cầu dự án để đội ngũ Quang Thắng trao đổi phương án phù hợp.",
};

export function parseCompanyProfile(raw: string | null | undefined): CompanyProfile {
  if (!raw) return DEFAULT_COMPANY_PROFILE;
  try {
    const value = JSON.parse(raw) as Partial<CompanyProfile>;
    return { ...DEFAULT_COMPANY_PROFILE, ...value,
      solutions: Array.isArray(value.solutions) ? value.solutions : DEFAULT_COMPANY_PROFILE.solutions,
      process: Array.isArray(value.process) ? value.process : DEFAULT_COMPANY_PROFILE.process,
    };
  } catch { return DEFAULT_COMPANY_PROFILE; }
}
