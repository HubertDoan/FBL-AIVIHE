'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight, ShieldCheck, FileText, TrendingUp, Users,
  Lock, CheckCircle, AlertTriangle, Sparkles,
} from 'lucide-react'
import { CommitmentCard } from '@/components/landing/landing-commitment-card'
import { HowAiHelpsSection } from '@/components/landing/landing-how-ai-helps-section'
import { EcosystemCareJourney } from '@/components/landing/landing-ecosystem-care-journey'
import { PartnersAndAdvisorsSection } from '@/components/landing/landing-partners-and-advisors-section'
import { IotHealthDevicesSection } from '@/components/landing/landing-iot-health-devices-section'
import { ServicePackagesSection } from '@/components/landing/landing-service-packages-section'
import { LandingConsultationRequestForm } from '@/components/landing/landing-consultation-request-form'
import { LandingAccessChannelsSection } from '@/components/landing/landing-access-channels-section'
import { LandingDoctorApplicationSection } from '@/components/landing/landing-doctor-application-section'
import { LandingPainPointsCentralSection } from '@/components/landing/landing-pain-points-central-section'
import { LandingBenefitsByUserGroupTabs } from '@/components/landing/landing-benefits-by-user-group-tabs'
import { LandingInformationJourneyFlowDiagram } from '@/components/landing/landing-information-journey-flow-diagram'
import { LandingMediExpressHealthStationPartnershipSection } from '@/components/landing/landing-mediexpress-health-station-partnership-section'

