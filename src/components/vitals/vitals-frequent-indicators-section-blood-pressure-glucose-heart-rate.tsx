'use client'

/**
 * Section chỉ số thay đổi thường xuyên (đo hàng ngày):
 * Huyết áp · Đường huyết · Nhịp tim
 * Hiển thị ở TOP của trang chỉ số sức khỏe
 */

import { HeartPulse, Droplets, Activity, Plus, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { AlertLevel } from '@/lib/vitals/vital-threshold-alert-detector'

export interface VitalRecord {
  id: string
  indicator_type: string
  value: Record<string, number>
  unit: string | null
  measured_at: string
  source: string
  alert_level: AlertLevel
  context_notes: Record<string, unknown> | null
}

interface Props {
  vitals: VitalRecord[]
  onAddClick: (defaultType?: string) => void
}

const FREQUENT = [
  {
    key: 'blood_pressure',
    label: 'Huyết áp',
    unit: 'mmHg',
    icon: HeartPulse,
    accent: 'rose',
    hint: 'Đo sáng và tối',
  },
  {
    key: 'blood_glucose',
    label: 'Đường huyết',
    unit: 'mg/dL',
    icon: Droplets,
    accent: 'amber',
    hint: 'Đo lúc đói hoặc 2h sau ăn',
  },
  {
    key: 'heart_rate',
    label: 'Nhịp tim',
    unit: 'bpm',
    icon: Activity,
    accent: 'pink',
    hint: 'Đo lúc nghỉ ngơi',
  },
]

const ACCENT_CLASSES: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  rose:  { bg: 'bg-rose-50',  text: 'text-rose-700',  border: 'border-rose-200', badge: 'bg-rose-100 text-rose-700' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700' },
  pink:  { bg: 'bg-pink-50',  text: 'text-pink-700',  border: 'border-pink-200', badge: 'bg-pink-100 text-pink-700' },
}

function formatBP(v: VitalRecord): string {
  if ('sys' in v.value) {
    const pulse = v.value.pulse ? ` · ${v.value.pulse}` : ''
    return `${v.value.sys}/${v.value.dia}${pulse}`
  }
  return '—'
}

function formatValue(v: VitalRecord): string {
  if (v.indicator_type === 'blood_pressure') return formatBP(v)
  const val = v.value.value ?? Object.values(v.value)[0]
  return val !== undefined ? String(val) : '—'
}

function alertBadge(level: AlertLevel) {
  if (level === 'critical') return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">⚠ Nguy hiểm</span>
  if (level === 'warning')  return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">△ Chú ý</span>
  return null
}

function trendIcon(curr: VitalRecord | null, prev: VitalRecord | null) {
  if (!curr || !prev) return <Minus className="size-3.5 text-gray-300" />
  const c = curr.indicator_type === 'blood_pressure' ? curr.value.sys : (curr.value.value ?? 0)
  const p = prev.indicator_type === 'blood_pressure' ? prev.value.sys : (prev.value.value ?? 0)
  if (c > p) return <TrendingUp className="size-3.5 text-red-400" />
  if (c < p) return <TrendingDown className="size-3.5 text-green-500" />
  return <Minus className="size-3.5 text-gray-300" />
}

export function VitalsFrequentIndicatorsSectionBloodPressureGlucoseHeartRate({ vitals, onAddClick }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Theo dõi hàng ngày</h2>
        <Button size="sm" onClick={() => onAddClick()} className="h-8 gap-1 bg-rose-600 hover:bg-rose-700 text-white text-xs">
          <Plus className="size-3.5" /> Đo mới
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {FREQUENT.map(ind => {
          const records = vitals.filter(v => v.indicator_type === ind.key)
          const latest = records[0] ?? null
          const prev   = records[1] ?? null
          const Icon   = ind.icon
          const ac     = ACCENT_CLASSES[ind.accent]

          return (
            <div
              key={ind.key}
              className={`rounded-xl border-2 ${latest?.alert_level === 'critical' ? 'border-red-300 bg-red-50' : latest?.alert_level === 'warning' ? 'border-amber-300 bg-amber-50' : `${ac.border} ${ac.bg}`} p-4 space-y-2 relative`}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Icon className={`size-4 ${ac.text}`} />
                  <span className="text-sm font-semibold text-gray-800">{ind.label}</span>
                </div>
                {alertBadge(latest?.alert_level ?? null)}
              </div>

              {/* Value */}
              {latest ? (
                <>
                  <div className="flex items-end gap-2">
                    <span className={`text-3xl font-extrabold leading-none ${latest.alert_level === 'critical' ? 'text-red-600' : latest.alert_level === 'warning' ? 'text-amber-700' : ac.text}`}>
                      {formatValue(latest)}
                    </span>
                    <span className="text-xs text-gray-400 mb-0.5">{ind.unit}</span>
                    <span className="mb-0.5">{trendIcon(latest, prev)}</span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    {new Date(latest.measured_at).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    {latest.context_notes ? ' · Có bối cảnh' : ''}
                  </p>
                </>
              ) : (
                <div className="py-2">
                  <p className="text-sm text-gray-400 italic mb-2">Chưa có dữ liệu</p>
                  <p className="text-[11px] text-gray-400">{ind.hint}</p>
                </div>
              )}

              {/* Quick add shortcut */}
              <button
                onClick={() => onAddClick(ind.key)}
                className={`w-full text-xs py-1.5 rounded-lg border ${ac.border} ${ac.text} hover:opacity-80 transition-opacity font-medium`}
              >
                + Thêm hôm nay
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
