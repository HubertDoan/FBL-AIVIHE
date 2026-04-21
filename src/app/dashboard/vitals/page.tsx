'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2, Plus, Ruler, Scale, HeartPulse, Droplets, Sparkles } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { VitalsAddMeasurementDialogWithIndicatorSelectorAndImageOcr } from '@/components/vitals/vitals-add-measurement-dialog-with-indicator-selector-and-image-ocr'

/**
 * Chỉ số sức khỏe — 4 basic indicators (theo yêu cầu thầy):
 * Chiều cao, Cân nặng, Huyết áp, Đường huyết
 * Healthcare palette (teal/emerald). "Thêm đo" mở dialog với manual + image OCR.
 */

interface VitalRecord {
  id: string
  indicator_type: string
  value: Record<string, number>
  unit: string | null
  measured_at: string
  source: 'manual' | 'image_ocr' | 'device'
  notes: string | null
}

const BASIC_INDICATORS = [
  { key: 'height',          icon: Ruler,      label: 'Chiều cao',  unit: 'cm',     color: 'from-purple-500 to-indigo-500', text: 'text-purple-700' },
  { key: 'weight',          icon: Scale,      label: 'Cân nặng',   unit: 'kg',     color: 'from-blue-500 to-cyan-500',     text: 'text-blue-700' },
  { key: 'blood_pressure',  icon: HeartPulse, label: 'Huyết áp',   unit: 'mmHg',   color: 'from-rose-500 to-pink-500',     text: 'text-rose-700' },
  { key: 'blood_glucose',   icon: Droplets,   label: 'Đường huyết', unit: 'mg/dL', color: 'from-amber-500 to-orange-500',  text: 'text-amber-700' },
]

const SOURCE_LABEL: Record<string, string> = {
  manual: 'Nhập tay',
  image_ocr: '📸 Ảnh máy đo (AI)',
  device: 'Thiết bị IoT',
}

export default function VitalsPage() {
  const { user, loading: authLoading } = useAuth()
  const [vitals, setVitals] = useState<VitalRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)

  async function fetchVitals() {
    setLoading(true)
    try {
      const res = await fetch('/api/vitals')
      const data = await res.json()
      setVitals(data.vitals ?? [])
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && user) fetchVitals()
  }, [authLoading, user])

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        <Loader2 className="size-5 animate-spin mr-2" /> Đang tải...
      </div>
    )
  }

  // Latest reading per indicator
  const latestByIndicator: Record<string, VitalRecord | null> = {}
  for (const ind of BASIC_INDICATORS) {
    latestByIndicator[ind.key] = vitals.find((v) => v.indicator_type === ind.key) || null
  }

  return (
    <div className="space-y-5 max-w-5xl">
      <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1">
        <ArrowLeft className="size-4" /> Về tổng quan
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-900">
            <span className="text-2xl">📊</span> Chỉ số sức khỏe
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            4 chỉ số cơ bản · {vitals.length} lần đo · Hỗ trợ AI đọc ảnh máy đo
          </p>
        </div>
        <Button
          onClick={() => setShowDialog(true)}
          className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 gap-1.5 shadow-md shadow-teal-500/20"
        >
          <Plus className="size-4" /> Thêm đo
        </Button>
      </div>

      {/* 4 indicator cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {BASIC_INDICATORS.map((ind) => {
          const Icon = ind.icon
          const latest = latestByIndicator[ind.key]
          return (
            <div
              key={ind.key}
              className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`size-8 rounded-lg bg-gradient-to-br ${ind.color} text-white flex items-center justify-center`}>
                  <Icon className="size-4" />
                </div>
                <span className="text-sm font-semibold text-slate-700">{ind.label}</span>
              </div>
              {latest ? (
                <>
                  <div className={`text-2xl font-extrabold ${ind.text}`}>
                    {formatVitalValue(latest)}
                    <span className="text-xs font-normal text-slate-400 ml-1">{latest.unit || ind.unit}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {new Date(latest.measured_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    {' · '}{SOURCE_LABEL[latest.source]}
                  </p>
                </>
              ) : (
                <p className="text-xs text-slate-400 italic">Chưa đo</p>
              )}
            </div>
          )
        })}
      </div>

      {/* History */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-slate-900">Lịch sử đo</h2>
            {vitals.length > 0 && (
              <span className="text-xs text-slate-500">{vitals.length} bản ghi</span>
            )}
          </div>

          {loading ? (
            <p className="text-center text-slate-400 py-6 text-sm">Đang tải...</p>
          ) : vitals.length === 0 ? (
            <div className="text-center py-8">
              <Sparkles className="size-10 mx-auto text-teal-300 mb-2" />
              <p className="text-sm text-slate-500 mb-3">Chưa có chỉ số nào được ghi nhận.</p>
              <Button
                onClick={() => setShowDialog(true)}
                className="bg-teal-600 hover:bg-teal-700"
              >
                <Plus className="size-4 mr-1" /> Thêm chỉ số đầu tiên
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {vitals.map((v) => {
                const def = BASIC_INDICATORS.find((i) => i.key === v.indicator_type)
                const Icon = def?.icon || HeartPulse
                return (
                  <li key={v.id} className="py-3 flex items-center gap-3">
                    <div className={`size-9 rounded-lg bg-gradient-to-br ${def?.color || 'from-slate-400 to-slate-500'} text-white flex items-center justify-center shrink-0`}>
                      <Icon className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-slate-900">{def?.label || v.indicator_type}</span>
                        <span className={`text-base font-bold ${def?.text || 'text-slate-700'}`}>
                          {formatVitalValue(v)}
                        </span>
                        <span className="text-xs text-slate-400">{v.unit || def?.unit}</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {new Date(v.measured_at).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        {' · '}{SOURCE_LABEL[v.source]}
                        {v.notes && ` · ${v.notes}`}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      {showDialog && (
        <VitalsAddMeasurementDialogWithIndicatorSelectorAndImageOcr
          onClose={() => setShowDialog(false)}
          onSaved={() => fetchVitals()}
        />
      )}
    </div>
  )
}

/** Format value JSON theo từng indicator */
function formatVitalValue(v: VitalRecord): string {
  if (v.indicator_type === 'blood_pressure' && 'sys' in v.value) {
    const pulse = v.value.pulse ? ` · ${v.value.pulse} bpm` : ''
    return `${v.value.sys}/${v.value.dia}${pulse}`
  }
  return String(v.value.value ?? Object.values(v.value)[0] ?? '—')
}
