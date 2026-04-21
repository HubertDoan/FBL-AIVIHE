'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight, ShieldCheck, FileText, TrendingUp, Users,
  Lock, CheckCircle, AlertTriangle, Sparkles, Stethoscope,
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
 * Landing aivihe.vn — restructured 21/04/2026 theo phản hồi thầy:
 * - Đưa thông tin thiết thực + tăng tin tưởng lên TOP
 * - Push thông tin chi tiết xuống dưới
 *
 * THỨ TỰ MỚI:
 *  1. Hero (3 thông điệp + CTA chính)
 *  2. ĐỐI TÁC MEDIEXPRESS (split view — tin tưởng ngay)  ← MOVED UP
 *  3. 2 QUICK CTA: Bệnh nhân tư vấn + Bác sĩ đăng ký     ← MOVED UP
 *  4. Nỗi đau trung tâm (đứt gãy thông tin)
 *  5. Sơ đồ hành trình thông tin
 *  6. 4 giá trị cốt lõi + Lợi ích 5 nhóm
 *  7. Cách AIVIHE hoạt động + Nguyên tắc an toàn
 *  8. Hệ sinh thái + IoT + Gói dịch vụ + Kênh tiếp cận
 *  9. Đội ngũ + Form đăng ký BS + CTA cuối
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* ===== 1. HERO — 3 thông điệp ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50">
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
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Image src="/thong-dong-life-logo.png" alt="Thong Dong Life" width={140} height={60} className="h-12 w-auto" priority />
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-slate-300">|</span>
                <span className="text-lg font-bold bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">AIVIHE</span>
              </div>
            </div>
            <Link href="/login" className="text-sm font-medium text-slate-700 hover:text-teal-700 transition-colors px-4 py-2 rounded-lg border border-slate-200 hover:border-teal-300 bg-white/70 backdrop-blur">
              Đăng nhập
            </Link>
          </div>

          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white border border-teal-100 rounded-full px-3 py-1 mb-4 shadow-sm">
              <Sparkles className="size-3.5 text-teal-500" />
              <span className="text-xs font-semibold text-slate-700">Nền tảng hồ sơ sức khỏe số trung tâm</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-3 leading-[1.1]">
              <span className="bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 bg-clip-text text-transparent">AIVIHE</span>
              <span className="text-slate-900"> — Hồ sơ sức khỏe số</span>
              <br />
              <span className="text-slate-900">không đứt gãy thông tin</span>
            </h1>
            <p className="max-w-2xl mx-auto text-base md:text-lg text-slate-600 leading-relaxed mb-2">
              Giải quyết <span className="font-semibold text-rose-600">đứt gãy thông tin chăm sóc dài hạn</span> —
              dữ liệu sức khỏe rải rác, không ai nhìn thấy toàn bộ hành trình.
            </p>
            <p className="max-w-xl mx-auto text-sm text-slate-500 mb-5">
              Dành cho khách hàng, gia đình và đội ngũ chăm sóc — cùng theo dõi một hành trình sức khỏe liên tục, an toàn.
            </p>

            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link href="/register" className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg shadow-teal-500/25 hover:shadow-xl transition-all text-sm md:text-base">
                Khởi tạo hồ sơ sức khỏe số miễn phí <ArrowRight className="size-4" />
              </Link>
              <a href="#hanh-trinh-thong-tin" className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:border-teal-300 text-slate-700 hover:text-teal-700 font-semibold px-6 py-3 rounded-lg transition-all text-sm md:text-base">
                Xem hành trình
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 2. ĐỐI TÁC MEDIEXPRESS (TIN TƯỞNG NGAY) — MOVED UP ===== */}
      <LandingMediExpressHealthStationPartnershipSection />

      {/* ===== 3. 2 QUICK CTA SIDE-BY-SIDE — Bệnh nhân + Bác sĩ ===== */}
      <section className="py-10 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-6">
            <div className="inline-block text-xs font-bold text-teal-600 tracking-widest uppercase mb-2">Bắt đầu ngay</div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Bạn là khách hàng hay bác sĩ?</h2>
            <p className="text-slate-600 text-sm">Chọn lối vào phù hợp — chỉ vài phút để bắt đầu</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* CTA 1: Khách hàng / bệnh nhân */}
            <div className="group bg-gradient-to-br from-teal-50 via-white to-emerald-50 border-2 border-teal-200 rounded-2xl p-6 hover:border-teal-400 hover:shadow-xl transition-all">
              <div className="size-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 text-white flex items-center justify-center mb-3 shadow-md shadow-teal-500/20">
                <Users className="size-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Tôi muốn quản lý sức khỏe</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Khởi tạo hồ sơ sức khỏe số miễn phí, lưu tài liệu khám/đơn thuốc, theo dõi chỉ số.
                Hành chính sẽ liên hệ tư vấn kênh phù hợp (Daycare / BSGĐ / PHCN).
              </p>
              <ul className="text-xs text-slate-600 space-y-1 mb-4">
                <li className="flex items-start gap-1.5"><CheckCircle className="size-3.5 text-teal-600 shrink-0 mt-0.5" />Hồ sơ trung tâm — không đứt gãy thông tin</li>
                <li className="flex items-start gap-1.5"><CheckCircle className="size-3.5 text-teal-600 shrink-0 mt-0.5" />AI hỗ trợ đọc tài liệu y tế</li>
                <li className="flex items-start gap-1.5"><CheckCircle className="size-3.5 text-teal-600 shrink-0 mt-0.5" />Gia đình cùng theo dõi (khi cho phép)</li>
              </ul>
              <a href="#dang-ky-tu-van" className="inline-flex items-center justify-center w-full gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 py-2.5 rounded-lg transition group-hover:gap-3">
                Đăng ký tư vấn <ArrowRight className="size-4" />
              </a>
            </div>

            {/* CTA 2: Bác sĩ */}
            <div className="group bg-gradient-to-br from-blue-50 via-white to-cyan-50 border-2 border-blue-200 rounded-2xl p-6 hover:border-blue-400 hover:shadow-xl transition-all">
              <div className="size-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center mb-3 shadow-md shadow-blue-500/20">
                <Stethoscope className="size-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Tôi là Bác sĩ muốn tham gia</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                BS đa khoa / Đông y / Y học gia đình / chuyên khoa — đăng ký tham gia mạng lưới.
                Hành chính sẽ liên hệ xác minh, Giám đốc duyệt, ký hợp đồng minh bạch.
              </p>
              <ul className="text-xs text-slate-600 space-y-1 mb-4">
                <li className="flex items-start gap-1.5"><CheckCircle className="size-3.5 text-blue-600 shrink-0 mt-0.5" />Linh hoạt: toàn thời gian / bán thời gian</li>
                <li className="flex items-start gap-1.5"><CheckCircle className="size-3.5 text-blue-600 shrink-0 mt-0.5" />Tài khoản BS riêng — quản lý KH gia đình</li>
                <li className="flex items-start gap-1.5"><CheckCircle className="size-3.5 text-blue-600 shrink-0 mt-0.5" />Tư vấn từ xa hoặc đến nhà BN</li>
              </ul>
              <a href="#dang-ky-bac-si" className="inline-flex items-center justify-center w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-lg transition group-hover:gap-3">
                Đăng ký BS gia đình <ArrowRight className="size-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

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
              { icon: '📁', title: 'Lưu trữ tập trung', desc: 'Tài liệu, đơn thuốc, kết quả khám tại một nơi — không mất, dễ tìm.' },
              { icon: '📈', title: 'Theo dõi xu hướng', desc: 'Chỉ số theo dòng thời gian — chủ động hơn, không xem lẻ loi.' },
              { icon: '🤝', title: 'Kết nối nhiều bên', desc: 'KH, gia đình, Daycare, BSGĐ, PHCN — cùng nhìn một hành trình.' },
              { icon: '🩺', title: 'Chuẩn bị tốt khi đi khám', desc: 'Tóm tắt SK, danh sách thuốc, câu hỏi — giảm thiếu sót.' },
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

      {/* ===== 7. LỢI ÍCH THEO 5 NHÓM ===== */}
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
              AIVIHE không thay thế hệ thống quản lý khám chữa bệnh của cơ sở y tế. Mọi xử lý y tế do chuyên môn đảm nhận.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <CommitmentCard icon={ShieldCheck} color="amber" title="AI không thay BS" desc="AI chỉ tổng hợp, giải thích. Không chẩn đoán, không kê đơn." />
            <CommitmentCard icon={Lock} color="teal" title="Bạn kiểm soát data" desc="Thông tin thuộc quyền bạn. Chia sẻ chỉ khi cho phép rõ ràng." />
            <CommitmentCard icon={CheckCircle} color="emerald" title="Luôn xác nhận" desc="Info AI trích xuất cần bạn kiểm tra + xác nhận trước khi lưu." />
            <CommitmentCard icon={AlertTriangle} color="rose" title="Minh bạch vai trò" desc="AIVIHE không thay hệ thống quản lý khám chữa bệnh." />
          </div>
        </div>
      </section>

      {/* ===== 10. HỆ SINH THÁI + IOT + GÓI + KÊNH (chi tiết bổ sung) ===== */}
      <EcosystemCareJourney />
      <IotHealthDevicesSection />
      <ServicePackagesSection />
      <LandingAccessChannelsSection />

      {/* ===== 11. ĐỘI NGŨ & ĐỐI TÁC ===== */}
      <PartnersAndAdvisorsSection />

      {/* ===== 12. FORM ĐĂNG KÝ BS GIA ĐÌNH ===== */}
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
