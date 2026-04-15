'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, ArrowRight, Check, X, Loader2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'

/**
 * Consultation wizard 4 bước (port từ AIVIHE_WIDGET_V7):
 *   Step 1: Chọn chuyên khoa
 *   Step 2: Chọn bác sĩ (BS gia đình mặc định + BS chuyên khoa)
 *   Step 3: Nhập câu hỏi + evidence tags
 *   Step 4: Review + submit
 */

const SPECIALTIES = [
  'Nội tổng quát', 'Tim mạch', 'Nội tiết (Đái tháo đường)', 'Cơ xương khớp',
  'Thần kinh', 'Hô hấp', 'Tiêu hóa', 'Da liễu', 'Tâm thần', 'Khác',
]

const DOCTORS = [
  { id: 'doc-1', name: 'BS. Nguyễn Hải', specialty: 'Nội tổng quát', rating: 4.8, is_family_doctor: true },
  { id: 'doc-2', name: 'BS. Trần Văn Nam', specialty: 'Tim mạch', rating: 4.9, is_family_doctor: false },
  { id: 'doc-3', name: 'BS. Phạm Văn Đức', specialty: 'Cơ xương khớp', rating: 4.7, is_family_doctor: false },
  { id: 'doc-4', name: 'BS. Lê Thị Hoa', specialty: 'Nội tiết (Đái tháo đường)', rating: 4.6, is_family_doctor: false },
  { id: 'doc-5', name: 'BS. Hoàng Minh Tú', specialty: 'Thần kinh', rating: 4.8, is_family_doctor: false },
]

const URGENCIES = [
  { value: 'low', label: 'Không gấp', color: 'bg-gray-100 text-gray-700' },
  { value: 'normal', label: 'Bình thường', color: 'bg-blue-100 text-blue-700' },
  { value: 'urgent', label: 'Khẩn cấp', color: 'bg-red-100 text-red-700' },
] as const

