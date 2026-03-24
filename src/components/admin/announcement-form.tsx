'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

export interface AnnouncementData {
  id?: string
  title: string
  content: string
  category: string
  target_type: string
  target_user_id?: string | null
  is_published: boolean
}

interface AnnouncementFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: AnnouncementData | null
  onSave: (data: AnnouncementData) => Promise<void>
}

const CATEGORIES = [
  { value: 'admin', label: 'Thông báo Admin' },
  { value: 'center', label: 'Thông báo Trung tâm' },
  { value: 'program', label: 'Chương trình' },
]

const TARGETS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'member', label: 'Thành viên' },
  { value: 'doctor', label: 'Bác sĩ' },
  { value: 'staff', label: 'Nhân viên' },
  { value: 'guest', label: 'Khách' },
  { value: 'individual', label: 'Cá nhân' },
]

export function AnnouncementForm({
  open,
  onOpenChange,
  initialData,
  onSave,
}: AnnouncementFormProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('admin')
  const [targetType, setTargetType] = useState('all')
  const [targetUserId, setTargetUserId] = useState('')
  const [isPublished, setIsPublished] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title)
      setContent(initialData.content)
      setCategory(initialData.category)
      setTargetType(initialData.target_type)
      setTargetUserId(initialData.target_user_id ?? '')
      setIsPublished(initialData.is_published)
    } else {
      setTitle('')
      setContent('')
      setCategory('admin')
      setTargetType('all')
      setTargetUserId('')
      setIsPublished(true)
    }
  }, [initialData, open])

  async function handleSubmit() {
    if (!title.trim() || !content.trim()) return
    setSaving(true)
    try {
      await onSave({
        id: initialData?.id,
        title: title.trim(),
        content: content.trim(),
        category,
        target_type: targetType,
        target_user_id: targetType === 'individual' ? targetUserId || null : null,
        is_published: isPublished,
      })
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  const isEdit = !!initialData?.id

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEdit ? 'Chỉnh sửa thông báo' : 'Tạo thông báo mới'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="ann-title" className="text-base">Tiêu đề</Label>
            <Input
              id="ann-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề thông báo..."
              className="h-10 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ann-content" className="text-base">Nội dung</Label>
            <Textarea
              id="ann-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nhập nội dung thông báo..."
              className="min-h-24 text-base"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-base">Danh mục</Label>
              <Select value={category} onValueChange={(v) => setCategory(v ?? 'admin')}>
                <SelectTrigger className="h-10 w-full text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-base">Đối tượng nhận</Label>
              <Select value={targetType} onValueChange={(v) => setTargetType(v ?? 'all')}>
                <SelectTrigger className="h-10 w-full text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TARGETS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {targetType === 'individual' && (
            <div className="space-y-2">
              <Label htmlFor="ann-user" className="text-base">ID người dùng</Label>
              <Input
                id="ann-user"
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                placeholder="Nhập ID hoặc tên người dùng..."
                className="h-10 text-base"
              />
            </div>
          )}

          <div className="flex items-center gap-3 pt-1">
            <Checkbox
              id="ann-published"
              checked={isPublished}
              onCheckedChange={(v) => setIsPublished(v === true)}
            />
            <Label htmlFor="ann-published" className="text-base cursor-pointer">
              {isPublished ? 'Đã đăng' : 'Bản nháp'}
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="min-h-[44px] text-base"
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving || !title.trim() || !content.trim()}
            className="min-h-[44px] text-base"
          >
            {saving && <Loader2 className="size-4 animate-spin mr-2" />}
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
