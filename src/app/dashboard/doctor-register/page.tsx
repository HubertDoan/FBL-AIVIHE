'use client'

// Doctor registration form — allows doctor-role users to submit professional profile for admin approval

import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { CertificateListEditor } from '@/components/doctor/certificate-list-editor'
import { WorkExperienceListEditor } from '@/components/doctor/work-experience-list-editor'
import { toast } from 'sonner'
import { CheckCircle, UserPlus } from 'lucide-react'
import type { Certificate, WorkExperience } from '@/lib/demo/demo-doctor-profile-data'

const DEGREE_OPTIONS = [
  { value: 'BS', label: 'Bác sĩ (BS)' },
  { value: 'CKI', label: 'Bác sĩ Chuyên khoa I (CKI)' },
  { value: 'CKII', label: 'Bác sĩ Chuyên khoa II (CKII)' },
  { value: 'ThS', label: 'Thạc sĩ Y khoa (ThS)' },
  { value: 'TS', label: 'Tiến sĩ Y khoa (TS)' },
]

export default function DoctorRegisterPage() {
  const { user, loading } = useAuth()
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [degree, setDegree] = useState('BS')
  const [university, setUniversity] = useState('')
  const [graduationYear, setGraduationYear] = useState(String(new Date().getFullYear() - 5))
  const [specialties, setSpecialties] = useState('')
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [experiences, setExperiences] = useState<WorkExperience[]>([])
  const [desiredWork, setDesiredWork] = useState('')
  const [availableHours, setAvailableHours] = useState('')
  const [maxPatients, setMaxPatients] = useState('10')

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <CheckCircle className="size-16 text-green-500 mx-auto" />
        <h2 className="text-2xl font-bold">Đăng ký đã gửi!</h2>
        <p className="text-lg text-muted-foreground">
          Hồ sơ của bạn đang chờ Admin duyệt. Bạn sẽ nhận được thông báo khi được chấp thuận.
        </p>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!university.trim()) { toast.error('Vui lòng nhập trường đào tạo.'); return }
    if (certificates.some(c => !c.name || !c.issuer || !c.issued_date)) {
      toast.error('Vui lòng điền đầy đủ thông tin chứng chỉ.'); return
    }
    if (experiences.some(e => !e.position || !e.facility)) {
      toast.error('Vui lòng điền đầy đủ thông tin kinh nghiệm.'); return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/doctor-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: user?.fullName ?? '',
          citizen_id: user?.citizenId ?? '',
          specialties: specialties.split(',').map(s => s.trim()).filter(Boolean),
          degree,
          university,
          graduation_year: parseInt(graduationYear),
          certificates,
          work_experience: experiences,
          desired_work: desiredWork,
          available_hours: availableHours,
          max_patients: parseInt(maxPatients) || 10,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error ?? 'Gửi đăng ký thất bại.')
      } else {
        setSubmitted(true)
      }
    } catch {
      toast.error('Lỗi kết nối. Vui lòng thử lại.')
    }
    setSubmitting(false)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <UserPlus className="size-6 text-primary" />
        <h1 className="text-2xl font-bold">Đăng ký bác sĩ gia đình</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Bằng cấp */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Bằng cấp & Đào tạo</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-base">Bằng cấp *</Label>
                <select
                  className="flex h-12 w-full rounded-md border border-input bg-background px-3 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                >
                  {DEGREE_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-base">Năm tốt nghiệp *</Label>
                <Input
                  type="number"
                  className="h-12 text-base"
                  min={1970}
                  max={new Date().getFullYear()}
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-base">Trường đào tạo *</Label>
                <Input
                  className="h-12 text-base"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  placeholder="VD: Đại học Y Hà Nội"
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-base">Chuyên khoa (ngăn cách bằng dấu phẩy)</Label>
                <Input
                  className="h-12 text-base"
                  value={specialties}
                  onChange={(e) => setSpecialties(e.target.value)}
                  placeholder="VD: Nội tổng quát, Y học gia đình"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chứng chỉ */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Chứng chỉ hành nghề</CardTitle></CardHeader>
          <CardContent>
            <CertificateListEditor certificates={certificates} onChange={setCertificates} />
          </CardContent>
        </Card>

        {/* Kinh nghiệm */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Kinh nghiệm công tác</CardTitle></CardHeader>
          <CardContent>
            <WorkExperienceListEditor experiences={experiences} onChange={setExperiences} />
          </CardContent>
        </Card>

        {/* Mong muốn */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Mong muốn làm việc</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label className="text-base">Giờ làm việc mong muốn</Label>
              <Input className="h-12 text-base" value={availableHours} onChange={(e) => setAvailableHours(e.target.value)} placeholder="VD: Thứ 2–6: 8:00–17:00" />
            </div>
            <div className="space-y-1">
              <Label className="text-base">Số bệnh nhân tối đa</Label>
              <Input type="number" className="h-12 text-base" min={1} max={50} value={maxPatients} onChange={(e) => setMaxPatients(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-base">Mong muốn & định hướng</Label>
              <Textarea className="text-base min-h-[100px]" value={desiredWork} onChange={(e) => setDesiredWork(e.target.value)} placeholder="Mô tả ngắn về định hướng nghề nghiệp và loại bệnh nhân muốn phục vụ" />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full h-14 text-lg" disabled={submitting}>
          {submitting ? 'Đang gửi...' : 'Gửi đăng ký'}
        </Button>
      </form>
    </div>
  )
}
