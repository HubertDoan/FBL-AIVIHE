'use client'

/**
 * Chỉ số sức khỏe — Layout mới theo tần suất sử dụng:
 * TOP:    Huyết áp · Đường huyết · Nhịp tim (theo dõi hàng ngày)
 * BOTTOM: Chiều cao · Cân nặng · BMI (ít thay đổi, ẩn mặc định)
 * Alert:  Khi vượt ngưỡng → dialog hỏi bối cảnh (thuốc, ăn uống, vận động, tinh thần)
 */

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { VitalsAddMeasurementDialogWithIndicatorSelectorAndImageOcr } from '@/components/vitals/vitals-add-measurement-dialog-with-indicator-selector-and-image-ocr'
import { VitalsFrequentIndicatorsSectionBloodPressureGlucoseHeartRate, type VitalRecord } from '@/components/vitals/vitals-frequent-indicators-section-blood-pressure-glucose-heart-rate'
import { VitalsStaticIndicatorsSectionHeightAndWeight } from '@/components/vitals/vitals-static-indicators-section-height-and-weight'
import { VitalsThresholdExceededContextFormDialog } from '@/components/vitals/vitals-threshold-exceeded-context-form-dialog'
import { Card, CardContent } from '@/components/ui/card'
import {
  detectBloodPressureAlert,
  detectGlucoseAlert,
  detectHeartRateAlert,
  type VitalThreshold,
  type AlertLevel,
} from '@/lib/vitals/vital-threshold-alert-detector'

const SOURCE_LABEL: Record<string, string> = {
  manual:    'Nhập tay',
  image_ocr: '📸 AI đọc ảnh',
  device:    'Thiết bị',
}

const INDICATOR_LABELS: Record<string, string> = {
  blood_pressure: 'Huyết áp',
  blood_glucose:  'Đường huyết',
  heart_rate:     'Nhịp tim',
  height:         'Chiều cao',
  weight:         'Cân nặng',
}

interface AlertState {
  vitalId: string
  indicatorLabel: string
  valueDisplay: string
  level: AlertLevel
}

