import Image from 'next/image'
import { ArrowRight, UserPlus, FileText, Brain, CheckCircle, Users } from 'lucide-react'

/**
 * Section "Hành trình chăm sóc liên tục" — 5 điểm chạm trong hệ sinh thái Thong Dong:
 * Khởi tạo tài khoản AIVIHE → Cập nhật tài liệu/chỉ số → AI tóm tắt →
 * Người dùng xác nhận → Gia đình/Daycare/BS gia đình/PHCN phối hợp khi được phân quyền.
 */
export function EcosystemCareJourney() {
  return (
    <section className="py-6 bg-gradient-to-b from-teal-50/30 to-white">
      <div className="max-w-6xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-10">
          <Image
            src="/thong-dong-life-logo.png"
            alt="Thong Dong Life"
            width={160}
            height={64}
            className="h-12 w-auto mx-auto mb-3"
          />
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            Một hành trình sức khỏe – nhiều điểm chạm chăm sóc
          </h2>
          <p className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed">
            AIVIHE kết nối các điểm chạm trong hệ sinh thái Thong Dong: từ Daycare, bác sĩ gia đình,
            phục hồi chức năng đến gia đình. Mỗi hoạt động được ghi nhận phù hợp, giúp việc chăm sóc
            không bị đứt gãy thông tin.
          </p>
        </div>

        {/* 5 Journey steps */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <JourneyStep
            icon={UserPlus}
            step={1}
            title="Khởi tạo tài khoản AIVIHE"
            desc="Khách hàng khởi tạo tài khoản AIVIHE để bắt đầu quản lý thông tin sức khỏe cá nhân."
          />
          <JourneyStep
            icon={FileText}
            step={2}
            title="Cập nhật tài liệu & chỉ số"
            desc="Tài liệu khám, đơn thuốc, xét nghiệm và chỉ số theo dõi được cập nhật liên tục."
          />
          <JourneyStep
            icon={Brain}
            step={3}
            title="AI hỗ trợ đọc và tóm tắt"
            desc="AI nhận diện, trích xuất và diễn giải thông tin bằng ngôn ngữ dễ hiểu."
          />
          <JourneyStep
            icon={CheckCircle}
            step={4}
            title="Người dùng xác nhận"
            desc="Thông tin chỉ được lưu sau khi người dùng kiểm tra và xác nhận."
          />
          <JourneyStep
            icon={Users}
            step={5}
            title="Đội ngũ phối hợp chăm sóc"
            desc="Gia đình, Daycare, bác sĩ gia đình và PHCN cùng phối hợp khi được phân quyền."
          />
        </div>

        {/* Ecosystem brands + link */}
        <div className="mt-10 text-center">
          <div className="flex flex-wrap justify-center gap-3 text-sm text-teal-700 mb-4">
            {['🌿 Thong Dong Life', '🏠 Daycare', '🏡 Home', '🌳 Land', '💻 Tech'].map((t) => (
              <span key={t} className="bg-white/70 px-3 py-1.5 rounded-full border border-teal-200">{t}</span>
            ))}
          </div>
          <a
            href="https://thongdonglife.vn"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-800 font-medium text-sm underline underline-offset-2"
          >
            Tìm hiểu thêm tại thongdonglife.vn <ArrowRight className="size-3" />
          </a>
        </div>
      </div>
    </section>
  )
}

function JourneyStep({ icon: Icon, step, title, desc }: {
  icon: React.ComponentType<{ className?: string }>
  step: number
  title: string
  desc: string
}) {
  return (
    <div className="relative bg-white rounded-2xl border border-teal-100 p-5 text-center hover:shadow-md transition-shadow">
      <div className="absolute -top-3 -right-2 size-8 rounded-full bg-teal-600 text-white text-sm font-bold flex items-center justify-center shadow">
        {step}
      </div>
      <div className="inline-flex items-center justify-center size-12 rounded-2xl bg-teal-50 text-teal-600 mb-3">
        <Icon className="size-6" />
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
    </div>
  )
}
