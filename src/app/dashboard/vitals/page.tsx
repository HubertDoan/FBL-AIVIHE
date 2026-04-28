'use client'

/**
 * Chỉ số sức khỏe — Layout theo tần suất sử dụng:
 * TOP:    Huyết áp · Đường huyết · Nhịp tim · Cân nặng (theo dõi hàng ngày)
 * MIDDLE: Thống kê xu hướng hàng tuần / tháng
 * BOTTOM: Chiều cao · BMI (ít thay đổi); Lịch sử đo với context chips
 * Alert:  Khi vượt ngưỡng → dialog hỏi bối cảnh
 */

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { VitalsAddMeasurementDialogWithIndicatorSelectorAndImageOcr } from '@/components/vitals/vitals-add-measurement-dialog-with-indicator-selector-and-image-ocr'
import { VitalsFrequentIndicatorsSectionBloodPressureGlucoseHeartRate, type VitalRecord } from '@/components/vitals/vitals-frequent-indicators-section-blood-pressure-glucose-heart-rate'
import { VitalsStaticIndicatorsSectionHeightAndWeight } from '@/components/vitals/vitals-static-indicators-section-height-and-weight'
import { VitalsThresholdExceededContextFormDialog } from '@/components/vitals/vitals-threshold-exceeded-context-form-dialog'
import { VitalsWeeklyMonthlyStatisticsAndTrendTable } from '@/components/vitals/vitals-weekly-monthly-statistics-and-trend-table'
import { VitalsMeasurementHistoryListWithContextChips } from '@/components/vitals/vitals-measurement-history-list-with-context-chips'
import { VitalsPersonalThresholdSettingsPanel } from '@/components/vitals/vitals-personal-threshold-settings-panel'
import { VitalsAiFactorAnalysisPanel } from '@/components/vitals/vitals-ai-factor-analysis-panel'
import {
  detectBloodPressureAlert,
  detectGlucoseAlert,
  detectHeartRateAlert,
  detectWeightAlert,
  type VitalThreshold,
  type AlertLevel,
} from '@/lib/vitals/vital-threshold-alert-detector'

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
    } else if (newVital.indicator_type === 'weight') {
      const v = newVital.value.value ?? 0
      level        = detectWeightAlert(v, thresholds)
      valueDisplay = `${v} kg`
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
    setPendingCheckType(type ?? 'blood_pressure')
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

  // Cân nặng + 3 chỉ số hàng ngày cùng trong section "Theo dõi hàng ngày"
  const frequentVitals = vitals.filter(v =>
    ['blood_pressure', 'blood_glucose', 'heart_rate', 'weight'].includes(v.indicator_type)
  )
  // Chiều cao (+ weight cho BMI) — static section chỉ hiển thị chiều cao + BMI
  const staticVitals = vitals.filter(v =>
    ['height', 'weight'].includes(v.indicator_type)
  )

  return (
    <div className="space-y-5 max-w-3xl">
      <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1">
        <ArrowLeft className="size-4" /> Về tổng quan
      </Link>

      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-900">
          📊 Chỉ số sức khỏe
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          {vitals.length} lần đo · Cập nhật hàng ngày · Hỗ trợ AI đọc ảnh máy đo
        </p>
      </div>

      {/* Huyết áp · Đường huyết · Nhịp tim · Cân nặng */}
      <VitalsFrequentIndicatorsSectionBloodPressureGlucoseHeartRate
        vitals={frequentVitals}
        onAddClick={openAddDialog}
      />

      {/* Thống kê xu hướng hàng tuần / tháng */}
      <VitalsWeeklyMonthlyStatisticsAndTrendTable vitals={vitals} />

      {/* Chiều cao + BMI — ẩn mặc định */}
      <VitalsStaticIndicatorsSectionHeightAndWeight
        vitals={staticVitals}
        onAddClick={openAddDialog}
      />

      {/* Ngưỡng cảnh báo cá nhân — chỉ khi vượt ngưỡng mới hỏi bối cảnh */}
      <VitalsPersonalThresholdSettingsPanel />

      {/* Phân tích AI — tương quan bối cảnh với chỉ số (hiện khi có ≥3 bối cảnh) */}
      <VitalsAiFactorAnalysisPanel vitals={vitals} />

      {/* Lịch sử đo với context chips */}
      <VitalsMeasurementHistoryListWithContextChips vitals={vitals} />

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
