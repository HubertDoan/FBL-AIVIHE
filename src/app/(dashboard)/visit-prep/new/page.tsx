'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, FileDown, Save, ArrowLeft, ArrowRight, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { SpecialtySelector } from '@/components/visit-prep/specialty-selector'
import { HealthSummaryView } from '@/components/summary/health-summary-view'
import { createClient } from '@/lib/supabase/client'
import { getSpecialtyName } from '@/lib/constants/medical-specialties'

const STEPS = ['Chọn chuyên khoa', 'Mô tả triệu chứng', 'Câu hỏi cho bác sĩ', 'Kết quả AI']

export default function NewVisitPrepPage() {
  const router = useRouter()
  const [citizenId, setCitizenId] = useState<string | null>(null)
  const [step, setStep] = useState(0)
  const [specialty, setSpecialty] = useState('')
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [symptomInput, setSymptomInput] = useState('')
  const [symptomDesc, setSymptomDesc] = useState('')
  const [questions, setQuestions] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{
    prepId: string; aiSummary: string; citations: never[]
  } | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('citizens').select('id').eq('auth_id', user.id).single()
      if (data) setCitizenId(data.id)
    }
    load()
  }, [])

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

  async function generate() {
    if (!citizenId || !specialty || symptoms.length === 0) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/ai/visit-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          citizenId, specialty, symptoms,
          symptomDescription: symptomDesc || null,
          questionsForDoctor: questions ? questions.split('\n').filter(Boolean) : [],
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Tạo thất bại.'); return }
      setResult(data)
      setStep(3)
    } catch {
      setError('Lỗi kết nối. Vui lòng thử lại.')
    } finally { setLoading(false) }
  }

  const canNext = step === 0 ? !!specialty : step === 1 ? symptoms.length > 0 : true

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

      {step === 0 && (
        <Card><CardHeader><CardTitle className="text-lg">Chọn chuyên khoa</CardTitle></CardHeader>
          <CardContent><SpecialtySelector value={specialty} onChange={setSpecialty} /></CardContent></Card>
      )}
      {step === 1 && (
        <Card><CardHeader><CardTitle className="text-lg">Mô tả triệu chứng — {getSpecialtyName(specialty)}</CardTitle></CardHeader>
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
                    {s}<button onClick={() => removeSymptom(s)} className="ml-1"><X className="size-3.5" /></button>
                  </Badge>))}
              </div>
            )}
            <div>
              <label className="block text-base font-medium mb-2">Mô tả chi tiết (tùy chọn)</label>
              <Textarea value={symptomDesc} onChange={(e) => setSymptomDesc(e.target.value)}
                placeholder="Mô tả thêm về triệu chứng, thời gian xuất hiện..." className="text-base min-h-[100px]" maxLength={2000} />
            </div>
          </CardContent></Card>
      )}
      {step === 2 && (
        <Card><CardHeader><CardTitle className="text-lg">Câu hỏi muốn hỏi bác sĩ</CardTitle></CardHeader>
          <CardContent>
            <Textarea value={questions} onChange={(e) => setQuestions(e.target.value)}
              placeholder={"Mỗi câu hỏi một dòng (tùy chọn)\nVí dụ: Tôi có cần xét nghiệm thêm không?"}
              className="text-base min-h-[120px]" maxLength={5000} />
          </CardContent></Card>
      )}
      {step === 3 && loading && (
        <Card><CardContent className="flex flex-col items-center py-16">
          <Loader2 className="size-10 text-primary animate-spin mb-4" />
          <p className="text-lg font-medium">AI đang tạo gói hồ sơ...</p>
        </CardContent></Card>
      )}
      {step === 3 && result && !loading && (
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
      {step < 3 && (
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}
            className="min-h-[48px] text-base gap-2"><ArrowLeft className="size-5" />Quay lại</Button>
          {step < 2 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canNext}
              className="min-h-[48px] text-base gap-2">Tiếp theo<ArrowRight className="size-5" /></Button>
          ) : (
            <Button onClick={generate} disabled={loading || !citizenId || symptoms.length === 0}
              className="min-h-[48px] text-base gap-2">
              {loading ? <Loader2 className="size-5 animate-spin" /> : null}Tạo gói hồ sơ</Button>
          )}
        </div>
      )}
    </div>
  )
}
