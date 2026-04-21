'use client'

// Member page to browse available doctors and request a family doctor assignment
// Fetches from /api/doctors/available; submits to /api/family-doctor-registrations
// Shows current registration status if already submitted

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Stethoscope,
  CheckCircle,
  Clock,
  Search,
  Send,
  HelpCircle,
  RefreshCw,
  Star,
} from 'lucide-react'

interface AvailableDoctor {
  id: string
  doctor_citizen_id: string
  specialty: string
  qualification: string
  experience_years: number
  bio: string | null
  languages: string[]
  avatar_url: string | null
  rating: number
  review_count: number
  citizens: {
    id: string
    full_name: string
    phone: string
  } | null
}

interface MyRegistration {
  id: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  requested_at: string
  rejected_reason: string | null
  doctor: {
    id: string
    full_name: string
    doctor_profiles: Array<{ specialty: string; qualification: string }> | null
  } | null
}

const SPECIALTY_OPTIONS = [
  'Nội tổng quát',
  'Y học gia đình',
  'Tim mạch',
  'Nội tiết',
  'Hô hấp',
  'Tiêu hoá',
  'Thần kinh',
  'Cơ xương khớp',
  'Lão khoa',
]

export default function ChooseDoctorPage() {
  const { user, loading: authLoading } = useAuth()
  const [doctors, setDoctors] = useState<AvailableDoctor[]>([])
  const [myRegistrations, setMyRegistrations] = useState<MyRegistration[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [specialtyFilter, setSpecialtyFilter] = useState('')
  const [confirmDoctor, setConfirmDoctor] = useState<AvailableDoctor | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showList, setShowList] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (specialtyFilter) params.set('specialty', specialtyFilter)

      const [docRes, regRes] = await Promise.all([
        fetch(`/api/doctors/available?${params}`),
        fetch('/api/family-doctor-registrations'),
      ])

      if (docRes.ok) {
        const d = await docRes.json()
        setDoctors(d.doctors ?? [])
      }
      if (regRes.ok) {
        const r = await regRes.json()
        setMyRegistrations(r.registrations ?? [])
      }
    } catch { /* silent */ }
    setPageLoading(false)
  }, [search, specialtyFilter])

  useEffect(() => {
    if (authLoading || !user) return
    fetchData()
  }, [authLoading, user, fetchData])

  async function handleRegister() {
    if (!confirmDoctor) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/family-doctor-registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctor_id: confirmDoctor.doctor_citizen_id }),
      })
      if (res.ok) {
        setConfirmDoctor(null)
        await fetchData()
        setShowList(false)
        toast.success('Đã gửi yêu cầu. Giám đốc sẽ duyệt trong 24 giờ.')
      } else {
        const err = await res.json()
        toast.error(err.error ?? 'Gửi yêu cầu thất bại.')
        setConfirmDoctor(null)
      }
    } catch { toast.error('Lỗi kết nối.') }
    setSubmitting(false)
  }

  // Check if KH already has a pending/approved registration for a doctor
  function getRegistrationStatus(doctorCitizenId: string) {
    return myRegistrations.find(
      r => r.doctor?.id === doctorCitizenId && ['pending', 'approved'].includes(r.status)
    )
  }

  if (authLoading || pageLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Active approved registration — show current doctor
  const approvedReg = myRegistrations.find(r => r.status === 'approved')
  const pendingReg = myRegistrations.find(r => r.status === 'pending')

  if ((approvedReg || pendingReg) && !showList) {
    const activeReg = approvedReg ?? pendingReg!
    const isApproved = activeReg.status === 'approved'
    const dp = activeReg.doctor?.doctor_profiles?.[0]

    return (
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Stethoscope className="size-6 text-teal-600" />
          <h1 className="text-2xl font-bold">Bác sĩ gia đình</h1>
        </div>

        <Card className={isApproved ? 'border-emerald-200' : 'border-yellow-200'}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {isApproved
                ? <><CheckCircle className="size-5 text-emerald-600" />Bác sĩ gia đình của bạn</>
                : <><Clock className="size-5 text-yellow-600" />Đang chờ giám đốc duyệt</>
              }
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-lg font-bold">{activeReg.doctor?.full_name}</p>
              {dp && (
                <p className="text-base text-muted-foreground">
                  {dp.qualification} · {dp.specialty}
                </p>
              )}
            </div>
            <Badge className={
              isApproved
                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                : 'bg-yellow-100 text-yellow-800 border-yellow-200'
            }>
              {isApproved ? 'Đã xác nhận' : 'Chờ duyệt — GĐ sẽ xử lý trong 24h'}
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
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Stethoscope className="size-6 text-teal-600" />
        <h1 className="text-2xl font-bold">Đăng ký bác sĩ gia đình</h1>
      </div>

      {showList && (approvedReg || pendingReg) && (
        <Button variant="outline" className="h-11 text-base" onClick={() => setShowList(false)}>
          ← Quay lại
        </Button>
      )}

      {/* Search + filter */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên bác sĩ..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-11 text-base"
          />
        </div>
        <select
          value={specialtyFilter}
          onChange={e => setSpecialtyFilter(e.target.value)}
          className="h-11 px-3 rounded-md border border-input bg-background text-base"
        >
          <option value="">Tất cả chuyên khoa</option>
          {SPECIALTY_OPTIONS.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Doctor list */}
      {doctors.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Stethoscope className="size-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-lg text-muted-foreground">
              {search || specialtyFilter
                ? 'Không tìm thấy bác sĩ phù hợp với bộ lọc.'
                : 'Hiện chưa có bác sĩ nào khả dụng.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {doctors.map(doctor => {
            const existingReg = getRegistrationStatus(doctor.doctor_citizen_id)
            const isPending = existingReg?.status === 'pending'
            const isApproved = existingReg?.status === 'approved'

            return (
              <Card key={doctor.id} className={isApproved ? 'border-emerald-200' : ''}>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <p className="text-lg font-bold">{doctor.citizens?.full_name}</p>
                      <p className="text-base text-muted-foreground">
                        {doctor.qualification} · {doctor.specialty}
                      </p>
                      {doctor.experience_years > 0 && (
                        <p className="text-sm text-muted-foreground">
                          {doctor.experience_years} năm kinh nghiệm
                        </p>
                      )}
                      {doctor.languages.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                          Ngôn ngữ: {doctor.languages.join(', ')}
                        </p>
                      )}
                    </div>
                    {doctor.rating > 0 && (
                      <div className="flex items-center gap-1 shrink-0 text-amber-500">
                        <Star className="size-4 fill-current" />
                        <span className="text-base font-semibold">{doctor.rating.toFixed(1)}</span>
                        <span className="text-sm text-muted-foreground">({doctor.review_count})</span>
                      </div>
                    )}
                  </div>

                  {doctor.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{doctor.bio}</p>
                  )}

                  {isApproved ? (
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                      <CheckCircle className="size-3.5 mr-1" />
                      Bác sĩ gia đình của bạn
                    </Badge>
                  ) : isPending ? (
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                      <Clock className="size-3.5 mr-1" />
                      Đã gửi yêu cầu — chờ duyệt
                    </Badge>
                  ) : (
                    <Button
                      className="w-full h-12 text-base bg-teal-600 hover:bg-teal-700"
                      onClick={() => setConfirmDoctor(doctor)}
                    >
                      <Send className="size-4 mr-2" />
                      Đăng ký BS gia đình
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Help section */}
      <div className="pt-2 border-t border-border flex items-center gap-2 text-base text-muted-foreground">
        <HelpCircle className="size-5 shrink-0" />
        <p>
          Sau khi đăng ký, Giám đốc trung tâm sẽ xem xét và phê duyệt trong vòng 24 giờ.
        </p>
      </div>

      {/* Confirm registration dialog */}
      <Dialog open={!!confirmDoctor} onOpenChange={open => { if (!open) setConfirmDoctor(null) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg flex items-center gap-2">
              <Stethoscope className="size-5 text-teal-600" />
              Xác nhận đăng ký BS gia đình
            </DialogTitle>
          </DialogHeader>
          {confirmDoctor && (
            <div className="py-2 space-y-2">
              <p className="text-base">Bạn muốn đăng ký:</p>
              <div className="rounded-lg bg-muted p-3 space-y-1">
                <p className="font-bold text-base">{confirmDoctor.citizens?.full_name}</p>
                <p className="text-base text-muted-foreground">
                  {confirmDoctor.qualification} · {confirmDoctor.specialty}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Yêu cầu sẽ được gửi đến Giám đốc để xét duyệt. Bạn sẽ nhận thông báo khi được duyệt.
              </p>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="h-11 text-base"
              onClick={() => setConfirmDoctor(null)}
              disabled={submitting}
            >
              Huỷ
            </Button>
            <Button
              className="h-11 text-base gap-2 bg-teal-600 hover:bg-teal-700"
              onClick={handleRegister}
              disabled={submitting}
            >
              <Send className="size-4" />
              {submitting ? 'Đang gửi...' : 'Xác nhận đăng ký'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
