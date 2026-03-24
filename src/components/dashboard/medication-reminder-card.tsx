'use client'

// MedicationReminderCard — shows active medication reminders from completed exam registrations
// Displayed on the patient dashboard for members with completed exams
// In-memory checkbox state for demo daily tracking (not persisted)

import { useState } from 'react'
import { Pill } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import type { MedicationReminder } from '@/lib/demo/demo-exam-registration-data'

interface ReminderItem extends MedicationReminder {
  regId: string
  index: number
}

interface Props {
  reminders: ReminderItem[]
}

function ReminderRow({ item }: { item: ReminderItem & { taken: boolean; onToggle: () => void } }) {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${item.taken ? 'bg-green-50 border-green-200' : 'bg-background border-border'}`}>
      <button
        type="button"
        onClick={item.onToggle}
        aria-label={item.taken ? 'Đánh dấu chưa uống' : 'Đánh dấu đã uống'}
        className={`mt-0.5 size-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
          item.taken ? 'bg-green-500 border-green-500 text-white' : 'border-border hover:border-primary'
        }`}
      >
        {item.taken && (
          <svg className="size-3.5" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
      <div className="min-w-0 flex-1">
        <p className={`text-base font-medium ${item.taken ? 'text-green-800 line-through' : ''}`}>
          {item.drug_name}
        </p>
        <p className="text-sm text-muted-foreground">{item.dosage} · {item.frequency}</p>
        {item.notes && <p className="text-sm text-amber-700 italic mt-0.5">{item.notes}</p>}
      </div>
      <span className="text-xs text-muted-foreground shrink-0 pt-1">{item.duration}</span>
    </div>
  )
}

export function MedicationReminderCard({ reminders }: Props) {
  // Track taken state: key = `${regId}-${index}`
  const [taken, setTaken] = useState<Record<string, boolean>>({})

  if (reminders.length === 0) return null

  function toggle(key: string) {
    setTaken((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const takenCount = reminders.filter((r) => taken[`${r.regId}-${r.index}`]).length

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Pill className="size-5 text-primary" />
            <h2 className="text-lg font-semibold">Lịch uống thuốc hôm nay</h2>
          </div>
          <span className="text-sm text-muted-foreground">
            {takenCount}/{reminders.length} đã uống
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {reminders.map((r) => {
          const key = `${r.regId}-${r.index}`
          return (
            <ReminderRow
              key={key}
              item={{ ...r, taken: !!taken[key], onToggle: () => toggle(key) }}
            />
          )
        })}
        {takenCount === reminders.length && (
          <p className="text-sm text-green-700 font-medium text-center py-2">
            Bạn đã uống đủ thuốc hôm nay. Rất tốt!
          </p>
        )}
      </CardContent>
    </Card>
  )
}
