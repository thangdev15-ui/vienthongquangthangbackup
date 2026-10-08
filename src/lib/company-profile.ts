export type ProfileFeature = { title: string; description: string };
export type ProfileCertificate = { title: string; description: string; image: string };

export type CompanyProfile = {
  heroEyebrow: string; heroTitle: string; heroDescription: string; heroImage: string;
  introTitle: string; introDescription: string; introImage: string;
  solutionsTitle: string; solutionsDescription: string; solutions: ProfileFeature[];
  certificates: ProfileCertificate[];
  processTitle: string; process: ProfileFeature[];
  closingTitle: string; closingDescription: string;
};

export const DEFAULT_COMPANY_PROFILE: CompanyProfile = {
  heroEyebrow: "HỒ SƠ NĂNG LỰC | VIỄN THÔNG QUANG THẮNG",
  heroTitle: "Hạ tầng kết nối vững chắc, bắt đầu từ giải pháp đúng.",
  heroDescription: "Đồng hành cùng doanh nghiệp, nhà thầu và đơn vị thi công trong việc lựa chọn thiết bị, xây dựng hạ tầng mạng và triển khai hệ thống viễn thông phù hợp thực tế.",
  heroImage: "/quangthangshop.jpg",
  introTitle: "Công ty Cổ phần Viễn thông Quang Thắng",
  introDescription: "Hoạt động từ ngày 12/10/2018, Công ty Cổ phần Viễn thông Quang Thắng chuyên cung cấp thiết bị và linh kiện điện tử – viễn thông, phục vụ xây dựng, nâng cấp và vận hành hạ tầng mạng, hệ thống truyền dẫn và an ninh công nghệ.\n\nDanh mục gồm cáp mạng, cáp quang, thiết bị mạng, thiết bị quang, tủ mạng, camera, đèn năng lượng mặt trời và phụ kiện. Quang Thắng kết hợp nguồn hàng ổn định với tư vấn kỹ thuật cho khách hàng cá nhân, doanh nghiệp và đơn vị thi công, đặc biệt tại TP. Hồ Chí Minh và các tỉnh lân cận.",
  introImage: "/quanngthangnhanvien.jpeg",
  solutionsTitle: "Giải pháp cho hạ tầng kết nối",
  solutionsDescription: "Danh mục thiết bị và tư vấn được lựa chọn theo quy mô, môi trường lắp đặt và yêu cầu vận hành của từng dự án.",
  solutions: [
    { title: "Hạ tầng mạng nội bộ", description: "Cáp mạng, switch, Wi-Fi, tủ rack và phụ kiện cho văn phòng, cửa hàng, nhà xưởng." },
    { title: "Hệ thống camera", description: "Thiết bị camera, đầu ghi, lưu trữ và phụ kiện phục vụ nhu cầu giám sát." },
    { title: "Hạ tầng cáp quang", description: "Cáp quang, thiết bị quang và phụ kiện kết nối cho hệ thống truyền dẫn." },
    { title: "Vật tư công trình", description: "Thiết bị và vật tư viễn thông được tư vấn theo danh mục, số lượng và tiến độ dự án." },
    { title: "Đèn năng lượng mặt trời", description: "Giải pháp chiếu sáng tiết kiệm năng lượng phục vụ nhu cầu sử dụng thực tế." },
    { title: "Tủ mạng & phụ kiện", description: "Tủ rack, phụ kiện quang và phụ kiện camera phục vụ kết nối, lắp đặt và bảo vệ hệ thống." },
  ],
  certificates: [
    { title: "Chứng nhận đại lý", description: "Giấy chứng nhận hợp tác và phân phối sản phẩm.", image: "/imported/certerficate/cer1.jpeg" },
    { title: "Chứng nhận chất lượng", description: "Hồ sơ xác nhận tiêu chuẩn và chất lượng sản phẩm.", image: "/imported/certerficate/cer2.jpeg" },
    { title: "Chứng nhận đối tác", description: "Ghi nhận hợp tác từ các thương hiệu đồng hành.", image: "/imported/certerficate/cer3.jpeg" },
    { title: "Giấy phép & xác nhận", description: "Tài liệu pháp lý và chứng nhận chuyên môn.", image: "/imported/certerficate/cer4.jpeg" },
    { title: "Chứng nhận phân phối", description: "Giấy chứng nhận đại lý phân phối chính thức.", image: "/imported/certerficate/cer5.jpeg" },
    { title: "Chứng nhận năng lực", description: "Chứng nhận và ghi nhận trong quá trình hoạt động.", image: "/imported/certerficate/cer6.jpeg" },
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
    // Upgrade the previously seeded copy without replacing custom admin edits.
    if (value.introTitle === "Năng lực được xây dựng từ từng nhu cầu thực tế") {
      value.introTitle = DEFAULT_COMPANY_PROFILE.introTitle;
    }
    if (value.introDescription === "Viễn Thông Quang Thắng cung cấp thiết bị viễn thông, cáp mạng, cáp quang, thiết bị mạng và camera giám sát. Đội ngũ hỗ trợ từ khâu tư vấn chủng loại, kiểm tra tính tương thích đến phối hợp giao hàng cho công trình.") {
      value.introDescription = DEFAULT_COMPANY_PROFILE.introDescription;
    }
    if (Array.isArray(value.solutions) && value.solutions.length === 4 && value.solutions.every((item, index) => item.title === DEFAULT_COMPANY_PROFILE.solutions[index].title && item.description === DEFAULT_COMPANY_PROFILE.solutions[index].description)) {
      value.solutions = DEFAULT_COMPANY_PROFILE.solutions;
    }
    return { ...DEFAULT_COMPANY_PROFILE, ...value,
      solutions: Array.isArray(value.solutions) ? value.solutions : DEFAULT_COMPANY_PROFILE.solutions,
      certificates: Array.isArray(value.certificates) ? value.certificates : DEFAULT_COMPANY_PROFILE.certificates,
      process: Array.isArray(value.process) ? value.process : DEFAULT_COMPANY_PROFILE.process,
    };
  } catch { return DEFAULT_COMPANY_PROFILE; }
}
