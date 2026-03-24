'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, FileDown, Save, ArrowLeft, ArrowRight, X, MessageCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { SpecialtySelector } from '@/components/visit-prep/specialty-selector'
import { HealthSummaryView } from '@/components/summary/health-summary-view'
import { useAuth } from '@/hooks/use-auth'
import { getSpecialtyName } from '@/lib/constants/medical-specialties'
import { toast } from 'sonner'

const STEPS = [
  'Chọn chuyên khoa',
  'Mô tả triệu chứng',
  'Câu hỏi cho bác sĩ',
  'Hỏi ý kiến BS gia đình',
  'Kết quả AI',
]

export default function NewVisitPrepPage() {
  const router = useRouter()
  const { user } = useAuth()
  const citizenId = user?.citizenId ?? null

  const [step, setStep] = useState(0)
  // Multi-select specialties
  const [specialties, setSpecialties] = useState<string[]>([])
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [symptomInput, setSymptomInput] = useState('')
  const [symptomDesc, setSymptomDesc] = useState('')
  const [questions, setQuestions] = useState('')
  // Ask family doctor
  const [askDoctor, setAskDoctor] = useState(false)
  const [doctorMessage, setDoctorMessage] = useState('')
  const [doctorSent, setDoctorSent] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{
    prepId: string; aiSummary: string; citations: never[]
  } | null>(null)

  function addSymptom() {
    const trimmed = symptomInput.trim()
    if (trimmed && !symptoms.includes(trimmed) && symptoms.length < 10) {
      setSymptoms([...symptoms, trimmed])
      setSymptomInput('')
    }
  }

  function removeSymptom(s: string) {
    setSymptoms(symptoms.filter((x) => x !== s))
  }

  // Send question to family doctor via notification
  async function sendToDoctorAsync() {
    if (!citizenId || !doctorMessage.trim()) return
    try {
      const specialtyNames = specialties.map(getSpecialtyName).filter(Boolean).join(', ')
      const symptomList = symptoms.join(', ')
      const content = [
        `Chuyên khoa: ${specialtyNames}`,
        `Triệu chứng: ${symptomList}`,
        symptomDesc ? `Mô tả: ${symptomDesc}` : '',
        `Câu hỏi: ${doctorMessage}`,
      ].filter(Boolean).join('\n')

      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole: 'doctor',
          title: `${user?.fullName ?? 'Thành viên'} hỏi ý kiến trước khi khám`,
          content,
        }),
      })
      setDoctorSent(true)
      toast.success('Đã gửi câu hỏi đến bác sĩ gia đình.')
    } catch {
      toast.error('Không gửi được. Vui lòng thử lại.')
    }
  }

  async function generate() {
    if (!citizenId || specialties.length === 0 || symptoms.length === 0) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/ai/visit-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          citizenId,
          // API nhận specialty (string) — gộp nhiều chuyên khoa thành chuỗi
          specialty: specialties.join(','),
          symptoms,
          symptomDescription: symptomDesc || null,
          questionsForDoctor: questions ? questions.split('\n').filter(Boolean) : [],
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Tạo thất bại.'); return }
      setResult(data)
      setStep(4)
    } catch {
      setError('Lỗi kết nối. Vui lòng thử lại.')
    } finally { setLoading(false) }
  }

  const canNext =
    step === 0 ? specialties.length > 0 :
    step === 1 ? symptoms.length > 0 :
    true

  const specialtyLabel = specialties.map(getSpecialtyName).filter(Boolean).join(', ')

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Tạo gói hồ sơ mới</h1>
        <p className="text-muted-foreground mt-1">{STEPS[step]} ({step + 1}/{STEPS.length})</p>
      </div>
      <div className="flex gap-1">
        {STEPS.map((_, i) => (
          <div key={i} className={`h-2 flex-1 rounded-full ${i <= step ? 'bg-primary' : 'bg-muted'}`} />
        ))}
      </div>
      {error && <div className="rounded-lg bg-destructive/10 p-4 text-destructive text-base">{error}</div>}

      {/* Step 0: Multi-select specialties */}
      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Chọn chuyên khoa muốn khám</CardTitle>
            <p className="text-sm text-muted-foreground">Có thể chọn nhiều chuyên khoa cùng lúc</p>
          </CardHeader>
          <CardContent>
            <SpecialtySelector value={specialties} onChange={(v) => setSpecialties(v as string[])} multiple />
          </CardContent>
        </Card>
      )}

      {/* Step 1: Symptoms */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Mô tả triệu chứng — {specialtyLabel}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input value={symptomInput} onChange={(e) => setSymptomInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSymptom())}
                placeholder="Nhập triệu chứng rồi nhấn Thêm..." className="text-base min-h-[48px]" />
              <Button onClick={addSymptom} className="min-h-[48px] text-base shrink-0">Thêm</Button>
            </div>
            {symptoms.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {symptoms.map((s) => (
                  <Badge key={s} variant="secondary" className="text-base py-1 px-3 gap-1">
                    {s}
                    <button onClick={() => removeSymptom(s)} className="ml-1">
                      <X className="size-3.5" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <div>
              <label className="block text-base font-medium mb-2">Mô tả chi tiết (tùy chọn)</label>
              <Textarea value={symptomDesc} onChange={(e) => setSymptomDesc(e.target.value)}
                placeholder="Mô tả thêm về triệu chứng, thời gian xuất hiện, mức độ khó chịu..."
                className="text-base min-h-[100px]" maxLength={2000} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Questions for doctor */}
      {step === 2 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Câu hỏi muốn hỏi bác sĩ</CardTitle></CardHeader>
          <CardContent>
            <Textarea value={questions} onChange={(e) => setQuestions(e.target.value)}
              placeholder={"Mỗi câu hỏi một dòng (tùy chọn)\nVí dụ: Tôi có cần xét nghiệm thêm không?"}
              className="text-base min-h-[120px]" maxLength={5000} />
          </CardContent>
        </Card>
      )}

      {/* Step 3: Ask family doctor */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="size-5" />
              Hỏi ý kiến bác sĩ gia đình
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Bạn có thể gửi thông tin triệu chứng để xin ý kiến BS gia đình trước khi đi khám
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary of what will be sent */}
            <div className="rounded-lg bg-muted/50 p-4 space-y-2 text-sm">
              <p><span className="font-medium">Chuyên khoa:</span> {specialtyLabel}</p>
              <p><span className="font-medium">Triệu chứng:</span> {symptoms.join(', ')}</p>
              {symptomDesc && <p><span className="font-medium">Mô tả:</span> {symptomDesc}</p>}
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="ask-doctor"
                checked={askDoctor}
                onChange={(e) => setAskDoctor(e.target.checked)}
                className="size-5 rounded border-gray-300"
              />
              <label htmlFor="ask-doctor" className="text-base font-medium cursor-pointer">
                Tôi muốn hỏi ý kiến bác sĩ gia đình
              </label>
            </div>

            {askDoctor && (
              <div className="space-y-3">
                <Textarea
                  value={doctorMessage}
                  onChange={(e) => setDoctorMessage(e.target.value)}
                  placeholder="Nhập câu hỏi hoặc mô tả thêm cho bác sĩ gia đình..."
                  className="text-base min-h-[100px]"
                  maxLength={2000}
                  disabled={doctorSent}
                />
                {!doctorSent ? (
                  <Button
                    onClick={sendToDoctorAsync}
                    disabled={!doctorMessage.trim()}
                    className="min-h-[48px] text-base gap-2"
                  >
                    <MessageCircle className="size-5" />
                    Gửi đến bác sĩ gia đình
                  </Button>
                ) : (
                  <div className="rounded-lg bg-green-50 border border-green-200 p-3">
                    <p className="text-green-800 text-base font-medium">
                      ✓ Đã gửi đến bác sĩ gia đình. Bạn sẽ nhận thông báo khi có phản hồi.
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 4: AI Result */}
      {step === 4 && loading && (
        <Card>
          <CardContent className="flex flex-col items-center py-16">
            <Loader2 className="size-10 text-primary animate-spin mb-4" />
            <p className="text-lg font-medium">AI đang tạo gói hồ sơ...</p>
          </CardContent>
        </Card>
      )}
      {step === 4 && result && !loading && (
        <div className="space-y-4">
          <HealthSummaryView summary={result.aiSummary} citations={result.citations}
            onRegenerate={generate} regenerating={loading} />
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => window.open(`/api/visit-prep/${result.prepId}/pdf`, '_blank')}
              className="min-h-[48px] text-base gap-2"><FileDown className="size-5" />Xuất PDF</Button>
            <Button variant="outline" onClick={() => router.push('/dashboard/visit-prep')}
              className="min-h-[48px] text-base gap-2"><Save className="size-5" />Xong</Button>
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      {step < 4 && (
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}
            className="min-h-[48px] text-base gap-2">
            <ArrowLeft className="size-5" />Quay lại
          </Button>
          {step < 3 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canNext}
              className="min-h-[48px] text-base gap-2">
              Tiếp theo<ArrowRight className="size-5" />
            </Button>
          ) : (
            <Button onClick={generate} disabled={loading || !citizenId || symptoms.length === 0}
              className="min-h-[48px] text-base gap-2">
              {loading ? <Loader2 className="size-5 animate-spin" /> : null}
              Tạo gói hồ sơ
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
