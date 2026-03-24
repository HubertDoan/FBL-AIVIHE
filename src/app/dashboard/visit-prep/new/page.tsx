'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { SpecialtySelector } from '@/components/visit-prep/specialty-selector'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'

export default function NewExamRegistrationPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [specialties, setSpecialties] = useState<string[]>([])
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [symptomInput, setSymptomInput] = useState('')
  const [symptomDescription, setSymptomDescription] = useState('')
  const [currentMedications, setCurrentMedications] = useState('')
  const [medicalHistory, setMedicalHistory] = useState('')
  const [questionsForDoctor, setQuestionsForDoctor] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function addSymptom() {
    const trimmed = symptomInput.trim()
    if (trimmed && !symptoms.includes(trimmed) && symptoms.length < 15) {
      setSymptoms([...symptoms, trimmed])
      setSymptomInput('')
    }
  }

  function removeSymptom(s: string) {
    setSymptoms(symptoms.filter((x) => x !== s))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    if (specialties.length === 0) {
      toast.error('Vui lòng chọn ít nhất một chuyên khoa.')
      return
    }
    if (symptoms.length === 0) {
      toast.error('Vui lòng nhập ít nhất một triệu chứng.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/exam-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specialties,
          symptoms,
          symptom_description: symptomDescription,
          current_medications: currentMedications,
          medical_history: medicalHistory,
          questions_for_doctor: questionsForDoctor,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Gửi phiếu thất bại. Vui lòng thử lại.')
        return
      }
      toast.success('Đã gửi phiếu đăng ký khám đến bác sĩ gia đình.')
      router.push('/dashboard/visit-prep')
    } catch {
      toast.error('Lỗi kết nối. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Đăng ký khám bệnh</h1>
        <p className="text-muted-foreground mt-1">
          Điền thông tin bên dưới để gửi đến bác sĩ gia đình xem xét
        </p>
      </div>

      {/* Section 1: Specialties */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">1. Chuyên khoa muốn khám</CardTitle>
          <p className="text-sm text-muted-foreground">Có thể chọn nhiều chuyên khoa</p>
        </CardHeader>
        <CardContent>
          <SpecialtySelector
            value={specialties}
            onChange={(v) => setSpecialties(v as string[])}
            multiple
          />
        </CardContent>
      </Card>

      {/* Section 2: Symptoms */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">2. Triệu chứng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={symptomInput}
              onChange={(e) => setSymptomInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSymptom())}
              placeholder="Nhập triệu chứng rồi nhấn Thêm..."
              className="text-base min-h-[48px]"
            />
            <Button type="button" onClick={addSymptom} className="min-h-[48px] text-base shrink-0">
              Thêm
            </Button>
          </div>
          {symptoms.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {symptoms.map((s) => (
                <Badge key={s} variant="secondary" className="text-base py-1 px-3 gap-1">
                  {s}
                  <button type="button" onClick={() => removeSymptom(s)} className="ml-1">
                    <X className="size-3.5" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          <div>
            <label className="block text-base font-medium mb-2">Mô tả chi tiết triệu chứng</label>
            <Textarea
              value={symptomDescription}
              onChange={(e) => setSymptomDescription(e.target.value)}
              placeholder="Mô tả thêm: thời gian xuất hiện, mức độ, hoàn cảnh xảy ra..."
              className="text-base min-h-[100px]"
              maxLength={2000}
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Current medications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">3. Thuốc đang dùng</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={currentMedications}
            onChange={(e) => setCurrentMedications(e.target.value)}
            placeholder="Liệt kê các thuốc đang uống: tên thuốc, liều dùng, tần suất..."
            className="text-base min-h-[100px]"
            maxLength={2000}
          />
        </CardContent>
      </Card>

      {/* Section 4: Medical history */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">4. Tiền sử bệnh</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={medicalHistory}
            onChange={(e) => setMedicalHistory(e.target.value)}
            placeholder="Các bệnh đã hoặc đang mắc, tiền sử phẫu thuật, dị ứng thuốc..."
            className="text-base min-h-[100px]"
            maxLength={2000}
          />
        </CardContent>
      </Card>

      {/* Section 5: Questions for family doctor */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">5. Câu hỏi cho bác sĩ gia đình</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={questionsForDoctor}
            onChange={(e) => setQuestionsForDoctor(e.target.value)}
            placeholder="Bạn muốn hỏi gì bác sĩ gia đình trước khi đi khám?"
            className="text-base min-h-[100px]"
            maxLength={2000}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end pb-8">
        <Button
          type="submit"
          disabled={submitting}
          className="min-h-[52px] text-lg px-8 gap-2"
        >
          {submitting && <Loader2 className="size-5 animate-spin" />}
          Gửi bác sĩ gia đình
        </Button>
      </div>
    </form>
  )
}
