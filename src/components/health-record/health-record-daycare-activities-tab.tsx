'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Home, Clock, Activity, AlertCircle, FileText } from 'lucide-react'
import type { DaycareActivity } from '@/lib/demo/demo-health-record-data'
import {
  detectBloodPressureAlert,
  detectGlucoseAlert,
  detectHeartRateAlert,
  type AlertLevel,
} from '@/lib/vitals/vital-threshold-alert-detector'

/**
 * Tab "Daycare" trong hồ sơ AIVIHE
 * Hiển thị hoạt động hằng ngày tại Thong Dong Daycare (mirror từ webhook)
 * Chỉ số BP, đường huyết, nhịp tim hiển thị kèm badge cảnh báo nếu vượt ngưỡng
 */

// Default thresholds (matching migration 00043 seeds)
const DEFAULT_THRESHOLDS = [
  { indicator_type: 'bp_systolic',  low_critical: 80, low_warning: 90,  high_warning: 140, high_critical: 180 },
  { indicator_type: 'bp_diastolic', low_critical: 50, low_warning: 60,  high_warning: 90,  high_critical: 120 },
  { indicator_type: 'blood_glucose',low_critical: 54, low_warning: 70,  high_warning: 140, high_critical: 200 },
  { indicator_type: 'heart_rate',   low_critical: 40, low_warning: 50,  high_warning: 100, high_critical: 130 },
]

