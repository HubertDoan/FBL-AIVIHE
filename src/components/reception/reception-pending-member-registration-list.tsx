'use client'

// Danh sách hồ sơ đăng ký thành viên đang chờ duyệt — dùng trong tab "Đăng ký thành viên" ở trang tiếp đón

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, UserPlus, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface PendingMember {
  id: string
  fullName: string
  phone: string
  registrationDate: string | null
  registrationStatus: string
}

export function ReceptionPendingMemberRegistrationList() {
  const router = useRouter()
  const [members, setMembers] = useState<PendingMember[]>([])
  const [loading, setLoading] = useState(true)
  const [approvingId, setApprovingId] = useState<string | null>(null)

  const loadPending = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/reception/pending-members')
      if (!res.ok) return
      const data = await res.json()
      setMembers(data.members ?? [])
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPending()
  }, [loadPending])

  async function handleSubmitToDirector(id: string) {
    setApprovingId(id)
    try {
      const res = await fetch(`/api/admin/members/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      })
      if (res.ok) {
        await loadPending()
      }
    } catch {
      // silently fail
    } finally {
      setApprovingId(null)
    }
  }

  function formatDate(iso: string | null): string {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-base">
          Hồ sơ đăng ký thành viên đang chờ xét duyệt
        </p>
        <Button
          onClick={() => router.push('/dashboard/register-member')}
          className="min-h-[48px] gap-2"
        >
          <UserPlus className="size-4" />
          + Đăng ký mới
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : members.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="size-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              Không có hồ sơ nào đang chờ duyệt
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {members.map((member) => (
            <Card key={member.id}>
              <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="text-base font-semibold">{member.fullName}</p>
                  <p className="text-sm text-muted-foreground">{member.phone}</p>
                  <p className="text-sm text-muted-foreground">
                    Ngày đăng ký: {formatDate(member.registrationDate)}
                  </p>
                  <Badge variant="secondary" className="text-sm">
                    Chờ duyệt
                  </Badge>
                </div>
                <Button
                  onClick={() => handleSubmitToDirector(member.id)}
                  disabled={approvingId === member.id}
                  className="min-h-[48px] shrink-0"
                >
                  {approvingId === member.id ? (
                    <Loader2 className="size-4 animate-spin mr-2" />
                  ) : null}
                  Trình Giám đốc duyệt
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
