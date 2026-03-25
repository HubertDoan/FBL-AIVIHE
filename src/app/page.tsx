'use client'

import Link from 'next/link'
import {
  Upload, Sparkles, TrendingUp, FileText,
  CheckCircle, ShieldAlert, ArrowRight, Lock, Camera, Brain, Stethoscope,
} from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'

const FEATURES = [
  {
    icon: Upload,
    title: 'Lưu trữ tập trung',
    desc: 'Tải lên và quản lý toàn bộ tài liệu sức khỏe tại một nơi duy nhất, an toàn và dễ truy cập.',
  },
  {
    icon: Sparkles,
    title: 'AI trích xuất thông minh',
    desc: 'AI đọc và trích xuất dữ liệu từ ảnh chụp tài liệu y tế, giúp bạn không cần nhập tay.',
  },
  {
    icon: TrendingUp,
    title: 'Theo dõi xu hướng',
    desc: 'Xem biểu đồ và xu hướng sức khỏe theo thời gian, nhận biết thay đổi sớm.',
  },
  {
    icon: FileText,
    title: 'Chuẩn bị đi khám',
    desc: 'Tạo gói hồ sơ chuẩn bị đi khám bác sĩ, gồm bệnh nền, thuốc đang dùng và câu hỏi gợi ý.',
  },
]

const STEPS = [
  {
    icon: Camera,
    label: 'Chụp ảnh tài liệu y tế',
    desc: 'Chụp hoặc tải lên kết quả xét nghiệm, đơn thuốc, phiếu khám.',
  },
  {
    icon: Brain,
    label: 'AI đọc và trích xuất dữ liệu',
    desc: 'AI tự động nhận dạng và trích xuất thông tin quan trọng từ tài liệu.',
  },
  {
    icon: CheckCircle,
    label: 'Bạn xác nhận thông tin',
    desc: 'Kiểm tra và xác nhận dữ liệu AI trích xuất trước khi lưu vào hồ sơ.',
  },
  {
    icon: TrendingUp,
    label: 'Xem timeline và chuẩn bị đi khám',
    desc: 'Theo dõi sức khỏe theo thời gian và tạo gói hồ sơ khi cần đi khám.',
  },
]

