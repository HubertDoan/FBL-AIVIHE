'use client'

// Message thread panel: chat bubbles (own=right/blue, other=left/gray), auto-scroll, send input
// Used in /dashboard/messages page right panel

import { useEffect, useRef, useState } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { Conversation, Message } from '@/lib/demo/demo-messaging-data'

function formatTime(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  const time = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  if (isToday) return time
  const date = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
  return `${date} ${time}`
}

interface MessageThreadWithBubblesAndInputProps {
  conversation: Conversation
  messages: Message[]
  currentUserId: string
  sending: boolean
  onSend: (content: string) => void
}

export function MessageThreadWithBubblesAndInput({
  conversation,
  messages,
  currentUserId,
  sending,
  onSend,
}: MessageThreadWithBubblesAndInputProps) {
  const [draft, setDraft] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSend() {
    const content = draft.trim()
    if (!content || sending) return
    onSend(content)
    setDraft('')
    textareaRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Ctrl+Enter or Cmd+Enter to send
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Thread header */}
      <div className="px-4 py-3 border-b border-border">
        <p className="text-base font-semibold">{conversation.subject}</p>
        <p className="text-sm text-muted-foreground">{messages.length} tin nhắn</p>
      </div>

      {/* Message bubbles */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-base text-muted-foreground">Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.senderId === currentUserId
            return (
              <div key={msg.id} className={cn('flex gap-2', isOwn ? 'justify-end' : 'justify-start')}>
                {/* Other sender avatar */}
                {!isOwn && (
                  <div className="size-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold shrink-0 mt-1">
                    {msg.senderName[0]?.toUpperCase() ?? '?'}
                  </div>
                )}

                <div className={cn('max-w-[70%] space-y-1', isOwn ? 'items-end' : 'items-start')}>
                  {/* Sender name (only for others) */}
                  {!isOwn && (
                    <p className="text-xs text-muted-foreground px-1">{msg.senderName}</p>
                  )}

                  {/* Bubble */}
                  <div
                    className={cn(
                      'px-4 py-2.5 rounded-2xl text-base leading-relaxed break-words',
                      isOwn
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-muted text-foreground rounded-bl-sm'
                    )}
                  >
                    {msg.content}
                  </div>

                  {/* Timestamp + read receipt */}
                  <div className={cn('flex items-center gap-1 px-1', isOwn ? 'justify-end' : 'justify-start')}>
                    <span className="text-xs text-muted-foreground">{formatTime(msg.createdAt)}</span>
                    {isOwn && (
                      <span className="text-xs text-muted-foreground">
                        {msg.readAt ? '✓✓' : '✓'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Own avatar */}
                {isOwn && (
                  <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary shrink-0 mt-1">
                    {msg.senderName[0]?.toUpperCase() ?? '?'}
                  </div>
                )}
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="p-3 border-t border-border bg-background">
        <div className="flex gap-2 items-end">
          <Textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập tin nhắn... (Ctrl+Enter để gửi)"
            className="flex-1 min-h-[48px] max-h-32 resize-none text-base"
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={!draft.trim() || sending}
            size="icon"
            className="size-12 shrink-0"
            aria-label="Gửi tin nhắn"
          >
            {sending ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Ctrl+Enter để gửi</p>
      </div>
    </div>
  )
}
