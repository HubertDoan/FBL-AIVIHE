'use client'

// Reception card for exam_completed registrations — enter payment amount and create payment slip
// Also handles payment_pending (confirm payment) and payment_done (return results to patient)

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import type { ExamRegistration } from '@/lib/demo/demo-exam-registration-data'

interface Props {
  reg: ExamRegistration
  onUpdated: () => void
}

export function ReceptionExamCompletedCard({ reg, onUpdated }: Props) {
  const [paymentAmount, setPaymentAmount] = useState(reg.payment_amount ? String(reg.payment_amount) : '')
  const [submitting, setSubmitting] = useState(false)

  async function patch(body: Record<string, unknown>, successMsg: string) {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/exam-registration/${reg.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) { const d = await res.json(); toast.error(d.error ?? 'Thao tác thất bại.'); return }
      toast.success(successMsg)
      onUpdated()
    } catch { toast.error('Lỗi kết nối. Vui lòng thử lại.') }
    finally { setSubmitting(false) }
  }

  function handleCreatePayment() {
    const amount = parseInt(paymentAmount.replace(/\D/g, ''), 10)
    if (!amount || amount <= 0) { toast.error('Vui lòng nhập số tiền hợp lệ.'); return }
    patch({ action: 'create_payment', payment_amount: amount }, 'Đã tạo phiếu thanh toán. Bệnh nhân sẽ nhận được thông báo.')
  }

  // exam_completed: show results + payment input
  if (reg.status === 'exam_completed') {
    return (
      <div className="space-y-4 pt-2 border-t">
        {/* Exam results summary */}
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 space-y-2">
          <p className="text-sm font-semibold text-emerald-900">Kết quả khám từ BS. {reg.exam_doctor_name}</p>
          {reg.exam_results && <p className="text-sm text-emerald-800 whitespace-pre-wrap line-clamp-3">{reg.exam_results}</p>}
          {reg.diagnosis && (
            <p className="text-sm text-emerald-800">
              <span className="font-medium">Chẩn đoán: </span>{reg.diagnosis}
            </p>
          )}
        </div>
        {/* Payment input */}
        <div className="space-y-2">
          <label className="block text-base font-medium">Số tiền thanh toán (VND)</label>
          <Input
            type="text"
            inputMode="numeric"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            placeholder="Ví dụ: 850000"
            className="text-base min-h-[48px]"
          />
        </div>
        <Button onClick={handleCreatePayment} disabled={submitting} className="min-h-[48px] text-base gap-2 w-full">
          {submitting && <Loader2 className="size-4 animate-spin" />}
          Tạo phiếu thanh toán
        </Button>
      </div>
    )
  }

  // payment_pending: waiting for patient to pay
  if (reg.status === 'payment_pending') {
    const formatted = reg.payment_amount ? reg.payment_amount.toLocaleString('vi-VN') + 'đ' : '—'
    return (
      <div className="space-y-3 pt-2 border-t">
        <div className="rounded-lg bg-orange-50 border border-orange-200 p-3">
          <p className="text-sm font-medium text-orange-900">Chờ bệnh nhân thanh toán</p>
          <p className="text-sm text-orange-800 mt-1">Số tiền: <span className="font-semibold">{formatted}</span></p>
        </div>
        <Button
          onClick={() => patch({ action: 'confirm_payment' }, 'Đã xác nhận thanh toán.')}
          disabled={submitting}
          variant="outline"
          className="min-h-[48px] text-base gap-2 w-full"
        >
          {submitting && <Loader2 className="size-4 animate-spin" />}
          Xác nhận đã thanh toán
        </Button>
      </div>
    )
  }

  // payment_done: payment confirmed, return results to patient
  if (reg.status === 'payment_done') {
    return (
      <div className="space-y-3 pt-2 border-t">
        <div className="rounded-lg bg-green-50 border border-green-200 p-3">
          <p className="text-sm font-medium text-green-900">Đã thanh toán</p>
          {reg.payment_amount && (
            <p className="text-sm text-green-800">Số tiền: {reg.payment_amount.toLocaleString('vi-VN')}đ</p>
          )}
        </div>
        <Button
          onClick={() => patch({ action: 'return_results' }, 'Đã trả kết quả cho bệnh nhân. Bệnh nhân sẽ nhận được thông báo.')}
          disabled={submitting}
          className="min-h-[48px] text-base gap-2 w-full"
        >
          {submitting && <Loader2 className="size-4 animate-spin" />}
          Trả kết quả cho bệnh nhân
        </Button>
      </div>
    )
  }

  // results_returned or completed
  return (
    <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 mt-2">
      <p className="text-sm font-medium text-gray-700">
        {reg.status === 'completed' ? 'Hồ sơ đã hoàn tất.' : 'Đã trả kết quả cho bệnh nhân.'}
      </p>
    </div>
  )
}
