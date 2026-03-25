'use client'

import { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, MessageCircle, CheckCircle, Eye, Filter } from 'lucide-react'
import type { DirectorReply, DirectorAnnouncement } from '@/lib/demo/demo-director-announcement-data'

type FilterStatus = 'all' | 'unread' | 'read' | 'resolved'

interface ReplyWithAnnouncement extends DirectorReply {
  announcement_title?: string
}

const FILTER_OPTIONS: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'unread', label: 'Chưa đọc' },
  { value: 'read', label: 'Đã đọc' },
  { value: 'resolved', label: 'Đã xử lý' },
]

const ROLE_LABELS: Record<string, string> = {
  citizen: 'Thành viên',
  doctor: 'Bác sĩ',
  branch_director: 'GĐ chi nhánh',
  director: 'Giám đốc',
  admin: 'Quản trị viên',
  reception: 'Tiếp đón',
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

interface Props {
  announcements: DirectorAnnouncement[]
}

export function DirectorFeedbackInbox({ announcements }: Props) {
  const [replies, setReplies] = useState<ReplyWithAnnouncement[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchReplies = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch replies for each announcement owned by director
      const allReplies: ReplyWithAnnouncement[] = []
      for (const ann of announcements) {
        const res = await fetch(`/api/director/announcements/${ann.id}`)
        if (res.ok) {
          const data = await res.json()
          const annReplies: DirectorReply[] = data.replies ?? []
          annReplies.forEach((r) => {
            allReplies.push({ ...r, announcement_title: ann.title })
          })
        }
      }
      allReplies.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      setReplies(allReplies)
    } catch {
      // keep empty
    }
    setLoading(false)
  }, [announcements])

  useEffect(() => {
    if (announcements.length > 0) {
      fetchReplies()
    } else {
      setLoading(false)
    }
  }, [announcements, fetchReplies])

  async function handleMarkRead(replyId: string, announcementId: string) {
    try {
      await fetch(`/api/director/announcements/${announcementId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _action: 'mark_read', reply_id: replyId }),
      })
      setReplies((prev) =>
        prev.map((r) => (r.id === replyId ? { ...r, is_read: true } : r))
      )
    } catch {
      // ignore
    }
  }

  async function handleResolve(replyId: string, announcementId: string) {
    if (!replyText.trim()) return
    setSubmitting(true)
    try {
      await fetch(`/api/director/announcements/${announcementId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          _action: 'mark_resolved',
          reply_id: replyId,
          director_reply: replyText.trim(),
        }),
      })
      setReplies((prev) =>
        prev.map((r) =>
          r.id === replyId
            ? { ...r, is_resolved: true, is_read: true, director_reply: replyText.trim() }
            : r
        )
      )
      setReplyingTo(null)
      setReplyText('')
    } catch {
      // ignore
    }
    setSubmitting(false)
  }

  const filtered = replies.filter((r) => {
    if (filter === 'unread') return !r.is_read
    if (filter === 'read') return r.is_read && !r.is_resolved
    if (filter === 'resolved') return r.is_resolved
    return true
  })

  const unreadCount = replies.filter((r) => !r.is_read).length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="size-4 text-muted-foreground shrink-0" />
        {FILTER_OPTIONS.map((opt) => (
          <Button
            key={opt.value}
            variant={filter === opt.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(opt.value)}
            className="min-h-[40px] text-base"
          >
            {opt.label}
            {opt.value === 'unread' && unreadCount > 0 && (
              <Badge className="ml-1.5 bg-red-500 text-white text-xs px-1.5 py-0">
                {unreadCount}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-lg">
          <MessageCircle className="size-10 mx-auto mb-3 opacity-40" />
          Không có phản hồi nào
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((reply) => (
            <Card
              key={reply.id}
              className={!reply.is_read ? 'border-orange-200 dark:border-orange-800' : ''}
            >
              <CardHeader className="pb-2 pt-4">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="space-y-0.5">
                    <p className="text-sm text-muted-foreground">
                      Về: <span className="text-foreground font-medium">{reply.announcement_title}</span>
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-base font-semibold">
                        {reply.author_name}
                      </CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {ROLE_LABELS[reply.author_role] ?? reply.author_role}
                      </Badge>
                      {!reply.is_read && (
                        <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400 text-xs">
                          Chưa đọc
                        </Badge>
                      )}
                      {reply.is_resolved && (
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 text-xs">
                          Đã xử lý
                        </Badge>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground shrink-0">
                    {formatDate(reply.created_at)}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 pb-4">
                <p className="text-base leading-relaxed">{reply.content}</p>

                {/* Director reply shown if resolved */}
                {reply.director_reply && (
                  <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg px-4 py-3 border-l-4 border-blue-400">
                    <p className="text-sm text-blue-700 dark:text-blue-400 font-medium mb-1">
                      Phản hồi của bạn:
                    </p>
                    <p className="text-base text-blue-800 dark:text-blue-300">{reply.director_reply}</p>
                  </div>
                )}

                {/* Action buttons */}
                {!reply.is_resolved && (
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    {!reply.is_read && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkRead(reply.id, reply.announcement_id)}
                        className="min-h-[40px] text-base gap-1.5"
                      >
                        <Eye className="size-4" />
                        Đánh dấu đã đọc
                      </Button>
                    )}
                    {replyingTo !== reply.id ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setReplyingTo(reply.id)
                          setReplyText('')
                          if (!reply.is_read) {
                            handleMarkRead(reply.id, reply.announcement_id)
                          }
                        }}
                        className="min-h-[40px] text-base gap-1.5"
                      >
                        <MessageCircle className="size-4" />
                        Trả lời & xử lý
                      </Button>
                    ) : (
                      <div className="w-full space-y-2">
                        <Textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Nhập nội dung trả lời..."
                          className="min-h-[80px] text-base"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleResolve(reply.id, reply.announcement_id)}
                            disabled={submitting || !replyText.trim()}
                            className="min-h-[40px] text-base gap-1.5"
                          >
                            {submitting
                              ? <Loader2 className="size-4 animate-spin" />
                              : <CheckCircle className="size-4" />
                            }
                            Gửi & đánh dấu đã xử lý
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setReplyingTo(null); setReplyText('') }}
                            className="min-h-[40px] text-base"
                          >
                            Hủy
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
