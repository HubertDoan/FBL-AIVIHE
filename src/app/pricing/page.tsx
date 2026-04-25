import type { Metadata } from 'next'
import Link from 'next/link'
import { Check, X, Zap, Shield, HeartPulse } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { FREE_OCR_LIMIT } from '@/lib/subscriptions/ocr-limit-checker-and-usage-tracker'

export const metadata: Metadata = {
  title: 'Gói dịch vụ – AIVIHE',
  description: 'Chọn gói phù hợp: Miễn phí hoặc Nâng cao để quản lý thông tin sức khỏe cá nhân.',
}

const FREE_FEATURES = [
  { label: `${FREE_OCR_LIMIT.toLocaleString()} trang OCR tài liệu y tế / tháng`, included: true },
  { label: 'Hồ sơ thông tin sức khỏe cá nhân', included: true },
  { label: 'Upload & lưu trữ tài liệu y tế', included: true },
  { label: 'Kết nối bác sĩ gia đình', included: true },
  { label: 'Chuẩn bị đi khám (AI hỗ trợ)', included: true },
  { label: 'Thông báo & cảnh báo sức khỏe', included: true },
  { label: 'OCR không giới hạn', included: false },
  { label: 'Báo cáo AI tổng hợp nâng cao', included: false },
  { label: 'Ưu tiên hỗ trợ kỹ thuật', included: false },
]

const PREMIUM_FEATURES = [
  { label: 'OCR tài liệu y tế không giới hạn', included: true },
  { label: 'Hồ sơ thông tin sức khỏe cá nhân', included: true },
  { label: 'Upload & lưu trữ tài liệu y tế', included: true },
  { label: 'Kết nối bác sĩ gia đình', included: true },
  { label: 'Chuẩn bị đi khám (AI hỗ trợ)', included: true },
  { label: 'Thông báo & cảnh báo sức khỏe', included: true },
  { label: 'Báo cáo AI tổng hợp nâng cao', included: true },
  { label: 'Ưu tiên hỗ trợ kỹ thuật', included: true },
  { label: 'Xuất PDF không giới hạn', included: true },
]

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-16 px-4">
      <div className="max-w-4xl mx-auto space-y-12">

        {/* Header */}
        <div className="text-center space-y-3">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest">Gói dịch vụ</p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Chọn gói phù hợp với bạn
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto text-lg">
            Bắt đầu miễn phí. Nâng cấp khi bạn cần thêm.
          </p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Free */}
          <Card className="border-2 border-gray-200">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 mb-1">
                <HeartPulse className="size-5 text-gray-500" />
                <span className="font-semibold text-gray-700 text-lg">Miễn phí</span>
              </div>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-bold text-gray-900">0₫</span>
                <span className="text-gray-400 mb-1">/tháng</span>
              </div>
              <p className="text-sm text-gray-500">Đủ dùng cho cá nhân quản lý hồ sơ sức khỏe</p>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <ul className="space-y-2.5">
                {FREE_FEATURES.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    {f.included
                      ? <Check className="size-4 text-green-500 shrink-0 mt-0.5" />
                      : <X className="size-4 text-gray-300 shrink-0 mt-0.5" />}
                    <span className={f.included ? 'text-gray-700' : 'text-gray-400'}>{f.label}</span>
                  </li>
                ))}
              </ul>
              <Link href="/register">
                <Button variant="outline" className="w-full min-h-[48px] text-base mt-2">
                  Bắt đầu miễn phí
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Premium */}
          <Card className="border-2 border-blue-500 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
              PHỔ BIẾN NHẤT
            </div>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="size-5 text-blue-500" />
                <span className="font-semibold text-blue-700 text-lg">Nâng cao</span>
              </div>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-bold text-gray-900">200.000₫</span>
                <span className="text-gray-400 mb-1">/tháng</span>
              </div>
              <p className="text-sm text-gray-500">Dành cho người dùng thường xuyên & gia đình</p>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <ul className="space-y-2.5">
                {PREMIUM_FEATURES.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="size-4 text-blue-500 shrink-0 mt-0.5" />
                    <span className="text-gray-700">{f.label}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full min-h-[48px] text-base mt-2 bg-blue-600 hover:bg-blue-700">
                Liên hệ nâng cấp
              </Button>
              <p className="text-xs text-center text-gray-400">
                Liên hệ: <a href="tel:+84xxx" className="underline">hotline</a> hoặc nhắn tin trong app
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Trust signals */}
        <div className="grid sm:grid-cols-3 gap-4 text-center">
          {[
            { icon: Shield, title: 'Dữ liệu của bạn', desc: 'Thuộc về bạn. Chỉ chia sẻ khi bạn cho phép.' },
            { icon: HeartPulse, title: 'AI hỗ trợ', desc: 'Tổng hợp thông tin — không chẩn đoán, không thay thế bác sĩ.' },
            { icon: Zap, title: 'Nâng cấp bất cứ lúc', desc: 'Huỷ dễ dàng. Không ràng buộc hợp đồng dài hạn.' },
          ].map(({ icon: Icon, title, desc }, i) => (
            <div key={i} className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm space-y-1">
              <Icon className="size-6 text-blue-500 mx-auto" />
              <p className="font-semibold text-gray-800 text-sm">{title}</p>
              <p className="text-xs text-gray-500">{desc}</p>
            </div>
          ))}
        </div>

        {/* Back link */}
        <div className="text-center">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 underline">
            ← Trở về trang chủ
          </Link>
        </div>
      </div>
    </main>
  )
}
