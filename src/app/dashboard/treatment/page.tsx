'use client'

// Treatment list page — shows active and completed treatment episodes
// Members only: each completed exam creates a treatment episode to monitor

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { HeartPulse, Calendar, Pill, ChevronRight, ClipboardList } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import type { TreatmentEpisode } from '@/lib/demo/demo-treatment-data'

function daysRemaining(endDate: string): number {
  const end = new Date(endDate)
  const now = new Date()
  const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
}

function progressPercent(startDate: string, durationDays: number): number {
  const start = new Date(startDate)
  const now = new Date()
  const elapsed = Math.max(0, (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  return Math.min(100, Math.round((elapsed / durationDays) * 100))
}

function statusBadge(status: TreatmentEpisode['status']) {
  const map = {
    active: { label: 'Đang điều trị', cls: 'bg-blue-100 text-blue-800' },
    completed: { label: 'Đã hoàn thành', cls: 'bg-green-100 text-green-800' },
    follow_up_needed: { label: 'Cần tái khám', cls: 'bg-amber-100 text-amber-800' },
  }
  const s = map[status]
  return <span className={`px-2 py-0.5 rounded-full text-sm font-medium ${s.cls}`}>{s.label}</span>
}

function ActiveTreatmentCard({ t, onClick }: { t: TreatmentEpisode; onClick: () => void }) {
  const remaining = daysRemaining(t.end_date)
  const pct = progressPercent(t.start_date, t.treatment_duration_days)
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold line-clamp-2">{t.diagnosis.split('.')[0]}</p>
            <p className="text-sm text-muted-foreground mt-0.5">BS. {t.exam_doctor_name}</p>
          </div>
          {statusBadge(t.status)}
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Ngày {t.treatment_duration_days - remaining}/{t.treatment_duration_days}</span>
            <span>Còn {remaining} ngày</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary rounded-full h-2 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Pill className="size-4" />
            {t.prescription.length} thuốc
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="size-4" />
            {t.exam_date}
          </span>
        </div>

        <div className="flex gap-2 pt-1">
          <Button
            variant="outline"
            className="flex-1 min-h-[48px] text-base"
            onClick={(e) => { e.stopPropagation(); onClick() }}
          >
            <ClipboardList className="size-4 mr-1" /> Ghi nhật ký
          </Button>
          <Button
            variant="outline"
            className="flex-1 min-h-[48px] text-base"
            onClick={(e) => { e.stopPropagation(); onClick() }}
          >
            Nhắn BS
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function CompletedTreatmentRow({ t, onClick }: { t: TreatmentEpisode; onClick: () => void }) {
  return (
    <button
      type="button"
      className="w-full flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent transition-colors text-left"
      onClick={onClick}
    >
      <div className="space-y-0.5">
        <p className="text-base font-medium">{t.diagnosis.split('.')[0]}</p>
        <p className="text-sm text-muted-foreground">{t.exam_date} · BS. {t.exam_doctor_name}</p>
      </div>
      <div className="flex items-center gap-2">
        {statusBadge(t.status)}
        <ChevronRight className="size-4 text-muted-foreground shrink-0" />
      </div>
    </button>
  )
}

export default function TreatmentListPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [treatments, setTreatments] = useState<TreatmentEpisode[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading || !user) return
    fetch('/api/treatment')
      .then((r) => r.json())
      .then((data) => setTreatments(data.treatments ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [authLoading, user])

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center space-y-3">
          <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-lg text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    )
  }

  const active = treatments.filter((t) => t.status === 'active' || t.status === 'follow_up_needed')
  const completed = treatments.filter((t) => t.status === 'completed')

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <HeartPulse className="size-6 text-primary" />
        <h1 className="text-2xl font-bold">Đang điều trị</h1>
      </div>

      {/* Active treatments */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Đợt điều trị hiện tại</h2>
        {active.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
            <HeartPulse className="size-10 mx-auto mb-2 opacity-30" />
            <p className="text-base">Không có đợt điều trị nào đang diễn ra</p>
          </div>
        ) : (
          active.map((t) => (
            <ActiveTreatmentCard
              key={t.id}
              t={t}
              onClick={() => router.push(`/dashboard/treatment/${t.id}`)}
            />
          ))
        )}
      </section>

      {/* Completed treatments */}
      {completed.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Đợt điều trị đã hoàn thành</h2>
          <div className="space-y-2">
            {completed.map((t) => (
              <CompletedTreatmentRow
                key={t.id}
                t={t}
                onClick={() => router.push(`/dashboard/treatment/${t.id}`)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
