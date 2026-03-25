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
import type {
  DirectorAnnouncementCategory,
  DirectorAnnouncementPriority,
  DirectorTargetType,
} from '@/lib/demo/demo-director-announcement-data'

export interface DirectorAnnouncementFormData {
  id?: string
  title: string
  content: string
  category: DirectorAnnouncementCategory
  priority: DirectorAnnouncementPriority
  target_type: DirectorTargetType
  target_roles: string[]
  target_user_phone: string
  target_user_name: string
  target_user_id: string
  allow_replies: boolean
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: DirectorAnnouncementFormData | null
  onSave: (data: DirectorAnnouncementFormData) => Promise<void>
}

const CATEGORIES: { value: DirectorAnnouncementCategory; label: string }[] = [
  { value: 'activity', label: 'Hoạt động' },
  { value: 'professional', label: 'Chuyên môn' },
  { value: 'event', label: 'Sự kiện' },
  { value: 'program', label: 'Chương trình' },
]

const PRIORITIES: { value: DirectorAnnouncementPriority; label: string; className: string }[] = [
  { value: 'normal', label: 'Bình thường', className: 'text-gray-600' },
  { value: 'important', label: 'Quan trọng', className: 'text-amber-600' },
  { value: 'urgent', label: 'Khẩn cấp', className: 'text-red-600' },
]

const GROUP_ROLES = [
  { value: 'citizen', label: 'Thành viên' },
  { value: 'doctor', label: 'Bác sĩ' },
  { value: 'reception', label: 'Tiếp đón' },
  { value: 'admin', label: 'Quản trị viên' },
]

const DEFAULT_FORM: DirectorAnnouncementFormData = {
  title: '',
  content: '',
  category: 'activity',
  priority: 'normal',
  target_type: 'all',
  target_roles: [],
  target_user_phone: '',
  target_user_name: '',
  target_user_id: '',
  allow_replies: true,
}

export function DirectorAnnouncementForm({ open, onOpenChange, initialData, onSave }: Props) {
  const [form, setForm] = useState<DirectorAnnouncementFormData>(DEFAULT_FORM)
  const [saving, setSaving] = useState(false)
  const [phoneSearching, setPhoneSearching] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(initialData ?? DEFAULT_FORM)
    }
  }, [open, initialData])

  function setField<K extends keyof DirectorAnnouncementFormData>(
    key: K,
    value: DirectorAnnouncementFormData[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function toggleRole(role: string) {
    setForm((prev) => ({
      ...prev,
      target_roles: prev.target_roles.includes(role)
        ? prev.target_roles.filter((r) => r !== role)
        : [...prev.target_roles, role],
    }))
  }

  async function searchByPhone() {
    if (!form.target_user_phone.trim()) return
    setPhoneSearching(true)
    try {
      // In demo mode, find from known demo accounts by phone
      const res = await fetch(`/api/director/search-member?phone=${encodeURIComponent(form.target_user_phone)}`)
      if (res.ok) {
        const data = await res.json()
        setField('target_user_name', data.fullName ?? '')
        setField('target_user_id', data.id ?? '')
      } else {
        setField('target_user_name', 'Không tìm thấy')
        setField('target_user_id', '')
      }
    } catch {
      setField('target_user_name', 'Lỗi tìm kiếm')
    }
    setPhoneSearching(false)
  }

  async function handleSubmit() {
    if (!form.title.trim() || !form.content.trim()) return
    setSaving(true)
    try {
      await onSave({ ...form, id: initialData?.id })
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  const isEdit = !!initialData?.id
  const canSubmit = form.title.trim() && form.content.trim()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEdit ? 'Chỉnh sửa thông báo' : 'Tạo thông báo mới'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="dir-title" className="text-lg">Tiêu đề</Label>
            <Input
              id="dir-title"
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              placeholder="Nhập tiêu đề thông báo..."
              className="h-11 text-base"
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="dir-content" className="text-lg">Nội dung</Label>
            <Textarea
              id="dir-content"
              value={form.content}
              onChange={(e) => setField('content', e.target.value)}
              placeholder="Nhập nội dung thông báo..."
              className="min-h-32 text-base"
            />
          </div>

          {/* Category + Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-lg">Danh mục</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setField('category', v as DirectorAnnouncementCategory)}
              >
                <SelectTrigger className="h-11 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value} className="text-base">
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-lg">Mức độ</Label>
              <Select
                value={form.priority}
                onValueChange={(v) => setField('priority', v as DirectorAnnouncementPriority)}
              >
                <SelectTrigger className="h-11 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p.value} value={p.value} className={`text-base ${p.className}`}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Target audience */}
          <div className="space-y-2">
            <Label className="text-lg">Đối tượng gửi</Label>
            <Select
              value={form.target_type}
              onValueChange={(v) => setField('target_type', v as DirectorTargetType)}
            >
              <SelectTrigger className="h-11 text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-base">Tất cả thành viên</SelectItem>
                <SelectItem value="group" className="text-base">Nhóm</SelectItem>
                <SelectItem value="individual" className="text-base">Cá nhân</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Group roles checkboxes */}
          {form.target_type === 'group' && (
            <div className="space-y-2 pl-2">
              <Label className="text-base text-muted-foreground">Chọn nhóm:</Label>
              <div className="grid grid-cols-2 gap-2">
                {GROUP_ROLES.map((r) => (
                  <div key={r.value} className="flex items-center gap-2">
                    <Checkbox
                      id={`role-${r.value}`}
                      checked={form.target_roles.includes(r.value)}
                      onCheckedChange={() => toggleRole(r.value)}
                    />
                    <Label htmlFor={`role-${r.value}`} className="text-base cursor-pointer">
                      {r.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Individual phone search */}
          {form.target_type === 'individual' && (
            <div className="space-y-2 pl-2">
              <Label className="text-base text-muted-foreground">Tìm theo số điện thoại:</Label>
              <div className="flex gap-2">
                <Input
                  value={form.target_user_phone}
                  onChange={(e) => setField('target_user_phone', e.target.value)}
                  placeholder="Số điện thoại..."
                  className="h-11 text-base"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={searchByPhone}
                  disabled={phoneSearching}
                  className="min-h-[44px] text-base shrink-0"
                >
                  {phoneSearching ? <Loader2 className="size-4 animate-spin" /> : 'Tìm'}
                </Button>
              </div>
              {form.target_user_name && (
                <p className="text-base text-muted-foreground pl-1">
                  Người nhận: <span className="font-medium text-foreground">{form.target_user_name}</span>
                </p>
              )}
            </div>
          )}

          {/* Allow replies */}
          <div className="flex items-center gap-3 pt-1">
            <Checkbox
              id="dir-allow-replies"
              checked={form.allow_replies}
              onCheckedChange={(v) => setField('allow_replies', v === true)}
            />
            <Label htmlFor="dir-allow-replies" className="text-base cursor-pointer">
              Cho phép thành viên phản hồi
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="min-h-[48px] text-base"
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving || !canSubmit}
            className="min-h-[48px] text-base"
          >
            {saving && <Loader2 className="size-4 animate-spin mr-2" />}
            {isEdit ? 'Cập nhật' : 'Gửi thông báo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
