'use client'

import Image from 'next/image'
import { ExternalLink, Heart, Smartphone, Activity, ShieldCheck } from 'lucide-react'

/**
 * Section "Hợp tác MediExpress" — TRUE 50/50 split layout, image nhỏ hơn,
 * label "Hợp tác" nổi bật ở top.
 * Mục tiêu: tạo niềm tin ngay từ đầu trang — không cảm giác đi bệnh viện.
 */
export function LandingMediExpressHealthStationPartnershipSection() {
  return (
    <section className="py-10 bg-gradient-to-br from-slate-50 via-white to-blue-50 border-y border-slate-100">
      <div className="max-w-6xl mx-auto px-4">
        {/* Top banner — "Hợp tác" label nổi bật */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-blue-600 text-white rounded-full px-4 py-1.5 shadow-md mb-2">
            <span className="text-xs font-bold uppercase tracking-widest">🤝 Đối tác chiến lược</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900">
            AIVIHE × <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">MediExpress Vietnam</span>
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl mx-auto">
            Trạm đo AI + wearable — theo dõi sức khỏe <span className="font-semibold">tự nhiên, không cảm giác đi bệnh viện</span>
          </p>
        </div>

        {/* TRUE 50/50 split — image LEFT, benefits RIGHT */}
        <div className="grid md:grid-cols-2 gap-6 items-center">
          {/* LEFT: Image (smaller, constrained height) */}
          <div className="flex justify-center md:justify-end">
            <div className="relative max-w-xs w-full">
              <div className="absolute -inset-3 bg-gradient-to-br from-blue-200/40 to-teal-200/30 rounded-2xl blur-xl" />
              <div className="relative bg-white rounded-xl border border-slate-200 p-2 shadow-md">
                <Image
                  src="/medi-express-ai-medical-station.jpg"
                  alt="AI Medical Station"
                  width={400}
                  height={500}
                  className="w-full h-64 md:h-72 object-contain rounded-lg"
                />
                <div className="mt-2 flex items-center justify-between text-[11px] px-1">
                  <span className="text-slate-600 font-semibold">AI Medical Station</span>
                  <a
                    href="https://mediexpress.com.vn/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-0.5 text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    mediexpress.com.vn <ExternalLink className="size-2.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: 4 benefits stacked */}
          <div className="space-y-2.5">
            <BenefitRow icon={Heart} color="bg-rose-100 text-rose-600" title="Đo nhanh tại trung tâm" desc="Trạm AI đo HA, cân, cao, BMI, SpO₂... vài phút. Tự đồng bộ AIVIHE." />
            <BenefitRow icon={Smartphone} color="bg-blue-100 text-blue-600" title="Wearable đăng ký" desc="Đeo tay theo dõi nhịp tim, bước, giấc ngủ tại nhà — liên tục." />
            <BenefitRow icon={Activity} color="bg-teal-100 text-teal-600" title="Tự nhiên — không cảm giác BV" desc="Ngồi thoải mái, không xếp hàng, không cần hẹn lịch." />
            <BenefitRow icon={ShieldCheck} color="bg-emerald-100 text-emerald-600" title="Đối tác y tế chính thức" desc="MediExpress + Bệnh viện 199 — chuẩn y khoa, dữ liệu chính xác." />
          </div>
        </div>
      </div>
    </section>
  )
}

function BenefitRow({ icon: Icon, color, title, desc }: {
  icon: React.ComponentType<{ className?: string }>
  color: string
  title: string
  desc: string
}) {
  return (
    <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white border border-slate-200 hover:border-blue-300 transition-all">
      <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="size-4" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-slate-900 leading-tight">{title}</h3>
        <p className="text-xs text-slate-600 leading-snug mt-0.5">{desc}</p>
      </div>
    </div>
  )
}
