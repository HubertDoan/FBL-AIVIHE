'use client'

// annual-checkup-records-tab — displays annual health checkup history as a card list
// Shows year, facility, doctor, status badge, and key vitals per checkup record

import { useState, useEffect } from 'react'
import { Plus, Stethoscope, Calendar, User, Activity } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AnnualCheckupAddForm } from './annual-checkup-add-form'
import type { CheckupFormData } from './annual-checkup-add-form'
import type { AnnualCheckup } from '@/lib/demo/demo-annual-checkup-data'

// ── Status badge ──────────────────────────────────────────────────────────────
const STATUS_MAP = {
  normal:    { label: 'Bình thường', cls: 'bg-green-100 text-green-800' },
  follow_up: { label: 'Cần tái khám', cls: 'bg-yellow-100 text-yellow-800' },
  abnormal:  { label: 'Bất thường',  cls: 'bg-red-100 text-red-800' },
}

function StatusBadge({ status }: { status: AnnualCheckup['status'] }) {
  const s = STATUS_MAP[status]
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${s.cls}`}>
      {s.label}
    </span>
  )
}

// ── Vital row ─────────────────────────────────────────────────────────────────
function VitalRow({ label, value }: { label: string; value?: string | number }) {
  if (!value) return null
  return (
    <span className="flex items-center gap-1 text-sm text-muted-foreground">
      <Activity className="size-3.5 shrink-0" />
      {label}: <span className="text-foreground font-medium">{value}</span>
    </span>
  )
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  userId: string
  editing?: boolean
}

// ── Main component ────────────────────────────────────────────────────────────
export function AnnualCheckupRecordsTab({ userId, editing }: Props) {
  const [checkups, setCheckups] = useState<AnnualCheckup[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (!userId) return
    fetch('/api/annual-checkup')
      .then((r) => r.json())
      .then((data) => setCheckups(data.checkups ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [userId])

  async function handleSave(formData: CheckupFormData) {
    const res = await fetch('/api/annual-checkup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
    if (!res.ok) throw new Error('Lưu thất bại')
    const saved: AnnualCheckup = await res.json()
    setCheckups((prev) => [saved, ...prev].sort((a, b) => b.year - a.year))
    setShowForm(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="size-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {editing && !showForm && (
        <Button
          variant="outline"
          className="w-full min-h-[48px] text-base gap-2"
          onClick={() => setShowForm(true)}
        >
          <Plus className="size-4" /> Thêm lần khám
        </Button>
      )}

      {showForm && (
        <AnnualCheckupAddForm
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
        />
      )}

      {checkups.length === 0 && !showForm && (
        <div className="text-center py-10 text-muted-foreground border border-dashed rounded-lg">
          <Stethoscope className="size-10 mx-auto mb-2 opacity-30" />
          <p className="text-base">Chưa có hồ sơ khám sức khỏe định kỳ</p>
        </div>
      )}

      {checkups.map((c) => (
        <Card key={c.id}>
          <CardContent className="pt-4 space-y-3">
            {/* Header: year + status */}
            <div className="flex items-start justify-between gap-2">
              <p className="text-base font-semibold">Khám sức khỏe {c.year}</p>
              <StatusBadge status={c.status} />
            </div>

            {/* Facility + doctor + date */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Stethoscope className="size-3.5 shrink-0" /> {c.facility}
              </span>
              <span className="flex items-center gap-1">
                <User className="size-3.5 shrink-0" /> {c.doctorName}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="size-3.5 shrink-0" /> {c.examDate}
              </span>
            </div>

            {/* Key vitals */}
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <VitalRow label="Huyết áp" value={c.bloodPressure} />
              <VitalRow label="Nhịp tim" value={c.heartRate ? `${c.heartRate} lần/phút` : undefined} />
              <VitalRow label="Đường huyết" value={c.bloodSugar} />
              <VitalRow label="Cholesterol" value={c.cholesterol} />
            </div>

            {/* General health summary */}
            <p className="text-sm text-muted-foreground">{c.generalHealth}</p>

            {/* Extra notes */}
            {c.notes && (
              <p className="text-sm text-muted-foreground italic">{c.notes}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
