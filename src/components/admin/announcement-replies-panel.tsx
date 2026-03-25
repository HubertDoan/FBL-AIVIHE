'use client'

// Admin panel showing replies for a single announcement, grouped by user.
// Admin can respond to each reply thread inline.

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Loader2, MessageSquare, Send, ChevronDown, ChevronUp } from 'lucide-react'

interface Reply {
  id: string
  announcement_id: string
  user_id: string
  user_name: string
  user_role: string
  content: string
  created_at: string
  admin_response: string | null
  admin_name: string | null
  admin_responded_at: string | null
}

interface Props {
  announcementId: string
  announcementTitle: string
  allowReply: boolean
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch { return iso }
}

function RoleTag({ role }: { role: string }) {
  const map: Record<string, { label: string; className: string }> = {
    citizen: { label: 'Thành viên', className: 'bg-blue-100 text-blue-700' },
    member: { label: 'Thành viên', className: 'bg-blue-100 text-blue-700' },
    doctor: { label: 'Bác sĩ', className: 'bg-green-100 text-green-700' },
    staff: { label: 'Nhân viên', className: 'bg-purple-100 text-purple-700' },
    guest: { label: 'Khách', className: 'bg-gray-100 text-gray-600' },
  }
  const meta = map[role] ?? { label: role, className: 'bg-gray-100 text-gray-600' }
  return (
    <Badge variant="secondary" className={`text-xs ${meta.className}`}>
      {meta.label}
    </Badge>
  )
}

function ReplyThread({ reply, onRespond }: { reply: Reply; onRespond: (replyId: string, text: string) => Promise<void> }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSend() {
    if (!text.trim()) return
    setSaving(true)
    try {
      await onRespond(reply.id, text.trim())
      setText('')
      setOpen(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
      {/* User message */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-base">{reply.user_name}</span>
          <RoleTag role={reply.user_role} />
          <span className="text-xs text-muted-foreground">{formatDate(reply.created_at)}</span>
        </div>
        <p className="text-base">{reply.content}</p>
      </div>

      {/* Admin response */}
      {reply.admin_response ? (
        <div className="pl-4 border-l-2 border-primary/40 space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-primary">{reply.admin_name ?? 'Admin'}</span>
            <span className="text-xs text-muted-foreground">{formatDate(reply.admin_responded_at ?? '')}</span>
          </div>
          <p className="text-base">{reply.admin_response}</p>
        </div>
      ) : (
        <div>
          {open ? (
            <div className="space-y-2">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Nhập phản hồi của bạn..."
                className="min-h-[72px] text-base"
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSend}
                  disabled={saving || !text.trim()}
                  className="min-h-[36px]"
                >
                  {saving ? <Loader2 className="size-3 animate-spin mr-1" /> : <Send className="size-3 mr-1" />}
                  Gửi
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => { setOpen(false); setText('') }}
                  className="min-h-[36px]"
                >
                  Hủy
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen(true)}
              className="min-h-[36px] text-sm"
            >
              Phản hồi
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export function AnnouncementRepliesPanel({ announcementId, announcementTitle, allowReply }: Props) {
  const [replies, setReplies] = useState<Reply[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(true)

  const fetchReplies = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/announcements/${announcementId}/replies`)
      if (res.ok) {
        const data = await res.json()
        setReplies(Array.isArray(data) ? data : [])
      }
    } catch { /* keep empty */ }
    setLoading(false)
  }, [announcementId])

  useEffect(() => { fetchReplies() }, [fetchReplies])

  async function handleRespond(replyId: string, responseText: string) {
    // In demo mode, update in-memory via a dedicated admin-respond endpoint stub
    // For now we optimistically patch local state
    setReplies((prev) =>
      prev.map((r) =>
        r.id === replyId
          ? { ...r, admin_response: responseText, admin_name: 'Admin AIVIHE', admin_responded_at: new Date().toISOString() }
          : r
      )
    )
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-2 text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <MessageSquare className="size-4" />
        Phản hồi ({replies.length})
        {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
      </button>

      {!allowReply && (
        <p className="text-sm text-muted-foreground italic">Thông báo này không cho phép phản hồi.</p>
      )}

      {expanded && (
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center gap-2 py-4 text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              <span className="text-sm">Đang tải phản hồi...</span>
            </div>
          ) : replies.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">Chưa có phản hồi nào.</p>
          ) : (
            replies.map((r) => (
              <ReplyThread key={r.id} reply={r} onRespond={handleRespond} />
            ))
          )}
        </div>
      )}
    </div>
  )
}
