'use client'

// Admin component to review pending doctor registrations and approve or suspend them

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react'
import type { DoctorProfile } from '@/lib/demo/demo-doctor-profile-data'

interface ProfileWithExpand extends DoctorProfile {
  expanded?: boolean
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  suspended: 'Tạm dừng',
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  approved: 'bg-green-100 text-green-800 border-green-200',
  suspended: 'bg-red-100 text-red-800 border-red-200',
}

export function DoctorApprovalList() {
  const [profiles, setProfiles] = useState<ProfileWithExpand[]>([])
  const [loading, setLoading] = useState(true)
  const [actingId, setActingId] = useState<string | null>(null)

  const fetchProfiles = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/doctor-profile')
      if (res.ok) {
        const data = await res.json()
        setProfiles((data.profiles ?? []) as ProfileWithExpand[])
      }
    } catch { /* silent */ }
    setLoading(false)
  }, [])

  useEffect(() => { fetchProfiles() }, [fetchProfiles])

  async function handleApprove(profile: DoctorProfile) {
    setActingId(profile.id)
    try {
      const res = await fetch('/api/admin/doctor-approval', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: profile.id, action: 'approve' }),
      })
      if (res.ok) {
        toast.success(`Đã duyệt hồ sơ của ${profile.full_name}.`)
        await fetchProfiles()
      } else {
        const err = await res.json()
        toast.error(err.error ?? 'Duyệt thất bại.')
      }
    } catch { toast.error('Lỗi kết nối.') }
    setActingId(null)
  }

  async function handleSuspend(profile: DoctorProfile) {
    setActingId(profile.id)
    try {
      const res = await fetch('/api/admin/doctor-approval', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: profile.id, action: 'suspend' }),
      })
      if (res.ok) {
        toast.success(`Đã tạm dừng hồ sơ của ${profile.full_name}.`)
        await fetchProfiles()
      } else {
        const err = await res.json()
        toast.error(err.error ?? 'Thao tác thất bại.')
      }
    } catch { toast.error('Lỗi kết nối.') }
    setActingId(null)
  }

  function toggleExpand(id: string) {
    setProfiles(ps => ps.map(p => p.id === id ? { ...p, expanded: !p.expanded } : p))
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map(i => <Skeleton key={i} className="h-24 w-full" />)}
      </div>
    )
  }

  if (profiles.length === 0) {
    return <p className="text-base text-muted-foreground py-4">Không có hồ sơ bác sĩ nào.</p>
  }

  return (
    <div className="space-y-4">
      {profiles.map(profile => (
        <div key={profile.id} className="border rounded-lg overflow-hidden">
          {/* Header row */}
          <div className="flex items-center justify-between gap-3 p-4">
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-base truncate">{profile.full_name}</p>
              <p className="text-sm text-muted-foreground">
                {profile.degree} · {profile.university} · {profile.graduation_year}
              </p>
              <p className="text-sm text-muted-foreground">
                {profile.specialties.join(', ') || 'Chưa có chuyên khoa'}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <Badge className={STATUS_COLORS[profile.status]}>
                {STATUS_LABELS[profile.status]}
              </Badge>
              <button
                onClick={() => toggleExpand(profile.id)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Xem chi tiết"
              >
                {profile.expanded ? <ChevronUp className="size-5" /> : <ChevronDown className="size-5" />}
              </button>
            </div>
          </div>

          {/* Expanded detail */}
          {profile.expanded && (
            <div className="border-t px-4 pb-4 space-y-3 bg-muted/20">
              <div className="pt-3 space-y-1">
                <p className="text-sm font-medium">Chứng chỉ ({profile.certificates.length})</p>
                {profile.certificates.map((c, i) => (
                  <p key={i} className="text-sm text-muted-foreground pl-2">
                    • {c.name} — {c.issuer} ({c.issued_date})
                  </p>
                ))}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Kinh nghiệm ({profile.work_experience.length})</p>
                {profile.work_experience.map((w, i) => (
                  <p key={i} className="text-sm text-muted-foreground pl-2">
                    • {w.position} tại {w.facility} ({w.from_year}–{w.to_year ?? 'nay'})
                  </p>
                ))}
              </div>
              {profile.desired_work && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">Mong muốn</p>
                  <p className="text-sm text-muted-foreground pl-2">{profile.desired_work}</p>
                </div>
              )}
              <div className="flex gap-2 pt-1">
                {profile.status !== 'approved' && (
                  <Button
                    size="sm"
                    className="h-10 text-base gap-1.5 bg-green-600 hover:bg-green-700"
                    disabled={actingId === profile.id}
                    onClick={() => handleApprove(profile)}
                  >
                    <CheckCircle className="size-4" />
                    Duyệt BS
                  </Button>
                )}
                {profile.status !== 'suspended' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-10 text-base gap-1.5 text-destructive border-destructive hover:bg-destructive/10"
                    disabled={actingId === profile.id}
                    onClick={() => handleSuspend(profile)}
                  >
                    <XCircle className="size-4" />
                    Tạm dừng
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