export default function NewConsultationWizardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [specialty, setSpecialty] = useState<string>('')
  const [doctorId, setDoctorId] = useState<string>('')
  const [urgency, setUrgency] = useState<'low' | 'normal' | 'urgent'>('normal')
  const [question, setQuestion] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])

  const doctor = DOCTORS.find(d => d.id === doctorId)
  const relevantDoctors = specialty
    ? DOCTORS.filter(d => d.specialty === specialty || d.is_family_doctor)
    : DOCTORS

  function addTag() {
    const v = tagInput.trim()
    if (v && !tags.includes(v)) setTags([...tags, v])
    setTagInput('')
  }

  function canProceed(): boolean {
    if (step === 1) return !!specialty
    if (step === 2) return !!doctorId
    if (step === 3) return question.trim().length >= 10
    return true
  }

  async function submit() {
    setSubmitting(true)
    try {
      const res = await fetch('/api/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specialty,
          target_doctor_id: doctorId,
          target_doctor_name: doctor?.name,
          question,
          tags,
          urgency,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Không gửi được')
        return
      }
      toast.success('Đã gửi câu hỏi đến BS!')
      router.push('/dashboard/consultation')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <Link href="/dashboard/consultation" className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1">
        <ArrowLeft className="size-4" /> Về danh sách
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Gửi câu hỏi tới Bác sĩ</h1>
        <p className="text-muted-foreground">4 bước đơn giản</p>
      </div>

      {/* Progress stepper */}
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4].map(n => (
          <div key={n} className="flex-1 flex items-center gap-2">
            <div className={`size-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
              step > n ? 'bg-green-500 text-white'
              : step === n ? 'bg-teal-600 text-white'
              : 'bg-gray-200 text-gray-500'
            }`}>
              {step > n ? <Check className="size-4" /> : n}
            </div>
            {n < 4 && <div className={`flex-1 h-0.5 ${step > n ? 'bg-green-500' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="pt-5 pb-5 min-h-[280px]">
          {step === 1 && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold">Bước 1: Chọn chuyên khoa</h2>
              <p className="text-sm text-gray-500">Chọn lĩnh vực bạn cần tư vấn</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SPECIALTIES.map(s => (
                  <button
                    key={s}
                    onClick={() => setSpecialty(s)}
                    className={`px-3 py-2 rounded-lg border text-sm text-left transition ${
                      specialty === s
                        ? 'border-teal-500 bg-teal-50 text-teal-700 font-semibold'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-teal-300'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold">Bước 2: Chọn bác sĩ</h2>
              <p className="text-sm text-gray-500">Chuyên khoa: <strong>{specialty}</strong></p>
              <div className="space-y-2">
                {relevantDoctors.map(d => (
                  <button
                    key={d.id}
                    onClick={() => setDoctorId(d.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition ${
                      doctorId === d.id
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 bg-white hover:border-teal-300'
                    }`}
                  >
                    <div className="size-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                      {d.name.charAt(d.name.length - 1).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{d.name}</p>
                      <p className="text-xs text-gray-500">
                        {d.specialty} · ⭐ {d.rating}
                        {d.is_family_doctor && ' · BS gia đình'}
                      </p>
                    </div>
                    {doctorId === d.id && <Check className="size-5 text-teal-600" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold">Bước 3: Nhập câu hỏi</h2>

              <div className="space-y-1.5">
                <Label>Câu hỏi của bạn <span className="text-destructive">*</span></Label>
                <Textarea
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  placeholder="VD: HbA1c của tôi mới đo là 6.8%, tôi đang dùng Metformin 1000mg/ngày. Có cần tăng liều không?"
                  rows={5}
                  className="text-base"
                />
                <p className="text-xs text-gray-500">Tối thiểu 10 ký tự — càng chi tiết càng tốt</p>
              </div>

              <div className="space-y-1.5">
                <Label>Evidence / Từ khóa liên quan (tùy chọn)</Label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    placeholder="VD: HbA1c, Metformin, ĐTĐ type 2"
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                  />
                  <Button variant="outline" onClick={addTag}>Thêm</Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {tags.map((t, i) => (
                      <span key={i} className="flex items-center gap-1 text-xs bg-slate-100 text-slate-800 rounded-full px-2 py-1">
                        {t}
                        <button onClick={() => setTags(tags.filter((_, j) => j !== i))}><X className="size-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Mức độ khẩn cấp</Label>
                <div className="flex gap-2">
                  {URGENCIES.map(u => (
                    <button
                      key={u.value}
                      onClick={() => setUrgency(u.value)}
                      className={`flex-1 px-3 py-2 rounded-lg border text-sm transition ${
                        urgency === u.value ? `${u.color} border-current font-semibold` : 'bg-white border-gray-200 text-gray-700'
                      }`}
                    >
                      {u.label}
                    </button>
                  ))}
                </div>
                {urgency === 'urgent' && (
                  <div className="flex items-start gap-2 text-xs text-red-900 bg-red-50 rounded-md p-2 border border-red-200">
                    <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                    <span>Nếu đang gặp tình huống đe dọa tính mạng, hãy gọi <strong>115</strong> hoặc đến bệnh viện gần nhất.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold">Bước 4: Xem lại & gửi</h2>
              <div className="space-y-2">
                <ReviewRow label="Chuyên khoa" value={specialty} />
                <ReviewRow label="Bác sĩ" value={`${doctor?.name} (${doctor?.specialty})`} />
                <ReviewRow label="Khẩn cấp" value={URGENCIES.find(u => u.value === urgency)?.label || ''} />
                <div className="bg-slate-50 rounded-md p-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Câu hỏi</p>
                  <p className="text-gray-900 whitespace-pre-wrap mt-1">{question}</p>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {tags.map((t, i) => (
                        <span key={i} className="text-xs bg-white border rounded px-1.5 py-0.5">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-500 italic">
                * Bác sĩ sẽ trả lời trong vòng 24 giờ. Nếu muộn, bạn sẽ nhận được thông báo.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Nav buttons */}
      <div className="flex justify-between gap-2">
        <Button variant="outline" disabled={step === 1} onClick={() => setStep(step - 1)}>
          <ArrowLeft className="size-4 mr-1" /> Quay lại
        </Button>
        {step < 4 ? (
          <Button disabled={!canProceed()} onClick={() => setStep(step + 1)} className="bg-teal-600 hover:bg-teal-700">
            Tiếp tục <ArrowRight className="size-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={submit} disabled={submitting} className="bg-green-600 hover:bg-green-700">
            {submitting ? <><Loader2 className="size-4 animate-spin mr-1" /> Đang gửi...</> : <>Gửi câu hỏi <Check className="size-4 ml-1" /></>}
          </Button>
        )}
      </div>
    </div>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 py-1 border-b border-gray-100">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right">{value}</span>
    </div>
  )
}
