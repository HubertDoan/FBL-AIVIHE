'use client'

/**
 * Dialog hỏi bối cảnh khi chỉ số vượt ngưỡng cảnh báo
 * Hiện sau khi save vital thành công nếu alert_level != null
 * Ghi nhận: thuốc, ăn uống, vận động, tinh thần → PATCH /api/vitals/:id/context
 */

import { useState } from 'react'
import { AlertTriangle, Pill, Utensils, Dumbbell, Brain, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { AlertLevel } from '@/lib/vitals/vital-threshold-alert-detector'

interface Props {
  open: boolean
  onClose: () => void
  vitalId: string
  indicatorLabel: string
  valueDisplay: string
  alertLevel: AlertLevel
}

type ExerciseLevel = 'none' | 'light' | 'moderate' | 'heavy'
type MentalState = 'normal' | 'stressed' | 'anxious' | 'tired' | 'happy'

const EXERCISE_OPTIONS: { value: ExerciseLevel; label: string }[] = [
  { value: 'none',     label: 'Không vận động' },
  { value: 'light',    label: 'Nhẹ nhàng' },
  { value: 'moderate', label: 'Bình thường' },
  { value: 'heavy',    label: 'Nhiều / mạnh' },
]

const MENTAL_OPTIONS: { value: MentalState; label: string; emoji: string }[] = [
  { value: 'normal',   label: 'Bình thường', emoji: '😊' },
  { value: 'happy',    label: 'Vui vẻ',      emoji: '😄' },
  { value: 'tired',    label: 'Mệt mỏi',     emoji: '😴' },
  { value: 'stressed', label: 'Căng thẳng',  emoji: '😤' },
  { value: 'anxious',  label: 'Lo lắng',     emoji: '😰' },
]

const MED_TYPES = [
  { value: 'blood_pressure', label: 'Thuốc huyết áp' },
  { value: 'diabetes',       label: 'Thuốc tiểu đường' },
  { value: 'heart',          label: 'Thuốc tim mạch' },
  { value: 'other',          label: 'Loại khác' },
]

export function VitalsThresholdExceededContextFormDialog({
  open, onClose, vitalId, indicatorLabel, valueDisplay, alertLevel,
}: Props) {
  const [takingMed, setTakingMed] = useState<boolean | null>(null)
  const [medTypes, setMedTypes] = useState<string[]>([])
  const [diet, setDiet] = useState('')
  const [exercise, setExercise] = useState<ExerciseLevel | null>(null)
  const [mental, setMental] = useState<MentalState | null>(null)
  const [extraNotes, setExtraNotes] = useState('')
  const [saving, setSaving] = useState(false)

  function toggleMedType(v: string) {
    setMedTypes(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v])
  }

  async function handleSave() {
    setSaving(true)
    try {
      await fetch(`/api/vitals/${vitalId}/context`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taking_medication: takingMed ?? false,
          medication_types: medTypes,
          diet: diet.trim() || null,
          exercise: exercise ?? 'none',
          mental_state: mental ?? 'normal',
          extra_notes: extraNotes.trim() || null,
        }),
      })
    } finally {
      setSaving(false)
      onClose()
    }
  }

  const isCritical = alertLevel === 'critical'

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose() }}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className={`size-5 ${isCritical ? 'text-red-500' : 'text-amber-500'}`} />
            {isCritical ? 'Chỉ số cần chú ý ngay' : 'Chỉ số vượt ngưỡng'}
          </DialogTitle>
        </DialogHeader>

        <div className={`rounded-lg p-3 text-sm font-medium mb-1 ${
          isCritical ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
        }`}>
          {indicatorLabel}: <span className="font-bold">{valueDisplay}</span>
          {isCritical
            ? ' — Vượt ngưỡng nguy hiểm. Vui lòng theo dõi sát và liên hệ bác sĩ nếu có triệu chứng bất thường.'
            : ' — Cao hơn mức bình thường. Hãy ghi lại bối cảnh để bác sĩ tham khảo.'}
        </div>

        <div className="space-y-4 text-sm">

          {/* Thuốc */}
          <div className="space-y-2">
            <p className="font-semibold flex items-center gap-1.5 text-gray-700">
              <Pill className="size-4 text-blue-500" /> Đang dùng thuốc không?
            </p>
            <div className="flex gap-2">
              {[{ v: true, l: 'Có' }, { v: false, l: 'Không' }].map(({ v, l }) => (
                <button key={String(v)} onClick={() => setTakingMed(v)}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    takingMed === v ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-300'
                  }`}>
                  {l}
                </button>
              ))}
            </div>
            {takingMed && (
              <div className="flex flex-wrap gap-2 pt-1">
                {MED_TYPES.map(m => (
                  <button key={m.value} onClick={() => toggleMedType(m.value)}
                    className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                      medTypes.includes(m.value) ? 'bg-blue-100 text-blue-700 border-blue-400' : 'border-gray-200 text-gray-500 hover:border-blue-300'
                    }`}>
                    {m.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Ăn uống */}
          <div className="space-y-1.5">
            <p className="font-semibold flex items-center gap-1.5 text-gray-700">
              <Utensils className="size-4 text-green-500" /> Ăn uống hôm nay
            </p>
            <Textarea
              placeholder="VD: ăn mặn, uống nhiều cà phê, bỏ bữa sáng..."
              value={diet}
              onChange={e => setDiet(e.target.value)}
              rows={2}
              className="resize-none text-sm"
            />
          </div>

          {/* Vận động */}
          <div className="space-y-1.5">
            <p className="font-semibold flex items-center gap-1.5 text-gray-700">
              <Dumbbell className="size-4 text-purple-500" /> Vận động hôm nay
            </p>
            <div className="grid grid-cols-2 gap-2">
              {EXERCISE_OPTIONS.map(o => (
                <button key={o.value} onClick={() => setExercise(o.value)}
                  className={`py-2 rounded-lg border text-sm transition-colors ${
                    exercise === o.value ? 'bg-purple-600 text-white border-purple-600' : 'border-gray-200 text-gray-600 hover:border-purple-300'
                  }`}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tinh thần */}
          <div className="space-y-1.5">
            <p className="font-semibold flex items-center gap-1.5 text-gray-700">
              <Brain className="size-4 text-rose-500" /> Tinh thần / cảm xúc
            </p>
            <div className="flex flex-wrap gap-2">
              {MENTAL_OPTIONS.map(o => (
                <button key={o.value} onClick={() => setMental(o.value)}
                  className={`px-3 py-1.5 rounded-full border text-sm transition-colors ${
                    mental === o.value ? 'bg-rose-100 text-rose-700 border-rose-400' : 'border-gray-200 text-gray-500 hover:border-rose-300'
                  }`}>
                  {o.emoji} {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ghi chú thêm */}
          <div className="space-y-1.5">
            <p className="text-gray-500 text-xs">Ghi chú thêm (tuỳ chọn)</p>
            <Textarea
              placeholder="Bất kỳ thông tin nào khác bạn muốn bác sĩ biết..."
              value={extraNotes}
              onChange={e => setExtraNotes(e.target.value)}
              rows={2}
              className="resize-none text-sm"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Bỏ qua
          </Button>
          <Button onClick={handleSave} disabled={saving} className="flex-1 gap-1">
            {saving ? 'Đang lưu...' : <><ChevronRight className="size-4" /> Lưu bối cảnh</>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
