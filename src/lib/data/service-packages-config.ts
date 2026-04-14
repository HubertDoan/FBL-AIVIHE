// Single source of truth for AIVIHE service packages
// Exported as a constant array for use across dashboard, API, and registration flows

export interface ServicePackage {
  id: string // 'free' | 'family-doctor' | 'rehabilitation' | 'specialist'
  name: string
  packageType: number // 0=free, 1=family-doctor, 2=rehabilitation, 3=specialist
  price: string
  tagColor: string
  icon: string // lucide icon name
  shortDesc: string
  benefits: string[]
  details: string // longer paragraph about the package
}

export const SERVICE_PACKAGES: ServicePackage[] = [
  {
    id: 'free',
    packageType: 0,
    name: 'Cơ bản',
    price: 'Miễn phí',
    tagColor: 'green',
    icon: 'Heart',
    shortDesc: 'Hồ sơ sức khỏe + AI tổng hợp báo cáo',
    benefits: [
      'Lập hồ sơ sức khỏe cá nhân',
      'Cập nhật đơn thuốc, kết quả khám',
      'AI tổng hợp báo cáo đánh giá chung',
      'Không giới hạn thời gian sử dụng',
    ],
    details:
      'Gói Cơ bản miễn phí cho phép bạn lập hồ sơ sức khỏe, tải lên tài liệu y tế, và nhận báo cáo tổng hợp từ trợ lý AI. Phù hợp cho những người muốn bắt đầu quản lý sức khỏe chủ động.',
  },
  {
    id: 'family-doctor',
    packageType: 1,
    name: 'Bác sĩ gia đình',
    price: 'Thuê bao tháng + phí/lần tư vấn',
    tagColor: 'teal',
    icon: 'Stethoscope',
    shortDesc: 'BS gia đình theo dõi, tư vấn, phát hiện sớm',
    benefits: [
      'Tất cả quyền lợi gói Cơ bản',
      'Bác sĩ gia đình theo dõi sức khỏe liên tục',
      'Tư vấn ảnh hưởng lối sống, ăn uống, tuổi tác',
      'Phát hiện sớm, từ xa, dự phòng',
      'Tự chọn BS trong danh sách hoặc gợi ý',
      'Đánh giá BS sau mỗi lần sử dụng (1-5 sao)',
      'BS đến nhà hoặc tư vấn online',
    ],
    details:
      'Bác sĩ gia đình sẽ theo dõi sự thay đổi sức khỏe của bạn theo thời gian, đánh giá ảnh hưởng của lối sống, ăn uống, tuổi tác và môi trường. Phát hiện từ sớm, từ xa để dự phòng bệnh tật.',
  },
  {
    id: 'rehabilitation',
    packageType: 2,
    name: 'Phục hồi chức năng',
    price: 'Phí theo buổi trị liệu',
    tagColor: 'blue',
    icon: 'Activity',
    shortDesc: 'Trị liệu tại trung tâm hoặc tại nhà',
    benefits: [
      'Tất cả quyền lợi gói Bác sĩ gia đình',
      'Đánh giá chức năng toàn diện',
      'Kế hoạch trị liệu cá nhân hóa',
      'Trị liệu tại trung tâm Thong Dong hoặc tại nhà',
      'Theo dõi tiến triển theo từng buổi',
      'Bài tập cá nhân hóa hướng dẫn chi tiết',
    ],
    details:
      'Chương trình phục hồi chức năng do kỹ thuật viên PHCN đánh giá và xây dựng kế hoạch trị liệu phù hợp. Bạn có thể chọn trị liệu tại trung tâm Thong Dong Daycare hoặc tại nhà.',
  },
  {
    id: 'specialist',
    packageType: 3,
    name: 'Chuyên khoa sâu',
    price: 'Phí theo lần tư vấn',
    tagColor: 'purple',
    icon: 'Star',
    shortDesc: 'BS chuyên khoa: khớp, tim mạch, nội tiết...',
    benefits: [
      'Tất cả quyền lợi gói PHCN',
      'Bác sĩ chuyên khoa theo lĩnh vực của bạn',
      'Chuyên khoa: khớp, tim mạch, nội tiết, thần kinh...',
      'Được xem hồ sơ sức khỏe + tư vấn chuyên sâu',
      'Hỗ trợ đi khám tại bệnh viện đối tác',
      'Phối hợp BS gia đình + BS chuyên khoa',
    ],
    details:
      'Bác sĩ chuyên khoa sâu sẽ được phép xem hồ sơ sức khỏe của bạn (có phân quyền), tư vấn chuyên sâu và hỗ trợ khi cần đi khám tại bệnh viện. Ví dụ: bệnh khớp có BS khớp, bệnh tim mạch có BS tim mạch.',
  },
]

/** Lookup helper — returns undefined if not found */
export function getPackageById(id: string): ServicePackage | undefined {
  return SERVICE_PACKAGES.find((p) => p.id === id)
}
