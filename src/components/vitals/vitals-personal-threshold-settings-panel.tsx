'use client'

/**
 * Panel cài đặt ngưỡng cảnh báo cá nhân — cho phép người dùng tự điều chỉnh
 * ngưỡng alarm so với mặc định BYT. Chỉ khi vượt ngưỡng này mới yêu cầu nhập bối cảnh.
 */

import { useState, useEffect } from 'react'
import { Settings2, ChevronDown, ChevronUp, Save, RotateCcw, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

interface ThresholdRow {
  indicator_type: string
  label: string
  unit: string
  low_warning: number | null
  high_warning: number | null
  low_critical: number | null
  high_critical: number | null
}

// MOH standard fallback (mirrors API SYSTEM_DEFAULTS)
const MOH_DEFAULTS: ThresholdRow[] = [
  { indicator_type: 'bp_systolic',   label: 'HA tâm thu',    unit: 'mmHg', low_critical: 80,  low_warning: 90,  high_warning: 140, high_critical: 180 },
  { indicator_type: 'bp_diastolic',  label: 'HA tâm trương', unit: 'mmHg', low_critical: 50,  low_warning: 60,  high_warning: 90,  high_critical: 120 },
  { indicator_type: 'blood_glucose', label: 'Đường huyết',   unit: 'mg/dL',low_critical: 54,  low_warning: 70,  high_warning: 140, high_critical: 200 },
  { indicator_type: 'heart_rate',    label: 'Nhịp tim',      unit: 'bpm',  low_critical: 40,  low_warning: 50,  high_warning: 100, high_critical: 130 },
  { indicator_type: 'weight',        label: 'Cân nặng',      unit: 'kg',   low_critical: 30,  low_warning: 40,  high_warning: 90,  high_critical: 120 },
]

export function VitalsPersonalThresholdSettingsPanel() {
  const [expanded, setExpanded] = useState(false)
  const [rows, setRows] = useState<ThresholdRow[]>([])
  const [saving, setSaving] = useState(false)
  const [isPersonalized, setIsPersonalized] = useState(false)

  useEffect(() => {
    if (!expanded) return
    fetch('/api/vitals/thresholds')
      .then(r => r.json())
      .then(data => {
        const personal: ThresholdRow[] = (data.personal ?? [])
        const system: ThresholdRow[]   = (data.system_defaults ?? MOH_DEFAULTS)
        setIsPersonalized(personal.length > 0)

        // Merge: personal overrides system defaults per indicator_type
        const base: ThresholdRow[] = system.map(d => {
          const override = personal.find((p: ThresholdRow) => p.indicator_type === d.indicator_type)
          const moh = MOH_DEFAULTS.find(m => m.indicator_type === d.indicator_type)
          return {
            indicator_type: d.indicator_type,
            label:          moh?.label ?? d.indicator_type,
            unit:           moh?.unit ?? '',
            low_warning:    override?.low_warning  ?? d.low_warning,
            high_warning:   override?.high_warning ?? d.high_warning,
            low_critical:   override?.low_critical  ?? d.low_critical,
            high_critical:  override?.high_critical ?? d.high_critical,
          }
        })
        setRows(base)
      })
  }, [expanded])

  function update(type: string, field: keyof ThresholdRow, value: string) {
    const n = value === '' ? null : Number(value)
    setRows(prev => prev.map(r => r.indicator_type === type ? { ...r, [field]: n } : r))
  }

  async function save() {
    setSaving(true)
    try {
      const res = await fetch('/api/vitals/thresholds', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thresholds: rows }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success('Đã lưu ngưỡng cá nhân')
      setIsPersonalized(true)
    } catch (e) {
      toast.error('Lỗi lưu ngưỡng: ' + (e instanceof Error ? e.message : ''))
    } finally {
      setSaving(false)
    }
  }

  function resetToSystem() {
    setRows(MOH_DEFAULTS)
    toast.info('Đã đặt lại về mặc định BYT — nhấn Lưu để áp dụng')
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Settings2 className="size-4 text-teal-600" />
          <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">Ngưỡng cảnh báo cá nhân</span>
          {isPersonalized && <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 font-semibold">Đã tùy chỉnh</span>}
        </div>
        {expanded ? <ChevronUp className="size-4 text-gray-400" /> : <ChevronDown className="size-4 text-gray-400" />}
      </button>

      {expanded && (
        <div className="border-t border-gray-100 p-4 space-y-4">
          <p className="text-xs text-gray-500">
            Khi chỉ số vượt ngưỡng <span className="font-semibold text-amber-600">Chú ý</span> của bạn, hệ thống sẽ hỏi về bối cảnh (thuốc, ăn uống, vận động, tinh thần).
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[420px]">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400">
                  <th className="text-left pb-2 font-medium">Chỉ số</th>
                  <th className="text-center pb-2 font-medium text-amber-600">⬇ Chú ý thấp</th>
                  <th className="text-center pb-2 font-medium text-amber-600">⬆ Chú ý cao</th>
                  <th className="text-center pb-2 font-medium text-red-600">⬇ Nguy hiểm</th>
                  <th className="text-center pb-2 font-medium text-red-600">⬆ Nguy hiểm</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map(row => (
                  <tr key={row.indicator_type}>
                    <td className="py-2 pr-2">
                      <span className="font-medium text-gray-700">{row.label}</span>
                      <span className="text-gray-400 ml-1">{row.unit}</span>
                    </td>
                    {(['low_warning', 'high_warning', 'low_critical', 'high_critical'] as const).map(field => (
                      <td key={field} className="py-2 px-1">
                        <Input
                          type="number"
                          value={row[field] ?? ''}
                          onChange={e => update(row.indicator_type, field, e.target.value)}
                          className="h-7 text-xs text-center w-20 mx-auto"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={resetToSystem} className="gap-1 text-xs">
              <RotateCcw className="size-3" /> Mặc định BYT
            </Button>
            <Button size="sm" onClick={save} disabled={saving} className="gap-1 text-xs bg-teal-600 hover:bg-teal-700 text-white ml-auto">
              {saving ? <Loader2 className="size-3 animate-spin" /> : <Save className="size-3" />} Lưu ngưỡng cá nhân
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
