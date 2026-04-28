'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { X, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

/**
 * Dialog xác thực kết quả AI classify + extract
 * - Preview file, sửa category
 * - Xác thực Họ tên / Ngày sinh / Thẻ BHYT — cảnh báo nếu không khớp, cho phép sửa
 * - Chỉ định → tách Xét nghiệm & Thăm dò chức năng
 * - Kết luận BS xét nghiệm / chẩn đoán hình ảnh
 * - POST /api/health-record/add
 */

export interface AiClassifyResult {
  category: 'family-doctor' | 'rehab' | 'clinic' | 'daycare'
  category_label: string
  confidence: number
  extracted_patient_name: string
  extracted_date_of_birth: string | null   // Ngày sinh từ tài liệu
  extracted_bhyt: string | null            // Số thẻ BHYT từ tài liệu
  extracted_date: string | null
  extracted_facility: string | null
  extracted_doctor: string | null
  extracted_diagnosis: string | null
  extracted_specialty: string | null
  extracted_reason: string | null
  extracted_indication: string | null      // Chỉ định (doctor's orders)
  extracted_tests: string[]                // Xét nghiệm máu / nước tiểu / sinh hóa
  extracted_functional_tests: string[]     // Thăm dò chức năng: ECG, siêu âm, X-quang...
  extracted_medications: string[]
  extracted_recommendations: string[]
  extracted_conclusion: string | null      // Kết luận / nhận xét của BS ký kết quả
  raw_text_preview: string
}

// Parse "NAME::VALUE::UNIT::REF" — fallback giữ nguyên chuỗi nếu không có separator
function parseTestRow(raw: string) {
  const p = raw.split('::').map(s => s.trim())
  if (p.length >= 2) return { name: p[0], value: p[1], unit: p[2] || '', ref: p[3] || '' }
  const m = raw.match(/^(.+?):\s*([\d.,]+)\s*([^\s(]+)?\s*(?:\(([^)]+)\))?$/)
  if (m) return { name: m[1].trim(), value: m[2], unit: m[3] || '', ref: m[4] || '' }
  return { name: raw, value: '', unit: '', ref: '' }
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 pt-1">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{label}</span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  )
}

function MismatchAlert({ field, docValue, accountValue }: { field: string; docValue: string; accountValue: string }) {
  return (
    <div className="bg-amber-50 border border-amber-300 rounded-md p-2.5 flex items-start gap-2">
      <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
      <p className="text-sm text-amber-800">
        <strong>{field}</strong> không khớp — Tài liệu: <strong>&ldquo;{docValue}&rdquo;</strong> · Tài khoản: <strong>&ldquo;{accountValue}&rdquo;</strong>.
        Kiểm tra và sửa trước khi xác thực.
      </p>
    </div>
  )
}

