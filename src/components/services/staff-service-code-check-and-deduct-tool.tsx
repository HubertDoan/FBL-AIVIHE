'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { QrCode, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

/**
 * Công cụ cho BS/nhân viên/KTV: nhập mã dịch vụ của khách để trừ 1 lượt sử dụng
 * Khách xuất trình mã SVC-HN-xxxxxx khi được khám tại nhà hoặc tại trung tâm
 */

interface LastResult {
  ok: boolean
  message: string
  package_type?: number
  remaining?: number | 'unlimited'
}

const PACKAGE_LABELS: Record<number, string> = {
  0: 'Cơ bản',
  1: 'Bác sĩ gia đình',
  2: 'Phục hồi chức năng',
  3: 'Chuyên khoa sâu',
  4: 'Chăm sóc giấc ngủ',
}

export function StaffServiceCodeCheckAndDeductTool() {
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<LastResult | null>(null)

  async function handleSubmit() {
    const trimmed = code.trim().toUpperCase()
    if (!/^SVC-[A-Z]{2}-\d{6}$/.test(trimmed)) {
      toast.error('Mã không hợp lệ. Định dạng: SVC-HN-000001')
      return
    }

    setSubmitting(true); setResult(null)
    try {
      const res = await fetch('/api/service-registration/record-usage-by-service-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service_code: trimmed }),
      })
      const data = await res.json()
      if (!res.ok) {
        setResult({ ok: false, message: data.error || 'Không thể xử lý' })
        toast.error(data.error || 'Không thể xử lý')
        return
      }
      setResult({
        ok: true,
        message: data.message,
        package_type: data.registration?.package_type,
        remaining: data.registration?.total_visits === 0
          ? 'unlimited'
          : (data.registration?.total_visits - data.registration?.used_visits),
      })
      toast.success('Đã ghi nhận 1 lượt sử dụng')
      setCode('')
    } catch {
      setResult({ ok: false, message: 'Lỗi kết nối' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="max-w-xl">
      <CardContent className="pt-6 pb-6 space-y-4">
        <div className="flex items-center gap-2">
          <QrCode className="size-5 text-teal-600" />
          <h3 className="text-lg font-bold">Check mã dịch vụ khách hàng</h3>
        </div>
        <p className="text-sm text-gray-500">
          Khi khách sử dụng dịch vụ (BS đến nhà, trị liệu tại trung tâm, tư vấn chuyên khoa...),
          nhập mã dịch vụ của khách để trừ 1 lượt.
        </p>

        <div className="space-y-2">
          <Label htmlFor="svc-code" className="text-base">Mã dịch vụ</Label>
          <Input
            id="svc-code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="SVC-HN-000001"
            className="min-h-[48px] font-mono text-lg tracking-wider"
            disabled={submitting}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={submitting || !code.trim()}
          className="w-full min-h-[48px] bg-teal-600 hover:bg-teal-700"
        >
          {submitting ? <><Loader2 className="size-4 animate-spin mr-2" /> Đang xử lý...</> : 'Xác nhận trừ 1 lượt'}
        </Button>

        {result && (
          <div className={`rounded-md p-3 border ${
            result.ok
              ? 'bg-green-50 border-green-200 text-green-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}>
            <div className="flex items-start gap-2">
              {result.ok ? <CheckCircle className="size-5 shrink-0 mt-0.5" /> : <AlertCircle className="size-5 shrink-0 mt-0.5" />}
              <div className="text-sm">
                <p className="font-medium">{result.message}</p>
                {result.ok && result.package_type !== undefined && (
                  <p className="mt-1">
                    Gói: <strong>{PACKAGE_LABELS[result.package_type]}</strong>
                    {' · '}
                    Còn lại: <strong>{result.remaining === 'unlimited' ? 'không giới hạn' : `${result.remaining} lượt`}</strong>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
