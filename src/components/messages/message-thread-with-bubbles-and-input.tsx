'use client'

// Message thread panel: combines ChatPanelWithMessageBubbles + MessageInputWithSendButton
// Accepts normalized ConversationUI + MessageUI shapes — works for demo and Supabase production
// Used as the right panel in /dashboard/messages page

import { ChatPanelWithMessageBubbles } from '@/components/messages/chat-panel-with-message-bubbles'
import { MessageInputWithSendButton } from '@/components/messages/message-input-with-send-button'
import type { ConversationUI, MessageUI } from '@/lib/types/messaging-ui-normalized-types'

interface MessageThreadWithBubblesAndInputProps {
  conversation: ConversationUI
  messages: MessageUI[]
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
  return (
    <div className="flex flex-col h-full">
      {/* Thread header */}
      <div className="px-4 py-3 border-b border-border">
        <p className="text-base font-semibold">
          {conversation.subject ?? 'Cuộc trò chuyện'}
        </p>
        <p className="text-sm text-muted-foreground">{messages.length} tin nhắn</p>
      </div>

      {/* Bubbles — fills remaining space */}
      <div className="flex-1 overflow-hidden">
        <ChatPanelWithMessageBubbles
          messages={messages}
          currentUserId={currentUserId}
        />
      </div>

      {/* Input bar */}
      <MessageInputWithSendButton sending={sending} onSend={onSend} />
    </div>
  )
}
