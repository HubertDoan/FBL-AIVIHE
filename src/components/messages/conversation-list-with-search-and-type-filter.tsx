'use client'

// Conversation list panel: shows all conversations with search and type filter tabs
// Used in /dashboard/messages page left panel

import { useState } from 'react'
import { MessageCircle, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { Conversation } from '@/lib/demo/demo-messaging-data'

type FilterTab = 'all' | 'admin' | 'director' | 'doctor' | 'specialist'

const TYPE_LABELS: Record<string, string> = {
  admin: 'Admin',
  director: 'Giám đốc',
  doctor: 'Bác sĩ',
  specialist: 'Chuyên khoa',
}

const TYPE_COLORS: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700',
  director: 'bg-indigo-100 text-indigo-700',
  doctor: 'bg-green-100 text-green-700',
  specialist: 'bg-teal-100 text-teal-700',
}

const TABS: { value: FilterTab; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'admin', label: 'Admin' },
  { value: 'director', label: 'Giám đốc' },
  { value: 'doctor', label: 'Bác sĩ' },
  { value: 'specialist', label: 'Chuyên khoa' },
]

function timeShort(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'Vừa xong'
  if (mins < 60) return `${mins}ph`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}g`
  return `${Math.floor(hours / 24)}ng`
}

interface ConversationListWithSearchAndTypeFilterProps {
  conversations: Conversation[]
  selectedId: string | null
  currentUserId: string
  onSelect: (conv: Conversation) => void
}

export function ConversationListWithSearchAndTypeFilter({
  conversations,
  selectedId,
  currentUserId,
  onSelect,
}: ConversationListWithSearchAndTypeFilterProps) {
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<FilterTab>('all')

  const filtered = conversations.filter((c) => {
    const matchTab = activeTab === 'all' || c.type === activeTab
    const matchSearch = search.trim() === '' || c.subject.toLowerCase().includes(search.toLowerCase()) || c.lastMessage.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm..."
            className="pl-9 text-base"
          />
        </div>
      </div>

      {/* Type filter tabs */}
      <div className="flex gap-1 p-2 border-b border-border overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
              activeTab === tab.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Conversation items */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground gap-2">
            <MessageCircle className="size-8 opacity-40" />
            <p className="text-base">Không có cuộc trò chuyện</p>
          </div>
        ) : (
          filtered.map((conv) => {
            const unread = conv.unreadCounts[currentUserId] ?? 0
            return (
              <button
                key={conv.id}
                onClick={() => onSelect(conv)}
                className={cn(
                  'w-full text-left px-4 py-3 border-b border-border/50 hover:bg-accent transition-colors',
                  selectedId === conv.id && 'bg-primary/5 border-l-2 border-l-primary'
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar placeholder */}
                  <div className="size-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <MessageCircle className="size-5 text-muted-foreground" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className={cn('text-base truncate', unread > 0 ? 'font-semibold' : 'font-medium')}>
                        {conv.subject}
                      </p>
                      <span className="text-xs text-muted-foreground shrink-0">{timeShort(conv.lastMessageAt)}</span>
                    </div>

                    <div className="flex items-center justify-between gap-1 mt-0.5">
                      <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className={cn('text-xs px-2 py-0.5 rounded-full', TYPE_COLORS[conv.type])}>
                          {TYPE_LABELS[conv.type]}
                        </span>
                        {unread > 0 && (
                          <span className="size-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {unread > 9 ? '9+' : unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
