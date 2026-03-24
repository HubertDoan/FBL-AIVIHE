'use client'

// TreatmentMedicationChecklist — daily medication tracking within a treatment episode
// Reuses toggle-checkbox pattern from medication-reminder-card

import { useState } from 'react'
import { Pill } from 'lucide-react'
import type { MedicationReminder } from '@/lib/demo/demo-exam-registration-data'

interface Props {
  treatmentId: string
  prescription: MedicationReminder[]
}

function MedRow({
  med,
  taken,
  onToggle,
}: {
  med: MedicationReminder
  taken: boolean
  onToggle: () => void
}) {
  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
        taken ? 'bg-green-50 border-green-200' : 'bg-background border-border'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-label={taken ? 'Đánh dấu chưa uống' : 'Đánh dấu đã uống'}
        className={`mt-0.5 size-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
          taken ? 'bg-green-500 border-green-500 text-white' : 'border-border hover:border-primary'
        }`}
      >
        {taken && (
          <svg className="size-3.5" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
      <div className="min-w-0 flex-1">
        <p className={`text-base font-medium ${taken ? 'text-green-800 line-through' : ''}`}>
          {med.drug_name}
        </p>
        <p className="text-sm text-muted-foreground">{med.dosage} · {med.frequency}</p>
        {med.notes && (
          <p className="text-sm text-amber-700 italic mt-0.5">{med.notes}</p>
        )}
      </div>
      <span className="text-xs text-muted-foreground shrink-0 pt-1">{med.duration}</span>
    </div>
  )
}

export function TreatmentMedicationChecklist({ treatmentId, prescription }: Props) {
  const [taken, setTaken] = useState<Record<number, boolean>>({})

  function toggle(idx: number) {
    setTaken((prev) => ({ ...prev, [idx]: !prev[idx] }))
  }

  const takenCount = prescription.filter((_, i) => taken[i]).length

  if (prescription.length === 0) {
    return <p className="text-muted-foreground text-base py-4 text-center">Không có đơn thuốc.</p>
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Pill className="size-5 text-primary" />
          <span className="text-base font-medium">Lịch uống thuốc hôm nay</span>
        </div>
        <span className="text-sm text-muted-foreground">{takenCount}/{prescription.length} đã uống</span>
      </div>
      <div className="space-y-2">
        {prescription.map((med, i) => (
          <MedRow
            key={`${treatmentId}-${i}`}
            med={med}
            taken={!!taken[i]}
            onToggle={() => toggle(i)}
          />
        ))}
      </div>
      {takenCount === prescription.length && prescription.length > 0 && (
        <p className="text-sm text-green-700 font-medium text-center py-2">
          Bạn đã uống đủ thuốc hôm nay. Rất tốt!
        </p>
      )}
    </div>
  )
}
