'use client'

// ExamScheduleCard — card for exam doctor to view patient info and submit exam results
// Handles: respond with exam plan (assigned_to_doctor) + complete exam (doctor_responded)

import { useState } from 'react'
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { getSpecialtyName } from '@/lib/constants/medical-specialties'
import { toast } from 'sonner'
import type { ExamRegistration } from '@/lib/demo/demo-exam-registration-data'

export function ExamScheduleCard({
  reg,
  onUpdated,
}: {
  reg: ExamRegistration
  onUpdated: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  // Plan form (assigned_to_doctor)
  const [examPlan, setExamPlan] = useState('')
  const [estimatedTime, setEstimatedTime] = useState('')
  const [examDate, setExamDate] = useState('')
  // Complete exam form (doctor_responded)
  const [examResults, setExamResults] = useState('')
  const [diagnosisText, setDiagnosisText] = useState('')
  const [prescriptionText, setPrescriptionText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const specialtyNames = reg.specialties.map((s) => getSpecialtyName(s) ?? s).join(', ')
  const needsPlan = reg.status === 'assigned_to_doctor'
  const needsCompletion = reg.status === 'doctor_responded'
  const isDone = !needsPlan && !needsCompletion

  async function handleRespond() {
    if (!examPlan.trim()) { toast.error('Vui lòng nhập nội dung khám.'); return }
    if (!estimatedTime.trim()) { toast.error('Vui lòng nhập dự kiến thời gian.'); return }
    setSubmitting(true)
    try {
      const res = await fetch(`/api/exam-registration/${reg.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'respond', exam_plan: examPlan, estimated_time: estimatedTime, exam_date: examDate || null }),
      })
      if (!res.ok) { const d = await res.json(); toast.error(d.error ?? 'Gửi thất bại.'); return }
      toast.success('Đã gửi kế hoạch khám. Bệnh nhân sẽ nhận được thông báo.')
      onUpdated()
    } catch { toast.error('Lỗi kết nối. Vui lòng thử lại.') }
    finally { setSubmitting(false) }
  }

  async function handleCompleteExam() {
    if (!examResults.trim()) { toast.error('Vui lòng nhập kết quả khám.'); return }
    if (!diagnosisText.trim()) { toast.error('Vui lòng nhập chẩn đoán.'); return }
    setSubmitting(true)
    try {
      const res = await fetch(`/api/exam-registration/${reg.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete_exam',
          exam_results: examResults,
          diagnosis: diagnosisText,
          prescription: prescriptionText || null,
        }),
      })
      if (!res.ok) { const d = await res.json(); toast.error(d.error ?? 'Gửi thất bại.'); return }
      toast.success('Đã hoàn thành khám. Tiếp đón sẽ nhận được thông báo.')
      onUpdated()
    } catch { toast.error('Lỗi kết nối. Vui lòng thử lại.') }
    finally { setSubmitting(false) }
  }

  function getStatusBadge() {
    if (needsPlan) return <span className="text-xs bg-cyan-100 text-cyan-800 px-2 py-1 rounded-full font-medium">Chờ phản hồi</span>
    if (needsCompletion) return <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full font-medium">Chờ hoàn thành khám</span>
    return <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">Đã hoàn thành</span>
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
            {getStatusBadge()}
            {expanded ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
          </div>
        </button>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4 pt-2 border-t">
          {/* Patient clinical info */}
          <section className="space-y-2">
            <div>
              <h3 className="font-medium text-base mb-1">Triệu chứng</h3>
              <div className="flex flex-wrap gap-2">
                {reg.symptoms.map((s) => (
                  <span key={s} className="bg-muted text-sm px-2 py-1 rounded-full">{s}</span>
                ))}
              </div>
              {reg.symptom_description && <p className="text-sm text-muted-foreground mt-2">{reg.symptom_description}</p>}
            </div>
            {reg.current_medications && (
              <div>
                <h3 className="font-medium text-base mb-1">Thuốc đang dùng</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{reg.current_medications}</p>
              </div>
            )}
            {reg.medical_history && (
              <div>
                <h3 className="font-medium text-base mb-1">Tiền sử bệnh</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{reg.medical_history}</p>
              </div>
            )}
          </section>

          {/* Family doctor notes */}
          {reg.family_doctor_response && (
            <section className="rounded-lg bg-blue-50 border border-blue-200 p-3">
              <p className="text-sm font-medium text-blue-900 mb-1">Ghi chú BS gia đình — {reg.family_doctor_name}</p>
              <p className="text-sm text-blue-800 whitespace-pre-wrap">{reg.family_doctor_response}</p>
            </section>
          )}

          {/* Exam plan already sent */}
          {reg.exam_plan && (
            <section className="rounded-lg bg-green-50 border border-green-200 p-3 space-y-1">
              <p className="text-sm font-medium text-green-900">Kế hoạch đã gửi:</p>
              <p className="text-sm text-green-800 whitespace-pre-wrap">{reg.exam_plan}</p>
              {reg.estimated_time && <p className="text-sm font-medium text-green-800">Thời gian: {reg.estimated_time}</p>}
            </section>
          )}

          {/* Form: send exam plan */}
          {needsPlan && (
            <section className="pt-2 border-t space-y-4">
              <div>
                <label className="block text-base font-medium mb-2">Nội dung khám</label>
                <Textarea value={examPlan} onChange={(e) => setExamPlan(e.target.value)}
                  placeholder="Mô tả các xét nghiệm, thủ thuật sẽ thực hiện khi khám..."
                  className="text-base min-h-[120px]" maxLength={3000} />
              </div>
              <div>
                <label className="block text-base font-medium mb-2">Dự kiến thời gian</label>
                <Input value={estimatedTime} onChange={(e) => setEstimatedTime(e.target.value)}
                  placeholder="Ví dụ: 9:00 - 10:00, Thứ Hai 25/03/2026" className="text-base min-h-[48px]" />
              </div>
              <div>
                <label className="block text-base font-medium mb-2">Ngày khám (tùy chọn)</label>
                <Input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} className="text-base min-h-[48px]" />
              </div>
              <Button onClick={handleRespond} disabled={submitting} className="min-h-[52px] text-base gap-2">
                {submitting && <Loader2 className="size-4 animate-spin" />}
                Gửi kế hoạch khám cho bệnh nhân
              </Button>
            </section>
          )}

          {/* Form: complete exam and send results to reception */}
          {needsCompletion && (
            <section className="pt-2 border-t space-y-4">
              <h3 className="text-base font-semibold">Hoàn thành khám — nhập kết quả</h3>
              <div>
                <label className="block text-base font-medium mb-2">Kết quả khám</label>
                <Textarea value={examResults} onChange={(e) => setExamResults(e.target.value)}
                  placeholder="Kết quả xét nghiệm, siêu âm, điện tâm đồ..."
                  className="text-base min-h-[120px]" maxLength={5000} />
              </div>
              <div>
                <label className="block text-base font-medium mb-2">Chẩn đoán / Kết luận</label>
                <Textarea value={diagnosisText} onChange={(e) => setDiagnosisText(e.target.value)}
                  placeholder="Chẩn đoán bệnh, mức độ, kết luận..."
                  className="text-base min-h-[100px]" maxLength={2000} />
              </div>
              <div>
                <label className="block text-base font-medium mb-2">
                  Đơn thuốc <span className="text-sm font-normal text-muted-foreground">(mỗi dòng: tên | liều | tần suất | thời gian)</span>
                </label>
                <Textarea value={prescriptionText} onChange={(e) => setPrescriptionText(e.target.value)}
                  placeholder={'Metformin 500mg | 1 viên | 2 lần/ngày | 30 ngày\nAmlodipine 5mg | 1 viên | 1 lần/ngày | 30 ngày'}
                  className="text-base min-h-[120px] font-mono text-sm" maxLength={3000} />
              </div>
              <Button onClick={handleCompleteExam} disabled={submitting} className="min-h-[52px] text-base gap-2 w-full">
                {submitting && <Loader2 className="size-4 animate-spin" />}
                Hoàn thành khám — Gửi về tiếp đón
              </Button>
            </section>
          )}

          {/* Completed exam results display */}
          {isDone && reg.exam_results && (
            <section className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 space-y-3">
              <p className="text-sm font-semibold text-emerald-900">Kết quả khám đã gửi:</p>
              <div>
                <p className="text-xs font-medium text-emerald-800 uppercase mb-1">Kết quả</p>
                <p className="text-sm text-emerald-800 whitespace-pre-wrap">{reg.exam_results}</p>
              </div>
              {reg.diagnosis && (
                <div>
                  <p className="text-xs font-medium text-emerald-800 uppercase mb-1">Chẩn đoán</p>
                  <p className="text-sm text-emerald-800 whitespace-pre-wrap">{reg.diagnosis}</p>
                </div>
              )}
            </section>
          )}
        </CardContent>
      )}
    </Card>
  )
}
