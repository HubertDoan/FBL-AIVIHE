'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Check, X, Loader2, Clock, Mail, Send } from 'lucide-react'

const RELATIONSHIP_LABELS: Record<string, string> = {
  father: 'Bố', mother: 'Mẹ', son: 'Con trai', daughter: 'Con gái',
  grandfather: 'Ông', grandmother: 'Bà', wife: 'Vợ', husband: 'Chồng',
  sibling: 'Anh/Chị/Em', other: 'Khác',
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending: { label: 'Đang chờ', className: 'bg-yellow-100 text-yellow-800' },
  accepted: { label: 'Đã chấp nhận', className: 'bg-green-100 text-green-800' },
  declined: { label: 'Đã từ chối', className: 'bg-red-100 text-red-800' },
}

interface Invitation {
  id: string
  relationship: string
  status: string
  message: string | null
  created_at: string
  inviter?: { full_name: string }
  invitee?: { full_name: string }
  invitee_phone?: string
}

interface InvitationListProps {
  refreshKey?: number
}

export function InvitationList({ refreshKey }: InvitationListProps) {
  const [received, setReceived] = useState<Invitation[]>([])
  const [sent, setSent] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [respondingId, setRespondingId] = useState<string | null>(null)

  const fetchInvitations = useCallback(async () => {
    try {
      const res = await fetch('/api/family/invitations')
      if (res.ok) {
        const data = await res.json()
        setReceived(data.received ?? [])
        setSent(data.sent ?? [])
      }
    } catch {
      // Silently handle
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchInvitations()
  }, [fetchInvitations, refreshKey])

  const handleRespond = async (id: string, action: 'accept' | 'decline') => {
    setRespondingId(id)
    try {
      const res = await fetch(`/api/family/invitations/${id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (res.ok) {
        fetchInvitations()
      }
    } catch {
      // Silently handle
    }
    setRespondingId(null)
  }

  function formatDate(dateStr: string) {
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const hasContent = received.length > 0 || sent.length > 0

  if (!hasContent) {
    return (
      <div className="text-center py-8">
        <Mail className="size-12 mx-auto text-muted-foreground mb-3" />
        <p className="text-lg text-muted-foreground">Chưa có lời mời nào.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Received invitations */}
      {received.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Mail className="size-5" />
            Lời mời đã nhận
          </h3>
          {received.map((inv) => (
            <Card key={inv.id} className="border-primary/20">
              <CardContent className="space-y-3 pt-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-lg font-semibold">
                      {inv.inviter?.full_name ?? 'Không rõ'}
                    </p>
                    <p className="text-base text-muted-foreground">
                      Quan hệ: {RELATIONSHIP_LABELS[inv.relationship] ?? inv.relationship}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(inv.created_at)}
                    </p>
                  </div>
                  <Badge className={STATUS_CONFIG[inv.status]?.className}>
                    {STATUS_CONFIG[inv.status]?.label}
                  </Badge>
                </div>

                {inv.message && (
                  <p className="text-base italic text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    &ldquo;{inv.message}&rdquo;
                  </p>
                )}

                {inv.status === 'pending' && (
                  <div className="flex gap-3">
                    <Button
                      className="flex-1 h-14 text-lg bg-green-600 hover:bg-green-700"
                      onClick={() => handleRespond(inv.id, 'accept')}
                      disabled={respondingId === inv.id}
                    >
                      {respondingId === inv.id ? (
                        <Loader2 className="size-5 animate-spin" />
                      ) : (
                        <>
                          <Check className="size-5 mr-2" />
                          Chấp nhận
                        </>
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1 h-14 text-lg"
                      onClick={() => handleRespond(inv.id, 'decline')}
                      disabled={respondingId === inv.id}
                    >
                      <X className="size-5 mr-2" />
                      Từ chối
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Sent invitations */}
      {sent.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Send className="size-5" />
            Lời mời đã gửi
          </h3>
          {sent.map((inv) => (
            <Card key={inv.id}>
              <CardContent className="pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold">
                      {inv.invitee?.full_name ?? inv.invitee_phone ?? 'Không rõ'}
                    </p>
                    <p className="text-base text-muted-foreground">
                      Quan hệ: {RELATIONSHIP_LABELS[inv.relationship] ?? inv.relationship}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="size-3" />
                      {formatDate(inv.created_at)}
                    </p>
                  </div>
                  <Badge className={STATUS_CONFIG[inv.status]?.className}>
                    {STATUS_CONFIG[inv.status]?.label}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
