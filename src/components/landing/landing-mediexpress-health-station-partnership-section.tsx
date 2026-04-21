'use client'

import Image from 'next/image'
import { ExternalLink, Heart, Smartphone, Activity, ShieldCheck, Sparkles } from 'lucide-react'

/**
 * Section trang chủ giới thiệu hợp tác MediExpress Vietnam:
 * - Trạm đo sức khỏe AI Medical Station (đo HA, cân nặng, chiều cao, BMI...)
 * - Wearable devices đăng ký để theo dõi chỉ số liên tục
 * - Mục tiêu: chăm sóc tự nhiên, KHÔNG cảm giác đi bệnh viện
 * - Tăng niềm tin qua đối tác y tế chính thức
 */
export function LandingMediExpressHealthStationPartnershipSection() {
  return (
    <section className="py-12 bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 bg-white border border-blue-100 rounded-full px-3 py-1 mb-3 shadow-sm">
            <Sparkles className="size-3.5 text-blue-500" />
            <span className="text-xs font-semibold text-slate-700">Đối tác công nghệ y tế</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
            Hợp tác cùng <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">MediExpress Vietnam</span>
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Trạm đo sức khỏe AI thông minh + thiết bị wearable đăng ký —
            <span className="font-semibold text-slate-800"> giúp bạn theo dõi chỉ số sức khỏe tự nhiên, không cảm giác đi bệnh viện</span>.
          </p>
        </div>

        {/* Main content — image left + benefits right */}
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left: Image */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-blue-200/30 to-teal-200/30 rounded-3xl blur-2xl" />
            <div className="relative bg-white rounded-2xl border border-slate-200 p-3 shadow-lg">
              <Image
                src="/medi-express-ai-medical-station.jpg"
                alt="AI Medical Station — Trạm đo sức khỏe thông minh"
                width={600}
                height={800}
                className="w-full h-auto rounded-xl object-contain"
                priority={false}
              />
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">AI Medical Station</span>
                <a
                  href="https://mediexpress.com.vn/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold"
                >
                  mediexpress.com.vn <ExternalLink className="size-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Right: 4 Benefits */}
          <div className="space-y-3">
            <BenefitRow
              icon={Heart}
              color="bg-rose-100 text-rose-600"
              title="Đo nhanh tại trung tâm"
              desc="Trạm AI Medical Station đo huyết áp, cân nặng, chiều cao, BMI, SpO₂... trong vài phút. Kết quả tự động đồng bộ vào hồ sơ AIVIHE."
            />
            <BenefitRow
              icon={Smartphone}
              color="bg-blue-100 text-blue-600"
              title="Wearable devices đăng ký"
              desc="Đăng ký các thiết bị đeo tay theo dõi nhịp tim, bước chân, giấc ngủ, SpO₂ tại nhà — dữ liệu liên tục, không gián đoạn."
            />
            <BenefitRow
              icon={Activity}
              color="bg-teal-100 text-teal-600"
              title="Theo dõi tự nhiên — không cảm giác bệnh viện"
              desc="Đo tại không gian thân thiện, ngồi thoải mái. Không phải xếp hàng, không cần hẹn lịch — chỉ vài thao tác đơn giản."
            />
            <BenefitRow
              icon={ShieldCheck}
              color="bg-emerald-100 text-emerald-600"
              title="Đối tác y tế chính thức"
              desc="MediExpress Vietnam — đối tác công nghệ với Bệnh viện 199 và mạng lưới y tế. Thiết bị đạt chuẩn y khoa, dữ liệu chính xác."
            />
          </div>
        </div>

        {/* Bottom note */}
        <div className="mt-8 text-center max-w-2xl mx-auto">
          <p className="text-sm text-slate-500 italic">
            🏥 Sự kết hợp giữa <strong className="text-slate-700">AIVIHE</strong> (nền tảng hồ sơ sức khỏe số) +
            <strong className="text-slate-700"> Thiết bị y tế MediExpress</strong> (đo lường chính xác) +
            <strong className="text-slate-700"> Đội ngũ Thong Dong</strong> (chăm sóc tận tâm)
            — mang đến trải nghiệm chăm sóc sức khỏe hoàn chỉnh, gần gũi, đáng tin cậy.
          </p>
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
    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
      <div className={`size-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="size-5" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
        <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}
