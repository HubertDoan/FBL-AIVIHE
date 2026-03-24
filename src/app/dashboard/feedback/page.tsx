'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, Send, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import type { Feedback, FeedbackCategory, FeedbackStatus } from '@/types/database'

const CATEGORIES: { value: FeedbackCategory; label: string }[] = [
  { value: 'bug', label: 'Lỗi kỹ thuật' },
  { value: 'feature_request', label: 'Góp ý tính năng' },
  { value: 'ui_suggestion', label: 'Góp ý giao diện' },
  { value: 'ai_feedback', label: 'Phản hồi về AI' },
  { value: 'general', label: 'Chung' },
]

const STATUS_LABELS: Record<FeedbackStatus, string> = {
  pending: 'Đang chờ',
  reviewing: 'Đang xem xét',
  resolved: 'Đã giải quyết',
  closed: 'Đã đóng',
}

const STATUS_VARIANTS: Record<FeedbackStatus, 'default' | 'secondary' | 'outline'> = {
  pending: 'outline',
  reviewing: 'default',
  resolved: 'secondary',
  closed: 'outline',
}

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [category, setCategory] = useState<FeedbackCategory>('general')
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function loadFeedbacks() {
    try {
      const res = await fetch('/api/feedback')
      const data = await res.json()
      if (res.ok) setFeedbacks(data.feedbacks ?? [])
    } catch { /* ignore */ }
    setLoading(false)
  }

  useEffect(() => { loadFeedbacks() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, content }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Gửi thất bại.'); return }
      setSuccess(true)
      setContent('')
      loadFeedbacks()
    } catch {
      setError('Lỗi kết nối. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Góp ý &amp; Phản hồi</h1>
        <p className="text-muted-foreground mt-1">
          Giúp chúng tôi cải thiện AIVIHE
        </p>
      </div>

      {/* Submit Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="size-5" />
            Gửi góp ý mới
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-base font-medium mb-2">Danh mục</label>
              <Select value={category} onValueChange={(v) => setCategory(v as FeedbackCategory)}>
                <SelectTrigger className="w-full min-h-[48px] text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-base font-medium mb-2">Nội dung</label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Mô tả chi tiết góp ý của bạn..."
                className="text-base min-h-[120px]"
                maxLength={5000}
                required
              />
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-destructive text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-lg bg-green-50 p-3 text-green-700 text-sm">
                Gửi góp ý thành công! Cảm ơn bạn.
              </div>
            )}

            <Button
              type="submit"
              disabled={submitting || !content.trim()}
              className="min-h-[48px] text-base gap-2"
            >
              {submitting ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
              Gửi góp ý
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Past Feedbacks */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Góp ý đã gửi</h2>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : feedbacks.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Bạn chưa gửi góp ý nào
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {feedbacks.map((fb) => (
              <Card key={fb.id}>
                <CardContent className="pt-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="secondary">
                      {CATEGORIES.find((c) => c.value === fb.category)?.label ?? fb.category}
                    </Badge>
                    <Badge variant={STATUS_VARIANTS[fb.status]}>
                      {STATUS_LABELS[fb.status]}
                    </Badge>
                  </div>
                  <p className="text-base">{fb.content}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(fb.created_at).toLocaleDateString('vi-VN')}
                  </p>
                  {fb.admin_response && (
                    <div className="mt-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
                      <p className="font-medium mb-1">Phản hồi từ quản trị:</p>
                      <p>{fb.admin_response}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
