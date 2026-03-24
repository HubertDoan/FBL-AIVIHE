'use client'

// Reception patient card — handles the full reception workflow:
// accept hồ sơ → assign exam doctor → post-exam payment → return results

import { useState } from 'react'
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getSpecialtyName } from '@/lib/constants/medical-specialties'
import { DEMO_ACCOUNTS } from '@/lib/demo/demo-accounts'
import { toast } from 'sonner'
import { ReceptionExamCompletedCard } from '@/components/dashboard/reception-exam-completed-card'
import type { ExamRegistration } from '@/lib/demo/demo-exam-registration-data'

const EXAM_DOCTORS = DEMO_ACCOUNTS.filter((a) => a.role === 'exam_doctor')

const POST_EXAM_STATUSES = ['exam_completed', 'payment_pending', 'payment_done', 'results_returned', 'completed']

function getStatusBadge(status: ExamRegistration['status']) {
  if (POST_EXAM_STATUSES.includes(status)) {
    const labels: Record<string, string> = {
      exam_completed: 'BS đã khám xong',
      payment_pending: 'Chờ thanh toán',
      payment_done: 'Đã thanh toán',
      results_returned: 'Đã trả kết quả',
      completed: 'Hoàn thành',
    }
    const colors: Record<string, string> = {
      exam_completed: 'bg-emerald-100 text-emerald-800',
      payment_pending: 'bg-orange-100 text-orange-800',
      payment_done: 'bg-green-100 text-green-800',
      results_returned: 'bg-blue-100 text-blue-800',
      completed: 'bg-gray-100 text-gray-800',
    }
    return <span className={`text-xs px-2 py-1 rounded-full font-medium ${colors[status] ?? 'bg-gray-100 text-gray-800'}`}>{labels[status] ?? status}</span>
  }
  if (['assigned_to_doctor', 'doctor_responded'].includes(status)) return <span className="text-xs bg-cyan-100 text-cyan-800 px-2 py-1 rounded-full font-medium">Đã xếp lịch</span>
  if (['reception_accepted'].includes(status)) return <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium">BV đã nhận</span>
  return <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full font-medium">Chờ tiếp nhận</span>
}

export function ReceptionPatientCard({ reg, onUpdated }: { reg: ExamRegistration; onUpdated: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const [selectedDoctorId, setSelectedDoctorId] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const specialtyNames = reg.specialties.map((s) => getSpecialtyName(s) ?? s).join(', ')
  const isAccepted = ['reception_accepted', 'assigned_to_doctor', 'doctor_responded', ...POST_EXAM_STATUSES].includes(reg.status)
  const isAssigned = ['assigned_to_doctor', 'doctor_responded', ...POST_EXAM_STATUSES].includes(reg.status)
  const isPostExam = POST_EXAM_STATUSES.includes(reg.status)

  async function handleAccept() {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/exam-registration/${reg.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept' }),
      })
      if (!res.ok) { const d = await res.json(); toast.error(d.error ?? 'Thao tác thất bại.'); return }
      toast.success('Đã chấp nhận hồ sơ.')
      onUpdated()
    } catch { toast.error('Lỗi kết nối. Vui lòng thử lại.') }
    finally { setSubmitting(false) }
  }

  async function handleAssignDoctor() {
    if (!selectedDoctorId) { toast.error('Vui lòng chọn bác sĩ khám.'); return }
    setSubmitting(true)
    try {
      const res = await fetch(`/api/exam-registration/${reg.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'assign_doctor', exam_doctor_id: selectedDoctorId }),
      })
      if (!res.ok) { const d = await res.json(); toast.error(d.error ?? 'Phân công thất bại.'); return }
      toast.success('Đã phân công bác sĩ khám và gửi thông báo.')
      onUpdated()
    } catch { toast.error('Lỗi kết nối. Vui lòng thử lại.') }
    finally { setSubmitting(false) }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <button type="button" onClick={() => setExpanded(!expanded)} className="w-full text-left flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <p className="text-base font-semibold">{reg.citizen_name}</p>
            <p className="text-sm text-muted-foreground">{specialtyNames} · {new Date(reg.created_at).toLocaleDateString('vi-VN')}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {getStatusBadge(reg.status)}
            {expanded ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
          </div>
        </button>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4 pt-2 border-t">
          <section className="space-y-2">
            <div><span className="text-sm font-medium">Chuyên khoa: </span><span className="text-sm text-muted-foreground">{specialtyNames}</span></div>
            <div><span className="text-sm font-medium">Triệu chứng: </span><span className="text-sm text-muted-foreground">{reg.symptoms.join(', ')}</span></div>
            {reg.family_doctor_name && (
              <div><span className="text-sm font-medium">BS gia đình: </span><span className="text-sm text-muted-foreground">{reg.family_doctor_name}</span></div>
            )}
          </section>

          {reg.family_doctor_response && (
            <section className="rounded-lg bg-blue-50 border border-blue-200 p-3">
              <p className="text-sm font-medium text-blue-900 mb-1">Nhận xét BS gia đình — {reg.family_doctor_name}</p>
              <p className="text-sm text-blue-800 whitespace-pre-wrap">{reg.family_doctor_response}</p>
              {reg.family_doctor_recommended_specialties && reg.family_doctor_recommended_specialties.length > 0 && (
                <p className="text-sm text-blue-800 mt-1">
                  <span className="font-medium">Nên khám: </span>
                  {reg.family_doctor_recommended_specialties.map((s) => getSpecialtyName(s) ?? s).join(', ')}
                </p>
              )}
            </section>
          )}

          {/* Accept hồ sơ */}
          {!isAccepted && (
            <div className="pt-2 border-t">
              <Button onClick={handleAccept} disabled={submitting} className="min-h-[48px] text-base gap-2">
                {submitting && <Loader2 className="size-4 animate-spin" />}
                Chấp nhận hồ sơ
              </Button>
            </div>
          )}

          {/* Assign exam doctor */}
          {isAccepted && !isAssigned && (
            <section className="pt-2 border-t space-y-3">
              <label className="block text-base font-medium">Phân công bác sĩ khám</label>
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-3 text-base bg-background min-h-[48px]"
              >
                <option value="">-- Chọn bác sĩ khám --</option>
                {EXAM_DOCTORS.map((d) => (
                  <option key={d.id} value={d.id}>{d.fullName}</option>
                ))}
              </select>
              <Button onClick={handleAssignDoctor} disabled={submitting || !selectedDoctorId} className="min-h-[48px] text-base gap-2">
                {submitting && <Loader2 className="size-4 animate-spin" />}
                Phân công bác sĩ khám
              </Button>
            </section>
          )}

          {/* Assigned but not yet examined */}
          {isAssigned && !isPostExam && (
            <div className="rounded-lg bg-green-50 border border-green-200 p-3">
              <p className="text-sm font-medium text-green-800">Đã phân công: {reg.exam_doctor_name}</p>
              {reg.estimated_time && <p className="text-sm text-green-700 mt-1">Lịch khám: {reg.estimated_time}</p>}
            </div>
          )}

          {/* Post-exam: payment and results */}
          {isPostExam && (
            <ReceptionExamCompletedCard reg={reg} onUpdated={onUpdated} />
          )}
        </CardContent>
      )}
    </Card>
  )
}
