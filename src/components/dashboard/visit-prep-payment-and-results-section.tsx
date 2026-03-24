'use client'

// Patient-facing section shown inside RegistrationCard when status requires action:
// payment_pending → show payment info + confirm button
// results_returned / completed → show full exam results + medication reminders + save to health record button

import { useState } from 'react'
import { Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import type { ExamRegistration, MedicationReminder } from '@/lib/demo/demo-exam-registration-data'

function MedicationRow({ med }: { med: MedicationReminder }) {
  return (
    <div className="border border-border rounded-lg p-3 space-y-1">
      <p className="text-base font-medium">{med.drug_name}</p>
      <p className="text-sm text-muted-foreground">
        {med.dosage} · {med.frequency} · {med.duration}
      </p>
      {med.notes && <p className="text-sm text-amber-700 italic">{med.notes}</p>}
    </div>
  )
}

interface Props {
  reg: ExamRegistration
  onUpdated: () => void
}

export function VisitPrepPaymentAndResultsSection({ reg, onUpdated }: Props) {
  const [submitting, setSubmitting] = useState(false)
  const [saved, setSaved] = useState(false)

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

  // payment_pending: show QR + amount + confirm button
  if (reg.status === 'payment_pending') {
    const formatted = reg.payment_amount ? reg.payment_amount.toLocaleString('vi-VN') + 'đ' : '—'
    return (
      <section className="space-y-4 pt-3 border-t">
        <div className="rounded-lg bg-orange-50 border border-orange-200 p-4 space-y-3">
          <h3 className="text-base font-semibold text-orange-900">Chờ thanh toán viện phí</h3>
          <p className="text-lg font-bold text-orange-900">{formatted}</p>
          <div className="text-sm text-orange-800 space-y-1">
            <p>Chuyển khoản hoặc thanh toán tại quầy tiếp đón.</p>
            <p className="font-medium">Ngân hàng: VietcomBank — STK: 1234 5678 9012</p>
            <p>Nội dung: <span className="font-mono">{reg.id.slice(-8).toUpperCase()}</span></p>
          </div>
        </div>
        <Button
          onClick={() => patch({ action: 'confirm_payment' }, 'Đã xác nhận thanh toán. Tiếp đón sẽ kiểm tra và trả kết quả.')}
          disabled={submitting}
          className="min-h-[52px] text-base gap-2 w-full"
        >
          {submitting && <Loader2 className="size-4 animate-spin" />}
          Tôi đã thanh toán
        </Button>
      </section>
    )
  }

  // results_returned or completed: show full results
  if (reg.status === 'results_returned' || reg.status === 'completed') {
    return (
      <section className="space-y-4 pt-3 border-t">
        <h3 className="text-base font-semibold text-green-900">Kết quả khám bệnh</h3>

        {reg.exam_results && (
          <div className="rounded-lg bg-green-50 border border-green-200 p-3 space-y-1">
            <p className="text-xs font-semibold uppercase text-green-800">Kết quả xét nghiệm / khám lâm sàng</p>
            <p className="text-sm text-green-900 whitespace-pre-wrap">{reg.exam_results}</p>
          </div>
        )}

        {reg.diagnosis && (
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 space-y-1">
            <p className="text-xs font-semibold uppercase text-blue-800">Chẩn đoán / Kết luận</p>
            <p className="text-sm text-blue-900 whitespace-pre-wrap">{reg.diagnosis}</p>
          </div>
        )}

        {reg.prescription && (
          <div className="rounded-lg bg-purple-50 border border-purple-200 p-3 space-y-1">
            <p className="text-xs font-semibold uppercase text-purple-800">Đơn thuốc</p>
            <p className="text-sm text-purple-900 whitespace-pre-wrap font-mono">{reg.prescription}</p>
          </div>
        )}

        {reg.medication_reminders && reg.medication_reminders.length > 0 && (
          <div className="space-y-2">
            <p className="text-base font-medium">Lịch uống thuốc</p>
            {reg.medication_reminders.map((med, i) => (
              <MedicationRow key={i} med={med} />
            ))}
          </div>
        )}

        {!saved ? (
          <Button
            onClick={() => { setSaved(true); toast.success('Đã lưu vào hồ sơ sức khỏe.') }}
            variant="outline"
            className="min-h-[48px] text-base gap-2 w-full"
          >
            <CheckCircle className="size-4" />
            Lưu vào hồ sơ sức khỏe
          </Button>
        ) : (
          <div className="flex items-center gap-2 text-green-700 text-sm font-medium py-2">
            <CheckCircle className="size-4" />
            Đã lưu vào hồ sơ sức khỏe
          </div>
        )}
      </section>
    )
  }

  return null
}
