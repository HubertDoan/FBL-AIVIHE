'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle, PhoneCall, Loader2 } from 'lucide-react'

/**
 * Form đăng ký tư vấn trên trang chủ aivihe.vn
 * Chỉ cần tên + SĐT. Sau khi submit, NV hành chính sẽ liên hệ bổ sung thông tin.
 * AIVIHE không có điểm tiếp xúc vật lý riêng — khách đến qua Daycare/BSGD/PHCN.
 */
export function LandingConsultationRequestForm() {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [channel, setChannel] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (fullName.trim().length < 2) {
      setError('Vui lòng nhập họ và tên')
      return
    }
    if (phone.length !== 10 || !phone.startsWith('0')) {
      setError('Số điện thoại phải 10 chữ số, bắt đầu bằng 0')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/consultation-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName.trim(),
          phone: phone.trim(),
          channel: channel || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Không thể gửi. Vui lòng thử lại.')
        return
      }
      setSubmitted(true)
    } catch {
      setError('Không thể kết nối. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  if (submitted) {
    return (
      <Card className="border-green-200 bg-green-50/50 max-w-xl mx-auto">
        <CardContent className="pt-6 pb-6 text-center">
          <div className="inline-flex size-16 rounded-full bg-green-100 text-green-600 items-center justify-center mb-4">
            <CheckCircle className="size-8" />
          </div>
          <h3 className="text-xl font-bold text-green-900 mb-2">
            Đã gửi yêu cầu tư vấn!
          </h3>
          <p className="text-green-800 leading-relaxed mb-3">
            Cảm ơn {fullName}. Nhân viên hành chính sẽ liên hệ số {phone} trong
            vòng 24 giờ để tư vấn và hướng dẫn bạn tiếp cận dịch vụ phù hợp.
          </p>
          <p className="text-sm text-green-700">
            AIVIHE phục vụ qua 3 kênh: Thong Dong Daycare, Phòng khám Bác sĩ gia đình,
            Phòng khám Phục hồi chức năng.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-xl mx-auto shadow-lg border-teal-100">
      <CardContent className="pt-6 pb-6">
        <div className="text-center mb-5">
          <div className="inline-flex size-12 rounded-full bg-teal-100 text-teal-600 items-center justify-center mb-2">
            <PhoneCall className="size-5" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Đăng ký tư vấn miễn phí</h3>
          <p className="text-sm text-gray-500 mt-1">
            Để lại tên + SĐT, nhân viên sẽ liên hệ tư vấn trong 24h
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="cr_name" className="text-base">
              Họ và tên <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cr_name"
              type="text"
              placeholder="Ví dụ: Nguyễn Văn Minh"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="min-h-[48px] text-base"
              autoComplete="name"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cr_phone" className="text-base">
              Số điện thoại <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cr_phone"
              type="tel"
              inputMode="numeric"
              placeholder="0901234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              required
              className="min-h-[48px] text-base"
              autoComplete="tel"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-base">Bạn quan tâm dịch vụ nào? (tùy chọn)</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'daycare', label: '🏠 Thong Dong Daycare' },
                { value: 'family-doctor', label: '👨‍⚕️ Bác sĩ gia đình' },
                { value: 'rehabilitation', label: '🏥 Phục hồi chức năng' },
                { value: 'aivihe', label: '🤖 AIVIHE Trợ lý AI sức khỏe' },
                { value: 'unsure', label: '💭 Chưa rõ, cần tư vấn' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setChannel(channel === opt.value ? '' : opt.value)}
                  className={`px-3 py-2 rounded-lg border text-sm text-left transition ${
                    channel === opt.value
                      ? 'border-teal-500 bg-teal-50 text-teal-700 font-medium'
                      : 'border-gray-200 bg-white hover:border-teal-300 text-gray-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive text-center bg-destructive/10 rounded-md p-2.5">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full min-h-[52px] text-base font-semibold bg-teal-600 hover:bg-teal-700"
            disabled={isLoading || phone.length < 10 || fullName.trim().length < 2}
          >
            {isLoading ? (
              <><Loader2 className="size-4 animate-spin mr-2" /> Đang gửi...</>
            ) : (
              'Gửi yêu cầu tư vấn'
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center leading-relaxed">
            Bằng việc gửi thông tin, bạn đồng ý để Thong Dong Life liên hệ tư vấn.
            Thông tin được bảo mật, không chia sẻ cho bên thứ ba.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
