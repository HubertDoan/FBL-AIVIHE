'use client'

// Messaging page: two-panel layout (conversation list + message thread)
// Supports all 4 conversation types: admin, director, doctor, specialist
// Mobile: shows list OR thread, not both simultaneously

import { useCallback, useEffect, useState } from 'react'
import { Plus, ArrowLeft, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConversationListWithSearchAndTypeFilter } from '@/components/messages/conversation-list-with-search-and-type-filter'
import { MessageThreadWithBubblesAndInput } from '@/components/messages/message-thread-with-bubbles-and-input'
import { NewConversationStartDialog, type ContactOption } from '@/components/messages/new-conversation-start-dialog'
import type { Conversation, Message, ConversationType } from '@/lib/demo/demo-messaging-data'

// Contact list available per role for starting new conversations
const CONTACTS_BY_ROLE: Record<string, ContactOption[]> = {
  // Admin sees all users
  admin: [
    { id: 'demo-0001-0000-0000-000000000001', name: 'Nguyễn Văn Minh', role: 'citizen', roleLabel: 'Thành viên' },
    { id: 'demo-0005-0000-0000-000000000005', name: 'BS. Nguyễn Hải', role: 'doctor', roleLabel: 'Bác sĩ' },
    { id: 'demo-0008-0000-0000-000000000008', name: 'Trần Thị Ngọc Trâm', role: 'director', roleLabel: 'Giám đốc' },
    { id: 'demo-0013-0000-0000-000000000013', name: 'BS. Phạm Văn Đức', role: 'specialist', roleLabel: 'BS Chuyên khoa' },
  ],
  super_admin: [
    { id: 'demo-0001-0000-0000-000000000001', name: 'Nguyễn Văn Minh', role: 'citizen', roleLabel: 'Thành viên' },
    { id: 'demo-0005-0000-0000-000000000005', name: 'BS. Nguyễn Hải', role: 'doctor', roleLabel: 'Bác sĩ' },
    { id: 'demo-0008-0000-0000-000000000008', name: 'Trần Thị Ngọc Trâm', role: 'director', roleLabel: 'Giám đốc' },
    { id: 'demo-0006-0000-0000-000000000006', name: 'Admin AIVIHE', role: 'admin', roleLabel: 'Admin' },
  ],
  // Director sees all employees
  director: [
    { id: 'demo-0005-0000-0000-000000000005', name: 'BS. Nguyễn Hải', role: 'doctor', roleLabel: 'Bác sĩ' },
    { id: 'demo-0009-0000-0000-000000000009', name: 'Lưu Tuấn Khanh', role: 'branch_director', roleLabel: 'GĐ Chi nhánh' },
    { id: 'demo-0006-0000-0000-000000000006', name: 'Admin AIVIHE', role: 'admin', roleLabel: 'Admin' },
  ],
  branch_director: [
    { id: 'demo-0008-0000-0000-000000000008', name: 'Trần Thị Ngọc Trâm', role: 'director', roleLabel: 'Giám đốc' },
    { id: 'demo-0006-0000-0000-000000000006', name: 'Admin AIVIHE', role: 'admin', roleLabel: 'Admin' },
  ],
  // Doctor sees their patients
  doctor: [
    { id: 'demo-0001-0000-0000-000000000001', name: 'Nguyễn Văn Minh', role: 'citizen', roleLabel: 'Bệnh nhân' },
    { id: 'demo-0006-0000-0000-000000000006', name: 'Admin AIVIHE', role: 'admin', roleLabel: 'Admin' },
  ],
  // Specialist sees referred patients
  specialist: [
    { id: 'demo-0001-0000-0000-000000000001', name: 'Nguyễn Văn Minh', role: 'citizen', roleLabel: 'Bệnh nhân' },
    { id: 'demo-0006-0000-0000-000000000006', name: 'Admin AIVIHE', role: 'admin', roleLabel: 'Admin' },
  ],
  // Citizens see admin + their doctor
  citizen: [
    { id: 'demo-0006-0000-0000-000000000006', name: 'Admin AIVIHE', role: 'admin', roleLabel: 'Admin' },
    { id: 'demo-0005-0000-0000-000000000005', name: 'BS. Nguyễn Hải', role: 'doctor', roleLabel: 'Bác sĩ gia đình' },
    { id: 'demo-0013-0000-0000-000000000013', name: 'BS. Phạm Văn Đức', role: 'specialist', roleLabel: 'BS Chuyên khoa' },
  ],
}

// Default contacts for staff roles
const DEFAULT_CONTACTS: ContactOption[] = [
  { id: 'demo-0006-0000-0000-000000000006', name: 'Admin AIVIHE', role: 'admin', roleLabel: 'Admin' },
]

export default function MessagesPage() {
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [currentUserRole, setCurrentUserRole] = useState<string>('')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [sending, setSending] = useState(false)
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [mobileView, setMobileView] = useState<'list' | 'thread'>('list')
  const [loading, setLoading] = useState(true)

  // Load current user info
  useEffect(() => {
    fetch('/api/demo/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setCurrentUserId(data.user.id)
          setCurrentUserRole(data.user.role)
        }
      })
      .catch(() => {})
  }, [])

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/messages')
      if (res.ok) {
        const data = await res.json()
        setConversations(data.conversations ?? [])
      }
    } catch {
      // silently handle
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadConversations()
    // Poll every 30 seconds
    const interval = setInterval(loadConversations, 30_000)
    return () => clearInterval(interval)
  }, [loadConversations])

  // Load messages for selected conversation
  const loadMessages = useCallback(async (convId: string) => {
    try {
      const res = await fetch(`/api/messages/${convId}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages ?? [])
        // Mark as read
        await fetch(`/api/messages/${convId}`, { method: 'PATCH' })
        // Update local unread count
        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId
              ? { ...c, unreadCounts: { ...c.unreadCounts, [currentUserId]: 0 } }
              : c
          )
        )
      }
    } catch {
      // silently handle
    }
  }, [currentUserId])

  function handleSelectConversation(conv: Conversation) {
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
        await loadMessages(selectedConv.id)
        await loadConversations()
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
    const newConv: Conversation = await res.json()
    await loadConversations()
    handleSelectConversation(newConv)
  }

  const contacts = CONTACTS_BY_ROLE[currentUserRole] ?? DEFAULT_CONTACTS

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
