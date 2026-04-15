'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Sparkles, AlertTriangle, CheckCircle, Pill, Loader2, MessageCircleQuestion } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import type { MedicalRecord11Sections } from '@/lib/demo/demo-medical-record-eleven-sections-data'

/**
 * Trang AI Summary — tổng hợp thông minh từ hồ sơ 11 section
 * Port từ SSK-VNeID "AI Summary" page:
 * - Tóm tắt chung bằng AI
 * - Cảnh báo bất thường (vitals cao, lab flagged H/L/W)
 * - Thuốc đang dùng
 * - Nút Hỏi BS gia đình trực tiếp
 */

interface AbnormalFlag {
  category: string
  label: string
  detail: string
  severity: 'high' | 'medium' | 'low'
}

export default function AiSummaryPage() {
  const { user, loading: authLoading } = useAuth()
  const [record, setRecord] = useState<MedicalRecord11Sections | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading || !user) return
    fetch('/api/medical-record')
      .then(r => r.ok ? r.json() : null)
      .then(d => setRecord(d))
      .finally(() => setLoading(false))
  }, [authLoading, user])

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        <Loader2 className="size-5 animate-spin mr-2" /> Đang phân tích với AI...
      </div>
    )
  }

  if (!record) return <div className="text-center py-12 text-destructive">Không tải được hồ sơ</div>

  const flags = computeAbnormalFlags(record)
  const activeMeds = record.chronic_conditions.flatMap(c => c.medications)
  const latestVitals = record.vital_signs[0]

  const narrative = generateAiNarrative(record, flags, activeMeds.length)

  return (
    <div className="space-y-5 max-w-3xl">
      <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1">
        <ArrowLeft className="size-4" /> Về tổng quan
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="size-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center">
          <Sparkles className="size-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-emerald-700">AI Phân tích</h1>
          <p className="text-sm text-muted-foreground">Tổng hợp tự động từ hồ sơ 11 mục của bạn</p>
        </div>
      </div>

      {/* AI narrative */}
      <Card className="border-emerald-200">
        <CardContent className="pt-5 pb-5 space-y-2">
          <div className="flex items-center gap-2 text-emerald-700">
            <Sparkles className="size-4" />
            <p className="text-xs font-bold uppercase tracking-wider">Tóm tắt AI</p>
          </div>
          <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{narrative}</p>
          <div className="bg-amber-50 border border-amber-200 rounded-md p-2 text-xs text-amber-900 mt-3">
            ⚠️ AIVIHE không chẩn đoán bệnh, không thay thế bác sĩ. Kết quả phân tích dựa trên dữ liệu bạn cung cấp.
          </div>
        </CardContent>
      </Card>

      {/* Abnormal flags */}
      {flags.length > 0 && (
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="size-5 text-red-600" />
              <p className="font-bold text-gray-900">Cảnh báo cần chú ý ({flags.length})</p>
            </div>
            <ul className="space-y-2">
              {flags.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm p-2 bg-red-50/50 rounded">
                  <span className={`size-2 rounded-full mt-2 shrink-0 ${f.severity === 'high' ? 'bg-red-600' : f.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                  <div>
                    <p className="font-semibold text-gray-900">{f.label}</p>
                    <p className="text-gray-600 text-xs">{f.detail}</p>
                    <p className="text-xs text-gray-400">{f.category}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Active meds count */}
      <Card className="border-l-4 border-l-emerald-500">
        <CardContent className="pt-4 pb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Pill className="size-5 text-emerald-600" />
            <div>
              <p className="font-bold text-gray-900">Thuốc đang dùng</p>
              <p className="text-xs text-gray-500">{activeMeds.length} loại · Từ {record.chronic_conditions.length} bệnh mạn tính</p>
            </div>
          </div>
          <span className="text-3xl font-bold text-emerald-700">{activeMeds.length}</span>
        </CardContent>
      </Card>

      {/* Latest vitals summary */}
      {latestVitals && (
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-sm font-bold text-gray-900 mb-2">Chỉ số gần nhất ({new Date(latestVitals.measured_at).toLocaleDateString('vi-VN')})</p>
            <div className="grid grid-cols-4 gap-2 text-sm">
              <MetricBox label="HA" value={`${latestVitals.blood_pressure_systolic}/${latestVitals.blood_pressure_diastolic}`} unit="mmHg" />
              <MetricBox label="Nhịp tim" value={String(latestVitals.pulse)} unit="bpm" />
              <MetricBox label="SpO2" value={`${latestVitals.spo2 ?? '—'}`} unit="%" />
              <MetricBox label="BMI" value={latestVitals.bmi.toFixed(1)} unit="" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action button */}
      <div className="flex gap-2 flex-wrap">
        <Link href="/dashboard/consultation/new">
          <Button className="bg-teal-600 hover:bg-teal-700 gap-1">
            <MessageCircleQuestion className="size-4" /> Hỏi BS gia đình
          </Button>
        </Link>
        <Link href="/dashboard/medical-record">
          <Button variant="outline">
            <CheckCircle className="size-4 mr-1" /> Xem hồ sơ đầy đủ
          </Button>
        </Link>
      </div>
    </div>
  )
}

function MetricBox({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="bg-slate-50 rounded-md p-2 text-center">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-bold">{value}</p>
      <p className="text-xs text-gray-400">{unit}</p>
    </div>
  )
}

function computeAbnormalFlags(record: MedicalRecord11Sections): AbnormalFlag[] {
  const flags: AbnormalFlag[] = []

  // Vitals abnormal
  const v = record.vital_signs[0]
  if (v) {
    if (v.blood_pressure_systolic >= 140 || v.blood_pressure_diastolic >= 90) {
      flags.push({ category: 'Sinh hiệu', label: 'Huyết áp cao', detail: `${v.blood_pressure_systolic}/${v.blood_pressure_diastolic} mmHg (bình thường < 140/90)`, severity: 'high' })
    }
    if (v.bmi >= 25) {
      flags.push({ category: 'Sinh hiệu', label: 'Thừa cân', detail: `BMI ${v.bmi.toFixed(1)} (bình thường 18.5-24.9)`, severity: 'medium' })
    }
    if (v.spo2 !== null && v.spo2 < 95) {
      flags.push({ category: 'Sinh hiệu', label: 'SpO2 thấp', detail: `${v.spo2}% (bình thường ≥ 95%)`, severity: 'high' })
    }
  }

  // Lab flagged
  record.lab_results.forEach(lab => {
    if (lab.flag === 'H') {
      flags.push({ category: 'Xét nghiệm', label: `${lab.test_name} cao`, detail: `${lab.value} ${lab.unit || ''} (khoảng tham chiếu ${lab.reference_range})`, severity: 'medium' })
    } else if (lab.flag === 'L') {
      flags.push({ category: 'Xét nghiệm', label: `${lab.test_name} thấp`, detail: `${lab.value} ${lab.unit || ''} (khoảng tham chiếu ${lab.reference_range})`, severity: 'medium' })
    }
  })

  // Imaging abnormal
  record.imaging.forEach(img => {
    if (img.status === 'abnormal' || img.status === 'severe') {
      flags.push({ category: 'Chẩn đoán hình ảnh', label: `${img.modality.toUpperCase()} ${img.body_part}: ${img.status === 'severe' ? 'Nặng' : 'Bất thường'}`, detail: img.conclusion, severity: img.status === 'severe' ? 'high' : 'medium' })
    }
  })

  return flags
}

function generateAiNarrative(record: MedicalRecord11Sections, flags: AbnormalFlag[], medsCount: number): string {
  const admin = record.administrative
  const parts: string[] = []

  if (admin) {
    parts.push(`${admin.full_name} (${admin.gender === 'male' ? 'Nam' : 'Nữ'}, sinh ${admin.date_of_birth}).`)
  }

  if (record.chronic_conditions.length > 0) {
    const conditions = record.chronic_conditions.map(c => c.condition).join(', ')
    parts.push(`Tiền sử: ${conditions}.`)
  }

  if (medsCount > 0) {
    parts.push(`Đang dùng ${medsCount} loại thuốc điều trị.`)
  }

  if (record.allergies.length > 0) {
    parts.push(`Cảnh báo dị ứng: ${record.allergies.map(a => a.agent).join(', ')}.`)
  }

  if (flags.length > 0) {
    parts.push(`\n🚨 Có ${flags.length} chỉ số bất thường cần chú ý, đã liệt kê bên dưới.`)
    parts.push('Khuyến nghị: tham vấn BS gia đình để đánh giá toàn diện và điều chỉnh điều trị nếu cần.')
  } else {
    parts.push('\n✅ Các chỉ số hiện tại trong ngưỡng an toàn. Tiếp tục duy trì lối sống lành mạnh và tái khám định kỳ.')
  }

  return parts.join(' ')
}
