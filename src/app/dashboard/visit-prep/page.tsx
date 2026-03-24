'use client'

// Patient visit-prep list page — theo dõi trạng thái phiếu đăng ký khám
// Includes payment confirmation and exam results display for post-exam statuses

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Stethoscope, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/use-auth'
import { getSpecialtyName } from '@/lib/constants/medical-specialties'
import { VisitPrepPaymentAndResultsSection } from '@/components/dashboard/visit-prep-payment-and-results-section'
import type { ExamRegistration, ExamRegistrationStatus } from '@/lib/demo/demo-exam-registration-data'

const STATUS_LABELS: Record<ExamRegistrationStatus, string> = {
  submitted: 'Chờ BS gia đình',
  doctor_reviewed: 'BS đã xem',
  sent_to_hospital: 'Đã gửi BV',
  reception_accepted: 'BV đã nhận',
  assigned_to_doctor: 'Đã xếp lịch',
  doctor_responded: 'BS đã trả lời',
  exam_completed: 'BS đã khám xong',
  payment_pending: 'Chờ thanh toán',
  payment_done: 'Đã thanh toán',
  results_returned: 'Có kết quả',
  completed: 'Hoàn thành',
}

const STATUS_COLORS: Record<ExamRegistrationStatus, string> = {
  submitted: 'bg-yellow-100 text-yellow-800',
  doctor_reviewed: 'bg-blue-100 text-blue-800',
  sent_to_hospital: 'bg-indigo-100 text-indigo-800',
  reception_accepted: 'bg-purple-100 text-purple-800',
  assigned_to_doctor: 'bg-cyan-100 text-cyan-800',
  doctor_responded: 'bg-green-100 text-green-800',
  exam_completed: 'bg-emerald-100 text-emerald-800',
  payment_pending: 'bg-orange-100 text-orange-800',
  payment_done: 'bg-green-100 text-green-800',
  results_returned: 'bg-blue-100 text-blue-800',
  completed: 'bg-gray-100 text-gray-800',
}

const ACTION_STATUSES: ExamRegistrationStatus[] = ['payment_pending', 'results_returned', 'completed']

function RegistrationCard({ reg, onUpdated }: { reg: ExamRegistration; onUpdated: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const specialtyNames = reg.specialties.map((s) => getSpecialtyName(s) ?? s).join(', ')
  const hasAction = ACTION_STATUSES.includes(reg.status)

  return (
    <Card className="transition-all">
      <CardHeader className="pb-2">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full text-left flex items-start justify-between gap-3"
        >
          <div className="space-y-1 min-w-0">
            <p className="text-base font-semibold truncate">{specialtyNames}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(reg.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              {' · '}{reg.symptoms.length} triệu chứng
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[reg.status]}`}>
              {STATUS_LABELS[reg.status]}
            </span>
            {expanded ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
          </div>
        </button>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4 pt-2 border-t">
          <section className="space-y-2">
            <h3 className="font-medium text-base">Triệu chứng</h3>
            <div className="flex flex-wrap gap-2">
              {reg.symptoms.map((s) => (
                <span key={s} className="bg-muted text-sm px-2 py-1 rounded-full">{s}</span>
              ))}
            </div>
            {reg.symptom_description && (
              <p className="text-sm text-muted-foreground">{reg.symptom_description}</p>
            )}
          </section>

          {reg.current_medications && (
            <section>
              <h3 className="font-medium text-base mb-1">Thuốc đang dùng</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{reg.current_medications}</p>
            </section>
          )}

          {reg.medical_history && (
            <section>
              <h3 className="font-medium text-base mb-1">Tiền sử bệnh</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{reg.medical_history}</p>
            </section>
          )}

          {reg.family_doctor_response && (
            <section className="rounded-lg bg-blue-50 border border-blue-200 p-4 space-y-2">
              <h3 className="font-medium text-base text-blue-900">Ý kiến BS gia đình — {reg.family_doctor_name}</h3>
              <p className="text-sm text-blue-800 whitespace-pre-wrap">{reg.family_doctor_response}</p>
              {reg.family_doctor_recommended_specialties && reg.family_doctor_recommended_specialties.length > 0 && (
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Nên khám: </span>
                  {reg.family_doctor_recommended_specialties.map((s) => getSpecialtyName(s) ?? s).join(', ')}
                </p>
              )}
            </section>
          )}

          {reg.exam_plan && reg.status !== 'exam_completed' && !ACTION_STATUSES.includes(reg.status) && (
            <section className="rounded-lg bg-green-50 border border-green-200 p-4 space-y-2">
              <h3 className="font-medium text-base text-green-900">Kế hoạch khám — {reg.exam_doctor_name}</h3>
              <p className="text-sm text-green-800 whitespace-pre-wrap">{reg.exam_plan}</p>
              {reg.estimated_time && (
                <p className="text-sm font-medium text-green-800">Thời gian dự kiến: {reg.estimated_time}</p>
              )}
            </section>
          )}

          {/* Payment / results section for actionable statuses */}
          {hasAction && <VisitPrepPaymentAndResultsSection reg={reg} onUpdated={onUpdated} />}
        </CardContent>
      )}
    </Card>
  )
}

export default function VisitPrepListPage() {
  const { user, loading: authLoading } = useAuth()
  const [registrations, setRegistrations] = useState<ExamRegistration[]>([])
  const [loading, setLoading] = useState(true)

  const loadRegistrations = useCallback(async () => {
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
    if (!authLoading && user) {
      loadRegistrations()
    }
  }, [authLoading, user, loadRegistrations])

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Đăng ký khám bệnh</h1>
          <p className="text-muted-foreground mt-1">Theo dõi trạng thái phiếu đăng ký khám</p>
        </div>
        <Link href="/dashboard/visit-prep/new">
          <Button className="min-h-[48px] text-base gap-2">
            <Plus className="size-5" />
            Tạo phiếu đăng ký khám
          </Button>
        </Link>
      </div>

      {loading || authLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : registrations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Stethoscope className="size-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Chưa có phiếu đăng ký nào</p>
            <p className="text-base text-muted-foreground mt-1 mb-6">
              Tạo phiếu để bắt đầu quy trình đăng ký khám bệnh
            </p>
            <Link href="/dashboard/visit-prep/new">
              <Button className="min-h-[48px] text-base">Tạo phiếu đăng ký khám</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {registrations.map((reg) => (
            <RegistrationCard key={reg.id} reg={reg} onUpdated={loadRegistrations} />
          ))}
        </div>
      )}
    </div>
  )
}
