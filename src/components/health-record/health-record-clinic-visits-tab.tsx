'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Hospital, Calendar, User, FlaskConical, Pill, FileText, ArrowRight } from 'lucide-react'
import type { ClinicVisit } from '@/lib/demo/demo-health-record-data'

/**
 * Tab "Khám chữa bệnh" trong hồ sơ AIVIHE
 * Các lần khám tại BV/phòng khám chuyên khoa (ngoài BSGĐ và PHCN tại Thong Dong)
 * BS chuyên khoa được phép xem hồ sơ, tư vấn và hỗ trợ đi khám
 */

export function HealthRecordClinicVisitsTab({ items }: { items: ClinicVisit[] }) {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 pb-6 text-center text-gray-500">
          <Hospital className="size-12 text-gray-300 mx-auto mb-2" />
          <p>Chưa có lần khám chuyên khoa nào.</p>
          <p className="text-sm mt-1">Tải lên kết quả khám tại mục &quot;Tải tài liệu&quot;.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-900">
        <p className="flex items-start gap-2">
          <Hospital className="size-4 shrink-0 mt-0.5" />
          <span>
            <strong>Khám chữa bệnh chuyên khoa</strong> — các lần khám tại bệnh viện hoặc phòng khám chuyên khoa
            (tim mạch, khớp, nội tiết, thần kinh...). BS chuyên khoa xem hồ sơ và tư vấn.
          </span>
        </p>
      </div>

      {items.map(v => (
        <Card key={v.id}>
          <CardContent className="pt-5 pb-5 space-y-3">
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div>
                <h3 className="font-bold text-lg">{v.facility}</h3>
                <p className="text-sm text-amber-700 font-medium">{v.specialty}</p>
                <p className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3" />
                    {new Date(v.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="size-3" /> {v.doctor_name}
                  </span>
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Lý do khám</p>
              <p className="text-sm text-gray-800">{v.reason}</p>
            </div>

            {v.diagnosis && (
              <div className="bg-amber-50 rounded-md p-3 border border-amber-200">
                <p className="text-xs font-semibold text-amber-900 mb-1">CHẨN ĐOÁN</p>
                <p className="text-sm text-amber-800 font-medium">{v.diagnosis}</p>
              </div>
            )}

            {v.tests_done.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1 flex items-center gap-1">
                  <FlaskConical className="size-3.5" /> Xét nghiệm & chẩn đoán hình ảnh
                </p>
                <ul className="space-y-0.5 text-sm text-gray-800">
                  {v.tests_done.map((t, i) => <li key={i}>• {t}</li>)}
                </ul>
              </div>
            )}

            {v.treatments.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Điều trị đã thực hiện</p>
                <ul className="space-y-0.5 text-sm text-gray-800">
                  {v.treatments.map((t, i) => <li key={i}>• {t}</li>)}
                </ul>
              </div>
            )}

            {v.medications_prescribed.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1 flex items-center gap-1">
                  <Pill className="size-3.5" /> Đơn thuốc
                </p>
                <ul className="space-y-0.5 text-sm text-gray-800">
                  {v.medications_prescribed.map((m, i) => <li key={i}>• {m}</li>)}
                </ul>
              </div>
            )}

            {v.document_ids.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-blue-600">
                <FileText className="size-3.5" /> {v.document_ids.length} tài liệu đính kèm
              </div>
            )}

            {v.follow_up && (
              <div className="border-t pt-2 text-sm flex items-center gap-1">
                <ArrowRight className="size-4 text-amber-600" />
                <span className="text-gray-500">Tái khám:</span>
                <em className="text-gray-700">{v.follow_up}</em>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
