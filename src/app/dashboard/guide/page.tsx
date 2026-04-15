'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import {
  BookOpen, Upload, Brain, CheckCircle, TrendingUp,
  Home, Stethoscope, Activity, Hospital, Bell, UserCircle, ArrowLeft,
} from 'lucide-react'

/**
 * Trang hướng dẫn sử dụng AIVIHE cho khách hàng
 * Giải thích 4 bước quản lý sức khỏe + ý nghĩa 7 khu vực
 */

export default function GuidePage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1 mb-2">
          <ArrowLeft className="size-4" /> Về tổng quan
        </Link>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="size-6 text-green-600" />
          Hướng dẫn sử dụng AIVIHE
        </h1>
        <p className="text-muted-foreground mt-1">
          AIVIHE là trợ lý AI sức khỏe cá nhân trong hệ sinh thái Thong Dong Life
        </p>
      </div>

      {/* 4 bước cơ bản */}
      <Card>
        <CardContent className="pt-5 pb-5 space-y-4">
          <h2 className="text-lg font-bold">4 bước quản lý sức khỏe</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <StepCard
              step={1}
              icon={Upload}
              title="Cập nhật hồ sơ"
              desc="Tải lên kết quả xét nghiệm, đơn thuốc, phiếu khám. AI tự đọc và trích xuất thông tin."
            />
            <StepCard
              step={2}
              icon={Brain}
              title="AI phân tích"
              desc="Trợ lý AI tổng hợp toàn bộ dữ liệu, lập báo cáo đánh giá chung về sức khỏe của bạn."
            />
            <StepCard
              step={3}
              icon={CheckCircle}
              title="Bạn xác nhận"
              desc="Kiểm tra dữ liệu AI trích xuất trước khi lưu. Bạn luôn là người quyết định."
            />
            <StepCard
              step={4}
              icon={TrendingUp}
              title="Theo dõi & nâng cấp"
              desc="Xem biểu đồ xu hướng. Khi cần hỗ trợ chuyên sâu, đăng ký gói BSGĐ, PHCN, chuyên khoa."
            />
          </div>
        </CardContent>
      </Card>

      {/* 7 khu vực */}
      <Card>
        <CardContent className="pt-5 pb-5 space-y-3">
          <h2 className="text-lg font-bold">7 khu vực trong tài khoản của bạn</h2>
          <div className="space-y-2">
            <AreaItem icon={Home} color="text-teal-600" title="Daycare" desc="Xem hoạt động hằng ngày tại Thong Dong Daycare — check-in/out, hoạt động, chỉ số đo tại trung tâm, ghi chú NV." />
            <AreaItem icon={Stethoscope} color="text-blue-600" title="Bác sĩ gia đình" desc="Theo dõi các lần khám BSGĐ — chẩn đoán, đơn thuốc, khuyến nghị, kế hoạch tái khám." />
            <AreaItem icon={Activity} color="text-purple-600" title="Phục hồi chức năng" desc="Buổi trị liệu PHCN — bài tập, mức đau trước/sau, tiến triển vận động." />
            <AreaItem icon={Hospital} color="text-amber-600" title="Khám chữa bệnh" desc="Các lần khám tại BV/PK chuyên khoa — chẩn đoán, xét nghiệm, điều trị." />
            <AreaItem icon={Bell} color="text-pink-600" title="Thông báo" desc="Tin nhắn từ trung tâm, bác sĩ, gia đình. Cảnh báo khi chỉ số bất thường." />
            <AreaItem icon={BookOpen} color="text-green-600" title="Hướng dẫn" desc="Trang này — hướng dẫn cách sử dụng AIVIHE." />
            <AreaItem icon={UserCircle} color="text-slate-600" title="Thông tin tài khoản" desc="Thông tin cá nhân, tài liệu y tế đã tải lên, gói dịch vụ đang sử dụng." />
          </div>
        </CardContent>
      </Card>

      {/* 3 Câu cam kết */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-5 pb-5 space-y-2">
          <h2 className="text-lg font-bold text-amber-900">3 điều bạn cần biết</h2>
          <ul className="space-y-2 text-sm text-amber-900">
            <li className="flex items-start gap-2">
              <CheckCircle className="size-4 shrink-0 mt-0.5 text-amber-700" />
              <span>Trợ lý AI sức khỏe cá nhân giúp bạn <strong>hiểu và quản lý dữ liệu sức khỏe của mình</strong>.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="size-4 shrink-0 mt-0.5 text-amber-700" />
              <span>AI chỉ hỗ trợ <strong>tổng hợp và giải thích</strong> thông tin từ dữ liệu bạn cung cấp, <strong>không thay thế bác sĩ</strong> và không chẩn đoán bệnh.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="size-4 shrink-0 mt-0.5 text-amber-700" />
              <span>Dữ liệu sức khỏe <strong>thuộc về bạn</strong> và chỉ được chia sẻ khi có sự cho phép của chủ hồ sơ.</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* 3 kênh tiếp cận */}
      <Card>
        <CardContent className="pt-5 pb-5 space-y-3">
          <h2 className="text-lg font-bold">3 kênh tiếp cận dịch vụ</h2>
          <p className="text-sm text-gray-600">
            AIVIHE là nền tảng online — khách hàng tiếp cận qua 3 điểm vật lý của Thong Dong Life:
          </p>
          <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
            <li><strong>Thong Dong Daycare</strong> — trung tâm chăm sóc ban ngày, sinh hoạt hàng ngày</li>
            <li><strong>Phòng khám Bác sĩ gia đình</strong> — khám tổng quát, theo dõi sức khỏe định kỳ</li>
            <li><strong>Phòng khám Phục hồi chức năng</strong> — đánh giá chức năng, trị liệu</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}

function StepCard({ step, icon: Icon, title, desc }: {
  step: number
  icon: React.ComponentType<{ className?: string }>
  title: string
  desc: string
}) {
  return (
    <div className="relative flex items-start gap-3 p-3 rounded-lg bg-slate-50 border">
      <div className="size-10 rounded-lg bg-green-100 text-green-700 flex items-center justify-center shrink-0 font-bold">
        {step}
      </div>
      <div>
        <div className="flex items-center gap-1.5 mb-1">
          <Icon className="size-4 text-green-700" />
          <p className="font-bold text-sm">{title}</p>
        </div>
        <p className="text-sm text-gray-600 leading-snug">{desc}</p>
      </div>
    </div>
  )
}

function AreaItem({ icon: Icon, color, title, desc }: {
  icon: React.ComponentType<{ className?: string }>
  color: string
  title: string
  desc: string
}) {
  return (
    <div className="flex items-start gap-2.5 p-2 rounded-md hover:bg-slate-50 transition">
      <Icon className={`size-5 shrink-0 mt-0.5 ${color}`} />
      <div>
        <p className="font-semibold text-gray-900">{title}</p>
        <p className="text-sm text-gray-600">{desc}</p>
      </div>
    </div>
  )
}
