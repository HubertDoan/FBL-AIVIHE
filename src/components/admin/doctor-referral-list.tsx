'use client'

// Admin component to manage doctor referral requests from members
// Lists pending referrals and allows admin to assign an approved doctor

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { UserCheck, Clock, Tag } from 'lucide-react'
import type { DoctorReferralRequest } from '@/lib/demo/demo-doctor-schedule-data'
import type { DoctorProfile } from '@/lib/demo/demo-doctor-profile-data'

export function DoctorReferralList() {
  const [referrals, setReferrals] = useState<DoctorReferralRequest[]>([])
  const [doctors, setDoctors] = useState<DoctorProfile[]>([])
  const [loading, setLoading] = useState(true)
  // Per-referral form state: referralId → { doctorId, notes }
  const [forms, setForms] = useState<Record<string, { doctorId: string; notes: string }>>({})
  const [assigning, setAssigning] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const [refRes, docRes] = await Promise.all([
        fetch('/api/doctor-referral'),
        fetch('/api/doctor-profile?available=false'),
      ])
      if (refRes.ok) {
        const d = await refRes.json()
        setReferrals(d.referrals ?? [])
      }
      if (docRes.ok) {
        const d = await docRes.json()
        // Show all approved doctors
        setDoctors((d.doctors ?? []).filter((doc: DoctorProfile) => doc.status === 'approved'))
      }
    } catch { /* silent */ }
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  function updateForm(referralId: string, field: 'doctorId' | 'notes', value: string) {
    setForms(prev => ({
      ...prev,
      [referralId]: { ...prev[referralId] ?? { doctorId: '', notes: '' }, [field]: value },
    }))
  }

  async function handleAssign(referral: DoctorReferralRequest) {
    const form = forms[referral.id]
    if (!form?.doctorId) {
      toast.error('Vui lòng chọn bác sĩ.')
      return
    }
    const doctor = doctors.find(d => d.citizen_id === form.doctorId)
    if (!doctor) return

    setAssigning(referral.id)
    try {
      const res = await fetch('/api/doctor-referral', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referral_id: referral.id,
          doctor_id: doctor.citizen_id,
          doctor_name: doctor.full_name,
          admin_notes: form.notes || null,
        }),
      })
      if (res.ok) {
        await fetchData()
        toast.success(`Đã giới thiệu ${doctor.full_name} cho ${referral.citizen_name}.`)
      } else {
        const err = await res.json()
        toast.error(err.error ?? 'Phân công thất bại.')
      }
    } catch { toast.error('Lỗi kết nối.') }
    setAssigning(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="size-7 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (referrals.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground text-base">
        <UserCheck className="size-10 mx-auto mb-2 opacity-40" />
        Không có yêu cầu giới thiệu bác sĩ nào đang chờ xử lý.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {referrals.map(referral => {
        const form = forms[referral.id] ?? { doctorId: '', notes: '' }
        return (
          <Card key={referral.id}>
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-base font-semibold">{referral.citizen_name}</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                    <Clock className="size-3.5" />
                    {new Date(referral.created_at).toLocaleDateString('vi-VN')}
                  </div>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800 shrink-0">Chờ xử lý</Badge>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {referral.specialties_needed.map(s => (
                  <div key={s} className="flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 text-sm">
                    <Tag className="size-3" />
                    {s}
                  </div>
                ))}
              </div>

              <p className="text-base text-muted-foreground">{referral.description}</p>

              <div className="space-y-2 pt-1 border-t border-border">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Chọn bác sĩ để giới thiệu</label>
                  <select
                    value={form.doctorId}
                    onChange={e => updateForm(referral.id, 'doctorId', e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-base"
                  >
                    <option value="">-- Chọn bác sĩ --</option>
                    {doctors.map(d => (
                      <option key={d.citizen_id} value={d.citizen_id}>
                        {d.full_name} · {d.specialties.join(', ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Ghi chú cho bệnh nhân (tuỳ chọn)</label>
                  <input
                    type="text"
                    value={form.notes}
                    onChange={e => updateForm(referral.id, 'notes', e.target.value)}
                    placeholder="Lý do giới thiệu..."
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-base"
                  />
                </div>
                <Button
                  className="w-full h-11 text-base gap-2"
                  onClick={() => handleAssign(referral)}
                  disabled={assigning === referral.id}
                >
                  <UserCheck className="size-4" />
                  {assigning === referral.id ? 'Đang phân công...' : 'Giới thiệu bác sĩ'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
