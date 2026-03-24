'use client'

// Member page to browse available doctors and request a family doctor assignment
// Also includes referral request section for when no suitable doctor is found

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Stethoscope, CheckCircle, Users, RefreshCw, HelpCircle, Send } from 'lucide-react'
import type { DoctorProfile, FamilyDoctorAssignment } from '@/lib/demo/demo-doctor-profile-data'

const SPECIALTY_OPTIONS = [
  'Nội tổng quát',
  'Y học gia đình',
  'Tim mạch',
  'Nội tiết',
  'Hô hấp',
  'Tiêu hoá',
  'Thần kinh',
  'Cơ xương khớp',
  'Da liễu',
  'Mắt',
  'Tai mũi họng',
  'Lão khoa',
]

export default function ChooseDoctorPage() {
  const { user, loading: authLoading } = useAuth()
  const [doctors, setDoctors] = useState<DoctorProfile[]>([])
  const [assignment, setAssignment] = useState<FamilyDoctorAssignment | null>(null)
  const [loading, setLoading] = useState(true)
  const [requestingId, setRequestingId] = useState<string | null>(null)
  const [showList, setShowList] = useState(false)
  // Referral form state
  const [showReferralForm, setShowReferralForm] = useState(false)
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([])
  const [referralDesc, setReferralDesc] = useState('')
  const [submittingReferral, setSubmittingReferral] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const [docRes, asgRes] = await Promise.all([
        fetch('/api/doctor-profile?available=true'),
        fetch('/api/family-doctor'),
      ])
      if (docRes.ok) {
        const d = await docRes.json()
        setDoctors(d.doctors ?? [])
      }
      if (asgRes.ok) {
        const a = await asgRes.json()
        setAssignment(a.assignment ?? null)
      }
    } catch { /* silent */ }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (authLoading || !user) return
    fetchData()
  }, [authLoading, user, fetchData])

  function toggleSpecialty(s: string) {
    setSelectedSpecialties(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    )
  }

  async function handleReferralSubmit() {
    if (selectedSpecialties.length === 0) {
      toast.error('Vui lòng chọn ít nhất một chuyên khoa.')
      return
    }
    if (!referralDesc.trim()) {
      toast.error('Vui lòng mô tả nhu cầu của bạn.')
      return
    }
    setSubmittingReferral(true)
    try {
      const res = await fetch('/api/doctor-referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ specialties_needed: selectedSpecialties, description: referralDesc.trim() }),
      })
      if (res.ok) {
        setShowReferralForm(false)
        setSelectedSpecialties([])
        setReferralDesc('')
        toast.success('Đã gửi yêu cầu. Trung tâm sẽ liên hệ bạn sớm.')
      } else {
        const err = await res.json()
        toast.error(err.error ?? 'Gửi yêu cầu thất bại.')
      }
    } catch { toast.error('Lỗi kết nối.') }
    setSubmittingReferral(false)
  }

  async function handleSelect(doctor: DoctorProfile) {
    setRequestingId(doctor.id)
    try {
      const res = await fetch('/api/family-doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctor_profile_id: doctor.id }),
      })
      if (res.ok) {
        await fetchData()
        setShowList(false)
        toast.success(`Đã gửi yêu cầu đến ${doctor.full_name}. Chờ xác nhận.`)
      } else {
        const err = await res.json()
        toast.error(err.error ?? 'Gửi yêu cầu thất bại.')
      }
    } catch { toast.error('Lỗi kết nối.') }
    setRequestingId(null)
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Has an accepted or pending assignment and not switching
  const activeAssignment = assignment && assignment.status !== 'declined'
  if (activeAssignment && !showList) {
    const acceptedDoctor = doctors.find(d => d.id === assignment.doctor_profile_id)
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Stethoscope className="size-6 text-primary" />
          <h1 className="text-2xl font-bold">Bác sĩ gia đình</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {assignment.status === 'accepted'
                ? <><CheckCircle className="size-5 text-green-500" />Bác sĩ gia đình của bạn</>
                : <><Stethoscope className="size-5 text-yellow-500" />Đang chờ xác nhận</>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {acceptedDoctor ? (
              <DoctorCard doctor={acceptedDoctor} compact />
            ) : (
              <p className="text-base text-muted-foreground">
                Yêu cầu đã gửi đến bác sĩ. Đang chờ phản hồi.
              </p>
            )}
            <Badge className={assignment.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
              {assignment.status === 'accepted' ? 'Đã xác nhận' : 'Chờ xác nhận'}
            </Badge>
            <Button
              variant="outline"
              className="w-full h-12 text-base gap-2"
              onClick={() => setShowList(true)}
            >
              <RefreshCw className="size-4" />
              Đổi bác sĩ
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Stethoscope className="size-6 text-primary" />
        <h1 className="text-2xl font-bold">Đăng ký bác sĩ gia đình</h1>
      </div>

      {showList && activeAssignment && (
        <Button variant="outline" className="h-11 text-base" onClick={() => setShowList(false)}>
          ← Quay lại
        </Button>
      )}

      {doctors.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Stethoscope className="size-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-lg text-muted-foreground">Hiện chưa có bác sĩ nào khả dụng.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {doctors.map(doctor => (
            <Card key={doctor.id}>
              <CardContent className="pt-4 space-y-4">
                <DoctorCard doctor={doctor} />
                <Button
                  className="w-full h-12 text-base"
                  disabled={requestingId === doctor.id}
                  onClick={() => handleSelect(doctor)}
                >
                  {requestingId === doctor.id ? 'Đang gửi...' : 'Chọn bác sĩ này'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Referral section */}
      <div className="pt-2 border-t border-border">
        <div className="flex items-center gap-2 mb-3">
          <HelpCircle className="size-5 text-muted-foreground" />
          <p className="text-base text-muted-foreground">Không tìm được bác sĩ phù hợp?</p>
        </div>
        {!showReferralForm ? (
          <Button
            variant="outline"
            className="h-11 text-base gap-2"
            onClick={() => setShowReferralForm(true)}
          >
            <Send className="size-4" />
            Nhờ trung tâm giới thiệu
          </Button>
        ) : (
          <Card className="border-primary/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Yêu cầu trung tâm giới thiệu bác sĩ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-base font-medium">Chuyên khoa cần (chọn một hoặc nhiều)</p>
                <div className="flex flex-wrap gap-2">
                  {SPECIALTY_OPTIONS.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSpecialty(s)}
                      className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        selectedSpecialties.includes(s)
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-background hover:bg-accent'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-base font-medium">Mô tả nhu cầu của bạn</label>
                <textarea
                  value={referralDesc}
                  onChange={e => setReferralDesc(e.target.value)}
                  rows={3}
                  placeholder="Ví dụ: Tôi bị cao huyết áp lâu năm, cần bác sĩ có kinh nghiệm theo dõi mãn tính..."
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-base resize-none"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  className="h-11 text-base flex-1 gap-2"
                  onClick={handleReferralSubmit}
                  disabled={submittingReferral}
                >
                  <Send className="size-4" />
                  {submittingReferral ? 'Đang gửi...' : 'Gửi yêu cầu'}
                </Button>
                <Button
                  variant="outline"
                  className="h-11 text-base"
                  onClick={() => setShowReferralForm(false)}
                >
                  Huỷ
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function DoctorCard({ doctor, compact = false }: { doctor: DoctorProfile; compact?: boolean }) {
  const slotsLeft = doctor.max_patients - doctor.current_patients
  const latestExp = doctor.work_experience.find(w => w.to_year === null) ?? doctor.work_experience[0]
  const totalYears = doctor.work_experience.reduce((acc, w) => {
    const end = w.to_year ?? new Date().getFullYear()
    return acc + (end - w.from_year)
  }, 0)

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-lg font-bold">{doctor.full_name}</p>
          <p className="text-base text-muted-foreground">{doctor.degree} · {doctor.specialties.join(', ')}</p>
        </div>
        <Badge variant="outline" className="shrink-0 text-sm">
          <Users className="size-3 mr-1" />
          {slotsLeft} chỗ trống
        </Badge>
      </div>
      {!compact && (
        <>
          {latestExp && (
            <p className="text-base">
              <span className="font-medium">{latestExp.position}</span> tại {latestExp.facility}
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            {totalYears} năm kinh nghiệm · {doctor.available_hours || 'Liên hệ để biết lịch'}
          </p>
        </>
      )}
    </div>
  )
}