export default function VitalsPage() {
  const { user, loading: authLoading } = useAuth()
  const [vitals, setVitals]               = useState<VitalRecord[]>([])
  const [thresholds, setThresholds]       = useState<VitalThreshold[]>([])
  const [loading, setLoading]             = useState(true)
  const [showDialog, setShowDialog]       = useState(false)
  const [defaultType, setDefaultType]     = useState<string | undefined>()
  const [alertState, setAlertState]       = useState<AlertState | null>(null)
  // Track timestamp before save so we can find the new record after refresh
  const [saveMoment, setSaveMoment]       = useState<number>(0)
  const [pendingCheckType, setPendingCheckType] = useState<string | undefined>()

  const fetchVitals = useCallback(async () => {
    setLoading(true)
    try {
      const [vitalsRes, thrRes] = await Promise.all([
        fetch('/api/vitals'),
        fetch('/api/vitals/thresholds'),
      ])
      const vitalsData = await vitalsRes.json()
      const thrData    = await thrRes.json()
      const fresh: VitalRecord[] = vitalsData.vitals ?? []
      setVitals(fresh)
      setThresholds(thrData.thresholds ?? [])
      return fresh
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading && user) fetchVitals()
  }, [authLoading, user, fetchVitals])

  /** Sau khi save → refresh → tìm bản ghi mới nhất → check threshold */
  async function handleVitalSaved() {
    const fresh = await fetchVitals() ?? []
    if (!pendingCheckType) return

    // Tìm vital mới nhất của loại vừa lưu (sau thời điểm mở dialog)
    const newVital = fresh.find(
      v => v.indicator_type === pendingCheckType &&
           new Date(v.measured_at).getTime() >= saveMoment - 5000
    )
    if (!newVital) return

    let level: AlertLevel = null
    let valueDisplay = ''

    if (newVital.indicator_type === 'blood_pressure' && 'sys' in newVital.value) {
      level        = detectBloodPressureAlert(newVital.value.sys, newVital.value.dia, thresholds)
      const pulse  = newVital.value.pulse ? ` · ${newVital.value.pulse} bpm` : ''
      valueDisplay = `${newVital.value.sys}/${newVital.value.dia}${pulse} mmHg`
    } else if (newVital.indicator_type === 'blood_glucose') {
      const v = newVital.value.value ?? 0
      level        = detectGlucoseAlert(v, thresholds)
      valueDisplay = `${v} mg/dL`
    } else if (newVital.indicator_type === 'heart_rate') {
      const v = newVital.value.value ?? 0
      level        = detectHeartRateAlert(v, thresholds)
      valueDisplay = `${v} bpm`
    }

    if (level) {
      setAlertState({
        vitalId:        newVital.id,
        indicatorLabel: INDICATOR_LABELS[newVital.indicator_type] ?? newVital.indicator_type,
        valueDisplay,
        level,
      })
    }
  }

  function openAddDialog(type?: string) {
    setDefaultType(type)
    setPendingCheckType(type ?? 'blood_pressure') // default check BP nếu không chỉ định
    setSaveMoment(Date.now())
    setShowDialog(true)
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        <Loader2 className="size-5 animate-spin mr-2" /> Đang tải...
      </div>
    )
  }

  const frequentVitals = vitals.filter(v =>
    ['blood_pressure', 'blood_glucose', 'heart_rate'].includes(v.indicator_type)
  )
  const staticVitals = vitals.filter(v =>
    ['height', 'weight'].includes(v.indicator_type)
  )

  return (
    <div className="space-y-5 max-w-3xl">
      <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1">
        <ArrowLeft className="size-4" /> Về tổng quan
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-900">
          📊 Chỉ số sức khỏe
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          {vitals.length} lần đo · Cập nhật hàng ngày · Hỗ trợ AI đọc ảnh máy đo
        </p>
      </div>

      {/* TOP: Huyết áp, Đường huyết, Nhịp tim */}
      <VitalsFrequentIndicatorsSectionBloodPressureGlucoseHeartRate
        vitals={frequentVitals}
        onAddClick={openAddDialog}
      />

      {/* BOTTOM: Chiều cao, Cân nặng, BMI — ẩn mặc định */}
      <VitalsStaticIndicatorsSectionHeightAndWeight
        vitals={staticVitals}
        onAddClick={openAddDialog}
      />

      {/* Lịch sử */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center justify-between">
            Lịch sử đo
            {vitals.length > 0 && <span className="text-xs font-normal text-slate-400">{vitals.length} bản ghi</span>}
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
                return (
                  <li key={v.id} className="py-2.5 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-slate-700">{label}</span>
                        <span className="text-sm font-bold text-slate-900">
                          {v.indicator_type === 'blood_pressure' && 'sys' in v.value
                            ? `${v.value.sys}/${v.value.dia}${v.value.pulse ? ` · ${v.value.pulse}` : ''}`
                            : String(v.value.value ?? Object.values(v.value)[0] ?? '—')}
                        </span>
                        <span className="text-xs text-slate-400">{v.unit}</span>
                        {v.alert_level === 'critical' && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 font-bold">⚠ Nguy hiểm</span>}
                        {v.alert_level === 'warning'  && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold">△ Chú ý</span>}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {new Date(v.measured_at).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        {' · '}{SOURCE_LABEL[v.source] ?? v.source}
                        {v.context_notes ? ' · Có bối cảnh' : ''}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Dialog nhập chỉ số */}
      {showDialog && (
        <VitalsAddMeasurementDialogWithIndicatorSelectorAndImageOcr
          onClose={() => { setShowDialog(false); setDefaultType(undefined) }}
          onSaved={handleVitalSaved}
        />
      )}

      {/* Dialog bối cảnh khi vượt ngưỡng */}
      {alertState && (
        <VitalsThresholdExceededContextFormDialog
          open={!!alertState}
          onClose={() => setAlertState(null)}
          vitalId={alertState.vitalId}
          indicatorLabel={alertState.indicatorLabel}
          valueDisplay={alertState.valueDisplay}
          alertLevel={alertState.level}
        />
      )}
    </div>
  )
}
