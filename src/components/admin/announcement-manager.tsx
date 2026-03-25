'use client'

// Admin announcement manager: table with filters, reply count badge, expandable reply panel

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Plus, Pencil, Trash2, Loader2, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react'
import { AnnouncementForm, type AnnouncementData } from './announcement-form'
import { AnnouncementRepliesPanel } from './announcement-replies-panel'
import {
  AnnouncementListFilters,
  type AnnouncementFilters,
} from './announcement-list-filters'

interface Announcement {
  id: string
  title: string
  content: string
  category: string
  target_type: string
  target_groups: string[]
  target_citizen_id?: string | null
  target_user_name?: string | null
  priority: 'normal' | 'important' | 'urgent'
  allow_reply: boolean
  is_published: boolean
  published_at: string
  reply_count: number
}

const CATEGORY_META: Record<string, { label: string; className: string }> = {
  technical: { label: 'Kỹ thuật', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' },
  system:    { label: 'Hệ thống', className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400' },
  maintenance: { label: 'Bảo trì', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400' },
  general:   { label: 'Chung', className: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' },
  program:   { label: 'Chương trình', className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400' },
  director:  { label: 'Giám đốc', className: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-400' },
  // legacy
  admin:     { label: 'Admin', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' },
  center:    { label: 'Trung tâm', className: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' },
}

const PRIORITY_META: Record<string, { label: string; className: string }> = {
  normal:    { label: 'Bình thường', className: 'bg-gray-100 text-gray-600' },
  important: { label: 'Quan trọng', className: 'bg-yellow-100 text-yellow-700' },
  urgent:    { label: 'Khẩn cấp', className: 'bg-red-100 text-red-700' },
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch { return iso }
}

function targetLabel(item: Announcement): string {
  if (item.target_type === 'all') return 'Tất cả'
  if (item.target_type === 'individual') return item.target_user_name ?? 'Cá nhân'
  if (item.target_type === 'group' && item.target_groups?.length) return item.target_groups.join(', ')
  return item.target_type
}

function applyFilters(items: Announcement[], f: AnnouncementFilters): Announcement[] {
  return items.filter((a) => {
    if (f.search && !a.title.toLowerCase().includes(f.search.toLowerCase())) return false
    if (f.category !== 'all' && a.category !== f.category) return false
    if (f.priority !== 'all' && (a.priority ?? 'normal') !== f.priority) return false
    return true
  })
}

export function AnnouncementManager() {
  const [items, setItems] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editData, setEditData] = useState<AnnouncementData | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filters, setFilters] = useState<AnnouncementFilters>({ search: '', category: 'all', priority: 'all' })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/announcements')
      if (res.ok) {
        const json = await res.json()
        setItems(json.data ?? [])
      }
    } catch { /* keep empty */ }
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  function handleCreate() { setEditData(null); setFormOpen(true) }

  function handleEdit(item: Announcement) {
    setEditData({
      id: item.id,
      title: item.title,
      content: item.content,
      category: item.category,
      target_type: item.target_type as AnnouncementData['target_type'],
      target_groups: item.target_groups ?? [],
      target_citizen_id: item.target_citizen_id,
      target_user_name: item.target_user_name,
      priority: item.priority ?? 'normal',
      allow_reply: item.allow_reply ?? false,
      attachments_note: '',
      is_published: item.is_published,
    })
    setFormOpen(true)
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`/api/admin/announcements/${id}`, { method: 'DELETE' })
      setItems((prev) => prev.filter((a) => a.id !== id))
      if (expandedId === id) setExpandedId(null)
    } catch { /* ignore */ }
  }

  async function handleSave(data: AnnouncementData) {
    const url = data.id ? `/api/admin/announcements/${data.id}` : '/api/admin/announcements'
    const method = data.id ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) await fetchData()
  }

  const visible = applyFilters(items, filters)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <AnnouncementListFilters filters={filters} onFiltersChange={setFilters} />
        <Button onClick={handleCreate} className="min-h-[48px] text-base shrink-0">
          <Plus className="size-4 mr-2" />
          Tạo thông báo mới
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Hiển thị {visible.length} / {items.length} thông báo
      </p>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-base">Tiêu đề</TableHead>
            <TableHead className="text-base">Danh mục</TableHead>
            <TableHead className="text-base">Ưu tiên</TableHead>
            <TableHead className="text-base">Đối tượng</TableHead>
            <TableHead className="text-base">Ngày</TableHead>
            <TableHead className="text-base">Phản hồi</TableHead>
            <TableHead className="text-base">Trạng thái</TableHead>
            <TableHead className="text-base text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visible.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-base">
                Không có thông báo nào phù hợp
              </TableCell>
            </TableRow>
          ) : (
            visible.map((item) => {
              const catMeta = CATEGORY_META[item.category] ?? CATEGORY_META.general
              const priMeta = PRIORITY_META[item.priority ?? 'normal']
              const isExpanded = expandedId === item.id
              return (
                <React.Fragment key={item.id}>
                  <TableRow
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  >
                    <TableCell className="text-base font-medium max-w-[200px]">
                      <div className="flex items-center gap-2">
                        {isExpanded ? <ChevronUp className="size-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="size-4 shrink-0 text-muted-foreground" />}
                        <span className="truncate">{item.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={catMeta.className}>{catMeta.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={priMeta.className}>{priMeta.label}</Badge>
                    </TableCell>
                    <TableCell className="text-base text-muted-foreground">{targetLabel(item)}</TableCell>
                    <TableCell className="text-base text-muted-foreground">{formatDate(item.published_at)}</TableCell>
                    <TableCell>
                      {item.allow_reply ? (
                        <div className="flex items-center gap-1 text-base">
                          <MessageSquare className="size-4 text-muted-foreground" />
                          <span>{item.reply_count ?? 0}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.is_published ? (
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">Đã đăng</Badge>
                      ) : (
                        <Badge variant="secondary">Bản nháp</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(item)} title="Chỉnh sửa">
                          <Pencil className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(item.id)} title="Xóa" className="text-red-600 hover:text-red-700">
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {isExpanded && (
                    <TableRow>
                      <TableCell colSpan={8} className="bg-muted/20 px-6 py-4">
                        <AnnouncementRepliesPanel
                          announcementId={item.id}
                          announcementTitle={item.title}
                          allowReply={item.allow_reply}
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              )
            })
          )}
        </TableBody>
      </Table>

      <AnnouncementForm
        open={formOpen}
        onOpenChange={setFormOpen}
        initialData={editData}
        onSave={handleSave}
      />
    </div>
  )
}
