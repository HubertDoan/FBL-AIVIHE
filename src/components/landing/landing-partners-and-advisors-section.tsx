import { Users, Building2, Stethoscope, Cpu } from 'lucide-react'

/**
 * Section giới thiệu đội ngũ cố vấn, đối tác và mạng lưới y tế
 * Thông tin từ thongdonglife.vn/ve-chung-toi
 */
export function PartnersAndAdvisorsSection() {
  return (
    <section className="py-6 bg-gradient-to-b from-white to-slate-50/50">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-2">
          Đội ngũ chuyên gia và đối tác
        </h2>
        <p className="text-center text-gray-500 mb-8 text-base">
          AIVIHE được xây dựng dựa trên nền tảng chuyên môn y tế và công nghệ hàng đầu
        </p>

        {/* Advisors */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <AdvisorCard
            name="PGS.TS. Doãn Ngọc Hải"
            title="Chuyên gia y tế — Chủ mô hình"
            desc="Nguyên Viện trưởng Viện Sức khỏe nghề nghiệp và Môi trường (Bộ Y tế). Kinh nghiệm sâu rộng trong y tế công cộng và hệ thống chăm sóc sức khỏe."
          />
          <AdvisorCard
            name="TS. Trần Thị Nhị Hà"
            title="Cố vấn cao cấp"
            desc="Nguyên Giám đốc Sở Y tế Hà Nội, Đại biểu Quốc hội khóa XV & XVI. Chuyên gia quản lý hệ thống y tế và chính sách sức khỏe."
          />
        </div>

        {/* Partners grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <PartnerCard
            icon={Building2}
            title="Đối tác công nghệ"
            items={[
              'Mirabo Global — VR/AR/MR & chuyển đổi số',
              'MediExpress — tiên phong IoT y tế, GoTrust Box, thiết bị đeo tay',
              'Thong Dong Tech — AI sức khỏe & nền tảng AIVIHE',
            ]}
          />
          <PartnerCard
            icon={Stethoscope}
            title="Mạng lưới y tế"
            items={[
              'Giám đốc các Sở Y tế phối hợp',
              'Trạm Y tế xã/phường đồng hành',
              'Bệnh viện Phục hồi chức năng',
            ]}
          />
          <PartnerCard
            icon={Users}
            title="Đối tác chiến lược"
            items={[
              'Bạch Niên Thiên Đức — chăm sóc dài hạn',
              'Bảo Minh — bảo hiểm sức khỏe',
              'Cộng đồng người cao tuổi địa phương',
            ]}
          />
        </div>
      </div>
    </section>
  )
}

function AdvisorCard({ name, title, desc }: {
  name: string; title: string; desc: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <h3 className="text-lg font-bold text-gray-900">{name}</h3>
      <p className="text-teal-600 font-medium text-sm mb-2">{title}</p>
      <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
    </div>
  )
}

function PartnerCard({ icon: Icon, title, items }: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  items: string[]
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="size-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
          <Icon className="size-5" />
        </div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="text-gray-600 text-sm flex items-start gap-1.5">
            <span className="text-teal-500 mt-1">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