const SENTENCES = [
  'Trợ lý AI sức khỏe cá nhân giúp người dân hiểu và quản lý dữ liệu sức khỏe của mình.',
  'AI chỉ hỗ trợ tổng hợp và giải thích thông tin từ dữ liệu người dùng cung cấp, không thay thế bác sĩ và không chẩn đoán bệnh.',
  'Dữ liệu sức khỏe thuộc về người dùng và chỉ được chia sẻ khi có sự cho phép của chủ hồ sơ.',
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/30">
      {/* Hero Section — compact, no scroll needed */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-cyan-500/5" />
        <div className="relative max-w-5xl mx-auto px-4 pt-4 pb-6">
          {/* Header: FBL trái to, AIVIHE giữa */}
          <div className="flex items-center justify-between mb-4">
            <img
              src="/fbl-logo.jpg"
              alt="FBL - For Better Life - Cho cuộc sống tốt hơn"
              className="h-14 md:h-18 w-auto object-contain"
            />
            <img
              src="/AIVIHE.jpg"
              alt="AIVIHE - Trợ lý AI sức khỏe cá nhân"
              className="h-16 md:h-20 w-auto object-contain rounded-lg shadow-sm"
            />
            {/* Spacer to balance FBL on left */}
            <div className="h-14 md:h-18 w-[87px] md:w-[116px]" />
          </div>

          {/* 3 Mandatory Sentences — compact */}
          <div className="max-w-3xl mx-auto mb-4 bg-white/80 backdrop-blur border border-blue-100 rounded-xl p-4 shadow-sm">
            {SENTENCES.map((s, i) => (
              <p
                key={i}
                className="flex items-start gap-2 text-left text-blue-900 mb-1.5 last:mb-0 text-sm md:text-base leading-snug"
              >
                <CheckCircle className="size-4 text-blue-500 shrink-0 mt-0.5" />
                <span>{s}</span>
              </p>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/login"
              className={buttonVariants({ size: 'lg', className: 'text-base px-6 py-4 rounded-xl min-h-[48px] gap-2' })}
            >
              Bắt đầu sử dụng
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/login"
              className={buttonVariants({ variant: 'outline', size: 'lg', className: 'text-base px-6 py-4 rounded-xl min-h-[48px]' })}
            >
              Đăng nhập
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-5xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold text-center mb-1 text-gray-900">
          Tính năng chính
        </h2>
        <p className="text-center text-gray-500 mb-4 text-base">
          Mọi thứ bạn cần để quản lý sức khỏe cho cả gia đình
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-6 text-center hover:shadow-lg hover:border-blue-200 transition-all duration-300 group"
            >
              <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-blue-50 text-blue-600 mb-4 group-hover:bg-blue-100 transition-colors">
                <f.icon className="size-7" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">{f.title}</h3>
              <p className="text-gray-600" style={{ fontSize: '16px', lineHeight: '1.6' }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gradient-to-b from-blue-50/50 to-white py-6">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-1 text-gray-900">
            Cách hoạt động
          </h2>
          <p className="text-center text-gray-500 mb-6 text-base">
            Chỉ 4 bước đơn giản để bắt đầu
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map((s, i) => (
              <div key={i} className="relative flex flex-col items-center text-center">
                {/* Step number */}
                <div className="absolute -top-2 -left-1 sm:left-auto size-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center shadow-md">
                  {i + 1}
                </div>
                <div className="size-16 rounded-2xl bg-white border-2 border-blue-200 text-blue-600 flex items-center justify-center mb-4 shadow-sm">
                  <s.icon className="size-7" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1" style={{ fontSize: '17px' }}>
                  {s.label}
                </h3>
                <p className="text-sm text-gray-500" style={{ fontSize: '15px', lineHeight: '1.5' }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="max-w-4xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold text-center mb-4 text-gray-900">
          Cam kết của AIVIHE
        </h2>
        <div className="space-y-6">
          {/* Disclaimer Card */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="size-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <ShieldAlert className="size-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-amber-800 mb-2">
                  Đây KHÔNG phải hệ thống y tế
                </h3>
                <p className="text-amber-700" style={{ fontSize: '16px', lineHeight: '1.6' }}>
                  AIVIHE là công cụ hỗ trợ quản lý dữ liệu sức khỏe cá nhân.
                  AI không chẩn đoán bệnh, không kê đơn thuốc và không thay thế bác sĩ.
                  Vui lòng tham khảo ý kiến bác sĩ để được tư vấn chuyên môn.
                </p>
              </div>
            </div>
          </div>

          {/* Data Ownership */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="size-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Lock className="size-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-blue-800 mb-2">
                  Dữ liệu thuộc về bạn
                </h3>
                <p className="text-blue-700" style={{ fontSize: '16px', lineHeight: '1.6' }}>
                  Dữ liệu sức khỏe thuộc về người dùng và chỉ được chia sẻ khi có sự cho phép rõ ràng của chủ hồ sơ.
                  Bạn có toàn quyền kiểm soát thông tin của mình.
                </p>
              </div>
            </div>
          </div>

          {/* AI Limitations */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="size-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                <Brain className="size-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">
                  AI có giới hạn
                </h3>
                <p className="text-slate-700" style={{ fontSize: '16px', lineHeight: '1.6' }}>
                  AI chỉ hỗ trợ tổng hợp và giải thích thông tin từ dữ liệu bạn cung cấp.
                  Kết quả trích xuất cần được bạn xác nhận trước khi lưu.
                  Mọi thông tin AI tạo ra đều trích dẫn nguồn gốc từ tài liệu gốc.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Family Doctor Section */}
      <section className="py-6 bg-gradient-to-b from-blue-50/30 to-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-2xl p-8 md:p-10 shadow-sm">
            <div className="flex items-start gap-4 mb-6">
              <div className="size-14 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                <Stethoscope className="size-7 text-teal-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-teal-900 mb-2">
                  Đăng ký Bác sĩ Gia đình
                </h2>
                <p className="text-lg text-teal-800">
                  Bạn có thể đăng ký bác sĩ gia đình để hỗ trợ quản lý sức khỏe cá nhân bạn và gia đình bạn.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3 text-base text-teal-800">
                <CheckCircle className="size-5 text-teal-600 shrink-0" />
                <span>Tư vấn sức khỏe định kỳ cho cả gia đình</span>
              </div>
              <div className="flex items-center gap-3 text-base text-teal-800">
                <CheckCircle className="size-5 text-teal-600 shrink-0" />
                <span>Theo dõi và giám sát chỉ số sức khỏe</span>
              </div>
              <div className="flex items-center gap-3 text-base text-teal-800">
                <CheckCircle className="size-5 text-teal-600 shrink-0" />
                <span>Hướng dẫn trước khi đi khám chuyên khoa</span>
              </div>
              <div className="flex items-center gap-3 text-base text-teal-800">
                <CheckCircle className="size-5 text-teal-600 shrink-0" />
                <span>Hỗ trợ đọc kết quả xét nghiệm</span>
              </div>
            </div>

            <div className="text-center space-y-3">
              <Link
                href="/login"
                className={buttonVariants({ size: 'lg', className: 'text-lg px-8 py-5 rounded-xl min-h-[52px] gap-2 bg-teal-600 hover:bg-teal-700' })}
              >
                <Stethoscope className="size-5" />
                Trở thành Thành viên để đăng ký
              </Link>
              <p className="text-sm text-teal-700">
                Bạn cần đăng ký Thành viên AIVIHE trước khi đăng ký Bác sĩ gia đình
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="text-center py-8 bg-gradient-to-b from-white to-blue-50/50">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Sẵn sàng quản lý sức khỏe tốt hơn?
        </h2>
        <p className="text-gray-500 mb-8" style={{ fontSize: '18px' }}>
          Bắt đầu miễn phí, không cần thẻ tín dụng
        </p>
        <Link
          href="/login"
          className={buttonVariants({ size: 'lg', className: 'text-lg px-10 py-6 rounded-xl min-h-[52px] gap-2' })}
        >
          Bắt đầu sử dụng
          <ArrowRight className="size-5" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-8">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-gray-500 mb-1" style={{ fontSize: '15px' }}>
            &copy; 2024 AIVIHE - FBL (For Better Life - Cho cuộc sống tốt hơn)
          </p>
          <p className="text-gray-400 text-sm">
            Được phát triển bởi đội ngũ FBL
          </p>
        </div>
      </footer>
    </div>
  )
}
