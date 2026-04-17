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
import { PartnersAndAdvisorsSection } from '@/components/landing/landing-partners-and-advisors-section'
import { IotHealthDevicesSection } from '@/components/landing/landing-iot-health-devices-section'
import { ServicePackagesSection } from '@/components/landing/landing-service-packages-section'
import { LandingConsultationRequestForm } from '@/components/landing/landing-consultation-request-form'
import { LandingAccessChannelsSection } from '@/components/landing/landing-access-channels-section'

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

          {/* AIVIHE badge — Nền tảng quản lý thông tin sức khỏe cá nhân */}
          <div className="inline-flex items-center gap-2 bg-white/80 border border-blue-100 rounded-full px-4 py-2 mb-6 shadow-sm">
            <Image src="/AIVIHE.jpg" alt="AIVIHE" width={80} height={32} className="h-8 w-auto rounded" />
            <span className="text-sm text-blue-700 font-medium">Nền tảng quản lý thông tin sức khỏe cá nhân</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            AIVIHE – Nền tảng quản lý thông tin sức khỏe cá nhân<br />
            của hệ sinh thái <span className="text-teal-600">Thong Dong</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-600 leading-relaxed mb-4">
            AIVIHE giúp khách hàng, gia đình, Thong Dong Daycare, bác sĩ gia đình và phục hồi chức năng
            cùng theo dõi một hành trình sức khỏe liên tục, an toàn và dễ hiểu.
          </p>
          <p className="max-w-2xl mx-auto text-base text-gray-500 leading-relaxed mb-6">
            Từ kết quả khám, đơn thuốc, xét nghiệm đến chỉ số hằng ngày và ghi chú chăm sóc,
            AIVIHE tập trung thông tin sức khỏe cá nhân vào một không gian dữ liệu do người dùng kiểm soát.
            AI chỉ hỗ trợ đọc, tóm tắt và giải thích — không chẩn đoán, không kê đơn và không thay thế bác sĩ.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a href="#dang-ky-tu-van" className={buttonVariants({ size: 'lg', className: 'text-base px-6 py-4 rounded-xl min-h-[48px] gap-2 bg-teal-600 hover:bg-teal-700' })}>
              Đăng ký tư vấn <ArrowRight className="size-4" />
            </a>
            <a href="#cach-aivihe-hoat-dong" className={buttonVariants({ variant: 'outline', size: 'lg', className: 'text-base px-6 py-4 rounded-xl min-h-[48px]' })}>
              Tìm hiểu cách AIVIHE hoạt động
            </a>
            <Link href="/login" className="text-sm text-teal-700 hover:underline px-3 py-2">
              Đăng nhập
            </Link>
          </div>
        </div>
      </section>

      {/* ===== VẤN ĐỀ ===== */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-2">Vì sao cần một không gian thông tin sức khỏe cá nhân?</h2>
        <p className="text-center text-gray-500 mb-8 text-base">Những vấn đề mà hầu hết khách hàng, gia đình và đội ngũ chăm sóc đều gặp phải</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ProblemCard icon={AlertTriangle} color="red" title="Dữ liệu đang rải rác" desc="Kết quả khám, đơn thuốc, xét nghiệm, ảnh chụp tài liệu nằm ở nhiều nơi. Khi cần xem lại, mất thời gian tổng hợp." />
          <ProblemCard icon={Users} color="amber" title="Gia đình khó đồng hành từ xa" desc="Con cái ở xa không nắm được bố mẹ đang dùng thuốc gì, chỉ số gần nhất ra sao, có dấu hiệu bất thường nào không." />
          <ProblemCard icon={Activity} color="orange" title="Thông tin dễ bị đứt gãy" desc="Mỗi lần khám, mỗi buổi trị liệu, mỗi ngày tại Daycare đều tạo thông tin mới. Không được kết nối thì chăm sóc dài hạn dễ thiếu liên tục." />
          <ProblemCard icon={TrendingUp} color="blue" title="Không theo dõi được xu hướng" desc="Một chỉ số riêng lẻ chưa nói lên nhiều. Khi theo dõi theo thời gian, xu hướng thay đổi giúp chủ động hơn." />
        </div>
      </section>

      {/* ===== GIẢI PHÁP ===== */}
      <section className="bg-gradient-to-b from-teal-50/50 to-white py-10">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-2">Không chỉ là AI – AIVIHE là nền tảng kết nối thông tin sức khỏe cá nhân</h2>
          <p className="text-center text-gray-500 mb-8 text-base max-w-3xl mx-auto">
            AIVIHE sử dụng AI để hỗ trợ đọc, trích xuất và tóm tắt tài liệu sức khỏe.
            Giá trị lớn hơn là tạo ra một không gian thông tin thống nhất, nơi khách hàng, gia đình và đội ngũ chăm sóc
            có thể phối hợp trên cùng một hành trình sức khỏe.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <SolutionCard icon={FileText} title="Lưu trữ tài liệu sức khỏe cá nhân" desc="Tập trung kết quả xét nghiệm, đơn thuốc, phiếu khám, hình ảnh tài liệu và chỉ số theo dõi tại một nơi dễ tìm." />
            <SolutionCard icon={Brain} title="AI hỗ trợ đọc và tóm tắt" desc="AI nhận diện thông tin, trích xuất chỉ số chính, diễn giải bằng ngôn ngữ dễ hiểu. Người dùng luôn xác nhận trước khi lưu." />
            <SolutionCard icon={TrendingUp} title="Theo dõi xu hướng theo thời gian" desc="Chỉ số sức khỏe hiển thị theo dòng thời gian, giúp nhận biết thay đổi và chuẩn bị tốt hơn khi trao đổi với bác sĩ." />
            <SolutionCard icon={Stethoscope} title="Chuẩn bị tài liệu khi đi khám" desc="AIVIHE tạo bản tóm tắt thông tin và danh mục tài liệu cần thiết trước khi gặp bác sĩ, tiết kiệm thời gian, giảm thiếu sót." />
            <SolutionCard icon={Users} title="Kết nối gia đình và đội ngũ chăm sóc" desc="Khi được cho phép, gia đình, Daycare, bác sĩ gia đình và PHCN cùng theo dõi thông tin phù hợp để chăm sóc liên tục." />
          </div>
        </div>
      </section>

      {/* ===== AI LÀM GÌ ===== */}
      <HowAiHelpsSection />

      {/* ===== DÀNH CHO AI ===== */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-2">AIVIHE dành cho những ai?</h2>
        <p className="text-center text-gray-500 mb-8 text-base">Kết nối khách hàng, gia đình và đội ngũ chăm sóc trong cùng một hành trình</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AudienceCard icon={Heart} title="Khách hàng cá nhân" items={['Quản lý thông tin sức khỏe chủ động từ sớm', 'Lưu trữ tài liệu khám, xét nghiệm, đơn thuốc', 'Theo dõi chỉ số và chuẩn bị tốt hơn cho các lần khám']} />
          <AudienceCard icon={Users} title="Gia đình đa thế hệ" items={['Đồng hành với cha mẹ, ông bà từ xa', 'Nhận tóm tắt thông tin khi được cho phép', 'Nắm lịch sinh hoạt, chỉ số, ghi chú đặc biệt']} />
          <AudienceCard icon={Activity} title="Thong Dong Daycare" items={['Ghi nhận chỉ số, sinh hoạt, hoạt động trong ngày', 'Kết nối lễ tân, chăm sóc, y tế và gia đình', 'Tạo bản tổng kết ngày gửi cho gia đình']} />
          <AudienceCard icon={Stethoscope} title="Bác sĩ gia đình" items={['Xem thông tin đã được khách hàng chia sẻ', 'Theo dõi xu hướng, bệnh nền, thuốc, lịch tái khám', 'Tư vấn dự phòng và phối hợp chuyển tuyến khi cần']} />
          <AudienceCard icon={TrendingUp} title="Phục hồi chức năng" items={['Ghi nhận đánh giá ban đầu và kế hoạch trị liệu', 'Cập nhật bài tập và tiến triển theo từng buổi', 'Phối hợp với bác sĩ gia đình và gia đình người bệnh']} />
          <AudienceCard icon={ShieldCheck} title="Bảo hiểm & đối tác" items={['Dữ liệu theo dõi sức khỏe do khách hàng cho phép chia sẻ', 'Hỗ trợ chăm sóc chủ động và dự phòng', 'Kết nối các điểm chạm trong hệ sinh thái Thong Dong']} />
        </div>
      </section>

      {/* ===== CAM KẾT ===== */}
      <section className="bg-gradient-to-b from-blue-50/30 to-white py-10">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-2">Nguyên tắc an toàn của AIVIHE</h2>
          <p className="text-center text-gray-500 mb-6 text-base">AIVIHE là công cụ hỗ trợ quản lý thông tin sức khỏe cá nhân, không thay thế hệ thống quản lý khám chữa bệnh của cơ sở y tế</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <CommitmentCard icon={ShieldCheck} color="amber" title="AI không thay thế bác sĩ" desc="AI chỉ hỗ trợ tổng hợp, giải thích và trình bày thông tin. Không chẩn đoán, không kê đơn, không thay ý kiến chuyên môn." />
            <CommitmentCard icon={Lock} color="blue" title="Người dùng kiểm soát dữ liệu" desc="Thông tin sức khỏe cá nhân thuộc quyền kiểm soát của người dùng. Chia sẻ chỉ khi có sự cho phép rõ ràng." />
            <CommitmentCard icon={CheckCircle} color="green" title="Luôn có bước xác nhận" desc="Thông tin do AI trích xuất cần được người dùng kiểm tra và xác nhận trước khi lưu vào tài khoản AIVIHE." />
            <CommitmentCard icon={AlertTriangle} color="teal" title="Minh bạch vai trò" desc="AIVIHE không thay thế hệ thống quản lý khám chữa bệnh của cơ sở y tế. Mọi xử lý y tế do chuyên môn đảm nhận." />
          </div>
        </div>
      </section>

      {/* ===== CẢM HỨNG: SỨC KHỎE LÀ VỐN QUÝ NHẤT ===== */}
      <HealthInspirationQuote />

      {/* ===== HÀNH TRÌNH CHĂM SÓC TRONG HỆ SINH THÁI ===== */}
      <EcosystemCareJourney />

      {/* ===== THIẾT BỊ IOT ===== */}
      <IotHealthDevicesSection />

      {/* ===== GÓI DỊCH VỤ ===== */}
      <ServicePackagesSection />

      {/* ===== 3 KÊNH TIẾP CẬN ===== */}
      <LandingAccessChannelsSection />

      {/* ===== ĐỘI NGŨ & ĐỐI TÁC ===== */}
      <PartnersAndAdvisorsSection />

      {/* ===== FORM ĐĂNG KÝ TƯ VẤN ===== */}
      <section id="dang-ky-tu-van" className="py-12 bg-gradient-to-b from-teal-50/40 to-white scroll-mt-6">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Bắt đầu hành trình sức khỏe cùng AIVIHE
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
              AIVIHE là nền tảng quản lý thông tin sức khỏe cá nhân — khách hàng tiếp cận qua
              <span className="font-semibold text-teal-700"> Thong Dong Daycare, Phòng khám Bác sĩ gia đình, </span>
              hoặc <span className="font-semibold text-teal-700">Phòng khám Phục hồi chức năng</span>.
              Để lại tên và số điện thoại, chúng tôi sẽ liên hệ tư vấn kênh phù hợp với bạn.
            </p>
          </div>
          <LandingConsultationRequestForm />
        </div>
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
