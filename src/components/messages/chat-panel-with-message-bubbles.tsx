'use client'

// Chat panel: renders message bubbles (self=right/blue, other=left/gray)
// Auto-scrolls to bottom on new messages
// Accepts normalized MessageUI shape — works for both demo and Supabase production mode
// Self bubble: bg-blue-600 text-white; Other bubble: bg-slate-100 text-slate-900
// Read receipts: ✓ sent, ✓✓ read

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import type { MessageUI } from '@/lib/types/messaging-ui-normalized-types'

function formatTime(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  const time = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  if (isToday) return time
  const date = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
  return `${date} ${time}`
}

interface ChatPanelWithMessageBubblesProps {
  messages: MessageUI[]
  currentUserId: string
}

export function ChatPanelWithMessageBubbles({
  messages,
  currentUserId,
}: ChatPanelWithMessageBubblesProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex flex-col h-full">
      {/* Message bubbles */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-base text-muted-foreground">
              Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender_id === currentUserId
            return (
              <div
                key={msg.id}
                className={cn('flex gap-2', isOwn ? 'justify-end' : 'justify-start')}
              >
                {/* Other sender avatar */}
                {!isOwn && (
                  <div className="size-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold shrink-0 mt-1">
                    {msg.sender_name[0]?.toUpperCase() ?? '?'}
                  </div>
                )}

                <div className={cn('max-w-[70%] space-y-1', isOwn ? 'items-end' : 'items-start')}>
                  {/* Sender name (only for others) */}
                  {!isOwn && (
                    <p className="text-xs text-muted-foreground px-1">{msg.sender_name}</p>
                  )}

                  {/* Bubble */}
                  <div
                    className={cn(
                      'px-4 py-2.5 rounded-2xl text-base leading-relaxed break-words',
                      isOwn
                        ? 'bg-blue-600 text-white rounded-br-sm'
                        : 'bg-slate-100 text-slate-900 rounded-bl-sm'
                    )}
                  >
                    {msg.content}
                  </div>

                  {/* Timestamp + read receipt */}
                  <div
                    className={cn(
                      'flex items-center gap-1 px-1',
                      isOwn ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <span className="text-xs text-muted-foreground">{formatTime(msg.created_at)}</span>
                    {isOwn && (
                      <span className="text-xs text-muted-foreground">
                        {msg.is_read ? '✓✓' : '✓'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Own avatar */}
                {isOwn && (
                  <div className="size-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-700 shrink-0 mt-1">
                    {msg.sender_name[0]?.toUpperCase() ?? '?'}
                  </div>
                )}
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
