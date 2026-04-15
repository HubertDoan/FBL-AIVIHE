'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Home, Clock, Activity, AlertCircle, FileText } from 'lucide-react'
import type { DaycareActivity } from '@/lib/demo/demo-health-record-data'

/**
 * Tab "Daycare" trong hồ sơ AIVIHE
 * Hiển thị hoạt động hằng ngày tại Thong Dong Daycare (mirror từ webhook)
 */

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

      {items.map(a => (
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

            {/* Vitals */}
            {Object.keys(a.vitals_snapshot).length > 0 && (
              <div className="bg-slate-50 rounded-md p-3">
                <p className="text-sm font-semibold text-gray-700 mb-2">Chỉ số đo tại Daycare</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                  {a.vitals_snapshot.blood_pressure && <VitalChip label="HA" value={`${a.vitals_snapshot.blood_pressure} mmHg`} />}
                  {a.vitals_snapshot.heart_rate && <VitalChip label="Nhịp tim" value={`${a.vitals_snapshot.heart_rate}/ph`} />}
                  {a.vitals_snapshot.spo2 && <VitalChip label="SpO2" value={`${a.vitals_snapshot.spo2}%`} />}
                  {a.vitals_snapshot.weight && <VitalChip label="Cân nặng" value={`${a.vitals_snapshot.weight} kg`} />}
                </div>
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
      ))}
    </div>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-gray-500 text-xs">{label}</p>
      <p className="font-medium text-gray-900">{value}</p>
    </div>
  )
}

function VitalChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded px-2 py-1 border">
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