// Healthcare-inspired palette (BV Thu Cúc / Hồng Ngọc / ĐH Y tế Công Cộng):
// - Primary: teal-600 (#0d9488) — trust + health
// - Accent warm: rose-400 / amber — human warmth
// - Dark: teal-900 (#134e4a) — professional authority
// - BG: cream slate-50 / emerald-50 — clean, healing
// Compact spacing, gradient accents, elder-friendly (text-base 16px min)
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* ===== 1. HERO — 3 thông điệp rõ ràng, bỏ stats row ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        {/* Grid pattern background */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `linear-gradient(to right, #0f766e 1px, transparent 1px), linear-gradient(to bottom, #0f766e 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />
        <div className="absolute -top-24 -left-24 size-96 rounded-full bg-teal-400/15 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 size-96 rounded-full bg-rose-300/15 blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 pt-8 pb-10">
          {/* Top bar — logos + login */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Image
                src="/thong-dong-life-logo.png"
                alt="Thong Dong Life"
                width={140}
                height={60}
                className="h-12 w-auto"
                priority
              />
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-slate-300">|</span>
                <span className="text-lg font-bold bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">AIVIHE</span>
              </div>
            </div>
            <Link
              href="/login"
              className="text-sm font-medium text-slate-700 hover:text-teal-700 transition-colors px-4 py-2 rounded-lg border border-slate-200 hover:border-teal-300 bg-white/70 backdrop-blur"
            >
              Đăng nhập
            </Link>
          </div>

          <div className="text-center max-w-4xl mx-auto">
            {/* Badge — định vị mới: hồ sơ sức khỏe số trung tâm */}
            <div className="inline-flex items-center gap-2 bg-white border border-teal-100 rounded-full px-3 py-1 mb-5 shadow-sm">
              <Sparkles className="size-3.5 text-teal-500" />
              <span className="text-xs font-semibold text-slate-700">Nền tảng hồ sơ sức khỏe số trung tâm</span>
            </div>

            {/* 3 thông điệp chốt — AIVIHE LÀ GÌ / GIẢI QUYẾT GÌ / AI ĐƯỢC LỢI */}
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 leading-[1.1]">
              <span className="bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                AIVIHE
              </span>
              <span className="text-slate-900"> — Hồ sơ sức khỏe số</span>
              <br />
              <span className="text-slate-900">không đứt gãy thông tin</span>
            </h1>

            {/* Thông điệp 2: Giải quyết gì */}
            <p className="max-w-2xl mx-auto text-base md:text-lg text-slate-600 leading-relaxed mb-3">
              Giải quyết <span className="font-semibold text-rose-600">đứt gãy thông tin chăm sóc dài hạn</span> —
              dữ liệu sức khỏe rải rác, không ai nhìn thấy toàn bộ hành trình.
            </p>

            {/* Thông điệp 3: Ai được lợi */}
            <p className="max-w-xl mx-auto text-sm text-slate-500 mb-2">
              Dành cho <span className="font-medium text-slate-700">khách hàng, gia đình và đội ngũ chăm sóc</span> —
              cùng theo dõi một hành trình sức khỏe liên tục, an toàn.
            </p>
            <p className="max-w-xl mx-auto text-xs text-slate-400 mb-7">
              AI chỉ hỗ trợ đọc, tóm tắt và giải thích — không chẩn đoán, không kê đơn, không thay thế bác sĩ.
            </p>

            {/* CTA cụ thể theo tình huống */}
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30 transition-all text-sm md:text-base"
              >
                Khởi tạo hồ sơ sức khỏe số miễn phí <ArrowRight className="size-4" />
              </Link>
              <a
                href="#hanh-trinh-thong-tin"
                className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:border-teal-300 text-slate-700 hover:text-teal-700 font-semibold px-6 py-3 rounded-lg transition-all text-sm md:text-base"
              >
                Xem hành trình thông tin
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 2. NỖI ĐAU TRUNG TÂM — NEW section (quan trọng nhất) ===== */}
      <LandingPainPointsCentralSection />

      {/* ===== 3. GIÁ TRỊ CỐT LÕI — 4 mục, gọn ===== */}
      <section className="py-10 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <div className="inline-block text-xs font-bold text-teal-600 tracking-widest uppercase mb-2">Giải pháp</div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-slate-900">4 giá trị cốt lõi của AIVIHE</h2>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed">
              Một hồ sơ trung tâm — kết nối tất cả, giữ thông tin liên tục không đứt gãy
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: '📁',
                title: 'Lưu trữ tập trung',
                desc: 'Tài liệu, đơn thuốc, kết quả khám tại một nơi — không mất, dễ tìm, luôn sẵn sàng.',
              },
              {
                icon: '📈',
                title: 'Theo dõi xu hướng theo thời gian',
                desc: 'Chỉ số theo dòng thời gian — thấy thay đổi để chủ động hơn, không chỉ xem lẻ loi.',
              },
              {
                icon: '🤝',
                title: 'Kết nối nhiều bên',
                desc: 'KH, gia đình, Daycare, BSGĐ, PHCN — cùng nhìn thấy một hành trình, khi được phép.',
              },
              {
                icon: '🩺',
                title: 'Chuẩn bị tốt khi đi khám',
                desc: 'Tóm tắt sức khỏe, danh sách thuốc, câu hỏi cho BS — giảm thiếu sót, tiết kiệm thời gian.',
              },
            ].map((item) => (
              <div key={item.title} className="bg-gradient-to-br from-teal-50/40 to-emerald-50/20 border border-teal-100 rounded-xl p-5">
                <div className="text-2xl mb-2" role="img" aria-hidden="true">{item.icon}</div>
                <h3 className="font-semibold text-slate-900 mb-1.5 text-sm">{item.title}</h3>
                <p className="text-slate-600 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 4. LỢI ÍCH THEO 5 NHÓM — NEW tabs component ===== */}
      <LandingBenefitsByUserGroupTabs />

      {/* ===== 5. SƠ ĐỒ HÀNH TRÌNH THÔNG TIN — NEW visual ===== */}
      <div id="hanh-trinh-thong-tin">
        <LandingInformationJourneyFlowDiagram />
      </div>

      {/* ===== 6. AI LÀM GÌ ===== */}
      <HowAiHelpsSection />

      {/* ===== 7. NGUYÊN TẮC AN TOÀN ===== */}
      <section className="py-10 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-6">
            <div className="inline-block text-xs font-bold text-emerald-700 tracking-widest uppercase mb-2">Nguyên tắc an toàn</div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Minh bạch & do bạn kiểm soát</h2>
            <p className="text-slate-500 text-sm max-w-2xl mx-auto">
              AIVIHE không thay thế hệ thống quản lý khám chữa bệnh của cơ sở y tế. Mọi xử lý y tế do chuyên môn đảm nhận.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <CommitmentCard icon={ShieldCheck} color="amber" title="AI không thay BS" desc="AI chỉ tổng hợp, giải thích. Không chẩn đoán, không kê đơn." />
            <CommitmentCard icon={Lock} color="teal" title="Bạn kiểm soát data" desc="Thông tin thuộc quyền bạn. Chia sẻ chỉ khi cho phép rõ ràng." />
            <CommitmentCard icon={CheckCircle} color="emerald" title="Luôn xác nhận" desc="Info AI trích xuất cần bạn kiểm tra + xác nhận trước khi lưu." />
            <CommitmentCard icon={AlertTriangle} color="rose" title="Minh bạch vai trò" desc="AIVIHE không thay hệ thống quản lý khám chữa bệnh của y tế." />
          </div>
        </div>
      </section>

      {/* ===== 8. HÀNH TRÌNH CHĂM SÓC (ecosystem — GIỮ NGUYÊN) ===== */}
      <EcosystemCareJourney />

      {/* ===== 9. THIẾT BỊ IOT — viết lại thận trọng ===== */}
      <IotHealthDevicesSection />

      {/* ===== 9.1 ĐỐI TÁC MEDIEXPRESS — trạm đo SK + wearable, không cảm giác bệnh viện ===== */}
      <LandingMediExpressHealthStationPartnershipSection />

      {/* ===== 10. GÓI DỊCH VỤ ===== */}
      <ServicePackagesSection />

      {/* ===== KÊNH TIẾP CẬN ===== */}
      <LandingAccessChannelsSection />

      {/* ===== ĐỘI NGŨ & ĐỐI TÁC (GIỮ NGUYÊN) ===== */}
      <PartnersAndAdvisorsSection />

      {/* ===== ĐĂNG KÝ BS GIA ĐÌNH (GIỮ NGUYÊN) ===== */}
      <LandingDoctorApplicationSection />

      {/* ===== CTA CUỐI TRANG — 3 CTA gắn tình huống cụ thể ===== */}
      <section id="dang-ky-tu-van" className="py-12 bg-gradient-to-br from-teal-900 via-emerald-900 to-teal-800 text-white scroll-mt-6">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="inline-block text-xs font-bold text-teal-300 tracking-widest uppercase mb-2">Bắt đầu ngay</div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              Bắt đầu hành trình sức khỏe không đứt gãy
            </h2>
            <p className="text-teal-100/90 text-sm max-w-2xl mx-auto">
              Chọn cách bắt đầu phù hợp với bạn — khởi tạo hồ sơ miễn phí, đăng ký cùng gia đình, hoặc liên hệ tư vấn.
            </p>
          </div>

          {/* 3 CTA cards gắn tình huống */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {[
              {
                icon: FileText,
                title: 'Khởi tạo hồ sơ sức khỏe số',
                desc: 'Miễn phí — lưu tài liệu, theo dõi chỉ số ngay hôm nay',
                cta: 'Bắt đầu miễn phí',
                href: '/register',
                primary: true,
              },
              {
                icon: Users,
                title: 'Gia đình cùng theo dõi',
                desc: 'Kết nối cha mẹ với con cái — theo dõi từ xa, không bỏ lỡ',
                cta: 'Đăng ký cho gia đình',
                href: '/register?plan=family',
                primary: false,
              },
              {
                icon: TrendingUp,
                title: 'Tư vấn cách dùng AIVIHE',
                desc: 'Đội ngũ hỗ trợ giải đáp — tìm kênh tiếp cận phù hợp nhất',
                cta: 'Nhận tư vấn',
                href: '#form-tu-van',
                primary: false,
              },
            ].map((item) => (
              <div key={item.title} className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-5 flex flex-col gap-3">
                <item.icon className="size-6 text-teal-300" />
                <div>
                  <h3 className="font-semibold text-white text-sm mb-1">{item.title}</h3>
                  <p className="text-teal-100/80 text-xs leading-relaxed">{item.desc}</p>
                </div>
                <Link
                  href={item.href}
                  className={`mt-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    item.primary
                      ? 'bg-white text-teal-700 hover:bg-teal-50'
                      : 'bg-white/15 text-white border border-white/30 hover:bg-white/25'
                  }`}
                >
                  {item.cta} <ArrowRight className="size-3.5" />
                </Link>
              </div>
            ))}
          </div>

          {/* Form tư vấn */}
          <div id="form-tu-van">
            <LandingConsultationRequestForm />
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-slate-200 bg-white py-5">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-1.5">
            <Image src="/thong-dong-life-logo.png" alt="Thong Dong Life" width={100} height={40} className="h-7 w-auto" />
            <span className="text-slate-300">|</span>
            <span className="text-sm font-bold bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent tracking-wide">AIVIHE</span>
          </div>
          <p className="text-slate-500 text-xs">&copy; 2026 AIVIHE — Thong Dong Life · Phát triển bởi Thong Dong Tech</p>
        </div>
      </footer>
    </div>
  )
}
