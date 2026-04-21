'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight, Heart, ShieldCheck, Users, Activity,
  Brain, FileText, TrendingUp, Stethoscope,
  AlertTriangle, Lock, CheckCircle, Sparkles,
} from 'lucide-react'
import { ProblemCard } from '@/components/landing/landing-problem-card'
import { SolutionCard } from '@/components/landing/landing-solution-card'
import { AudienceCard } from '@/components/landing/landing-audience-card'
import { CommitmentCard } from '@/components/landing/landing-commitment-card'
import { HowAiHelpsSection } from '@/components/landing/landing-how-ai-helps-section'
import { HealthInspirationQuote } from '@/components/landing/landing-health-inspiration-quote'
import { EcosystemCareJourney } from '@/components/landing/landing-ecosystem-care-journey'
import { PartnersAndAdvisorsSection } from '@/components/landing/landing-partners-and-advisors-section'
import { IotHealthDevicesSection } from '@/components/landing/landing-iot-health-devices-section'
import { ServicePackagesSection } from '@/components/landing/landing-service-packages-section'
import { LandingConsultationRequestForm } from '@/components/landing/landing-consultation-request-form'
import { LandingAccessChannelsSection } from '@/components/landing/landing-access-channels-section'

// Healthcare-inspired palette (BV Thu Cúc / Hồng Ngọc / ĐH Y tế Công Cộng):
// - Primary: teal-600 (#0d9488) — trust + health
// - Accent warm: rose-400 / amber — human warmth
// - Dark: teal-900 (#134e4a) — professional authority
// - BG: cream slate-50 / emerald-50 — clean, healing
// Compact spacing, gradient accents, elder-friendly (text-base 16px min)
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* ===== HERO — soft healthcare gradient ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        {/* Grid pattern background — subtle */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `linear-gradient(to right, #0f766e 1px, transparent 1px), linear-gradient(to bottom, #0f766e 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />
        {/* Soft colored blobs — teal + rose (health + warmth) */}
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
            {/* Badge — teal healthcare */}
            <div className="inline-flex items-center gap-2 bg-white border border-teal-100 rounded-full px-3 py-1 mb-5 shadow-sm">
              <Sparkles className="size-3.5 text-teal-500" />
              <span className="text-xs font-semibold text-slate-700">Nền tảng quản lý thông tin sức khỏe cá nhân</span>
            </div>

            {/* H1 — teal/emerald gradient */}
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 leading-[1.1]">
              <span className="bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                AIVIHE
              </span>
              <span className="text-slate-900"> — Không gian dữ liệu</span>
              <br />
              <span className="text-slate-900">sức khỏe cá nhân của bạn</span>
            </h1>
            <p className="max-w-2xl mx-auto text-base md:text-lg text-slate-600 leading-relaxed mb-3">
              Cùng khách hàng, gia đình, <span className="font-semibold text-slate-800">Thong Dong Daycare</span>,
              bác sĩ gia đình và phục hồi chức năng theo dõi một hành trình sức khỏe liên tục — an toàn, dễ hiểu.
            </p>
            <p className="max-w-xl mx-auto text-sm text-slate-500 mb-6">
              AI chỉ hỗ trợ đọc, tóm tắt và giải thích — không chẩn đoán, không kê đơn, không thay thế bác sĩ.
            </p>

            {/* CTAs — teal gradient primary */}
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <a
                href="#dang-ky-tu-van"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30 transition-all text-sm md:text-base"
              >
                Đăng ký tư vấn <ArrowRight className="size-4" />
              </a>
              <a
                href="#cach-aivihe-hoat-dong"
                className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:border-teal-300 text-slate-700 hover:text-teal-700 font-semibold px-6 py-3 rounded-lg transition-all text-sm md:text-base"
              >
                Cách AIVIHE hoạt động
              </a>
            </div>
          </div>

          {/* Stats row — teal accents */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-10 max-w-4xl mx-auto">
            {[
              { k: '11', v: 'tabs hồ sơ' },
              { k: 'AI', v: 'OCR + tóm tắt' },
              { k: '5', v: 'điểm chạm chăm sóc' },
              { k: '100%', v: 'người dùng kiểm soát' },
            ].map((s) => (
              <div key={s.v} className="bg-white/80 backdrop-blur border border-teal-100 rounded-xl px-4 py-3 text-center">
                <div className="text-xl md:text-2xl font-bold bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">{s.k}</div>
                <div className="text-xs text-slate-500 mt-0.5">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== VẤN ĐỀ — LIGHT healthcare theme (replaced dark slate-900) ===== */}
      <section className="relative py-10 bg-gradient-to-br from-rose-50/60 via-amber-50/40 to-white overflow-hidden">
        {/* Decorative dots pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(#0f766e 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />
        <div className="relative max-w-6xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-7">
            <div className="inline-block text-xs font-bold text-rose-600 tracking-widest uppercase mb-2">Vấn đề hiện tại</div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Vì sao cần không gian thông tin sức khỏe cá nhân?</h2>
            <p className="text-slate-600 text-sm">Những điểm đứt gãy phổ biến trong chăm sóc dài hạn</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <ProblemCard icon={AlertTriangle} color="rose" title="Dữ liệu rải rác" desc="Kết quả khám, đơn thuốc, xét nghiệm nằm ở nhiều nơi — mất thời gian tổng hợp khi cần." />
            <ProblemCard icon={Users} color="amber" title="Khó đồng hành từ xa" desc="Con cái ở xa không nắm được thuốc, chỉ số, dấu hiệu bất thường của cha mẹ." />
            <ProblemCard icon={Activity} color="teal" title="Thông tin đứt gãy" desc="Mỗi lần khám, buổi trị liệu, ngày Daycare đều tạo info mới. Không kết nối — chăm sóc thiếu liên tục." />
            <ProblemCard icon={TrendingUp} color="emerald" title="Không thấy xu hướng" desc="Chỉ số riêng lẻ chưa đủ. Theo dõi theo thời gian mới thấy thay đổi để chủ động hơn." />
          </div>
        </div>
      </section>

      {/* ===== GIẢI PHÁP — white clean ===== */}
      <section className="py-10 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <div className="inline-block text-xs font-bold text-teal-600 tracking-widest uppercase mb-2">Giải pháp</div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-slate-900">Không chỉ là AI — AIVIHE là nền tảng kết nối</h2>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed">
              Tạo một không gian thông tin thống nhất, nơi khách hàng, gia đình và đội ngũ chăm sóc
              phối hợp trên cùng hành trình sức khỏe.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <SolutionCard icon={FileText} title="Lưu trữ tập trung" desc="Tài liệu sức khỏe cá nhân tại một nơi dễ tìm." />
            <SolutionCard icon={Brain} title="AI đọc & tóm tắt" desc="Trích xuất chỉ số, diễn giải dễ hiểu. User xác nhận trước khi lưu." />
            <SolutionCard icon={TrendingUp} title="Theo dõi xu hướng" desc="Chỉ số theo dòng thời gian — chuẩn bị tốt khi trao đổi BS." />
            <SolutionCard icon={Stethoscope} title="Chuẩn bị đi khám" desc="Tạo bản tóm tắt + danh mục tài liệu — giảm thiếu sót." />
            <SolutionCard icon={Users} title="Kết nối đội ngũ" desc="Khi cho phép: gia đình, Daycare, BSGĐ, PHCN cùng theo dõi." />
          </div>
        </div>
      </section>

      {/* ===== AI LÀM GÌ ===== */}
      <HowAiHelpsSection />

      {/* ===== DÀNH CHO AI — cream gradient ===== */}
      <section className="py-10 bg-gradient-to-b from-emerald-50/40 to-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="inline-block text-xs font-bold text-emerald-700 tracking-widest uppercase mb-2">Đối tượng</div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">AIVIHE dành cho những ai?</h2>
            <p className="text-slate-600 text-sm">Kết nối mọi điểm chạm trong hành trình chăm sóc</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <AudienceCard icon={Heart} title="Khách hàng cá nhân" items={['Quản lý SK chủ động từ sớm', 'Lưu tài liệu khám, đơn thuốc', 'Theo dõi chỉ số, chuẩn bị đi khám']} />
            <AudienceCard icon={Users} title="Gia đình đa thế hệ" items={['Đồng hành cha mẹ từ xa', 'Nhận tóm tắt khi được cho phép', 'Nắm lịch sinh hoạt, chỉ số, ghi chú']} />
            <AudienceCard icon={Activity} title="Thong Dong Daycare" items={['Ghi chỉ số, sinh hoạt trong ngày', 'Kết nối lễ tân, chăm sóc, gia đình', 'Tổng kết ngày gửi gia đình']} />
            <AudienceCard icon={Stethoscope} title="Bác sĩ gia đình" items={['Xem thông tin KH chia sẻ', 'Theo dõi xu hướng, bệnh nền, thuốc', 'Tư vấn dự phòng + chuyển tuyến']} />
            <AudienceCard icon={TrendingUp} title="Phục hồi chức năng" items={['Đánh giá ban đầu + kế hoạch', 'Bài tập + tiến triển theo buổi', 'Phối hợp BSGĐ + gia đình']} />
            <AudienceCard icon={ShieldCheck} title="Bảo hiểm & đối tác" items={['Dữ liệu KH cho phép chia sẻ', 'Hỗ trợ chăm sóc chủ động', 'Kết nối ecosystem Thong Dong']} />
          </div>
        </div>
      </section>

      {/* ===== CAM KẾT ===== */}
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

      {/* ===== CẢM HỨNG ===== */}
      <HealthInspirationQuote />

      {/* ===== HÀNH TRÌNH CHĂM SÓC ===== */}
      <EcosystemCareJourney />

      {/* ===== THIẾT BỊ IOT ===== */}
      <IotHealthDevicesSection />

      {/* ===== GÓI DỊCH VỤ ===== */}
      <ServicePackagesSection />

      {/* ===== 3 KÊNH TIẾP CẬN ===== */}
      <LandingAccessChannelsSection />

      {/* ===== ĐỘI NGŨ & ĐỐI TÁC ===== */}
      <PartnersAndAdvisorsSection />

      {/* ===== FORM ĐĂNG KÝ — teal dark (healthcare authority) ===== */}
      <section id="dang-ky-tu-van" className="py-12 bg-gradient-to-br from-teal-900 via-emerald-900 to-teal-800 text-white scroll-mt-6">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-6">
            <div className="inline-block text-xs font-bold text-teal-300 tracking-widest uppercase mb-2">Bắt đầu ngay</div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              Hành trình sức khỏe cùng AIVIHE
            </h2>
            <p className="text-teal-100/90 text-sm max-w-2xl mx-auto">
              Tiếp cận qua <span className="font-semibold text-teal-200">Thong Dong Daycare, Phòng khám Bác sĩ gia đình</span> hoặc
              <span className="font-semibold text-teal-200"> Phòng khám Phục hồi chức năng</span>.
              Để lại tên + SĐT, chúng tôi liên hệ tư vấn kênh phù hợp.
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
