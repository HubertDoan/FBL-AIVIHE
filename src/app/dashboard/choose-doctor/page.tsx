'use client'

// Member page to browse available doctors and request a family doctor assignment

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Stethoscope, CheckCircle, Users, RefreshCw } from 'lucide-react'
import type { DoctorProfile, FamilyDoctorAssignment } from '@/lib/demo/demo-doctor-profile-data'

export default function ChooseDoctorPage() {
  const { user, loading: authLoading } = useAuth()
  const [doctors, setDoctors] = useState<DoctorProfile[]>([])
  const [assignment, setAssignment] = useState<FamilyDoctorAssignment | null>(null)
  const [loading, setLoading] = useState(true)
  const [requestingId, setRequestingId] = useState<string | null>(null)
  const [showList, setShowList] = useState(false)

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
