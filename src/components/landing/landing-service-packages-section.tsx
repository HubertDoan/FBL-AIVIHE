'use client'

import Link from 'next/link'
import { ArrowRight, CheckCircle, Star, Heart, Activity, Stethoscope } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'

/**
 * Section giới thiệu 4 gói dịch vụ AIVIHE:
 * Gói 0 (miễn phí) → Gói 1 (BSGD) → Gói 2 (PHCN) → Gói 3 (Chuyên khoa sâu)
 */
export function ServicePackagesSection() {
  return (
    <section className="py-12 bg-gradient-to-b from-white to-teal-50/30">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-2">
          Gói dịch vụ
        </h2>
        <p className="text-center text-gray-500 mb-8 text-base">
          Bắt đầu miễn phí — nâng cấp khi bạn cần thêm hỗ trợ chuyên sâu
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Gói 0 — Miễn phí */}
          <PackageCard
            icon={Heart}
            name="Cơ bản"
            price="Miễn phí"
            highlight={false}
            features={[
              'Khởi tạo tài khoản AIVIHE',
              'Quản lý thông tin sức khỏe cá nhân',
              'Cập nhật đơn thuốc, kết quả khám, xét nghiệm và tài liệu sức khỏe',
              'AI hỗ trợ tóm tắt thông tin đã được xác nhận',
              'Không giới hạn thời gian',
            ]}
          />

          {/* Gói 1 — Bác sĩ gia đình */}
          <PackageCard
            icon={Stethoscope}
            name="Bác sĩ gia đình"
            price="Thuê bao + phí/lần"
            highlight
            features={[
              'Tất cả gói Cơ bản',
              'BS gia đình theo dõi thông tin sức khỏe khi khách hàng cho phép',
              'Tư vấn lối sống, dự phòng, quản lý bệnh nền',
              'Chuẩn bị khi cần đi khám chuyên khoa',
              'Tự chọn BS — đánh giá sao',
            ]}
          />

          {/* Gói 2 — PHCN */}
          <PackageCard
            icon={Activity}
            name="Phục hồi chức năng"
            price="Phí theo buổi"
            highlight={false}
            features={[
              'Tất cả gói BSGD',
              'Đánh giá chức năng chuyên sâu',
              'Trị liệu tại trung tâm hoặc tại nhà',
              'Nhật ký trị liệu và tiến triển PHCN',
              'Bài tập cá nhân hóa',
            ]}
          />

          {/* Gói 3 — Chuyên khoa sâu */}
          <PackageCard
            icon={Star}
            name="Chuyên khoa sâu"
            price="Phí theo lần tư vấn"
            highlight={false}
            features={[
              'Tất cả gói PHCN',
              'BS chuyên khoa: khớp, tim mạch, nội tiết...',
              'Xem bản tóm tắt thông tin sức khỏe và tài liệu liên quan khi khách hàng cho phép',
              'Hỗ trợ đi khám tại bệnh viện',
              'Phối hợp BS gia đình + chuyên khoa',
            ]}
          />
        </div>

        <div className="text-center mt-8">
          <Link
            href="/register"
            className={buttonVariants({ size: 'lg', className: 'text-base px-8 py-5 rounded-xl min-h-[48px] gap-2 bg-teal-600 hover:bg-teal-700' })}
          >
            Đăng ký miễn phí ngay <ArrowRight className="size-4" />
          </Link>
          <p className="text-sm text-gray-500 mt-2">
            Bắt đầu với gói Cơ bản miễn phí — nâng cấp bất cứ lúc nào
          </p>
        </div>
      </div>
    </section>
  )
}

function PackageCard({ icon: Icon, name, price, highlight, features }: {
  icon: React.ComponentType<{ className?: string }>
  name: string
  price: string
  highlight: boolean
  features: string[]
}) {
  return (
    <div className={`rounded-2xl border p-5 flex flex-col ${
      highlight
        ? 'border-teal-400 bg-teal-50/50 shadow-md ring-2 ring-teal-200'
        : 'border-gray-200 bg-white'
    }`}>
      {highlight && (
        <span className="inline-block text-xs font-bold text-teal-700 bg-teal-100 rounded-full px-3 py-0.5 mb-3 self-start">
          Phổ biến nhất
        </span>
      )}
      <div className="flex items-center gap-2 mb-2">
        <div className={`size-9 rounded-lg flex items-center justify-center ${
          highlight ? 'bg-teal-100 text-teal-600' : 'bg-gray-100 text-gray-600'
        }`}>
          <Icon className="size-5" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">{name}</h3>
      </div>
      <p className={`text-sm font-semibold mb-4 ${highlight ? 'text-teal-600' : 'text-gray-500'}`}>
        {price}
      </p>
      <ul className="space-y-2 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
            <CheckCircle className={`size-4 shrink-0 mt-0.5 ${highlight ? 'text-teal-500' : 'text-gray-400'}`} />
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
