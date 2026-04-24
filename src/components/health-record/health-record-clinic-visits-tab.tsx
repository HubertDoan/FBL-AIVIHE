'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Hospital, Calendar, User, Pill, FileText, ArrowRight, ExternalLink, Loader2 } from 'lucide-react'
import type { ClinicVisit } from '@/lib/demo/demo-health-record-data'

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
            <strong>Khám chữa bệnh chuyên khoa</strong> — các lần khám tại bệnh viện hoặc phòng khám chuyên khoa.
          </span>
        </p>
      </div>

      {items.map(v => (
        <ClinicVisitCard key={v.id} visit={v} />
      ))}
    </div>
  )
}

// Parse "NAME::VALUE::UNIT::REF" hoặc legacy "NAME: VALUE UNIT (REF) ⚠️"
// Auto-detect abnormal từ value vs reference range (hỗ trợ cả dữ liệu không có ⚠️)
function parseTestRow(raw: string) {
  const clean = raw.replace(/ ?⚠️/g, '').trim()
  let abnormal = raw.includes('⚠️')

  function detectAbnormal(value: string, ref: string): boolean {
    if (!value || !ref) return false
    const v = parseFloat(value.replace(',', '.'))
    if (isNaN(v)) return false
    const m = ref.match(/([\d.,]+)\s*[-–]\s*([\d.,]+)/)
    if (!m) return false
    const lo = parseFloat(m[1].replace(',', '.')), hi = parseFloat(m[2].replace(',', '.'))
    return v < lo || v > hi
  }

  const p = clean.split('::').map(s => s.trim())
  if (p.length >= 2) {
    const ref = p[3] || ''
    if (!abnormal) abnormal = detectAbnormal(p[1], ref)
    return { name: p[0], value: p[1], unit: p[2] || '', ref, abnormal }
  }
  const m = clean.match(/^(.+?):\s*([\d.,]+)\s*([^\s(]+)?\s*(?:\(([^)]+)\))?$/)
  if (m) {
    const ref = m[4] || ''
    if (!abnormal) abnormal = detectAbnormal(m[2], ref)
    return { name: m[1].trim(), value: m[2], unit: m[3] || '', ref, abnormal }
  }
  return { name: clean, value: '', unit: '', ref: '', abnormal }
}

function ClinicVisitCard({ visit }: { visit: ClinicVisit }) {
  const [docUrl, setDocUrl] = useState<string | null>(null)
  const [loadingDoc, setLoadingDoc] = useState(false)
  const parsedTests = visit.tests_done.map(parseTestRow)
  const hasTable = parsedTests.some(t => t.value)

  async function openDocument(docId: string) {
    setLoadingDoc(true)
    try {
      const res = await fetch(`/api/documents/${docId}/view-url`)
      const data = await res.json()
      if (data.url) {
        setDocUrl(data.url)
        window.open(data.url, '_blank')
      }
    } finally {
      setLoadingDoc(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-5 pb-5 space-y-3">
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div>
            <h3 className="font-bold text-lg">{visit.facility}</h3>
            {visit.specialty && <p className="text-sm text-amber-700 font-medium">{visit.specialty}</p>}
            <p className="text-xs text-gray-500 flex items-center gap-3 mt-0.5">
              <span className="flex items-center gap-1">
                <Calendar className="size-3" />
                {new Date(visit.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </span>
              {visit.doctor_name && (
                <span className="flex items-center gap-1">
                  <User className="size-3" /> {visit.doctor_name}
                </span>
              )}
            </p>
          </div>
        </div>

        {visit.reason && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Lý do khám</p>
            <p className="text-sm text-gray-800">{visit.reason}</p>
          </div>
        )}

        {visit.diagnosis && (
          <div className="bg-amber-50 rounded-md p-3 border border-amber-200">
            <p className="text-xs font-semibold text-amber-900 mb-1">CHẨN ĐOÁN</p>
            <p className="text-sm text-amber-800 font-medium">{visit.diagnosis}</p>
          </div>
        )}

        {/* Bảng xét nghiệm */}
        {parsedTests.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Xét nghiệm & chẩn đoán hình ảnh</p>
            {hasTable ? (
              <div className="overflow-x-auto rounded border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600 text-xs">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium">Tên xét nghiệm</th>
                      <th className="text-right px-3 py-2 font-medium">Kết quả</th>
                      <th className="text-left px-3 py-2 font-medium">Đơn vị</th>
                      <th className="text-left px-3 py-2 font-medium">Tham chiếu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedTests.map((t, i) => (
                      <tr key={i} className={`border-t border-gray-100 ${t.abnormal ? 'bg-red-50' : ''}`}>
                        <td className="px-3 py-1.5 text-gray-800">{t.name}</td>
                        <td className={`px-3 py-1.5 text-right font-medium ${t.abnormal ? 'text-red-600' : 'text-gray-900'}`}>
                          {t.value} {t.abnormal && '⚠️'}
                        </td>
                        <td className="px-3 py-1.5 text-gray-500 text-xs">{t.unit}</td>
                        <td className="px-3 py-1.5 text-gray-400 text-xs">{t.ref}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <ul className="space-y-0.5 text-sm text-gray-800">
                {visit.tests_done.map((t, i) => <li key={i}>• {t}</li>)}
              </ul>
            )}
          </div>
        )}

        {visit.medications_prescribed.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-1 flex items-center gap-1">
              <Pill className="size-3.5" /> Đơn thuốc
            </p>
            <ul className="space-y-0.5 text-sm text-gray-800">
              {visit.medications_prescribed.map((m, i) => <li key={i}>• {m}</li>)}
            </ul>
          </div>
        )}

        {/* Link tài liệu gốc */}
        {visit.document_ids.length > 0 && (
          <div className="border-t pt-2 flex flex-wrap gap-2">
            {visit.document_ids.map((docId, i) => (
              <button
                key={docId}
                onClick={() => openDocument(docId)}
                disabled={loadingDoc}
                className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                {loadingDoc ? <Loader2 className="size-3.5 animate-spin" /> : <FileText className="size-3.5" />}
                Xem tài liệu gốc {visit.document_ids.length > 1 ? `#${i + 1}` : ''}
                <ExternalLink className="size-3" />
              </button>
            ))}
          </div>
        )}

        {visit.follow_up && (
          <div className="border-t pt-2 text-sm flex items-center gap-1">
            <ArrowRight className="size-4 text-amber-600" />
            <span className="text-gray-500">Tái khám:</span>
            <em className="text-gray-700">{visit.follow_up}</em>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
