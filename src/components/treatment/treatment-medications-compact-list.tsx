'use client'

// Compact medication list for the treatment page
// Shows drugs with dosage/frequency — links to full medication reminder card
// Intentionally minimal: full detail lives in /dashboard/medications

import { Pill } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { MedicationReminder } from '@/lib/demo/demo-exam-registration-data'

interface Props {
  medications: MedicationReminder[]
}

export function TreatmentMedicationsCompactList({ medications }: Props) {
  if (medications.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground border border-dashed rounded-lg">
        <Pill className="size-8 mx-auto mb-2 opacity-30" />
        <p className="text-sm">Không có thuốc nào</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {medications.map((med, idx) => (
        <Card key={idx} className="border-emerald-100">
          <CardContent className="p-3 flex items-start gap-3">
            <div className="size-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
              <Pill className="size-4 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{med.drug_name}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {med.dosage} · {med.frequency}
                {med.duration ? ` · ${med.duration}` : ''}
              </p>
              {med.notes && (
                <p className="text-xs text-amber-700 mt-0.5 line-clamp-1">{med.notes}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
