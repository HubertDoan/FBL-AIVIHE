'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight, ShieldCheck, Lock, CheckCircle, AlertTriangle, Sparkles,
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

/**
 * Landing aivihe.vn — Progressive Disclosure Layout (theo ý kiến chuyên gia 21/04/2026).
 *
 * Nguyên tắc: PAS + Jobs-to-be-done cho elder VN.
 * Hero CHỈ trả lời 3 câu: (1) AIVIHE là gì · (2) giải quyết vấn đề gì · (3) làm gì tiếp.
 * Partnership MediExpress + IoT đặt xuống SAU khi user đã hiểu sản phẩm lõi.
 * BS CTA demote thành link top bar — không cạnh tranh attention với KH.
 *
 * Thứ tự 14 sections:
 *  1. Hero clean (H1 + sub + 1 CTA)
 *  2. Pain Points (đứt gãy thông tin)
 *  3. 4 giá trị cốt lõi
 *  4. Sơ đồ hành trình thông tin
 *  5. Lợi ích 5 nhóm
 *  6. Cách AI hoạt động
 *  7. Nguyên tắc an toàn
 *  8. Hệ sinh thái care journey
 *  9. MediExpress + IoT (đối tác đo lường) — gộp
 * 10. Gói dịch vụ
 * 11. Kênh tiếp cận
 * 12. Đội ngũ & đối tác
 * 13. Form đăng ký BS (dành cho BS)
 * 14. CTA cuối + Form tư vấn KH
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* ===== 1. HERO CLEAN — CHỈ 3 VIỆC: là gì / giải quyết gì / làm gì tiếp ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `linear-gradient(to right, #0f766e 1px, transparent 1px), linear-gradient(to bottom, #0f766e 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />
        <div className="absolute -top-24 -left-24 size-96 rounded-full bg-teal-400/15 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 size-96 rounded-full bg-emerald-300/15 blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-4 pt-5 pb-10">

          {/* Top bar — logos + login + BS link nhỏ (không cạnh tranh với CTA chính) */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Image src="/thong-dong-life-logo.png" alt="Thong Dong Life" width={140} height={60} className="h-10 w-auto" priority />
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-slate-300">|</span>
                <span className="text-base font-bold bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">AIVIHE</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <a href="#dang-ky-bac-si" className="text-slate-500 hover:text-teal-700 transition-colors hidden md:inline">Bác sĩ tham gia mạng lưới?</a>
              <Link href="/login" className="font-medium text-slate-700 hover:text-teal-700 transition-colors px-4 py-2 rounded-lg border border-slate-200 hover:border-teal-300 bg-white/70 backdrop-blur">
                Đăng nhập
              </Link>
            </div>
          </div>

          {/* Hero content — center, 1 màn ăn decision */}
          <div className="text-center max-w-3xl mx-auto">

            {/* Banner định vị — giữ nguyên style gốc: gradient teal-emerald, chữ trắng, to */}
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-full px-6 py-3 shadow-xl shadow-teal-500/30 mb-6">
              <Sparkles className="size-5" />
              <span className="text-base md:text-xl font-bold tracking-wide">Nền tảng quản lý sức khỏe cá nhân</span>
            </div>

            {/* H1 — TRẢ LỜI "AIVIHE LÀ GÌ" */}
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 leading-[1.15] text-slate-900">
              <span className="bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 bg-clip-text text-transparent">AIVIHE</span>
              <span className="block mt-1">Một hồ sơ sức khỏe chung</span>
              <span className="block">cho cả gia đình</span>
            </h1>

            {/* Sub — TRẢ LỜI "GIẢI QUYẾT VẤN ĐỀ GÌ" */}
            <p className="text-base md:text-xl text-slate-600 leading-relaxed mb-6 max-w-2xl mx-auto">
              Lưu tài liệu, đơn thuốc, chỉ số của người thân tại <span className="font-semibold text-slate-900">một nơi</span> — để không còn thất lạc, không còn kể lại từ đầu mỗi lần đi khám.
            </p>

            {/* CTA — TRẢ LỜI "LÀM GÌ TIẾP THEO" (1 nút chính + 1 text link) */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
              <Link href="/register" className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold px-7 py-3.5 rounded-lg shadow-lg shadow-teal-500/30 hover:shadow-xl transition-all text-base md:text-lg">
                Khởi tạo hồ sơ miễn phí <ArrowRight className="size-5" />
              </Link>
              <a href="#hanh-trinh-thong-tin" className="text-sm md:text-base font-semibold text-teal-700 hover:text-teal-800 underline underline-offset-4 decoration-teal-300 hover:decoration-teal-600 transition-colors">
                Xem hành trình thông tin →
              </a>
            </div>

            {/* Microcopy — đặt kỳ vọng về AI */}
            <p className="text-xs md:text-sm text-slate-400 italic">
              AI chỉ hỗ trợ đọc, tóm tắt và giải thích — không chẩn đoán, không kê đơn, không thay thế bác sĩ.
            </p>
          </div>
        </div>
      </section>

      {/* ===== 2. PAIN POINTS — "AGITATION" trong PAS ===== */}
      <LandingPainPointsCentralSection />

      {/* ===== 3. 4 GIÁ TRỊ CỐT LÕI — "SOLUTION" trong PAS ===== */}
      <section className="py-6 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-6">
            <div className="inline-block text-xs font-bold text-teal-600 tracking-widest uppercase mb-2">Giải pháp</div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-slate-900">AIVIHE giải quyết như thế nào</h2>
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

      {/* ===== 4. SƠ ĐỒ HÀNH TRÌNH THÔNG TIN ===== */}
      <div id="hanh-trinh-thong-tin">
        <LandingInformationJourneyFlowDiagram />
      </div>

      {/* ===== 5. LỢI ÍCH 5 NHÓM (tabs — JTBD) ===== */}
      <LandingBenefitsByUserGroupTabs />

      {/* ===== 6. CÁCH AI HOẠT ĐỘNG ===== */}
      <HowAiHelpsSection />

      {/* ===== 7. NGUYÊN TẮC AN TOÀN (Trust builder) ===== */}
      <section className="py-6 bg-white">
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

      {/* ===== 8. HỆ SINH THÁI CARE JOURNEY ===== */}
      <EcosystemCareJourney />

      {/* ===== 9. THIẾT BỊ & ĐỐI TÁC ĐO LƯỜNG — MediExpress + IoT gộp ===== */}
      <IotHealthDevicesSection />

      {/* ===== 10. GÓI DỊCH VỤ ===== */}
      <ServicePackagesSection />

      {/* ===== 11. KÊNH TIẾP CẬN ===== */}
      <LandingAccessChannelsSection />

      {/* ===== 12. ĐỘI NGŨ & ĐỐI TÁC ===== */}
      <PartnersAndAdvisorsSection />

      {/* ===== 13. FORM ĐĂNG KÝ BS (B2B funnel riêng, không cạnh tranh hero) ===== */}
      <div id="dang-ky-bac-si">
        <LandingDoctorApplicationSection />
      </div>

      {/* ===== 14. CTA CUỐI + FORM TƯ VẤN KH ===== */}
      <section id="dang-ky-tu-van" className="py-8 bg-gradient-to-br from-teal-900 via-emerald-900 to-teal-800 text-white scroll-mt-6">
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
