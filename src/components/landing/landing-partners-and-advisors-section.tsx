import { Cpu, Stethoscope, Building2 } from 'lucide-react'

/**
 * Section "Đội ngũ & đối tác" — chia 3 cụm theo ý kiến chuyên gia (PGS.TS. Doãn Ngọc Hải, 21/04/2026):
 *  1. Chuyên gia sáng lập & cố vấn
 *  2. Đối tác công nghệ
 *  3. Đối tác y tế & cộng đồng
 *
 * Cấu trúc rõ ràng giúp website cảm giác chỉnh chu, chuyên nghiệp hơn.
 */
export function PartnersAndAdvisorsSection() {
  return (
    <section className="py-6 bg-gradient-to-b from-white to-slate-50/50">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-6">
          <div className="inline-block text-xs font-bold text-teal-600 tracking-widest uppercase mb-2">Đội ngũ & đối tác</div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
            Được xây dựng bởi những người có chuyên môn
          </h2>
          <p className="text-slate-500 text-sm md:text-base max-w-2xl mx-auto">
            AIVIHE quy tụ chuyên gia y tế, đối tác công nghệ và mạng lưới y tế — cùng hướng đến chăm sóc sức khỏe người cao tuổi chất lượng cao.
          </p>
        </div>

        {/* ═══ CỤM 1 — Chuyên gia sáng lập & cố vấn ═══ */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-teal-700 uppercase tracking-widest mb-3 text-center">
            Chuyên gia sáng lập & cố vấn
          </h3>
          <div className="grid md:grid-cols-2 gap-5">
            <AdvisorCard
              name="PGS.TS. Doãn Ngọc Hải"
              title="Chuyên gia y tế — Chủ mô hình"
              desc="Nguyên Viện trưởng Viện Sức khỏe nghề nghiệp và Môi trường (Bộ Y tế). Kinh nghiệm sâu rộng trong y tế công cộng và hệ thống chăm sóc sức khỏe."
            />
            <AdvisorCard
              name="TS. Trần Thị Nhị Hà"
              title="Cố vấn cao cấp"
              desc="Nguyên Giám đốc Sở Y tế Hà Nội, Đại biểu Quốc hội khóa XV và XVI. Chuyên gia quản lý hệ thống y tế và chính sách sức khỏe."
            />
          </div>
        </div>

        {/* ═══ CỤM 2 — Đối tác công nghệ ═══ */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-blue-700 uppercase tracking-widest mb-3 text-center">
            Đối tác công nghệ
          </h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <PartnerItem
              icon={Cpu}
              accent="blue"
              name="Mirabo Global"
              desc="VR/AR/MR và chuyển đổi số"
            />
            <PartnerItem
              icon={Cpu}
              accent="blue"
              name="MediExpress"
              desc="Tiên phong IoT y tế — trạm AI Medical Hub, thiết bị đeo tay"
            />
            <PartnerItem
              icon={Cpu}
              accent="blue"
              name="Thong Dong Tech"
              desc="AI sức khỏe và phát triển nền tảng AIVIHE"
            />
          </div>
        </div>

        {/* ═══ CỤM 3 — Đối tác y tế & cộng đồng ═══ */}
        <div>
          <h3 className="text-sm font-bold text-rose-700 uppercase tracking-widest mb-3 text-center">
            Đối tác y tế & cộng đồng
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <PartnerItem icon={Stethoscope} accent="rose" name="Bệnh viện" desc="Phối hợp chuyển tuyến" compact />
            <PartnerItem icon={Stethoscope} accent="rose" name="Trạm y tế" desc="Xã/phường đồng hành" compact />
            <PartnerItem icon={Building2} accent="rose" name="Đơn vị chăm sóc dài hạn" desc="Bạch Niên Thiên Đức" compact />
            <PartnerItem icon={Building2} accent="rose" name="Bảo hiểm" desc="Bảo Minh — bảo hiểm sức khỏe" compact />
            <PartnerItem icon={Building2} accent="rose" name="Cộng đồng người cao tuổi" desc="Địa phương" compact />
          </div>
        </div>
      </div>
    </section>
  )
}

function AdvisorCard({ name, title, desc }: {
  name: string; title: string; desc: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-teal-100 p-5 hover:shadow-md transition-shadow">
      <h4 className="text-lg font-bold text-slate-900">{name}</h4>
      <p className="text-teal-600 font-medium text-sm mb-2">{title}</p>
      <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
    </div>
  )
}

function PartnerItem({ icon: Icon, accent, name, desc, compact }: {
  icon: React.ComponentType<{ className?: string }>
  accent: 'blue' | 'rose'
  name: string
  desc: string
  compact?: boolean
}) {
  const accentMap = {
    blue: { border: 'border-blue-100', bg: 'bg-blue-50', text: 'text-blue-600' },
    rose: { border: 'border-rose-100', bg: 'bg-rose-50', text: 'text-rose-600' },
  }
  const c = accentMap[accent]
  return (
    <div className={`bg-white rounded-xl border ${c.border} p-4 hover:shadow-sm transition-shadow`}>
      <div className="flex items-center gap-2 mb-1.5">
        <div className={`size-8 rounded-lg ${c.bg} ${c.text} flex items-center justify-center shrink-0`}>
          <Icon className="size-4" />
        </div>
        <h4 className={`font-semibold text-slate-900 ${compact ? 'text-sm' : 'text-base'} leading-tight`}>{name}</h4>
      </div>
      <p className={`text-slate-600 ${compact ? 'text-xs' : 'text-sm'} leading-snug pl-10`}>{desc}</p>
    </div>
  )
}
