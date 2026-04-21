'use client'

// Messaging page: two-panel layout (conversation list + message thread)
// Supports demo mode (in-memory) and production mode (Supabase + Realtime)
// Mobile: shows list OR thread, not both simultaneously

import { useCallback, useEffect, useRef, useState } from 'react'
import { Plus, ArrowLeft, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConversationListWithSearchAndTypeFilter } from '@/components/messages/conversation-list-with-search-and-type-filter'
import { MessageThreadWithBubblesAndInput } from '@/components/messages/message-thread-with-bubbles-and-input'
import { NewConversationStartDialog, type ContactOption } from '@/components/messages/new-conversation-start-dialog'
import { useSupabaseMessagesRealtimeSubscription } from '@/lib/hooks/use-supabase-messages-realtime-subscription'
import type { ConversationUI, MessageUI } from '@/lib/types/messaging-ui-normalized-types'
import type { Conversation, Message, ConversationType } from '@/lib/demo/demo-messaging-data'

// Role label mapping for display
const ROLE_LABELS: Record<string, string> = {
  citizen: 'Thành viên',
  guest: 'Khách',
  doctor: 'Bác sĩ',
  specialist: 'BS Chuyên khoa',
  admin: 'Admin',
  super_admin: 'Super Admin',
  director: 'Giám đốc',
  branch_director: 'GĐ Chi nhánh',
  reception: 'Tiếp đón',
  exam_doctor: 'BS Khám bệnh',
  staff: 'Nhân viên',
  accountant: 'Kế toán',
  admin_staff: 'Hành chính',
  manager: 'Quản lý',
  technician: 'Kỹ thuật',
  tech_assistant: 'Kỹ thuật viên',
  nurse: 'Điều dưỡng',
  support_staff: 'Nhân viên hỗ trợ',
  intern: 'Nhân viên thực tập',
}

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

// Normalize demo Conversation → ConversationUI
function normalizeDemoConversation(c: Conversation, currentUserId: string): ConversationUI {
  return {
    id: c.id,
    participant_ids: c.participants,
    type: c.type,
    subject: c.subject,
    last_message: c.lastMessage,
    last_message_at: c.lastMessageAt,
    unread_count: c.unreadCounts[currentUserId] ?? 0,
    created_at: c.createdAt,
  }
}

// Normalize demo Message → MessageUI
function normalizeDemoMessage(m: Message): MessageUI {
  return {
    id: m.id,
    conversation_id: m.conversationId,
    sender_id: m.senderId,
    sender_name: m.senderName,
    content: m.content,
    is_read: m.readAt !== null,
    created_at: m.createdAt,
  }
}

// Normalize Supabase conversation row → ConversationUI
function normalizeSupabaseConversation(
  c: Record<string, unknown>,
  currentUserId: string
): ConversationUI {
  return {
    id: c.id as string,
    participant_ids: (c.participant_ids as string[]) ?? [],
    type: (c.type as ConversationUI['type']) ?? undefined,
    subject: (c.subject as string) ?? undefined,
    last_message: (c.last_message as string) ?? '',
    last_message_at: (c.last_message_at as string) ?? (c.created_at as string),
    unread_count: 0, // Supabase doesn't track per-user unread count in schema
    created_at: c.created_at as string,
  }
}

