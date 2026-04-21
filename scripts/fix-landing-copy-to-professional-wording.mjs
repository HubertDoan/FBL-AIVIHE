// Bulk replace viết tắt / ngôn ngữ nội bộ -> ngôn ngữ chuyên nghiệp trên landing
// Theo ý kiến chuyên gia PGS.TS. Doãn Ngọc Hải (21/04/2026)
import fs from 'node:fs'

const files = [
  'src/components/landing/landing-access-channels-section.tsx',
  'src/components/landing/landing-consultation-request-form.tsx',
  'src/components/landing/landing-benefits-by-user-group-tabs.tsx',
  'src/components/landing/landing-doctor-application-form.tsx',
  'src/components/landing/landing-doctor-application-section.tsx',
  'src/components/landing/landing-ecosystem-care-journey.tsx',
  'src/components/landing/landing-information-journey-flow-diagram.tsx',
  'src/components/landing/landing-pain-points-central-section.tsx',
  'src/components/landing/landing-service-packages-section.tsx',
]

// Specific targeted replacements — USER-FACING strings only
const replacements = [
  // Service packages
  [`'BS gia đình theo dõi thông tin sức khỏe khi khách hàng cho phép'`, `'Bác sĩ gia đình theo dõi thông tin sức khỏe khi khách hàng cho phép'`],
  [`'Tự chọn BS — đánh giá sao'`, `'Tự chọn bác sĩ — đánh giá sao'`],
  [`'Tất cả gói BSGD'`, `'Tất cả gói Bác sĩ gia đình'`],
  [`'Nhật ký trị liệu và tiến triển PHCN'`, `'Nhật ký trị liệu và tiến triển phục hồi chức năng'`],
  [`'Tất cả gói PHCN'`, `'Tất cả gói Phục hồi chức năng'`],
  [`'BS chuyên khoa: khớp, tim mạch, nội tiết...'`, `'Bác sĩ chuyên khoa: khớp, tim mạch, nội tiết...'`],
  [`'Phối hợp BS gia đình + chuyên khoa'`, `'Phối hợp bác sĩ gia đình + chuyên khoa'`],
  // Access channels
  [`desc="BS gia đình gặp khách, đánh giá sức khỏe tổng thể và giới thiệu AIVIHE để theo dõi định kỳ, tư vấn dự phòng."`, `desc="Bác sĩ gia đình gặp khách, đánh giá sức khỏe tổng thể và giới thiệu AIVIHE để theo dõi định kỳ, tư vấn dự phòng."`],
  [`'Khách đến PK BS gia đình'`, `'Khách đến phòng khám bác sĩ gia đình'`],
  [`'BS khám, đánh giá'`, `'Bác sĩ khám, đánh giá'`],
  [`'BS theo dõi thông tin được chia sẻ và tư vấn dự phòng theo định kỳ'`, `'Bác sĩ theo dõi thông tin được chia sẻ và tư vấn dự phòng theo định kỳ'`],
  [`desc="KTV PHCN đánh giá chức năng vận động, chỉ định trị liệu. AIVIHE hỗ trợ ghi nhận nhật ký trị liệu, bài tập và tiến triển PHCN."`, `desc="Kỹ thuật viên phục hồi chức năng đánh giá chức năng vận động và chỉ định trị liệu. AIVIHE hỗ trợ ghi nhận nhật ký trị liệu, bài tập và tiến triển."`],
  [`'Khách đến PK PHCN'`, `'Khách đến phòng khám phục hồi chức năng'`],
  [`'Ghi nhận nhật ký trị liệu và tiến triển PHCN'`, `'Ghi nhận nhật ký trị liệu và tiến triển phục hồi chức năng'`],
  // Consultation form dropdown
  [`{ value: 'family-doctor', label: '👨‍⚕️ BS gia đình' }`, `{ value: 'family-doctor', label: '👨‍⚕️ Bác sĩ gia đình' }`],
  [`{ value: 'rehabilitation', label: '🏥 PHCN' }`, `{ value: 'rehabilitation', label: '🏥 Phục hồi chức năng' }`],
  // Benefits by user group
  [`'Chỉ số, bữa ăn, hoạt động, ghi chú đặc biệt — tất cả lưu vào hồ sơ KH tự động.'`, `'Chỉ số, bữa ăn, hoạt động, ghi chú đặc biệt — tất cả lưu vào hồ sơ khách hàng tự động.'`],
  [`'Kết nối với Daycare, PHCN, chuyên khoa — chuyển tuyến có thông tin đầy đủ.'`, `'Kết nối với Daycare, phục hồi chức năng và chuyên khoa — chuyển tuyến có thông tin đầy đủ.'`],
  [`label: 'PHCN',`, `label: 'Phục hồi chức năng',`],
  [`'Mỗi buổi trị liệu có ghi chép — KH, gia đình và BSGĐ đều thấy tiến triển theo thời gian.'`, `'Mỗi buổi trị liệu có ghi chép — khách hàng, gia đình và bác sĩ gia đình đều thấy tiến triển theo thời gian.'`],
  [`title: 'Phối hợp BSGĐ + gia đình',`, `title: 'Phối hợp bác sĩ gia đình + gia đình',`],
  [`'Chia sẻ tiến triển PHCN với bác sĩ gia đình và gia đình — chăm sóc liên tục không đứt gãy.'`, `'Chia sẻ tiến triển phục hồi chức năng với bác sĩ gia đình và gia đình — chăm sóc liên tục không đứt gãy.'`],
  // Doctor application form — dropdown labels
  [`{ value: 'general', label: 'BS Đa khoa' },`, `{ value: 'general', label: 'Bác sĩ Đa khoa' },`],
  [`{ value: 'oriental', label: 'BS Đông y' },`, `{ value: 'oriental', label: 'Bác sĩ Đông y' },`],
  [`{ value: 'specialist', label: 'BS Chuyên khoa' },`, `{ value: 'specialist', label: 'Bác sĩ Chuyên khoa' },`],
  // Doctor application form headings/placeholders
  [`<h3 className="text-xl font-bold text-gray-900">Đăng ký BS gia đình</h3>`, `<h3 className="text-xl font-bold text-gray-900">Đăng ký Bác sĩ gia đình</h3>`],
  [`placeholder="BS. Nguyễn Văn A"`, `placeholder="Bác sĩ Nguyễn Văn A"`],
  // Doctor application section heading
  [`Đăng ký BS gia đình`, `Đăng ký Bác sĩ gia đình`],
  // Ecosystem care journey
  [`desc="Gia đình, Daycare, bác sĩ gia đình và PHCN cùng phối hợp khi được phân quyền."`, `desc="Gia đình, Daycare, bác sĩ gia đình và phục hồi chức năng cùng phối hợp khi được phân quyền."`],
  // Information journey flow diagram
  [`label: 'Bác sĩ GĐ & PHCN',`, `label: 'Bác sĩ gia đình & Phục hồi chức năng',`],
  // Pain points
  [`text: 'Nhiều buổi PHCN nhưng không có hồ sơ tiến triển rõ ràng',`, `text: 'Nhiều buổi phục hồi chức năng nhưng không có hồ sơ tiến triển rõ ràng',`],
]

let totalChanges = 0
for (const f of files) {
  let content = fs.readFileSync(f, 'utf8')
  let fileChanges = 0
  for (const [find, to] of replacements) {
    if (content.includes(find)) {
      content = content.split(find).join(to)
      fileChanges++
      totalChanges++
    }
  }
  if (fileChanges > 0) {
    fs.writeFileSync(f, content, 'utf8')
    console.log(`${f}: ${fileChanges} changes`)
  }
}
console.log('TOTAL CHANGES:', totalChanges)
