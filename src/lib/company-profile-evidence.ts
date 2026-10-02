// Transcribed from PROFILE QUANG THẮNG 120126.pdf, PDF page 3 (printed page 2).
// Keep document facts separate from the store's editable sales contact settings.
export const COMPANY_PROFILE_FACTS = [
  ["Tên công ty", "Công ty Cổ phần Viễn thông Quang Thắng"],
  ["Tên tiếng Anh", "QUANG THANG TELECOMMUNICATION JOINT STOCK COMPANY"],
  ["Tên viết tắt", "QUANG THANG TELECOM JSC"],
  ["Mã số thuế", "0315327471"],
  ["Ngày hoạt động", "12/10/2018"],
  ["Người đại diện", "Võ Quốc Thắng"],
  ["Địa chỉ", "435/26 Thống Nhất, Phường Thông Tây Hội, TP. Hồ Chí Minh"],
  ["Hotline", "0941 74 6161"],
  ["Email trong hồ sơ", "quangthangtelecom@gmail.com"],
  ["Website", "vienthongquangthang.com"],
] as const;

const photo = (name: string, caption: string) => ({
  src: `/imported/company-profile/web/${name}.webp`, caption,
});

// PDF pages 9–12; photos supplied by the company in public/imported/company-profile.
export const COMPANY_PROFILE_PROJECTS = [
  {
    id: "ho-tram", category: "Hạ tầng mạng", title: "Cung cấp giải pháp mạng cho dự án Hồ Tràm",
    description: "Cung cấp giải pháp mạng cho dự án Hồ Tràm, với hình ảnh thiết bị, tủ mạng và hệ thống đấu nối thực tế trong hồ sơ doanh nghiệp.",
    images: [photo("giaiphaphotram3", "Hệ thống thiết bị trong tủ mạng tại dự án Hồ Tràm"), photo("giaphaphotram1", "Thiết bị và vật tư chuẩn bị cho dự án Hồ Tràm"), photo("giaiphaphotram2", "Đấu nối cáp mạng trong tủ rack tại Hồ Tràm")],
  },
  {
    id: "bai-xe", category: "Kiểm soát ra vào", title: "Giải pháp kiểm soát bãi xe thông minh",
    description: "Hình ảnh công trình bãi xe thông minh: khu vực kiểm soát ra vào, vật tư và tủ thiết bị phục vụ hệ thống.",
    images: [photo("kiemsoatbaixe1", "Triển khai hệ thống kiểm soát tại bãi xe"), photo("kiemsoatbaixe2", "Các làn kiểm soát ra vào bãi xe"), photo("kiemsoatbaixe3", "Vật tư phục vụ công trình bãi xe"), photo("kiemsoatbaixe4", "Tủ thiết bị và đấu nối hệ thống bãi xe")],
  },
  {
    id: "camera-can-ho", category: "Camera & an ninh", title: "Hệ thống camera giám sát căn hộ",
    description: "Cung cấp thiết bị và hạ tầng kết nối cho hệ thống camera giám sát căn hộ, từ chuẩn bị vật tư đến triển khai đường cáp và đấu nối.",
    images: [photo("cameragiamsatcanho1", "Thiết bị camera và vật tư cho công trình căn hộ"), photo("cameragiamsatcanho2", "Triển khai đường cáp cho hệ thống camera căn hộ"), photo("cameragiamsatcanho3", "Đấu nối cáp mạng phục vụ hệ thống giám sát")],
  },
  {
    id: "ket-noi", category: "Hoạt động đối tác", title: "Kết nối đối tác thể thao và du lịch",
    description: "Gắn kết đội ngũ và đối tác qua hoạt động thể thao, du lịch và giao lưu; nuôi dưỡng mối quan hệ hợp tác lâu dài bên cạnh hoạt động kinh doanh.",
    images: [photo("ketnoi3", "Giải tennis Quang Thắng Telecom Open lần 2"), photo("ketnoi1", "Giao lưu và hoạt động tập thể cùng đối tác"), photo("ketnoi2", "Chuyến du lịch kết nối đối tác")],
  },
];
