'use client'

import { useState, useEffect, useCallback } from 'react'
import { Loader2, ChevronDown, ChevronUp, Stethoscope } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { SpecialtySelector } from '@/components/visit-prep/specialty-selector'
import { useAuth } from '@/hooks/use-auth'
import { getSpecialtyName } from '@/lib/constants/medical-specialties'
import { toast } from 'sonner'
import type { ExamRegistration } from '@/lib/demo/demo-exam-registration-data'

function RegistrationReviewCard({
  reg,
  onUpdated,
}: {
  reg: ExamRegistration
  onUpdated: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [response, setResponse] = useState('')
  const [recommendedSpecialties, setRecommendedSpecialties] = useState<string[]>(reg.specialties)
  const [submitting, setSubmitting] = useState(false)

  const specialtyNames = reg.specialties.map((s) => getSpecialtyName(s) ?? s).join(', ')
  const isReviewed = reg.status !== 'submitted'

  async function handleReview() {
    if (!response.trim()) {
      toast.error('Vui lòng nhập ý kiến trước khi gửi.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(`/api/exam-registration/${reg.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'review',
          response,
          recommended_specialties: recommendedSpecialties,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error ?? 'Gửi thất bại.')
        return
      }
      toast.success('Đã gửi ý kiến thành công.')
      onUpdated()
    } catch {
      toast.error('Lỗi kết nối. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSendToHospital() {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/exam-registration/${reg.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_to_hospital' }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error ?? 'Gửi thất bại.')
        return
      }
      toast.success('Đã gửi hồ sơ đến bệnh viện.')
      onUpdated()
    } catch {
      toast.error('Lỗi kết nối. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full text-left flex items-start justify-between gap-3"
        >
          <div className="space-y-1 min-w-0">
            <p className="text-base font-semibold">{reg.citizen_name}</p>
            <p className="text-sm text-muted-foreground">
              {specialtyNames} · {new Date(reg.created_at).toLocaleDateString('vi-VN')}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isReviewed && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                Đã xem
              </span>
            )}
            {expanded ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
          </div>
        </button>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4 pt-2 border-t">
          {/* Patient clinical info */}
          <section className="space-y-3">
            <div>
              <h3 className="font-medium text-base mb-1">Triệu chứng</h3>
              <div className="flex flex-wrap gap-2">
                {reg.symptoms.map((s) => (
                  <span key={s} className="bg-muted text-sm px-2 py-1 rounded-full">{s}</span>
                ))}
              </div>
              {reg.symptom_description && (
                <p className="text-sm text-muted-foreground mt-2">{reg.symptom_description}</p>
              )}
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
            {reg.questions_for_doctor && (
              <div>
                <h3 className="font-medium text-base mb-1">Câu hỏi của bệnh nhân</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{reg.questions_for_doctor}</p>
              </div>
            )}
          </section>

          {/* Response form */}
          {!isReviewed && (
            <section className="space-y-4 pt-2 border-t">
              <div>
                <label className="block text-base font-medium mb-2">Ý kiến / Hướng dẫn thêm</label>
                <Textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Nhập ý kiến hoặc hướng dẫn thêm cho bệnh nhân..."
                  className="text-base min-h-[100px]"
                  maxLength={3000}
                />
              </div>
              <div>
                <label className="block text-base font-medium mb-2">Nên khám chuyên khoa</label>
                <SpecialtySelector
                  value={recommendedSpecialties}
                  onChange={(v) => setRecommendedSpecialties(v as string[])}
                  multiple
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleReview}
                  disabled={submitting}
                  className="min-h-[48px] text-base gap-2"
                >
                  {submitting && <Loader2 className="size-4 animate-spin" />}
                  Gửi ý kiến
                </Button>
              </div>
            </section>
          )}

          {/* Already reviewed — show send to hospital button */}
          {isReviewed && reg.status === 'doctor_reviewed' && (
            <section className="pt-2 border-t">
              {reg.family_doctor_response && (
                <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 mb-4">
                  <p className="text-sm font-medium text-blue-900 mb-1">Ý kiến đã gửi:</p>
                  <p className="text-sm text-blue-800 whitespace-pre-wrap">{reg.family_doctor_response}</p>
                </div>
              )}
              <Button
                onClick={handleSendToHospital}
                disabled={submitting}
                variant="default"
                className="min-h-[48px] text-base gap-2"
              >
                {submitting && <Loader2 className="size-4 animate-spin" />}
                Gửi hồ sơ đến bệnh viện
              </Button>
            </section>
          )}

          {/* Already sent to hospital */}
          {reg.status !== 'submitted' && reg.status !== 'doctor_reviewed' && (
            <div className="rounded-lg bg-green-50 border border-green-200 p-3">
              <p className="text-sm font-medium text-green-800">
                Hồ sơ đã được gửi đến bệnh viện.
              </p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

export default function DoctorReviewPage() {
  const { user, loading: authLoading } = useAuth()
  const [registrations, setRegistrations] = useState<ExamRegistration[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const res = await fetch('/api/exam-registration')
      if (!res.ok) return
      const data = await res.json()
      setRegistrations(data.registrations ?? [])
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading && user?.role === 'doctor') {
      loadData()
    } else if (!authLoading) {
      setLoading(false)
    }
  }, [authLoading, user, loadData])

  if (!authLoading && user?.role !== 'doctor') {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground text-lg">Bạn không có quyền truy cập trang này.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Xem xét đăng ký khám</h1>
        <p className="text-muted-foreground mt-1">
          Danh sách phiếu đăng ký khám cần xem xét từ bệnh nhân
        </p>
      </div>

      {loading || authLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : registrations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Stethoscope className="size-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Không có phiếu nào cần xem xét</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {registrations.map((reg) => (
            <RegistrationReviewCard key={reg.id} reg={reg} onUpdated={loadData} />
          ))}
        </div>
      )}
    </div>
  )
}
