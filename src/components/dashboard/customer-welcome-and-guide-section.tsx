'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Sparkles, BookOpen, ChevronDown, ChevronUp,
  FileText, Brain, TrendingUp, Shield,
} from 'lucide-react'

/**
 * Welcome section for customer dashboard:
 * - Director's announcement/welcome message
 * - Getting started guide for health management
 */
export function CustomerWelcomeAndGuideSection({ userName }: { userName: string }) {
  const [showGuide, setShowGuide] = useState(false)

  return (
    <div className="space-y-4">
      {/* Director welcome */}
      <Card className="border-teal-200 bg-gradient-to-r from-teal-50 to-cyan-50">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-start gap-3">
            <div className="size-10 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h3 className="font-bold text-teal-900 text-lg">
                Chào mừng {userName} đến với AIVIHE!
              </h3>
              <p className="text-teal-800 mt-1 leading-relaxed">
                AIVIHE là trợ lý AI sức khỏe cá nhân trong hệ sinh thái Thong Dong Life.
                Tại đây, bạn có thể quản lý hồ sơ sức khỏe, theo dõi chỉ số,
                và được hỗ trợ bởi đội ngũ bác sĩ gia đình chuyên nghiệp.
              </p>
              <p className="text-teal-700 text-sm mt-2 italic">
                — Ban Giám đốc Thong Dong Life
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Getting started guide (collapsible) */}
      <Card>
        <CardContent className="pt-4 pb-3">
          <Button
            variant="ghost"
            className="w-full justify-between p-0 h-auto hover:bg-transparent"
            onClick={() => setShowGuide(!showGuide)}
          >
            <div className="flex items-center gap-2 text-left">
              <BookOpen className="size-5 text-blue-600" />
              <span className="font-semibold text-base">Hướng dẫn sử dụng AIVIHE</span>
            </div>
            {showGuide ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </Button>

          {showGuide && (
            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              <GuideStep
                icon={FileText}
                step={1}
                title="Cập nhật hồ sơ sức khỏe"
                desc="Tải lên kết quả khám, đơn thuốc, xét nghiệm. AI sẽ tự động đọc và trích xuất thông tin."
              />
              <GuideStep
                icon={Brain}
                step={2}
                title="AI phân tích"
                desc="Trợ lý AI tổng hợp dữ liệu, tạo báo cáo đánh giá chung về sức khỏe của bạn."
              />
              <GuideStep
                icon={TrendingUp}
                step={3}
                title="Theo dõi xu hướng"
                desc="Xem biểu đồ chỉ số theo thời gian, nhận cảnh báo khi có bất thường."
              />
              <GuideStep
                icon={Shield}
                step={4}
                title="Đăng ký gói dịch vụ"
                desc="Nâng cấp để có bác sĩ gia đình theo dõi, PHCN, hoặc chuyên khoa sâu hỗ trợ."
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function GuideStep({ icon: Icon, step, title, desc }: {
  icon: React.ComponentType<{ className?: string }>
  step: number
  title: string
  desc: string
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
      <div className="size-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 text-sm font-bold">
        {step}
      </div>
      <div>
        <p className="font-medium text-sm text-gray-900">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
      </div>
    </div>
  )
}
