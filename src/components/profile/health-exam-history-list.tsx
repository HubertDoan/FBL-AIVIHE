'use client'

// HealthExamHistoryList — shows completed treatment episodes as medical history in profile
// Displays date, diagnosis, doctor, specialties, and medication count per episode

import { useState, useEffect } from 'react'
import { ClipboardList, Calendar, User, Pill } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { TreatmentEpisode } from '@/lib/demo/demo-treatment-data'

const SPECIALTY_LABELS: Record<string, string> = {
  cardiology: 'Tim mạch',
  endocrinology: 'Nội tiết',
  rheumatology: 'Cơ xương khớp',
  neurology: 'Thần kinh',
  gastroenterology: 'Tiêu hóa',
  pulmonology: 'Hô hấp',
  nephrology: 'Thận - Tiết niệu',
  oncology: 'Ung bướu',
  ophthalmology: 'Mắt',
  dermatology: 'Da liễu',
}

function specialtyLabel(code: string): string {
  return SPECIALTY_LABELS[code] ?? code
}

function statusLabel(status: TreatmentEpisode['status']) {
  const map = {
    active: { text: 'Đang điều trị', cls: 'bg-blue-100 text-blue-800' },
    completed: { text: 'Đã hoàn thành', cls: 'bg-green-100 text-green-800' },
    follow_up_needed: { text: 'Cần tái khám', cls: 'bg-amber-100 text-amber-800' },
  }
  const s = map[status]
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.cls}`}>{s.text}</span>
}

interface Props {
  userId: string
}

export function HealthExamHistoryList({ userId }: Props) {
  const [treatments, setTreatments] = useState<TreatmentEpisode[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    fetch('/api/treatment')
      .then((r) => r.json())
      .then((data) => setTreatments(data.treatments ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [userId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="size-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (treatments.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground border border-dashed rounded-lg">
        <ClipboardList className="size-10 mx-auto mb-2 opacity-30" />
        <p className="text-base">Chưa có lịch sử khám bệnh</p>
      </div>
    )
  }

  // Sort newest first
  const sorted = [...treatments].sort((a, b) => b.exam_date.localeCompare(a.exam_date))

  return (
    <div className="space-y-3">
      {sorted.map((t) => (
        <Card key={t.id}>
          <CardContent className="pt-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <p className="text-base font-semibold flex-1 min-w-0">{t.diagnosis.split('.')[0]}</p>
              {statusLabel(t.status)}
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="size-3.5" /> {t.exam_date}
              </span>
              <span className="flex items-center gap-1">
                <User className="size-3.5" /> {t.exam_doctor_name}
              </span>
              <span className="flex items-center gap-1">
                <Pill className="size-3.5" /> {t.prescription.length} thuốc
              </span>
            </div>

            {t.specialties.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {t.specialties.map((s) => (
                  <span key={s} className="px-2 py-0.5 bg-muted rounded-full text-xs">
                    {specialtyLabel(s)}
                  </span>
                ))}
              </div>
            )}

            {t.prescription.length > 0 && (
              <div className="text-sm text-muted-foreground">
                Thuốc: {t.prescription.map((m) => m.drug_name).join(', ')}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
