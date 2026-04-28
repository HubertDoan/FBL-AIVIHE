'use client'

/**
 * Danh sách lịch sử đo chỉ số — hiển thị bối cảnh (thuốc, ăn uống, vận động, tinh thần)
 * dưới dạng chip nhỏ khi có context_notes
 */

import { Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { VitalRecord } from './vitals-frequent-indicators-section-blood-pressure-glucose-heart-rate'

interface Props {
  vitals: VitalRecord[]
}

const INDICATOR_LABELS: Record<string, string> = {
  blood_pressure: 'Huyết áp',
  blood_glucose:  'Đường huyết',
  heart_rate:     'Nhịp tim',
  height:         'Chiều cao',
  weight:         'Cân nặng',
}

const SOURCE_LABEL: Record<string, string> = {
  manual:    'Nhập tay',
  image_ocr: '📸 AI đọc ảnh',
  device:    'Thiết bị',
}

const EXERCISE_LABEL: Record<string, string> = {
  light:    'Nhẹ nhàng',
  moderate: 'Bình thường',
  heavy:    'Nhiều/mạnh',
}

const MENTAL_LABEL: Record<string, string> = {
  happy:    '😄 Vui vẻ',
  tired:    '😴 Mệt mỏi',
  stressed: '😤 Căng thẳng',
  anxious:  '😰 Lo lắng',
}

const MED_TYPE_LABEL: Record<string, string> = {
  blood_pressure: 'HA',
  diabetes:       'ĐH',
  heart:          'Tim',
  other:          'Khác',
}

interface ContextNotes {
  taking_medication?: boolean
  medication_types?: string[]
  diet?: string | null
  exercise?: string | null
  mental_state?: string | null
  extra_notes?: string | null
}

function ContextChips({ notes }: { notes: ContextNotes }) {
  const chips: string[] = []

  if (notes.taking_medication) {
    const types = (notes.medication_types ?? []).map(t => MED_TYPE_LABEL[t] ?? t)
    chips.push('💊 Thuốc' + (types.length ? ': ' + types.join(', ') : ''))
  }
  if (notes.diet?.trim()) chips.push('🍽 ' + notes.diet.trim())
  if (notes.exercise && notes.exercise !== 'none' && EXERCISE_LABEL[notes.exercise]) {
    chips.push('🏃 ' + EXERCISE_LABEL[notes.exercise])
  }
  if (notes.mental_state && notes.mental_state !== 'normal' && MENTAL_LABEL[notes.mental_state]) {
    chips.push(MENTAL_LABEL[notes.mental_state])
  }
  if (notes.extra_notes?.trim()) chips.push('📝 ' + notes.extra_notes.trim())

  if (!chips.length) return null
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {chips.map((chip, i) => (
        <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
          {chip}
        </span>
      ))}
    </div>
  )
}

export function VitalsMeasurementHistoryListWithContextChips({ vitals }: Props) {
  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center justify-between">
          Lịch sử đo
          {vitals.length > 0 && (
            <span className="text-xs font-normal text-slate-400">{vitals.length} bản ghi</span>
          )}
        </h2>

        {vitals.length === 0 ? (
          <div className="text-center py-8">
            <Sparkles className="size-10 mx-auto text-teal-300 mb-2" />
            <p className="text-sm text-slate-500 mb-3">Chưa có chỉ số nào.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {vitals.slice(0, 30).map(v => {
              const label = INDICATOR_LABELS[v.indicator_type] ?? v.indicator_type
              const ctx = v.context_notes as ContextNotes | null

              return (
                <li key={v.id} className="py-2.5 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-slate-700">{label}</span>
                      <span className="text-sm font-bold text-slate-900">
                        {v.indicator_type === 'blood_pressure' && 'sys' in v.value
                          ? `${v.value.sys}/${v.value.dia}${v.value.pulse ? ` · ${v.value.pulse}` : ''}`
                          : String(v.value.value ?? Object.values(v.value)[0] ?? '—')}
                      </span>
                      <span className="text-xs text-slate-400">{v.unit}</span>
                      {v.alert_level === 'critical' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 font-bold">⚠ Nguy hiểm</span>
                      )}
                      {v.alert_level === 'warning' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold">△ Chú ý</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {new Date(v.measured_at).toLocaleString('vi-VN', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                      {' · '}{SOURCE_LABEL[v.source] ?? v.source}
                    </p>
                    {ctx && <ContextChips notes={ctx} />}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
