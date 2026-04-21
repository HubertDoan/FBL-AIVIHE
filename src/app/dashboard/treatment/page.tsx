'use client'

// Treatment list page — redesigned with full treatment overview
// Sections:
//   1. Active treatment summary (diagnosis, doctor, start date, progress)
//   2. Active treatment card list (existing)
//   3. Completed treatments
//   4. Related documents grouped by type
//   5. Supplementary upload (AI extract → user confirm)

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  HeartPulse,
  Calendar,
  Pill,
  ChevronRight,
  ClipboardList,
  FolderOpen,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import type { TreatmentEpisode } from '@/lib/demo/demo-treatment-data'
import { TreatmentActiveSummaryCard } from '@/components/treatment/treatment-active-summary-card'
import { TreatmentMedicationsCompactList } from '@/components/treatment/treatment-medications-compact-list'
import { TreatmentRelatedDocumentsGroupedList } from '@/components/treatment/treatment-related-documents-grouped-list'
import { TreatmentSupplementaryUploadSection } from '@/components/treatment/treatment-supplementary-upload-section'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function daysRemaining(endDate: string): number {
  const diff = Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000)
  return Math.max(0, diff)
}

function progressPercent(startDate: string, durationDays: number): number {
  const elapsed = Math.max(0, (Date.now() - new Date(startDate).getTime()) / 86400000)
  return Math.min(100, Math.round((elapsed / durationDays) * 100))
}

function statusBadge(status: TreatmentEpisode['status']) {
  const map = {
    active:            { label: 'Đang điều trị',  cls: 'bg-teal-100 text-teal-800' },
    completed:         { label: 'Đã hoàn thành',  cls: 'bg-green-100 text-green-800' },
    follow_up_needed:  { label: 'Cần tái khám',   cls: 'bg-amber-100 text-amber-800' },
  }
  const s = map[status]
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.cls}`}>{s.label}</span>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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

        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Ngày {t.treatment_duration_days - remaining}/{t.treatment_duration_days}</span>
            <span>Còn {remaining} ngày</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-teal-500 rounded-full h-2 transition-all" style={{ width: `${pct}%` }} />
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
            className="flex-1 min-h-[44px] text-sm"
            onClick={(e) => { e.stopPropagation(); onClick() }}
          >
            <ClipboardList className="size-4 mr-1" /> Ghi nhật ký
          </Button>
          <Button
            variant="outline"
            className="flex-1 min-h-[44px] text-sm"
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
        <p className="text-sm font-medium">{t.diagnosis.split('.')[0]}</p>
        <p className="text-xs text-muted-foreground">{t.exam_date} · BS. {t.exam_doctor_name}</p>
      </div>
      <div className="flex items-center gap-2">
        {statusBadge(t.status)}
        <ChevronRight className="size-4 text-muted-foreground shrink-0" />
      </div>
    </button>
  )
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-gray-800">{title}</h2>
      {children}
    </section>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TreatmentListPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [treatments, setTreatments] = useState<TreatmentEpisode[]>([])
  const [loading, setLoading] = useState(true)
  const [docsKey, setDocsKey] = useState(0) // bump to re-fetch documents after upload

  const fetchTreatments = useCallback(() => {
    if (!user) return
    fetch('/api/treatment')
      .then((r) => r.json())
      .then((data) => setTreatments(data.treatments ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  useEffect(() => {
    if (authLoading || !user) return
    fetchTreatments()
  }, [authLoading, user, fetchTreatments])

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center space-y-3">
          <div className="size-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-base text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  const active = treatments.filter((t) => t.status === 'active' || t.status === 'follow_up_needed')
  const completed = treatments.filter((t) => t.status === 'completed')
  // Aggregate all active medications
  const activeMeds = active.flatMap((t) => t.prescription)

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-8">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <HeartPulse className="size-6 text-teal-600" />
        <h1 className="text-xl font-bold">Đang điều trị</h1>
      </div>

      {/* Section 1: Active treatment summary cards (highlighted) */}
      {active.length > 0 ? (
        <Section title="Tóm tắt đợt điều trị hiện tại">
          <div className="space-y-3">
            {active.map((t) => (
              <TreatmentActiveSummaryCard key={t.id} treatment={t} />
            ))}
          </div>
        </Section>
      ) : (
        <div className="text-center py-10 border border-dashed rounded-xl text-muted-foreground">
          <HeartPulse className="size-12 mx-auto mb-3 opacity-20" />
          <p className="text-base font-medium">Không có đợt điều trị nào đang diễn ra</p>
          <p className="text-sm mt-1">Upload tài liệu y tế bên dưới để bắt đầu theo dõi sức khỏe</p>
        </div>
      )}

      {/* Section 2: Active treatment detail cards (actions: log, message) */}
      {active.length > 0 && (
        <Section title="Đợt điều trị hiện tại">
          {active.map((t) => (
            <ActiveTreatmentCard
              key={t.id}
              t={t}
              onClick={() => router.push(`/dashboard/treatment/${t.id}`)}
            />
          ))}
        </Section>
      )}

      {/* Section 3: Medications compact list */}
      {activeMeds.length > 0 && (
        <Section title="Thuốc đang dùng">
          <TreatmentMedicationsCompactList medications={activeMeds} />
        </Section>
      )}

      {/* Section 4: Completed treatments */}
      {completed.length > 0 && (
        <Section title="Đợt điều trị đã hoàn thành">
          <div className="space-y-2">
            {completed.map((t) => (
              <CompletedTreatmentRow
                key={t.id}
                t={t}
                onClick={() => router.push(`/dashboard/treatment/${t.id}`)}
              />
            ))}
          </div>
        </Section>
      )}

      {/* Section 5: Related documents grouped by type */}
      <Section title="Tài liệu khám / xét nghiệm liên quan">
        <TreatmentRelatedDocumentsGroupedList
          key={docsKey}
          citizenId={user.citizenId}
        />
      </Section>

      {/* Section 6: Supplementary upload */}
      <Section title="">
        <TreatmentSupplementaryUploadSection
          citizenId={user.citizenId}
          fullName={user.fullName}
          onUploadComplete={() => setDocsKey((k) => k + 1)}
        />
      </Section>

      {/* Empty state CTA — shown only when no treatments and no section above was shown */}
      {treatments.length === 0 && (
        <Card className="border-dashed border-teal-200 bg-teal-50/50">
          <CardContent className="p-6 text-center space-y-3">
            <FolderOpen className="size-10 mx-auto text-teal-400" />
            <p className="text-sm text-gray-600">
              Chưa có hồ sơ điều trị. Upload tài liệu y tế để AI trích xuất và tạo hồ sơ.
            </p>
            <Button
              size="sm"
              className="bg-teal-600 hover:bg-teal-700 text-white"
              onClick={() => router.push('/dashboard/upload')}
            >
              Đi đến trang Upload
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
