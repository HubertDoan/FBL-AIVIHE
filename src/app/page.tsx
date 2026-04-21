'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight, ShieldCheck, FileText, Users,
  Lock, CheckCircle, AlertTriangle, Sparkles, Stethoscope,
  Heart, Smartphone, Activity, ExternalLink,
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

/**
 * Landing aivihe.vn — Combined Hero Layout (21/04/2026):
 * - LEFT half: AIVIHE positioning (hero text + CTA)
 * - RIGHT half: MediExpress partnership (image + 4 benefits)
 * Cùng đứng top — vừa định vị, vừa tạo niềm tin ngay
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* ===== 1. COMBINED HERO — AIVIHE LEFT + MEDIEXPRESS RIGHT ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-blue-50">
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `linear-gradient(to right, #0f766e 1px, transparent 1px), linear-gradient(to bottom, #0f766e 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />
        <div className="absolute -top-24 -left-24 size-96 rounded-full bg-teal-400/15 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 size-96 rounded-full bg-blue-300/15 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 pt-6 pb-8">
          {/* Top bar — logos + login */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Image src="/thong-dong-life-logo.png" alt="Thong Dong Life" width={140} height={60} className="h-10 w-auto" priority />
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-slate-300">|</span>
                <span className="text-base font-bold bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">AIVIHE</span>
              </div>
            </div>
            <Link href="/login" className="text-sm font-medium text-slate-700 hover:text-teal-700 transition-colors px-4 py-2 rounded-lg border border-slate-200 hover:border-teal-300 bg-white/70 backdrop-blur">
              Đăng nhập
            </Link>
          </div>

          {/* TWO-COLUMN HERO — AIVIHE + MediExpress */}
          <div className="grid lg:grid-cols-2 gap-6 items-stretch">

            {/* ═══ LEFT: AIVIHE Hero ═══ */}
            <div className="bg-white/60 backdrop-blur border border-teal-100 rounded-2xl p-6 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 bg-white border border-teal-200 rounded-full px-3 py-1 mb-4 shadow-sm w-fit">
                <Sparkles className="size-3.5 text-teal-500" />
                <span className="text-xs font-semibold text-slate-700">Nền tảng hồ sơ sức khỏe số trung tâm</span>
              </div>

              <h1 className="text-2xl md:text-4xl font-bold tracking-tight mb-3 leading-[1.15]">
                <span className="bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 bg-clip-text text-transparent">AIVIHE</span>
                <span className="text-slate-900"> — Hồ sơ sức khỏe số</span>
                <br />
                <span className="text-slate-900">không đứt gãy thông tin</span>
              </h1>

              <p className="text-sm md:text-base text-slate-600 leading-relaxed mb-2">
                Giải quyết <span className="font-semibold text-rose-600">đứt gãy thông tin chăm sóc dài hạn</span> —
                dữ liệu sức khỏe rải rác, không ai nhìn thấy toàn bộ hành trình.
              </p>
              <p className="text-xs md:text-sm text-slate-500 mb-4">
                Dành cho khách hàng, gia đình và đội ngũ chăm sóc — cùng theo dõi một hành trình sức khỏe liên tục, an toàn.
              </p>
              <p className="text-[11px] text-slate-400 mb-5 italic">
                AI chỉ hỗ trợ đọc, tóm tắt và giải thích — không chẩn đoán, không kê đơn, không thay thế bác sĩ.
              </p>

              <div className="flex flex-wrap gap-2">
                <Link href="/register" className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold px-5 py-2.5 rounded-lg shadow-md shadow-teal-500/25 hover:shadow-lg transition-all text-sm">
                  Khởi tạo hồ sơ miễn phí <ArrowRight className="size-4" />
                </Link>
                <a href="#hanh-trinh-thong-tin" className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:border-teal-300 text-slate-700 hover:text-teal-700 font-semibold px-5 py-2.5 rounded-lg transition-all text-sm">
                  Xem hành trình
                </a>
              </div>
            </div>

            {/* ═══ RIGHT: MediExpress Partnership Card ═══ */}
            <div className="bg-white/60 backdrop-blur border border-blue-100 rounded-2xl p-6 flex flex-col">
              <div className="inline-flex items-center gap-2 bg-blue-600 text-white rounded-full px-3 py-1 mb-3 shadow-md w-fit">
                <span className="text-xs font-bold uppercase tracking-widest">🤝 Đối tác chiến lược</span>
              </div>
              <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-1">
                AIVIHE × <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">MediExpress Vietnam</span>
              </h2>
              <p className="text-xs text-slate-600 mb-3">
                Trạm AI Medical Hub + wearable — theo dõi sức khỏe <span className="font-semibold">tự nhiên, không cảm giác đi bệnh viện</span>
              </p>

              <div className="grid grid-cols-2 gap-3 items-start flex-1">
                {/* Image small */}
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-br from-blue-200/40 to-teal-200/30 rounded-xl blur-lg" />
                  <div className="relative bg-white rounded-lg border border-slate-200 p-1.5 shadow-sm">
                    <Image
                      src="/medi-express-ai-medical-station.jpg"
                      alt="AI Medical Station"
                      width={300}
                      height={400}
                      className="w-full h-44 object-contain rounded"
                    />
                    <div className="mt-1 px-1">
                      <a href="https://mediexpress.com.vn/" target="_blank" rel="noopener noreferrer" className="text-[10px] inline-flex items-center gap-0.5 text-blue-600 hover:text-blue-700 font-semibold">
                        mediexpress.com.vn <ExternalLink className="size-2.5" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* 4 benefits compact */}
                <div className="space-y-1.5">
                  <MiniBenefit icon={Heart} color="text-rose-600" title="Đo nhanh tại trung tâm" />
                  <MiniBenefit icon={Smartphone} color="text-blue-600" title="Wearable đăng ký" />
                  <MiniBenefit icon={Activity} color="text-teal-600" title="Tự nhiên, không cảm giác BV" />
                  <MiniBenefit icon={ShieldCheck} color="text-emerald-600" title="Đối tác y tế chính thức" />
                </div>
              </div>

              <a href="#thiet-bi-mediexpress" className="text-xs text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1 mt-3 self-start">
                Xem 12 chức năng AI Medical Hub + 8 thiết bị →
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* ===== 2. 2 QUICK CTA SIDE-BY-SIDE — KH + BS ===== */}
      <section className="py-8 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-5">
            <div className="inline-block text-xs font-bold text-teal-600 tracking-widest uppercase mb-1">Bắt đầu ngay</div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900">Bạn là khách hàng hay bác sĩ?</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="group bg-gradient-to-br from-teal-50 via-white to-emerald-50 border-2 border-teal-200 rounded-2xl p-5 hover:border-teal-400 hover:shadow-xl transition-all">
              <div className="size-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 text-white flex items-center justify-center mb-2.5 shadow-md">
                <Users className="size-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1.5">Tôi muốn quản lý sức khỏe</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-3">
                Khởi tạo hồ sơ SK số miễn phí, lưu tài liệu/đơn thuốc, theo dõi chỉ số. Hành chính tư vấn kênh phù hợp.
              </p>
              <a href="#dang-ky-tu-van" className="inline-flex items-center justify-center w-full gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 py-2.5 rounded-lg transition group-hover:gap-3 text-sm">
                Đăng ký tư vấn <ArrowRight className="size-4" />
              </a>
            </div>

            <div className="group bg-gradient-to-br from-blue-50 via-white to-cyan-50 border-2 border-blue-200 rounded-2xl p-5 hover:border-blue-400 hover:shadow-xl transition-all">
              <div className="size-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center mb-2.5 shadow-md">
                <Stethoscope className="size-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1.5">Tôi là Bác sĩ muốn tham gia</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-3">
                BS đa khoa / Đông y / YHGD / chuyên khoa — đăng ký mạng lưới. GĐ duyệt, ký HĐ minh bạch.
              </p>
              <a href="#dang-ky-bac-si" className="inline-flex items-center justify-center w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-lg transition group-hover:gap-3 text-sm">
                Đăng ký BS gia đình <ArrowRight className="size-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 3. CHI TIẾT MEDIEXPRESS — 12 features + 8 devices ===== */}
      <div id="thiet-bi-mediexpress">
        <LandingMediExpressHealthStationPartnershipSection />
      </div>

      {/* ===== 4. NỖI ĐAU TRUNG TÂM ===== */}
      <LandingPainPointsCentralSection />

      {/* ===== 5. SƠ ĐỒ HÀNH TRÌNH THÔNG TIN ===== */}
      <div id="hanh-trinh-thong-tin">
        <LandingInformationJourneyFlowDiagram />
      </div>

      {/* ===== 6. GIÁ TRỊ CỐT LÕI ===== */}
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
              { icon: '📁', title: 'Lưu trữ tập trung', desc: 'Tài liệu, đơn thuốc, kết quả khám tại một nơi.' },
              { icon: '📈', title: 'Theo dõi xu hướng', desc: 'Chỉ số theo thời gian — chủ động hơn.' },
              { icon: '🤝', title: 'Kết nối nhiều bên', desc: 'KH, gia đình, Daycare, BSGĐ, PHCN cùng một hành trình.' },
              { icon: '🩺', title: 'Chuẩn bị tốt khi đi khám', desc: 'Tóm tắt SK, danh sách thuốc — giảm thiếu sót.' },
            ].map((item) => (
              <div key={item.title} className="bg-gradient-to-br from-teal-50/40 to-emerald-50/20 border border-teal-100 rounded-xl p-5">
                <div className="text-2xl mb-2" aria-hidden="true">{item.icon}</div>
                <h3 className="font-semibold text-slate-900 mb-1.5 text-sm">{item.title}</h3>
                <p className="text-slate-600 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 7. LỢI ÍCH 5 NHÓM ===== */}
      <LandingBenefitsByUserGroupTabs />

      {/* ===== 8. AI LÀM GÌ ===== */}
      <HowAiHelpsSection />

      {/* ===== 9. NGUYÊN TẮC AN TOÀN ===== */}
      <section className="py-10 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-6">
            <div className="inline-block text-xs font-bold text-emerald-700 tracking-widest uppercase mb-2">Nguyên tắc an toàn</div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Minh bạch & do bạn kiểm soát</h2>
            <p className="text-slate-500 text-sm max-w-2xl mx-auto">
              AIVIHE không thay thế hệ thống quản lý khám chữa bệnh. Mọi xử lý y tế do chuyên môn đảm nhận.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <CommitmentCard icon={ShieldCheck} color="amber" title="AI không thay BS" desc="AI chỉ tổng hợp, giải thích. Không chẩn đoán, không kê đơn." />
            <CommitmentCard icon={Lock} color="teal" title="Bạn kiểm soát data" desc="Thông tin thuộc quyền bạn. Chia sẻ chỉ khi cho phép." />
            <CommitmentCard icon={CheckCircle} color="emerald" title="Luôn xác nhận" desc="Info AI trích xuất cần bạn xác nhận trước khi lưu." />
            <CommitmentCard icon={AlertTriangle} color="rose" title="Minh bạch vai trò" desc="AIVIHE không thay hệ thống QLKCB của y tế." />
          </div>
        </div>
      </section>

      {/* ===== 10. HỆ SINH THÁI + IOT + GÓI + KÊNH ===== */}
      <EcosystemCareJourney />
      <IotHealthDevicesSection />
      <ServicePackagesSection />
      <LandingAccessChannelsSection />

      {/* ===== 11. ĐỘI NGŨ & ĐỐI TÁC ===== */}
      <PartnersAndAdvisorsSection />

      {/* ===== 12. FORM ĐĂNG KÝ BS ===== */}
      <div id="dang-ky-bac-si">
        <LandingDoctorApplicationSection />
      </div>

      {/* ===== 13. CTA CUỐI + FORM TƯ VẤN KH ===== */}
      <section id="dang-ky-tu-van" className="py-12 bg-gradient-to-br from-teal-900 via-emerald-900 to-teal-800 text-white scroll-mt-6">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-6">
            <div className="inline-block text-xs font-bold text-teal-300 tracking-widest uppercase mb-2">Đăng ký tư vấn</div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Bắt đầu hành trình sức khỏe không đứt gãy</h2>
            <p className="text-teal-100/90 text-sm max-w-2xl mx-auto">
              Để lại thông tin — Hành chính sẽ liên hệ trong 24h tư vấn kênh phù hợp.
            </p>
          </div>
          <LandingConsultationRequestForm />
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

function MiniBenefit({ icon: Icon, color, title }: {
  icon: React.ComponentType<{ className?: string }>; color: string; title: string
}) {
  return (
    <div className="flex items-start gap-1.5 p-1.5 rounded bg-white border border-slate-100">
      <Icon className={`size-3.5 shrink-0 mt-0.5 ${color}`} />
      <span className="text-[11px] font-semibold text-slate-800 leading-tight">{title}</span>
    </div>
  )
}
