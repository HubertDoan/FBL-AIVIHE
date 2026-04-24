'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Stethoscope, User, Calendar, Pill, AlertCircle } from 'lucide-react'
import type { FamilyDoctorEncounter } from '@/lib/demo/demo-health-record-data'

/**
 * Tab "Bác sĩ gia đình" trong hồ sơ AIVIHE
 * Các buổi tư vấn, khám bởi BS gia đình — chẩn đoán, kê đơn, theo dõi
 */

export function HealthRecordFamilyDoctorEncountersTab({ items }: { items: FamilyDoctorEncounter[] }) {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 pb-6 text-center text-gray-500">
          <Stethoscope className="size-12 text-gray-300 mx-auto mb-2" />
          <p>Chưa có lần khám nào với bác sĩ gia đình.</p>
          <p className="text-sm mt-1">Đăng ký gói "Bác sĩ gia đình" để bắt đầu.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
        <p className="flex items-start gap-2">
          <Stethoscope className="size-4 shrink-0 mt-0.5" />
          <span>
            <strong>Bác sĩ gia đình</strong> — theo dõi sức khỏe tổng thể, tư vấn lối sống, phát hiện sớm,
            và điều phối chăm sóc. Mỗi lần khám được lưu lại đầy đủ.
          </span>
        </p>
      </div>

      {items.map(e => (
        <Card key={e.id}>
          <CardContent className="pt-5 pb-5 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="size-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  <User className="size-5" />
                </div>
                <div>
                  <p className="font-bold">{e.doctor_name}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar className="size-3" />
                    {new Date(e.date).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </p>
                </div>
              </div>
              {e.next_visit && (
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded border border-amber-200">
                  Tái khám: {(() => { const d = new Date(e.next_visit!); return isNaN(d.getTime()) ? e.next_visit : d.toLocaleDateString('vi-VN') })()}
                </span>
              )}
            </div>

            <Section label="Lý do khám" value={e.reason} />
            <Section label="Triệu chứng" value={e.symptoms} />

            {e.vital_signs && <Section label="Chỉ số sinh tồn" value={e.vital_signs} mono />}

            {e.diagnosis && (
              <div className="bg-blue-50 rounded-md p-3 border border-blue-100">
                <p className="text-xs font-semibold text-blue-900 mb-1">CHẨN ĐOÁN {e.diagnosis_icd10 ? `(ICD-10: ${e.diagnosis_icd10})` : ''}</p>
                <p className="text-sm text-blue-800">{e.diagnosis}</p>
              </div>
            )}

            {e.prescription && (
              <div className="flex items-start gap-2">
                <Pill className="size-4 shrink-0 mt-1 text-teal-600" />
                <div>
                  <p className="text-xs font-semibold text-gray-700">Đơn thuốc</p>
                  <p className="text-sm text-gray-800">{e.prescription}</p>
                </div>
              </div>
            )}

            {e.recommendations.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <AlertCircle className="size-3.5" /> KHUYẾN NGHỊ
                </p>
                <ul className="space-y-0.5">
                  {e.recommendations.map((r, i) => (
                    <li key={i} className="text-sm text-gray-700">✓ {r}</li>
                  ))}
                </ul>
              </div>
            )}

            {e.follow_up_plan && (
              <div className="border-t pt-2 text-sm">
                <span className="text-gray-500">Kế hoạch theo dõi:</span> <em className="text-gray-700">{e.follow_up_plan}</em>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function Section({ label, value, mono }: { label: string; value: string | null | undefined; mono?: boolean }) {
  if (!value) return null
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`text-sm text-gray-800 ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  )
}
