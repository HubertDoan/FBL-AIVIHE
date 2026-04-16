'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  ArrowLeft, Download, Loader2, AlertTriangle,
  TrendingUp, TrendingDown, Minus, Sparkles,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import type { MedicalRecord11Sections } from '@/lib/demo/demo-medical-record-eleven-sections-data'

/**
 * Báo cáo tóm tắt sức khỏe — xuất PDF gửi chuyên gia
 *
 * Gồm 5 phần:
 * 1. Thông tin bệnh nhân
 * 2. AI tóm tắt tổng thể
 * 3. Chỉ số lưu ý (bất thường)
 * 4. Xu hướng sức khỏe theo thời gian
 * 5. Bệnh mạn tính & Thuốc đang dùng
 */

export default function HealthReportPage() {
  const { user, loading: authLoading } = useAuth()
  const [record, setRecord] = useState<MedicalRecord11Sections | null>(null)
  const [loading, setLoading] = useState(true)
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (authLoading || !user) return
    fetch('/api/medical-record')
      .then(r => r.ok ? r.json() : null)
      .then(d => setRecord(d))
      .finally(() => setLoading(false))
  }, [authLoading, user])

  function handleExportPdf() {
    window.print()
  }

  if (authLoading || loading) {
    return <div className="flex items-center justify-center py-20 text-gray-500"><Loader2 className="size-5 animate-spin mr-2" /> Đang tạo báo cáo...</div>
  }
  if (!record) return <div className="text-center py-12 text-destructive">Không tải được hồ sơ</div>

  const admin = record.administrative
  const latest = record.vital_signs[0]
  const prev = record.vital_signs[1]
  const abnormalLabs = record.lab_results.filter(l => l.flag === 'H' || l.flag === 'L')
  const abnormalImaging = record.imaging.filter(i => i.status !== 'normal')
  const totalAbnormal = abnormalLabs.length + abnormalImaging.length
  const today = new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Screen-only controls */}
      <div className="flex items-center justify-between flex-wrap gap-2 print:hidden">
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1">
          <ArrowLeft className="size-4" /> Về tổng quan
        </Link>
        <Button onClick={handleExportPdf} className="bg-red-600 hover:bg-red-700 gap-2">
          <Download className="size-4" /> Xuất PDF
        </Button>
      </div>

      {/* Printable report */}
      <div ref={printRef} className="print:p-0">

        {/* ===== HEADER ===== */}
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl p-5 print:rounded-none print:bg-teal-700">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-xl font-bold">BÁO CÁO TÓM TẮT SỨC KHỎE</h1>
              <p className="text-teal-100 text-sm">AIVIHE — Trợ lý AI sức khỏe cá nhân · Thong Dong Life</p>
            </div>
            <div className="text-right text-sm text-teal-100">
              <p>Ngày lập: {today}</p>
              <p>Nguồn: aivihe.vn</p>
            </div>
          </div>
        </div>

        {/* ===== 1. THÔNG TIN BỆNH NHÂN ===== */}
        <Card className="mt-4">
          <CardContent className="pt-4 pb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">1. Thông tin bệnh nhân</h2>
            {admin ? (
              <div className="grid sm:grid-cols-3 gap-3 text-sm">
                <InfoRow label="Họ tên" value={admin.full_name} bold />
                <InfoRow label="Ngày sinh" value={new Date(admin.date_of_birth).toLocaleDateString('vi-VN')} />
                <InfoRow label="Giới tính" value={admin.gender === 'male' ? 'Nam' : admin.gender === 'female' ? 'Nữ' : 'Khác'} />
                <InfoRow label="SĐT" value={admin.phone} />
                <InfoRow label="CCCD" value={admin.national_id} />
                <InfoRow label="BHYT" value={admin.insurance_number || '—'} />
                <InfoRow label="Dị ứng" value={record.allergies.map(a => a.agent).join(', ') || 'Không'} />
                <InfoRow label="Bệnh mạn tính" value={record.chronic_conditions.map(c => c.condition).join(', ') || 'Không'} />
                <InfoRow label="Thuốc đang dùng" value={record.chronic_conditions.flatMap(c => c.medications).join(', ') || 'Không'} />
              </div>
            ) : (
              <p className="text-gray-400 italic">Chưa có thông tin hành chính</p>
            )}
          </CardContent>
        </Card>

        {/* ===== 2. AI TÓM TẮT ===== */}
        <Card className="mt-3">
          <CardContent className="pt-4 pb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
              <Sparkles className="size-4 text-teal-600" /> 2. AI tóm tắt tổng thể
            </h2>
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 text-sm text-teal-900 leading-relaxed">
              {generateNarrative(record, totalAbnormal)}
            </div>
          </CardContent>
        </Card>

        {/* ===== 3. CHỈ SỐ LƯU Ý ===== */}
        <Card className="mt-3">
          <CardContent className="pt-4 pb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
              <AlertTriangle className="size-4 text-red-600" /> 3. Chỉ số lưu ý ({totalAbnormal} bất thường)
            </h2>

            {totalAbnormal === 0 ? (
              <p className="text-green-600 font-medium text-sm">✅ Tất cả chỉ số trong ngưỡng bình thường.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b text-xs text-gray-500 uppercase">
                      <th className="text-left py-2 px-2">Chỉ số</th>
                      <th className="text-right py-2 px-2">Kết quả</th>
                      <th className="text-left py-2 px-2">Khoảng BT</th>
                      <th className="text-left py-2 px-2">Đánh giá</th>
                      <th className="text-left py-2 px-2">Ngày</th>
                    </tr>
                  </thead>
                  <tbody>
                    {abnormalLabs.map(l => (
                      <tr key={l.id} className="border-b border-gray-100">
                        <td className="py-2 px-2 font-medium">{l.test_name}</td>
                        <td className={`py-2 px-2 text-right font-bold ${l.flag === 'H' ? 'text-red-600' : 'text-blue-600'}`}>
                          {l.value} {l.unit}
                        </td>
                        <td className="py-2 px-2 text-gray-500">{l.reference_range || '—'}</td>
                        <td className="py-2 px-2">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${l.flag === 'H' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                            {l.flag === 'H' ? '↑ Cao' : '↓ Thấp'}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-gray-500 text-xs">{l.date}</td>
                      </tr>
                    ))}
                    {abnormalImaging.map(i => (
                      <tr key={i.id} className="border-b border-gray-100">
                        <td className="py-2 px-2 font-medium">{i.modality.toUpperCase()} {i.body_part}</td>
                        <td className="py-2 px-2 text-right text-amber-600 font-medium">{i.conclusion}</td>
                        <td className="py-2 px-2 text-gray-500">Bình thường</td>
                        <td className="py-2 px-2">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                            ⚠ {i.status === 'severe' ? 'Nặng' : 'Bất thường'}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-gray-500 text-xs">{i.date}</td>
                      </tr>
                    ))}
                    {/* Vital signs abnormal */}
                    {latest && latest.blood_pressure_systolic >= 140 && (
                      <tr className="border-b border-gray-100">
                        <td className="py-2 px-2 font-medium">Huyết áp tâm thu</td>
                        <td className="py-2 px-2 text-right font-bold text-red-600">{latest.blood_pressure_systolic} mmHg</td>
                        <td className="py-2 px-2 text-gray-500">&lt; 140</td>
                        <td className="py-2 px-2"><span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">↑ Cao</span></td>
                        <td className="py-2 px-2 text-gray-500 text-xs">{new Date(latest.measured_at).toLocaleDateString('vi-VN')}</td>
                      </tr>
                    )}
                    {latest && latest.bmi >= 25 && (
                      <tr className="border-b border-gray-100">
                        <td className="py-2 px-2 font-medium">BMI</td>
                        <td className="py-2 px-2 text-right font-bold text-amber-600">{latest.bmi.toFixed(1)}</td>
                        <td className="py-2 px-2 text-gray-500">18.5 – 24.9</td>
                        <td className="py-2 px-2"><span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">↑ Thừa cân</span></td>
                        <td className="py-2 px-2 text-gray-500 text-xs">{new Date(latest.measured_at).toLocaleDateString('vi-VN')}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ===== 4. XU HƯỚNG SỨC KHỎE ===== */}
        <Card className="mt-3">
          <CardContent className="pt-4 pb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">4. Xu hướng sức khỏe</h2>
            {latest && prev ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <TrendCard label="HA tâm thu" current={latest.blood_pressure_systolic} previous={prev.blood_pressure_systolic} unit="mmHg" warnHigh={140} />
                <TrendCard label="HA tâm trương" current={latest.blood_pressure_diastolic} previous={prev.blood_pressure_diastolic} unit="mmHg" warnHigh={90} />
                <TrendCard label="Nhịp tim" current={latest.pulse} previous={prev.pulse} unit="/ph" warnHigh={100} warnLow={60} />
                <TrendCard label="Cân nặng" current={latest.weight_kg} previous={prev.weight_kg} unit="kg" />
                <TrendCard label="BMI" current={Number(latest.bmi.toFixed(1))} previous={Number(prev.bmi.toFixed(1))} unit="" warnHigh={25} />
                <TrendCard label="SpO₂" current={latest.spo2 ?? 0} previous={prev.spo2 ?? 0} unit="%" warnLow={95} invertTrend />
                <TrendCard label="Nhiệt độ" current={latest.temperature} previous={prev.temperature} unit="°C" warnHigh={37.5} />
                <div className="rounded-lg border border-gray-200 p-3 bg-slate-50 flex flex-col justify-center text-center">
                  <p className="text-xs text-gray-500">Khoảng cách đo</p>
                  <p className="text-sm font-bold text-gray-900">{daysBetween(latest.measured_at, prev.measured_at)} ngày</p>
                  <p className="text-[10px] text-gray-400">
                    {new Date(prev.measured_at).toLocaleDateString('vi-VN')} → {new Date(latest.measured_at).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 italic text-sm">Cần ≥ 2 lần đo để hiện xu hướng.</p>
            )}
          </CardContent>
        </Card>

        {/* ===== 5. BỆNH MẠN TÍNH & THUỐC ===== */}
        <Card className="mt-3">
          <CardContent className="pt-4 pb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">5. Bệnh mạn tính & Thuốc đang dùng</h2>
            {record.chronic_conditions.length === 0 ? (
              <p className="text-gray-400 italic text-sm">Chưa ghi nhận bệnh mạn tính.</p>
            ) : (
              <div className="space-y-3">
                {record.chronic_conditions.map(c => (
                  <div key={c.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-gray-900">{c.condition} {c.icd10 && <span className="text-xs text-gray-500">({c.icd10})</span>}</p>
                        <p className="text-xs text-gray-500">Từ {c.since} · {c.monitoring_frequency}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.status === 'controlled' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {c.status === 'controlled' ? 'Ổn định' : c.status === 'active' ? 'Đang hoạt động' : 'Thuyên giảm'}
                      </span>
                    </div>
                    {c.medications.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {c.medications.map((m, i) => (
                          <span key={i} className="text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded px-2 py-0.5">💊 {m}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ===== FOOTER ===== */}
        <div className="mt-4 border-t pt-3 text-xs text-gray-500 space-y-1">
          <p><strong>Lưu ý:</strong> Báo cáo này được tạo tự động bởi AIVIHE dựa trên dữ liệu người dùng cung cấp. AI không chẩn đoán bệnh, không thay thế bác sĩ. Vui lòng tham khảo ý kiến chuyên gia y tế.</p>
          <p>AIVIHE — Trợ lý AI sức khỏe cá nhân · Thong Dong Life · https://aivihe.vn · Ngày: {today}</p>
        </div>
      </div>
    </div>
  )
}

/* ===== SUB-COMPONENTS ===== */

function InfoRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div>
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`text-gray-900 ${bold ? 'font-bold' : 'font-medium'}`}>{value}</p>
    </div>
  )
}

function TrendCard({ label, current, previous, unit, warnHigh, warnLow, invertTrend }: {
  label: string; current: number; previous: number; unit: string
  warnHigh?: number; warnLow?: number; invertTrend?: boolean
}) {
  const diff = current - previous
  const pct = previous !== 0 ? ((diff / previous) * 100).toFixed(1) : '—'
  const isUp = diff > 0
  const isDown = diff < 0
  const isStable = diff === 0

  // Determine if trend is bad
  let isBad = false
  if (warnHigh && current >= warnHigh) isBad = true
  if (warnLow && current < warnLow) isBad = true
  if (invertTrend && isDown) isBad = true

  const TrendIcon = isUp ? TrendingUp : isDown ? TrendingDown : Minus
  const trendColor = isStable ? 'text-gray-500' : (isBad ? 'text-red-600' : 'text-green-600')

  return (
    <div className={`rounded-lg border p-3 ${isBad ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'}`}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-xl font-extrabold ${isBad ? 'text-red-600' : 'text-gray-900'}`}>
        {current} <span className="text-xs font-normal text-gray-400">{unit}</span>
      </p>
      <div className={`flex items-center gap-1 text-xs ${trendColor} mt-1`}>
        <TrendIcon className="size-3.5" />
        <span>{isUp ? '+' : ''}{diff !== 0 ? diff.toFixed(1) : '0'} ({pct}%)</span>
      </div>
    </div>
  )
}

function daysBetween(d1: string, d2: string): number {
  const ms = Math.abs(new Date(d1).getTime() - new Date(d2).getTime())
  return Math.round(ms / (24 * 3600 * 1000))
}

function generateNarrative(record: MedicalRecord11Sections, abnormalCount: number): string {
  const admin = record.administrative
  const parts: string[] = []

  if (admin) {
    const age = new Date().getFullYear() - new Date(admin.date_of_birth).getFullYear()
    parts.push(`Bệnh nhân ${admin.full_name}, ${admin.gender === 'male' ? 'Nam' : 'Nữ'}, ${age} tuổi.`)
  }

  if (record.chronic_conditions.length > 0) {
    parts.push(`Tiền sử bệnh mạn tính: ${record.chronic_conditions.map(c => c.condition).join(', ')}.`)
    const meds = record.chronic_conditions.flatMap(c => c.medications)
    if (meds.length > 0) parts.push(`Đang điều trị: ${meds.join(', ')}.`)
  }

  if (record.allergies.length > 0) {
    parts.push(`Dị ứng: ${record.allergies.map(a => `${a.agent} (${a.severity === 'severe' ? 'nặng' : a.severity})`).join(', ')}.`)
  }

  const latest = record.vital_signs[0]
  if (latest) {
    parts.push(`Chỉ số gần nhất (${new Date(latest.measured_at).toLocaleDateString('vi-VN')}): HA ${latest.blood_pressure_systolic}/${latest.blood_pressure_diastolic} mmHg, nhịp tim ${latest.pulse}/ph, SpO₂ ${latest.spo2 ?? '—'}%, BMI ${latest.bmi.toFixed(1)}.`)
  }

  if (abnormalCount > 0) {
    parts.push(`\n⚠️ Phát hiện ${abnormalCount} chỉ số bất thường cần lưu ý (xem mục 3).`)
    parts.push('Khuyến nghị: tham vấn bác sĩ chuyên khoa để đánh giá và điều chỉnh phác đồ điều trị.')
  } else {
    parts.push('\n✅ Các chỉ số hiện tại trong ngưỡng an toàn. Tiếp tục duy trì lối sống lành mạnh và tái khám định kỳ.')
  }

  return parts.join(' ')
}
