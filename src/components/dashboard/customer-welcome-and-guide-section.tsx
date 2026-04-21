'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Sparkles } from 'lucide-react'

/**
 * Welcome section for customer dashboard.
 * Director's welcome message only — hướng dẫn sử dụng đã có ở sidebar (Hướng dẫn),
 * không lặp lại ở dashboard body để tránh nhiễu.
 */
export function CustomerWelcomeAndGuideSection({ userName }: { userName: string }) {
  return (
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
              AIVIHE là nền tảng quản lý thông tin sức khỏe cá nhân của hệ sinh thái Thong Dong.
              Tại đây, bạn có thể quản lý thông tin sức khỏe, theo dõi chỉ số,
              và được hỗ trợ bởi đội ngũ bác sĩ gia đình chuyên nghiệp.
            </p>
            <p className="text-teal-700 text-sm mt-2 italic">
              — Ban Giám đốc Thong Dong Life
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