export default function MessagesPage() {
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [currentUserRole, setCurrentUserRole] = useState<string>('')
  const [conversations, setConversations] = useState<ConversationUI[]>([])
  const [selectedConv, setSelectedConv] = useState<ConversationUI | null>(null)
  const [messages, setMessages] = useState<MessageUI[]>([])
  const [sending, setSending] = useState(false)
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [mobileView, setMobileView] = useState<'list' | 'thread'>('list')
  const [loading, setLoading] = useState(true)
  const [allContacts, setAllContacts] = useState<ContactOption[]>([])

  // Stable callback ref so Realtime hook doesn't re-subscribe on every render
  const onNewMessageRef = useRef<(msg: MessageUI) => void>(() => {})
  onNewMessageRef.current = (msg: MessageUI) => {
    setMessages((prev) => {
      // Deduplicate by id
      if (prev.some((m) => m.id === msg.id)) return prev
      return [...prev, msg]
    })
    // Refresh conversation list to update last_message preview
    loadConversations()
  }

  const stableOnNewMessage = useCallback((msg: MessageUI) => {
    onNewMessageRef.current(msg)
  }, [])

  // Supabase Realtime subscription (no-op in demo mode)
  useSupabaseMessagesRealtimeSubscription({
    conversationId: selectedConv?.id ?? null,
    onNewMessage: stableOnNewMessage,
  })

  // Load current user info + contacts
  useEffect(() => {
    // Demo mode: use demo/me; Production: use /api/profile (returns { citizen })
    const userEndpoint = isDemoMode ? '/api/demo/me' : '/api/profile'
    fetch(userEndpoint)
      .then((r) => r.json())
      .then((data) => {
        if (isDemoMode) {
          const u = data.user
          if (u?.id) { setCurrentUserId(u.id); setCurrentUserRole(u.role ?? '') }
        } else {
          const c = data.citizen
          if (c?.id) { setCurrentUserId(c.id); setCurrentUserRole(c.role ?? '') }
        }
      })
      .catch(() => {})

    // Contacts only available in demo mode for now
    // Production: members see only their conversations; staff initiate from admin panel
    if (isDemoMode) {
      fetch('/api/demo/accounts')
        .then((r) => r.json())
        .then((data) => {
          const list = Array.isArray(data) ? data : []
          setAllContacts(
            list.map((a: { id: string; fullName: string; role: string }) => ({
              id: a.id,
              name: a.fullName,
              role: a.role,
              roleLabel: ROLE_LABELS[a.role] ?? a.role,
            }))
          )
        })
        .catch(() => {})
    }
  }, [])

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/messages')
      if (!res.ok) return
      const data = await res.json()
      const raw: ConversationUI[] = (data.conversations ?? []).map(
        (c: Record<string, unknown>) =>
          isDemoMode
            ? normalizeDemoConversation(c as unknown as Conversation, currentUserId)
            : normalizeSupabaseConversation(c, currentUserId)
      )
      setConversations(raw)
    } catch {
      // silently handle
    } finally {
      setLoading(false)
    }
  }, [currentUserId])

  useEffect(() => {
    if (!currentUserId) return
    loadConversations()
    // Poll every 30s in demo mode; Realtime handles updates in production
    if (isDemoMode) {
      const interval = setInterval(loadConversations, 30_000)
      return () => clearInterval(interval)
    }
  }, [loadConversations, currentUserId])

  // Load messages for selected conversation
  const loadMessages = useCallback(async (convId: string) => {
    try {
      const res = await fetch(`/api/messages/${convId}`)
      if (!res.ok) return
      const data = await res.json()
      const raw: MessageUI[] = (data.messages ?? []).map((m: Record<string, unknown>) =>
        isDemoMode
          ? normalizeDemoMessage(m as unknown as Message)
          : {
              id: m.id as string,
              conversation_id: m.conversation_id as string,
              sender_id: m.sender_id as string,
              sender_name: (m.sender_name as string) ?? 'Người dùng',
              content: m.content as string,
              is_read: (m.is_read as boolean) ?? false,
              created_at: m.created_at as string,
            }
      )
      setMessages(raw)
      // Mark as read
      await fetch(`/api/messages/${convId}`, { method: 'PATCH' })
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, unread_count: 0 } : c))
      )
    } catch {
      // silently handle
    }
  }, [])

  function handleSelectConversation(conv: ConversationUI) {
    setSelectedConv(conv)
    setMobileView('thread')
    if (currentUserId) loadMessages(conv.id)
  }

  async function handleSend(content: string) {
    if (!selectedConv) return
    setSending(true)
    try {
      const res = await fetch(`/api/messages/${selectedConv.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      if (res.ok) {
        // In demo mode, reload messages (no realtime); production uses Realtime
        if (isDemoMode) {
          await loadMessages(selectedConv.id)
          await loadConversations()
        }
      }
    } catch {
      // silently handle
    } finally {
      setSending(false)
    }
  }

  async function handleStartConversation(
    recipientId: string,
    type: ConversationType,
    subject: string,
    firstMessage: string
  ) {
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipientId, type, subject, firstMessage }),
    })
    if (!res.ok) throw new Error('Không thể tạo cuộc trò chuyện')
    const raw = await res.json()
    await loadConversations()
    // Normalize and select the new conversation
    const newConv: ConversationUI = isDemoMode
      ? normalizeDemoConversation(raw as Conversation, currentUserId)
      : normalizeSupabaseConversation(raw as Record<string, unknown>, currentUserId)
    handleSelectConversation(newConv)
  }

  const contacts = allContacts
    .filter((c) => c.id !== currentUserId)
    .sort((a, b) => a.role.localeCompare(b.role) || a.name.localeCompare(b.name))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-base text-muted-foreground">Đang tải...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Page header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <MessageCircle className="size-6" />
          Tin nhắn
        </h1>
        <Button
          onClick={() => setShowNewDialog(true)}
          size="sm"
          className="text-base gap-2"
        >
          <Plus className="size-4" />
          <span className="hidden sm:inline">Tin nhắn mới</span>
          <span className="sm:hidden">Mới</span>
        </Button>
      </div>

      {/* Two-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel: conversation list — hidden on mobile when viewing thread */}
        <div className={`
          w-full lg:w-80 lg:border-r lg:border-border lg:flex lg:flex-col
          ${mobileView === 'thread' ? 'hidden lg:flex' : 'flex flex-col'}
        `}>
          <ConversationListWithSearchAndTypeFilter
            conversations={conversations}
            selectedId={selectedConv?.id ?? null}
            currentUserId={currentUserId}
            onSelect={handleSelectConversation}
          />
        </div>

        {/* Right panel: message thread — hidden on mobile when viewing list */}
        <div className={`
          flex-1
          ${mobileView === 'list' ? 'hidden lg:flex lg:flex-col' : 'flex flex-col'}
        `}>
          {selectedConv ? (
            <div className="flex flex-col h-full">
              {/* Mobile back button */}
              <button
                onClick={() => setMobileView('list')}
                className="lg:hidden flex items-center gap-2 px-4 py-2 border-b border-border text-base text-primary"
              >
                <ArrowLeft className="size-4" />
                Danh sách
              </button>
              <MessageThreadWithBubblesAndInput
                conversation={selectedConv}
                messages={messages}
                currentUserId={currentUserId}
                sending={sending}
                onSend={handleSend}
              />
            </div>
          ) : (
            <div className="hidden lg:flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
              <MessageCircle className="size-12 opacity-30" />
              <p className="text-lg">Chọn một cuộc trò chuyện để bắt đầu</p>
            </div>
          )}
        </div>
      </div>

      {/* New conversation dialog */}
      <NewConversationStartDialog
        open={showNewDialog}
        contacts={contacts}
        onClose={() => setShowNewDialog(false)}
        onStart={handleStartConversation}
      />
    </div>
  )
}
