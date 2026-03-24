'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Loader2, Heart, Pill, Activity, User } from 'lucide-react'

interface HealthData {
  citizen: {
    full_name: string
    date_of_birth: string | null
    gender: string | null
    phone: string
  } | null
  healthProfile: {
    chronic_conditions: string[]
    current_medications: string[]
    blood_type: string | null
    allergies: string[]
  } | null
  recentEvents: Array<{
    event_type: string
    title: string
    event_date: string
    details: Record<string, unknown> | null
  }>
}

const GENDER_MAP: Record<string, string> = {
  male: 'Nam',
  female: 'Nữ',
  other: 'Khác',
}

interface FamilyMemberHealthProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  memberId: string
  memberName: string
}

export function FamilyMemberHealth({
  open,
  onOpenChange,
  memberId,
  memberName,
}: FamilyMemberHealthProps) {
  const [data, setData] = useState<HealthData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open || !memberId) return
    setLoading(true)
    setError('')
    setData(null)

    fetch(`/api/family/members/${memberId}/health`)
      .then(async (res) => {
        const json = await res.json()
        if (res.ok) {
          setData(json)
        } else {
          setError(json.error ?? 'Không thể tải dữ liệu.')
        }
      })
      .catch(() => setError('Lỗi kết nối.'))
      .finally(() => setLoading(false))
  }, [open, memberId])

  function formatAge(dob: string | null) {
    if (!dob) return ''
    const birth = new Date(dob)
    const age = Math.floor(
      (Date.now() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    )
    return `${age} tuổi`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Heart className="size-5 text-red-500" />
            Hồ sơ sức khỏe - {memberName}
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <p className="text-destructive text-base text-center py-4">{error}</p>
        )}

        {data && (
          <div className="space-y-5">
            {/* Personal info */}
            {data.citizen && (
              <section className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="size-5" />
                  Thông tin cá nhân
                </h3>
                <div className="bg-muted/50 rounded-lg p-4 space-y-1 text-base">
                  <p><span className="font-medium">Họ tên:</span> {data.citizen.full_name}</p>
                  {data.citizen.date_of_birth && (
                    <p>
                      <span className="font-medium">Ngày sinh:</span>{' '}
                      {new Date(data.citizen.date_of_birth).toLocaleDateString('vi-VN')}{' '}
                      ({formatAge(data.citizen.date_of_birth)})
                    </p>
                  )}
                  {data.citizen.gender && (
                    <p><span className="font-medium">Giới tính:</span> {GENDER_MAP[data.citizen.gender] ?? data.citizen.gender}</p>
                  )}
                </div>
              </section>
            )}

            {/* Chronic diseases */}
            {data.healthProfile && (
              <section className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Activity className="size-5 text-orange-500" />
                  Bệnh nền
                </h3>
                {data.healthProfile.chronic_conditions.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {data.healthProfile.chronic_conditions.map((c, i) => (
                      <Badge key={i} variant="outline" className="text-base py-1 px-3">
                        {c}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-base text-muted-foreground">Không có bệnh nền ghi nhận.</p>
                )}

                {data.healthProfile.allergies.length > 0 && (
                  <div className="mt-2">
                    <p className="text-base font-medium text-red-600">Dị ứng:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {data.healthProfile.allergies.map((a, i) => (
                        <Badge key={i} variant="destructive" className="text-sm">
                          {a}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Current medications */}
            {data.healthProfile && (
              <section className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Pill className="size-5 text-blue-500" />
                  Thuốc đang dùng
                </h3>
                {data.healthProfile.current_medications.length > 0 ? (
                  <ul className="space-y-1 text-base">
                    {data.healthProfile.current_medications.map((m, i) => (
                      <li key={i} className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2">
                        <span className="size-2 rounded-full bg-blue-400 shrink-0" />
                        {m}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-base text-muted-foreground">Không có thuốc ghi nhận.</p>
                )}
              </section>
            )}

            {/* Recent health events */}
            {data.recentEvents.length > 0 && (
              <section className="space-y-2">
                <h3 className="text-lg font-semibold">Sự kiện sức khỏe gần đây</h3>
                <div className="space-y-2">
                  {data.recentEvents.map((ev, i) => (
                    <div key={i} className="bg-muted/30 rounded-lg p-3 border">
                      <div className="flex items-center justify-between">
                        <p className="text-base font-medium">{ev.title}</p>
                        <span className="text-sm text-muted-foreground">
                          {new Date(ev.event_date).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs mt-1">
                        {ev.event_type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
