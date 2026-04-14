'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight, Heart, ShieldCheck, Users, Activity,
  Brain, FileText, TrendingUp, Stethoscope,
  AlertTriangle, Lock, CheckCircle,
} from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { ProblemCard } from '@/components/landing/landing-problem-card'
import { SolutionCard } from '@/components/landing/landing-solution-card'
import { AudienceCard } from '@/components/landing/landing-audience-card'
import { CommitmentCard } from '@/components/landing/landing-commitment-card'
import { HowAiHelpsSection } from '@/components/landing/landing-how-ai-helps-section'
import { HealthInspirationQuote } from '@/components/landing/landing-health-inspiration-quote'
import { EcosystemCareJourney } from '@/components/landing/landing-ecosystem-care-journey'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/30">

      {/* ===== HERO: Logo lớn + Thông điệp chính ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600/5 via-transparent to-blue-500/5" />
        <div className="relative max-w-5xl mx-auto px-4 pt-6 pb-8 text-center">
          {/* Logo Thong Dong Life — to, trung tâm */}
          <div className="flex flex-col items-center gap-3 mb-6">
            <Image
              src="/thong-dong-life-logo.png"
              alt="Thong Dong Life - Sống thong dong"
              width={280}
              height={120}
              className="h-24 md:h-32 w-auto object-contain"
              priority
            />
            <p className="text-teal-700 text-lg font-medium tracking-wide">
              Sống khỏe, sống vui, sống có ý nghĩa
            </p>
          </div>

          {/* AIVIHE badge — trợ lý AI sức khỏe cá nhân bởi Thong Dong Tech */}
          <div className="inline-flex items-center gap-2 bg-white/80 border border-blue-100 rounded-full px-4 py-2 mb-6 shadow-sm">
            <Image src="/AIVIHE.jpg" alt="AIVIHE" width={80} height={32} className="h-8 w-auto rounded" />
            <span className="text-sm text-blue-700 font-medium">Trợ lý AI sức khỏe cá nhân</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Tại sao bạn cần quản lý<br />
            <span className="text-teal-600">sức khỏe cá nhân?</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-600 leading-relaxed mb-6">
            Không chờ đến khi có vấn đề mới bắt đầu. Dữ liệu sức khỏe rải rác ở nhiều nơi —
            kết quả xét nghiệm trên điện thoại, đơn thuốc trong ngăn kéo, phiếu khám ở các bệnh viện khác nhau.
            AIVIHE là trợ lý AI giúp bạn hiểu và quản lý thông tin sức khỏe cho bạn và gia đình.
          </p>

          <div className="flex items-center justify-center gap-3">
            <Link href="/login" className={buttonVariants({ size: 'lg', className: 'text-base px-6 py-4 rounded-xl min-h-[48px] gap-2 bg-teal-600 hover:bg-teal-700' })}>
              Bắt đầu sử dụng <ArrowRight className="size-4" />
            </Link>
            <Link href="/login" className={buttonVariants({ variant: 'outline', size: 'lg', className: 'text-base px-6 py-4 rounded-xl min-h-[48px]' })}>
              Đăng nhập
            </Link>
          </div>
        </div>
      </section>

      {/* ===== VẤN ĐỀ ===== */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-2">Thực trạng quản lý sức khỏe hiện nay</h2>
        <p className="text-center text-gray-500 mb-8 text-base">Những vấn đề mà hầu hết mọi người đều gặp phải</p>
        <div className="grid md:grid-cols-3 gap-6">
          <ProblemCard icon={AlertTriangle} color="red" title="Dữ liệu phân tán" desc="Kết quả khám ở BV này, xét nghiệm ở BV kia, đơn thuốc ở phòng khám — không ai tổng hợp được hết." />
          <ProblemCard icon={Users} color="amber" title="Gia đình không nắm được" desc="Con cái ở xa không biết bố mẹ đang uống thuốc gì, chỉ số gần nhất ra sao, lần khám tới khi nào." />
          <ProblemCard icon={Activity} color="orange" title="Không phát hiện sớm" desc="Chỉ số bất thường nhưng không ai theo dõi liên tục. Đến khi phát hiện thì đã muộn." />
        </div>
      </section>

      {/* ===== GIẢI PHÁP ===== */}
      <section className="bg-gradient-to-b from-teal-50/50 to-white py-10">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-2">Trợ lý AI sức khỏe cá nhân của bạn</h2>
          <p className="text-center text-gray-500 mb-8 text-base">AIVIHE giúp bạn hiểu và quản lý thông tin sức khỏe — không thay thế bác sĩ, không phải hồ sơ y tế điện tử</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <SolutionCard icon={FileText} title="Lưu trữ tập trung" desc="Tất cả tài liệu y tế ở một nơi — an toàn, dễ tìm, không bao giờ mất." />
            <SolutionCard icon={Brain} title="AI đọc hộ bạn" desc="AI tự động đọc và trích xuất thông tin từ ảnh chụp tài liệu. Bạn chỉ cần xác nhận." />
            <SolutionCard icon={TrendingUp} title="Theo dõi xu hướng" desc="Biểu đồ chỉ số theo thời gian, cảnh báo khi bất thường. Phát hiện sớm, xử lý kịp." />
            <SolutionCard icon={Stethoscope} title="Chuẩn bị đi khám" desc="Tạo gói hồ sơ đầy đủ trước khi gặp bác sĩ. Tiết kiệm thời gian, không thiếu thông tin." />
          </div>
        </div>
      </section>

      {/* ===== AI LÀM GÌ ===== */}
      <HowAiHelpsSection />

      {/* ===== DÀNH CHO AI ===== */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8">AIVIHE phù hợp với ai?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <AudienceCard icon={Heart} title="Mọi người" items={['Quản lý sức khỏe chủ động từ sớm', 'Lưu trữ đơn thuốc, kết quả khám', 'Nhắc thuốc và lịch tái khám']} />
          <AudienceCard icon={Users} title="Gia đình đa thế hệ" items={['Theo dõi sức khỏe người thân từ xa', 'Nhận cảnh báo khi chỉ số bất thường', 'Chia sẻ hồ sơ sức khỏe an toàn']} />
          <AudienceCard icon={Stethoscope} title="Đội ngũ y tế" items={['Bác sĩ gia đình xem toàn bộ lịch sử', 'Nhân viên Daycare theo dõi hàng ngày', 'Kỹ thuật viên PHCN đánh giá chức năng']} />
        </div>
      </section>

      {/* ===== CAM KẾT ===== */}
      <section className="bg-gradient-to-b from-blue-50/30 to-white py-10">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Cam kết của AIVIHE</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <CommitmentCard icon={ShieldCheck} color="amber" title="Không thay thế bác sĩ" desc="AI chỉ tổng hợp và giải thích thông tin. Không chẩn đoán, không kê đơn." />
            <CommitmentCard icon={Lock} color="blue" title="Dữ liệu thuộc về bạn" desc="Chỉ chia sẻ khi có sự cho phép rõ ràng. Bạn toàn quyền kiểm soát." />
            <CommitmentCard icon={CheckCircle} color="green" title="Bạn luôn xác nhận" desc="AI trích xuất dữ liệu nhưng bạn phải xác nhận trước khi lưu." />
          </div>
        </div>
      </section>

      {/* ===== CẢM HỨNG: SỨC KHỎE LÀ VỐN QUÝ NHẤT ===== */}
      <HealthInspirationQuote />

      {/* ===== HÀNH TRÌNH CHĂM SÓC TRONG HỆ SINH THÁI ===== */}
      <EcosystemCareJourney />

      {/* ===== FINAL CTA ===== */}
      <section className="text-center py-10 bg-gradient-to-b from-white to-teal-50/30">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Bắt đầu quản lý sức khỏe ngay hôm nay</h2>
        <p className="text-gray-500 mb-6 text-lg">Miễn phí. Không cần thẻ tín dụng.</p>
        <Link href="/login" className={buttonVariants({ size: 'lg', className: 'text-lg px-10 py-6 rounded-xl min-h-[52px] gap-2 bg-teal-600 hover:bg-teal-700' })}>
          Bắt đầu sử dụng <ArrowRight className="size-5" />
        </Link>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-gray-100 bg-white py-6">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Image src="/thong-dong-life-logo.png" alt="Thong Dong Life" width={100} height={40} className="h-8 w-auto" />
            <span className="text-gray-300">|</span>
            <Image src="/AIVIHE.jpg" alt="AIVIHE" width={60} height={24} className="h-6 w-auto rounded" />
          </div>
          <p className="text-gray-500 text-sm">&copy; 2024 AIVIHE — Thong Dong Life (Sống thong dong)</p>
          <p className="text-gray-400 text-xs mt-1">Được phát triển bởi Thong Dong Tech</p>
        </div>
      </footer>
    </div>
  )
}
