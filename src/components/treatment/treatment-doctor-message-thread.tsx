'use client'

// TreatmentDoctorMessageThread — message thread between patient and doctors within a treatment episode
// Supports sending to family doctor or exam doctor (if follow_up_needed)

import { useState } from 'react'
import { MessageSquare, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { TreatmentMessage } from '@/lib/demo/demo-treatment-data'

interface Props {
  treatmentId: string
  messages: TreatmentMessage[]
  currentUserId: string
  currentUserName: string
  hasFollowUp: boolean
  onMessageSent: (msg: TreatmentMessage) => void
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function roleName(role: TreatmentMessage['from_role']) {
  if (role === 'doctor') return 'BS gia đình'
  if (role === 'exam_doctor') return 'BS điều trị'
  return 'Bạn'
}

export function TreatmentDoctorMessageThread({
  treatmentId,
  messages,
  currentUserId,
  currentUserName,
  hasFollowUp,
  onMessageSent,
}: Props) {
  const [content, setContent] = useState('')
  const [target, setTarget] = useState<'doctor' | 'exam_doctor'>('doctor')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setError('')
    setSending(true)
    try {
      const res = await fetch(`/api/treatment/${treatmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_message',
          from_id: currentUserId,
          from_name: currentUserName,
          from_role: 'citizen',
          target_role: target,
          content: content.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Lỗi khi gửi tin nhắn.'); return }
      onMessageSent(data.message)
      setContent('')
    } catch {
      setError('Không thể kết nối máy chủ.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="size-5 text-primary" />
        <span className="text-base font-semibold">Tin nhắn với bác sĩ</span>
      </div>

      {/* Message thread */}
      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {messages.length === 0 ? (
          <p className="text-muted-foreground text-base text-center py-6">
            Chưa có tin nhắn nào. Hãy đặt câu hỏi cho bác sĩ!
          </p>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.from_id === currentUserId
            return (
              <div key={msg.id} className={`flex flex-col gap-1 ${isOwn ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-base ${
                  isOwn
                    ? 'bg-primary text-primary-foreground rounded-tr-sm'
                    : 'bg-muted rounded-tl-sm'
                }`}>
                  <p>{msg.content}</p>
                </div>
                <p className="text-xs text-muted-foreground px-1">
                  {isOwn ? 'Bạn' : `${msg.from_name} (${roleName(msg.from_role)})`} · {formatDate(msg.created_at)}
                </p>
              </div>
            )
          })
        )}
      </div>

      {/* Send form */}
      <form onSubmit={handleSend} className="space-y-3 border-t pt-4">
        {hasFollowUp && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTarget('doctor')}
              className={`flex-1 min-h-[44px] rounded-lg border text-sm font-medium transition-colors ${
                target === 'doctor' ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-accent'
              }`}
            >
              Hỏi BS gia đình
            </button>
            <button
              type="button"
              onClick={() => setTarget('exam_doctor')}
              className={`flex-1 min-h-[44px] rounded-lg border text-sm font-medium transition-colors ${
                target === 'exam_doctor' ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-accent'
              }`}
            >
              Hỏi BS điều trị
            </button>
          </div>
        )}

        <div className="flex gap-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`Nhắn ${target === 'exam_doctor' ? 'BS điều trị' : 'BS gia đình'}...`}
            rows={2}
            className="flex-1 border border-border rounded-lg px-3 py-2 text-base bg-background resize-none"
          />
          <Button
            type="submit"
            disabled={sending || !content.trim()}
            className="min-h-[48px] px-4 self-end"
            aria-label="Gửi tin nhắn"
          >
            <Send className="size-4" />
          </Button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </form>
    </div>
  )
}
