'use client'

/**
 * Panel quản lý ngưỡng chỉ số sức khỏe toàn hệ thống theo chuẩn BYT
 * Dùng trong admin dashboard → tab Cài đặt hệ thống
 * Admin/director chỉnh sửa ngưỡng áp dụng cho tất cả người dùng (fallback mặc định)
 */

import { useState, useEffect } from 'react'
import { Save, Loader2, RotateCcw, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

interface ThresholdRow {
  indicator_type: string
  label: string
  unit: string
  low_critical: number | null
  low_warning: number | null
  high_warning: number | null
  high_critical: number | null
  notes?: string
}

const MOH_DEFAULTS: ThresholdRow[] = [
  { indicator_type: 'bp_systolic',   label: 'HA tâm thu',    unit: 'mmHg', low_critical: 80,  low_warning: 90,  high_warning: 140, high_critical: 180 },
  { indicator_type: 'bp_diastolic',  label: 'HA tâm trương', unit: 'mmHg', low_critical: 50,  low_warning: 60,  high_warning: 90,  high_critical: 120 },
  { indicator_type: 'blood_glucose', label: 'Đường huyết',   unit: 'mg/dL',low_critical: 54,  low_warning: 70,  high_warning: 140, high_critical: 200 },
  { indicator_type: 'heart_rate',    label: 'Nhịp tim',      unit: 'bpm',  low_critical: 40,  low_warning: 50,  high_warning: 100, high_critical: 130 },
  { indicator_type: 'weight',        label: 'Cân nặng',      unit: 'kg',   low_critical: 30,  low_warning: 40,  high_warning: 90,  high_critical: 120 },
]

export function AdminSystemVitalThresholdsManagementPanel() {
  const [rows, setRows]       = useState<ThresholdRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)

  useEffect(() => {
    fetch('/api/admin/vital-thresholds')
      .then(r => r.json())
      .then(data => setRows(data.thresholds ?? MOH_DEFAULTS))
      .catch(() => setRows(MOH_DEFAULTS))
      .finally(() => setLoading(false))
  }, [])

  function update(type: string, field: keyof ThresholdRow, value: string) {
    const n = value === '' ? null : Number(value)
    setRows(prev => prev.map(r => r.indicator_type === type ? { ...r, [field]: n } : r))
  }

  async function save() {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/vital-thresholds', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thresholds: rows }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Đã cập nhật ngưỡng hệ thống BYT')
    } catch (e) {
      toast.error('Lỗi: ' + (e instanceof Error ? e.message : ''))
    } finally {
      setSaving(false)
    }
  }

  function resetToMoh() {
    setRows(MOH_DEFAULTS)
    toast.info('Đã đặt lại về chuẩn BYT — nhấn Lưu để áp dụng')
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 py-6 justify-center">
        <Loader2 className="size-4 animate-spin" /> Đang tải...
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="size-5 text-teal-600" />
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Ngưỡng chỉ số sức khỏe — Chuẩn BYT</h3>
            <p className="text-xs text-gray-500">Áp dụng cho tất cả tài khoản khi chưa cài đặt ngưỡng cá nhân</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={resetToMoh} className="gap-1 text-xs">
            <RotateCcw className="size-3" /> Đặt lại chuẩn BYT
          </Button>
          <Button size="sm" onClick={save} disabled={saving} className="gap-1 text-xs bg-teal-600 hover:bg-teal-700 text-white">
            {saving ? <Loader2 className="size-3 animate-spin" /> : <Save className="size-3" />} Lưu
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-xs">
          <thead className="bg-gray-50">
            <tr className="border-b border-gray-200">
              <th className="text-left px-3 py-2.5 font-semibold text-gray-600">Chỉ số</th>
              <th className="text-center px-3 py-2.5 font-semibold text-red-500">⬇ Nguy hiểm thấp</th>
              <th className="text-center px-3 py-2.5 font-semibold text-amber-500">⬇ Chú ý thấp</th>
              <th className="text-center px-3 py-2.5 font-semibold text-amber-500">⬆ Chú ý cao</th>
              <th className="text-center px-3 py-2.5 font-semibold text-red-500">⬆ Nguy hiểm cao</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map(row => (
              <tr key={row.indicator_type} className="hover:bg-gray-50">
                <td className="px-3 py-2">
                  <span className="font-medium text-gray-800">{row.label}</span>
                  <span className="text-gray-400 ml-1">({row.unit})</span>
                </td>
                {(['low_critical', 'low_warning', 'high_warning', 'high_critical'] as const).map(field => (
                  <td key={field} className="px-2 py-2 text-center">
                    <Input
                      type="number"
                      value={row[field] ?? ''}
                      onChange={e => update(row.indicator_type, field, e.target.value)}
                      className="h-7 w-20 text-center text-xs mx-auto"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-gray-400">
        Nguồn tham khảo: Hướng dẫn BYT Việt Nam — Tăng huyết áp (QĐ 3192/2010), Đái tháo đường (QĐ 3319/2017).
        Ngưỡng cân nặng mang tính tương đối, cần điều chỉnh theo chiều cao/BMI cá nhân.
      </p>
    </div>
  )
}