export function HealthRecordDaycareActivitiesTab({ items }: { items: DaycareActivity[] }) {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 pb-6 text-center text-gray-500">
          <Home className="size-12 text-gray-300 mx-auto mb-2" />
          <p>Chưa có dữ liệu Daycare. Dữ liệu sẽ tự động cập nhật khi bạn tham gia sinh hoạt tại Thong Dong Daycare.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 text-sm text-teal-900">
        <p className="flex items-start gap-2">
          <Home className="size-4 shrink-0 mt-0.5" />
          <span>
            <strong>Nguồn: Thong Dong Daycare</strong> — dữ liệu tự động cập nhật từ hệ thống Daycare qua API/webhook.
            Lễ tân, nhân viên chăm sóc và y tá tại trung tâm ghi nhận hàng ngày.
          </span>
        </p>
      </div>

      {items.map(a => {
        const vs = a.vitals_snapshot

        // Parse BP string "sys/dia" → numbers for threshold check
        let bpAlert: AlertLevel = null
        let bpSys: number | null = null
        let bpDia: number | null = null
        if (vs.blood_pressure) {
          const parts = vs.blood_pressure.split('/')
          bpSys = parseFloat(parts[0])
          bpDia = parseFloat(parts[1])
          if (!isNaN(bpSys) && !isNaN(bpDia)) {
            bpAlert = detectBloodPressureAlert(bpSys, bpDia, DEFAULT_THRESHOLDS)
          }
        }

        const glucoseAlert = vs.blood_glucose != null
          ? detectGlucoseAlert(vs.blood_glucose, DEFAULT_THRESHOLDS)
          : null

        const hrAlert = vs.heart_rate != null
          ? detectHeartRateAlert(vs.heart_rate, DEFAULT_THRESHOLDS)
          : null

        const hasAnyAlert = bpAlert || glucoseAlert || hrAlert

        return (
          <Card key={a.id}>
            <CardContent className="pt-5 pb-5 space-y-3">
              {/* Header: date + check-in/out */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-lg font-bold">
                  {new Date(a.date).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
                </h3>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  {a.checkin_at && (
                    <span className="flex items-center gap-1">
                      <Clock className="size-3.5 text-green-600" />
                      {new Date(a.checkin_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} → {a.checkout_at && new Date(a.checkout_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>

              {/* Activities */}
              {a.activities.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                    <Activity className="size-4" /> Hoạt động
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {a.activities.map((act, i) => (
                      <span key={i} className="text-sm bg-teal-50 text-teal-700 border border-teal-200 rounded-full px-2.5 py-0.5">
                        {act}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Meal + nap + mood */}
              <div className="grid sm:grid-cols-3 gap-3 text-sm">
                {a.meal_status && (
                  <DetailItem label="🍽️ Ăn trưa" value={a.meal_status} />
                )}
                {a.nap_duration_minutes !== null && (
                  <DetailItem label="😴 Nghỉ trưa" value={`${a.nap_duration_minutes} phút`} />
                )}
                {a.mood_rating !== null && (
                  <DetailItem
                    label="😊 Tinh thần"
                    value={`${a.mood_rating}/5 ${renderMoodEmoji(a.mood_rating)}`}
                  />
                )}
              </div>

              {/* Vitals — BP, glucose, heart rate prominent; spo2 + weight secondary */}
              {Object.keys(vs).length > 0 && (
                <div className={`rounded-md p-3 ${hasAnyAlert ? 'bg-amber-50 border border-amber-200' : 'bg-slate-50'}`}>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Chỉ số đo tại Daycare</p>

                  {/* Primary: BP / glucose / heart rate */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                    {vs.blood_pressure && (
                      <VitalChipPrimary
                        label="Huyết áp"
                        value={vs.blood_pressure}
                        unit="mmHg"
                        alertLevel={bpAlert}
                      />
                    )}
                    {vs.blood_glucose != null && (
                      <VitalChipPrimary
                        label="Đường huyết"
                        value={String(vs.blood_glucose)}
                        unit="mg/dL"
                        alertLevel={glucoseAlert}
                      />
                    )}
                    {vs.heart_rate != null && (
                      <VitalChipPrimary
                        label="Nhịp tim"
                        value={String(vs.heart_rate)}
                        unit="bpm"
                        alertLevel={hrAlert}
                      />
                    )}
                  </div>

                  {/* Secondary: SpO2, weight */}
                  {(vs.spo2 != null || vs.weight != null) && (
                    <div className="flex flex-wrap gap-2">
                      {vs.spo2 != null && <VitalChipSecondary label="SpO2" value={`${vs.spo2}%`} />}
                      {vs.weight != null && <VitalChipSecondary label="Cân nặng" value={`${vs.weight} kg`} />}
                    </div>
                  )}
                </div>
              )}

              {/* Staff notes */}
              {a.staff_notes && (
                <div className="border-t pt-2">
                  <p className="text-sm flex items-start gap-1.5">
                    <FileText className="size-4 shrink-0 mt-0.5 text-gray-500" />
                    <span><span className="text-gray-500">Ghi chú NV:</span> <em className="text-gray-700">{a.staff_notes}</em></span>
                  </p>
                </div>
              )}

              {/* Incidents */}
              {a.incidents.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-md p-2">
                  <p className="text-sm font-semibold text-red-800 flex items-center gap-1.5">
                    <AlertCircle className="size-4" /> Sự cố
                  </p>
                  {a.incidents.map((inc, i) => (
                    <p key={i} className="text-sm text-red-700 mt-1">• [{inc.type}] {inc.description}</p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-gray-500 text-xs">{label}</p>
      <p className="font-medium text-gray-900">{value}</p>
    </div>
  )
}

/** Primary vital chip — BP, glucose, heart rate — with alert badge */
function VitalChipPrimary({
  label, value, unit, alertLevel,
}: {
  label: string
  value: string
  unit: string
  alertLevel: AlertLevel
}) {
  const isCritical = alertLevel === 'critical'
  const isWarning  = alertLevel === 'warning'

  return (
    <div className={`rounded-lg border px-3 py-2 ${
      isCritical ? 'bg-red-50 border-red-300'
      : isWarning ? 'bg-amber-50 border-amber-300'
      : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between gap-1 mb-0.5">
        <p className="text-xs text-gray-500">{label}</p>
        {isCritical && <span className="text-[9px] font-bold px-1 py-0.5 rounded-full bg-red-100 text-red-700">⚠ Nguy hiểm</span>}
        {isWarning  && <span className="text-[9px] font-bold px-1 py-0.5 rounded-full bg-amber-100 text-amber-700">△ Chú ý</span>}
      </div>
      <p className={`font-bold text-base leading-tight ${
        isCritical ? 'text-red-700' : isWarning ? 'text-amber-700' : 'text-gray-900'
      }`}>
        {value} <span className="text-xs font-normal text-gray-400">{unit}</span>
      </p>
    </div>
  )
}

/** Secondary chip — SpO2, weight — plain display */
function VitalChipSecondary({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded px-2 py-1 border border-gray-200 text-sm">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-semibold text-gray-900">{value}</p>
    </div>
  )
}

function renderMoodEmoji(rating: number): string {
  if (rating >= 5) return '😄'
  if (rating >= 4) return '🙂'
  if (rating >= 3) return '😐'
  if (rating >= 2) return '😕'
  return '😞'
}
