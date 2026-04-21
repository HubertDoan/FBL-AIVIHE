'use client'

// Message input bar with send button
// Enter = send, Shift+Enter = new line
// Used at the bottom of the chat panel in /dashboard/messages

import { useRef, useState } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface MessageInputWithSendButtonProps {
  sending: boolean
  onSend: (content: string) => void
}

export function MessageInputWithSendButton({
  sending,
  onSend,
}: MessageInputWithSendButtonProps) {
  const [draft, setDraft] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleSend() {
    const content = draft.trim()
    if (!content || sending) return
    onSend(content)
    setDraft('')
    textareaRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Enter sends; Shift+Enter inserts newline
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="p-3 border-t border-border bg-background">
      <div className="flex gap-2 items-end">
        <Textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nhập tin nhắn... (Enter để gửi, Shift+Enter xuống dòng)"
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
          {sending ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <Send className="size-5" />
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Enter để gửi · Shift+Enter xuống dòng
      </p>
    </div>
  )
}
