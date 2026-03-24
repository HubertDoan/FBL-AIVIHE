'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import { AnnouncementForm, type AnnouncementData } from './announcement-form'

interface Announcement {
  id: string
  title: string
  content: string
  category: string
  target_type: string
  target_user_id?: string | null
  is_published: boolean
  published_at: string
}

const CATEGORY_LABELS: Record<string, { label: string; className: string }> = {
  admin: { label: 'Admin', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' },
  center: { label: 'Trung tâm', className: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' },
  program: { label: 'Chương trình', className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400' },
}

const TARGET_LABELS: Record<string, string> = {
  all: 'Tất cả',
  member: 'Thành viên',
  doctor: 'Bác sĩ',
  staff: 'Nhân viên',
  guest: 'Khách',
  individual: 'Cá nhân',
}

export function AnnouncementManager() {
  const [items, setItems] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editData, setEditData] = useState<AnnouncementData | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/announcements')
      if (res.ok) {
        const json = await res.json()
        setItems(json.data ?? [])
      }
    } catch {
      // keep empty
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  function handleCreate() {
    setEditData(null)
    setFormOpen(true)
  }

  function handleEdit(item: Announcement) {
    setEditData({
      id: item.id,
      title: item.title,
      content: item.content,
      category: item.category,
      target_type: item.target_type,
      target_user_id: item.target_user_id,
      is_published: item.is_published,
    })
    setFormOpen(true)
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`/api/admin/announcements/${id}`, { method: 'DELETE' })
      setItems((prev) => prev.filter((a) => a.id !== id))
    } catch {
      // ignore
    }
  }

  async function handleSave(data: AnnouncementData) {
    if (data.id) {
      // Update
      const res = await fetch(`/api/admin/announcements/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        await fetchData()
      }
    } else {
      // Create
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        await fetchData()
      }
    }
  }

  function formatDate(iso: string) {
    try {
      return new Date(iso).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    } catch {
      return iso
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Tổng cộng {items.length} thông báo
        </p>
        <Button onClick={handleCreate} className="min-h-[44px] text-base">
          <Plus className="size-4 mr-2" />
          Tạo thông báo mới
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-base">Tiêu đề</TableHead>
            <TableHead className="text-base">Danh mục</TableHead>
            <TableHead className="text-base">Đối tượng</TableHead>
            <TableHead className="text-base">Ngày</TableHead>
            <TableHead className="text-base">Trạng thái</TableHead>
            <TableHead className="text-base text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-base">
                Chưa có thông báo nào
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => {
              const cat = CATEGORY_LABELS[item.category] ?? CATEGORY_LABELS.admin
              return (
                <TableRow key={item.id}>
                  <TableCell className="text-base font-medium max-w-[200px] truncate">
                    {item.title}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={cat.className}>
                      {cat.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-base">
                    {TARGET_LABELS[item.target_type] ?? item.target_type}
                  </TableCell>
                  <TableCell className="text-base text-muted-foreground">
                    {formatDate(item.published_at)}
                  </TableCell>
                  <TableCell>
                    {item.is_published ? (
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
                        Đã đăng
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Bản nháp</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleEdit(item)}
                        title="Chỉnh sửa"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(item.id)}
                        title="Xóa"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
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