// Bảng xét nghiệm có thể chỉnh sửa từng ô
function TestsTable({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const rows = value.split('\n').map(s => s.trim()).filter(Boolean)
  const parsed = rows.map(parseTestRow)
  if (rows.length === 0) {
    return <Textarea value={value} onChange={e => onChange(e.target.value)} rows={3} className="text-xs font-mono" placeholder="Mỗi dòng 1 xét nghiệm" />
  }
  function updateCell(idx: number, field: 'name' | 'value' | 'unit' | 'ref', val: string) {
    const updated = parsed.map((r, i) => i === idx ? { ...r, [field]: val } : r)
    onChange(updated.map(r => `${r.name}::${r.value}::${r.unit}::${r.ref}`).join('\n'))
  }
  return (
    <div className="overflow-x-auto rounded border border-gray-200">
      <table className="w-full text-xs">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="text-left px-2 py-1.5 font-medium w-[45%]">Tên xét nghiệm</th>
            <th className="text-right px-2 py-1.5 font-medium w-[15%]">Kết quả</th>
            <th className="text-left px-2 py-1.5 font-medium w-[12%]">Đơn vị</th>
            <th className="text-left px-2 py-1.5 font-medium w-[28%]">Tham chiếu</th>
          </tr>
        </thead>
        <tbody>
          {parsed.map((row, i) => (
            <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
              <td className="px-1 py-1"><input className="w-full text-xs bg-transparent outline-none focus:bg-white focus:ring-1 focus:ring-teal-300 rounded px-1" value={row.name} onChange={e => updateCell(i, 'name', e.target.value)} /></td>
              <td className="px-1 py-1"><input className="w-full text-xs text-right bg-transparent outline-none focus:bg-white focus:ring-1 focus:ring-teal-300 rounded px-1 font-medium" value={row.value} onChange={e => updateCell(i, 'value', e.target.value)} /></td>
              <td className="px-1 py-1"><input className="w-full text-xs bg-transparent outline-none focus:bg-white focus:ring-1 focus:ring-teal-300 rounded px-1 text-gray-500" value={row.unit} onChange={e => updateCell(i, 'unit', e.target.value)} /></td>
              <td className="px-1 py-1"><input className="w-full text-xs bg-transparent outline-none focus:bg-white focus:ring-1 focus:ring-teal-300 rounded px-1 text-gray-400" value={row.ref} onChange={e => updateCell(i, 'ref', e.target.value)} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const CATEGORIES = [
  { value: 'daycare',       label: '🏠 Daycare' },
  { value: 'family-doctor', label: '👨‍⚕️ Bác sĩ gia đình' },
  { value: 'rehab',         label: '🏃 Phục hồi chức năng' },
  { value: 'clinic',        label: '🏥 Khám chữa bệnh chuyên khoa' },
] as const

interface Props {
  filename: string
  preview: string | null
  classifyResult: AiClassifyResult
  customerName: string
  customerDateOfBirth?: string  // YYYY-MM-DD — để kiểm tra khớp với tài liệu
  customerBhyt?: string         // Số thẻ BHYT — để kiểm tra khớp
  documentId?: string
  onClose: () => void
  onSaved: () => void
}

export function DocumentClassificationReviewDialog({
  filename, preview, classifyResult, customerName,
  customerDateOfBirth, customerBhyt, documentId, onClose, onSaved,
}: Props) {
  const [category, setCategory] = useState<AiClassifyResult['category']>(classifyResult.category)

  // §2 — Thông tin bệnh nhân
  const [patientName, setPatientName] = useState(classifyResult.extracted_patient_name)
  const [dateOfBirth, setDateOfBirth] = useState(classifyResult.extracted_date_of_birth || '')
  const [bhyt, setBhyt] = useState(classifyResult.extracted_bhyt || '')

  // §3 — Thông tin khám
  const [date, setDate] = useState(classifyResult.extracted_date || new Date().toISOString().slice(0, 10))
  const [facility, setFacility] = useState(classifyResult.extracted_facility || '')
  const [doctorName, setDoctorName] = useState(classifyResult.extracted_doctor || '')
  const [specialty, setSpecialty] = useState(classifyResult.extracted_specialty || '')

  // §4 — Lý do & Chỉ định
  const [reason, setReason] = useState(classifyResult.extracted_reason || '')
  const [indication, setIndication] = useState(classifyResult.extracted_indication || '')
  const [diagnosis, setDiagnosis] = useState(classifyResult.extracted_diagnosis || '')

  // §5 — Kết quả
  const [tests, setTests] = useState((classifyResult.extracted_tests ?? []).join('\n'))
  const [functionalTests, setFunctionalTests] = useState((classifyResult.extracted_functional_tests ?? []).join('\n'))
  const [conclusion, setConclusion] = useState(classifyResult.extracted_conclusion || '')

  // §6 — Điều trị
  const [meds, setMeds] = useState((classifyResult.extracted_medications ?? []).join('\n'))
  const [recs, setRecs] = useState((classifyResult.extracted_recommendations ?? []).join('\n'))
  const [followUp, setFollowUp] = useState('')

  const [saving, setSaving] = useState(false)

  const nameMismatch = useMemo(() =>
    patientName.trim().toLowerCase() !== customerName.trim().toLowerCase(),
  [patientName, customerName])

  const dobMismatch = useMemo(() =>
    !!(customerDateOfBirth && dateOfBirth && dateOfBirth !== customerDateOfBirth),
  [dateOfBirth, customerDateOfBirth])

  const bhytMismatch = useMemo(() =>
    !!(customerBhyt && bhyt && bhyt.replace(/\s/g, '') !== customerBhyt.replace(/\s/g, '')),
  [bhyt, customerBhyt])

  async function handleSave() {
    if (!patientName.trim()) { toast.error('Vui lòng nhập tên bệnh nhân'); return }
    setSaving(true)
    try {
      const data: Record<string, unknown> = {
        date,
        facility,
        doctor_name: doctorName,
        specialty,
        reason,
        indication: indication.trim() || null,
        diagnosis,
        tests: tests.split('\n').map(s => s.trim()).filter(Boolean),
        functional_tests: functionalTests.split('\n').map(s => s.trim()).filter(Boolean),
        medications: meds.split('\n').map(s => s.trim()).filter(Boolean),
        recommendations: recs.split('\n').map(s => s.trim()).filter(Boolean),
        conclusion: conclusion.trim() || null,
        follow_up: followUp.trim() || null,
        date_of_birth: dateOfBirth || null,
        bhyt: bhyt.trim() || null,
        document_ids: documentId ? [documentId] : [],
      }
      const res = await fetch('/api/health-record/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, data }),
      })
      const resp = await res.json()
      if (!res.ok) { toast.error(resp.error || 'Không thể lưu'); return }
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-start md:items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <Card className="w-full max-w-3xl my-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <CardContent className="pt-5 pb-5 space-y-4">

          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-xl font-bold">Xác thực tài liệu</h3>
              <p className="text-sm text-gray-500 truncate">{filename}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}><X className="size-5" /></Button>
          </div>

          {/* AI banner */}
          <div className="bg-purple-50 border border-purple-200 rounded-md p-3 text-sm">
            <p className="font-medium text-purple-900">🤖 AI đã phân tích · Độ tin cậy: {(classifyResult.confidence * 100).toFixed(0)}%</p>
            <p className="text-purple-700 text-xs mt-0.5">{classifyResult.raw_text_preview}</p>
          </div>

          {preview && (
            <div className="flex justify-center">
              <img src={preview} alt="preview" className="max-h-64 rounded border" />
            </div>
          )}

          {/* §1 PHÂN LOẠI */}
          <SectionHeader label="Phân loại tài liệu" />
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map(c => (
              <button key={c.value} type="button" onClick={() => setCategory(c.value)}
                className={`px-3 py-2 rounded-lg border text-sm text-left transition ${
                  category === c.value
                    ? 'border-teal-500 bg-teal-50 text-teal-700 font-medium'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-teal-300'
                }`}>
                {c.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 -mt-2">AI gợi ý: {classifyResult.category_label}</p>

          {/* §2 THÔNG TIN BỆNH NHÂN */}
          <SectionHeader label="Thông tin bệnh nhân" />
          {nameMismatch && <MismatchAlert field="Họ tên" docValue={patientName} accountValue={customerName} />}
          {dobMismatch && <MismatchAlert field="Ngày sinh" docValue={dateOfBirth} accountValue={customerDateOfBirth!} />}
          {bhytMismatch && <MismatchAlert field="Thẻ BHYT" docValue={bhyt} accountValue={customerBhyt!} />}
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Họ tên <span className="text-destructive">*</span></Label>
              <Input value={patientName} onChange={e => setPatientName(e.target.value)}
                className={nameMismatch ? 'border-amber-500' : ''} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Ngày sinh</Label>
              <Input type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)}
                className={dobMismatch ? 'border-amber-500' : ''} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Số thẻ BHYT</Label>
              <Input value={bhyt} onChange={e => setBhyt(e.target.value)}
                placeholder="VD: DN4310123456789"
                className={bhytMismatch ? 'border-amber-500' : ''} />
            </div>
          </div>

          {/* §3 THÔNG TIN KHÁM */}
          <SectionHeader label="Thông tin khám" />
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm">Ngày khám</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Cơ sở / Nơi khám</Label>
              <Input value={facility} onChange={e => setFacility(e.target.value)} placeholder="VD: BV Bạch Mai" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Bác sĩ / KTV</Label>
              <Input value={doctorName} onChange={e => setDoctorName(e.target.value)} />
            </div>
            {category === 'clinic' && (
              <div className="space-y-1.5">
                <Label className="text-sm">Chuyên khoa</Label>
                <Input value={specialty} onChange={e => setSpecialty(e.target.value)} placeholder="Tim mạch / Khớp..." />
              </div>
            )}
          </div>

          {/* §4 LÝ DO & CHỈ ĐỊNH */}
          <SectionHeader label="Lý do & Chỉ định" />
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm">Lý do khám / Triệu chứng</Label>
              <Textarea value={reason} onChange={e => setReason(e.target.value)} rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Chỉ định</Label>
              <Textarea value={indication} onChange={e => setIndication(e.target.value)} rows={2}
                placeholder="Các xét nghiệm / thăm dò được bác sĩ chỉ định" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Chẩn đoán</Label>
            <Textarea value={diagnosis} onChange={e => setDiagnosis(e.target.value)} rows={2} />
          </div>

          {/* §5 KẾT QUẢ */}
          <SectionHeader label="Kết quả" />
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">🧪 Xét nghiệm (máu, nước tiểu, sinh hóa...)</Label>
            <TestsTable value={tests} onChange={setTests} />
          </div>
          {(functionalTests || category === 'clinic') && (
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">📊 Thăm dò chức năng (ECG, siêu âm, X-quang, MRI...)</Label>
              <Textarea value={functionalTests} onChange={e => setFunctionalTests(e.target.value)} rows={3}
                className="text-xs" placeholder="Mỗi dòng 1 kết quả thăm dò chức năng hoặc chẩn đoán hình ảnh" />
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-teal-700">🔬 Kết luận BS xét nghiệm / Chẩn đoán hình ảnh</Label>
            <Textarea value={conclusion} onChange={e => setConclusion(e.target.value)} rows={3}
              placeholder="VD: HÌNH ẢNH NHÂN VÚ TRÁI (BIRADS 4A). NANG VÚ HAI BÊN."
              className="text-sm" />
          </div>

          {/* §6 ĐIỀU TRỊ & THEO DÕI */}
          <SectionHeader label="Điều trị & Theo dõi" />
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm">Đơn thuốc (mỗi dòng 1 mục)</Label>
              <Textarea value={meds} onChange={e => setMeds(e.target.value)} rows={3} className="text-xs" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Khuyến nghị</Label>
              <Textarea value={recs} onChange={e => setRecs(e.target.value)} rows={3} className="text-xs" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Tái khám / Ghi chú theo dõi</Label>
            <Input value={followUp} onChange={e => setFollowUp(e.target.value)} placeholder="VD: Tái khám sau 1 tháng" />
          </div>

          {/* Actions */}
          <div className="border-t pt-3 flex gap-2 flex-wrap">
            <Button className="flex-1 min-h-[48px] bg-teal-600 hover:bg-teal-700"
              onClick={handleSave} disabled={saving || !patientName.trim()}>
              {saving
                ? <><Loader2 className="size-4 animate-spin mr-2" /> Đang lưu...</>
                : <><CheckCircle className="size-4 mr-2" /> Xác thực & Lưu vào hồ sơ</>
              }
            </Button>
            <Button variant="outline" onClick={onClose} disabled={saving}>Hủy</Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Bằng việc xác thực, bạn đồng ý thông tin được lưu vào mục{' '}
            <strong>{CATEGORIES.find(c => c.value === category)?.label}</strong> trong hồ sơ AIVIHE.
          </p>

        </CardContent>
      </Card>
    </div>
  )
}
