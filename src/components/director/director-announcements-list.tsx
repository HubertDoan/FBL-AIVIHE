'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react'
import type { DirectorAnnouncement } from '@/lib/demo/demo-director-announcement-data'
import type { DirectorAnnouncementFormData } from './director-announcement-form'

const CATEGORY_LABELS: Record<string, { label: string; className: string }> = {
  activity: { label: 'Hoạt động', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' },
  professional: { label: 'Chuyên môn', className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400' },
  event: { label: 'Sự kiện', className: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' },
  program: { label: 'Chương trình', className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400' },
}

const PRIORITY_LABELS: Record<string, { label: string; className: string }> = {
  normal: { label: 'Bình thường', className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
  important: { label: 'Quan trọng', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' },
  urgent: { label: 'Khẩn cấp', className: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' },
}

const TARGET_LABELS: Record<string, string> = {
  all: 'Tất cả thành viên',
  group: 'Nhóm',
  individual: 'Cá nhân',
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    })
  } catch { return '' }
}

interface Props {
  items: DirectorAnnouncement[]
  loading: boolean
  onCreateClick: () => void
  onEditClick: (item: DirectorAnnouncement) => void
  onDeleteClick: (id: string) => void
}

export function DirectorAnnouncementsList({
  items, loading, onCreateClick, onEditClick, onDeleteClick,
}: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        Đang tải...
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">Tổng cộng {items.length} thông báo</p>
        <Button onClick={onCreateClick} className="min-h-[48px] text-base gap-2">
          <Plus className="size-4" />
          Tạo thông báo mới
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-lg">
          Chưa có thông báo nào. Hãy tạo thông báo đầu tiên!
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const cat = CATEGORY_LABELS[item.category] ?? CATEGORY_LABELS.activity
            const pri = PRIORITY_LABELS[item.priority] ?? PRIORITY_LABELS.normal
            const isExpanded = expanded.has(item.id)
            return (
              <Card key={item.id}>
                <CardHeader className="pb-2 pt-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <CardTitle className="text-base leading-snug">{item.title}</CardTitle>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant="secondary" className={`text-xs ${cat.className}`}>
                          {cat.label}
                        </Badge>
                        <Badge variant="secondary" className={`text-xs ${pri.className}`}>
                          {pri.label}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {TARGET_LABELS[item.target_type] ?? item.target_type}
                        </Badge>
                        {item.allow_replies && item.reply_count > 0 && (
                          <Badge className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 gap-1">
                            <MessageCircle className="size-3" />
                            {item.reply_count} phản hồi
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {item.created_by_name} · {formatDate(item.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleExpand(item.id)}
                        title="Xem nội dung"
                        className="size-9"
                      >
                        {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEditClick(item)}
                        title="Chỉnh sửa"
                        className="size-9"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteClick(item.id)}
                        title="Xóa"
                        className="size-9 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0 pb-4">
                    <p className="text-base leading-relaxed whitespace-pre-wrap text-muted-foreground">
                      {item.content}
                    </p>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Convert DirectorAnnouncement to form data for editing
export function announcementToFormData(item: DirectorAnnouncement): DirectorAnnouncementFormData {
  return {
    id: item.id,
    title: item.title,
    content: item.content,
    category: item.category,
    priority: item.priority,
    target_type: item.target_type,
    target_roles: item.target_roles ?? [],
    target_user_phone: '',
    target_user_name: item.target_user_name ?? '',
    target_user_id: item.target_user_id ?? '',
    allow_replies: item.allow_replies,
  }
}
