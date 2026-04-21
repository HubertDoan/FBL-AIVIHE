'use client'

// Summary card for the currently active treatment episode
// Shows: diagnosis, attending doctor, start date, specialty tags

import { HeartPulse, Calendar, UserRound, Stethoscope } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { TreatmentEpisode } from '@/lib/demo/demo-treatment-data'

interface Props {
  treatment: TreatmentEpisode
}

const SPECIALTY_LABELS: Record<string, string> = {
  cardiology: 'Tim mạch',
  endocrinology: 'Nội tiết',
  rheumatology: 'Cơ xương khớp',
  neurology: 'Thần kinh',
  pulmonology: 'Hô hấp',
  gastroenterology: 'Tiêu hóa',
  nephrology: 'Thận',
  orthopedics: 'Chỉnh hình',
}

function daysRemaining(endDate: string): number {
  const diff = Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000)
  return Math.max(0, diff)
}

function progressPercent(startDate: string, durationDays: number): number {
  const elapsed = Math.max(0, (Date.now() - new Date(startDate).getTime()) / 86400000)
  return Math.min(100, Math.round((elapsed / durationDays) * 100))
}

export function TreatmentActiveSummaryCard({ treatment: t }: Props) {
  const remaining = daysRemaining(t.end_date)
  const pct = progressPercent(t.start_date, t.treatment_duration_days)
  const dayElapsed = t.treatment_duration_days - remaining

  return (
    <Card className="border-teal-200 bg-gradient-to-br from-teal-50 to-emerald-50">
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="size-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
            <HeartPulse className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold leading-tight line-clamp-2 text-gray-900">
              {t.diagnosis.split('.')[0]}
            </p>
            <div className="flex flex-wrap gap-1 mt-1">
              {t.specialties.map((sp) => (
                <span
                  key={sp}
                  className="px-2 py-0.5 bg-teal-100 text-teal-700 text-xs rounded-full font-medium"
                >
                  {SPECIALTY_LABELS[sp] ?? sp}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Info row */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <UserRound className="size-4 text-teal-500" />
            {t.exam_doctor_name}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="size-4 text-teal-500" />
            Từ {t.start_date}
          </span>
          <span className="flex items-center gap-1">
            <Stethoscope className="size-4 text-teal-500" />
            {t.prescription.length} thuốc
          </span>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Ngày {dayElapsed}/{t.treatment_duration_days}</span>
            <span className={remaining <= 3 ? 'text-amber-600 font-semibold' : ''}>
              Còn {remaining} ngày
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-teal-500 rounded-full h-2 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Treatment notes (truncated) */}
        {t.treatment_notes && (
          <p className="text-xs text-gray-600 line-clamp-2 bg-white/60 rounded p-2">
            {t.treatment_notes}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
