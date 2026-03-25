'use client'

// Announcement creation/edit form with full targeting, priority, and reply settings

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
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
import { useAuth } from '@/hooks/use-auth'
import {
  AnnouncementTargetSelector,
  type TargetType,
} from './announcement-target-selector'

export interface AnnouncementData {
  id?: string
  title: string
  content: string
  category: string
  target_type: TargetType
  target_groups: string[]
  target_citizen_id?: string | null
  target_user_name?: string | null
  priority: 'normal' | 'important' | 'urgent'
  allow_reply: boolean
  attachments_note: string
  is_published: boolean
}

interface AnnouncementFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: AnnouncementData | null
  onSave: (data: AnnouncementData) => Promise<void>
}

const ADMIN_CATEGORIES = [
  { value: 'technical', label: 'Kỹ thuật' },
  { value: 'system', label: 'Hệ thống' },
  { value: 'maintenance', label: 'Bảo trì' },
  { value: 'general', label: 'Chung' },
  { value: 'program', label: 'Chương trình' },
]

const DIRECTOR_CATEGORIES = [
  { value: 'director', label: 'Thông báo từ Giám đốc' },
]

const BRANCH_DIRECTOR_CATEGORIES = [
  { value: 'general', label: 'Chung' },
  { value: 'program', label: 'Chương trình' },
]

const PRIORITY_OPTIONS = [
  { value: 'normal', label: 'Bình thường', className: 'bg-gray-100 text-gray-700' },
  { value: 'important', label: 'Quan trọng', className: 'bg-yellow-100 text-yellow-700' },
  { value: 'urgent', label: 'Khẩn cấp', className: 'bg-red-100 text-red-700' },
]

function getCategories(role: string) {
  if (role === 'director') return DIRECTOR_CATEGORIES
  if (role === 'branch_director') return BRANCH_DIRECTOR_CATEGORIES
  return ADMIN_CATEGORIES
}

function getDefaultCategory(role: string) {
  if (role === 'director') return 'director'
  if (role === 'branch_director') return 'general'
  return 'general'
}

export function AnnouncementForm({
  open,
  onOpenChange,
  initialData,
  onSave,
}: AnnouncementFormProps) {
  const { user } = useAuth({ redirect: false })
  const userRole = user?.role ?? 'admin'
  const categories = getCategories(userRole)
  const defaultCategory = getDefaultCategory(userRole)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState(defaultCategory)
  const [targetType, setTargetType] = useState<TargetType>('all')
  const [targetGroups, setTargetGroups] = useState<string[]>([])
  const [targetCitizenId, setTargetCitizenId] = useState('')
  const [targetUserName, setTargetUserName] = useState('')
  const [priority, setPriority] = useState<'normal' | 'important' | 'urgent'>('normal')
  const [allowReply, setAllowReply] = useState(false)
  const [attachmentsNote, setAttachmentsNote] = useState('')
  const [isPublished, setIsPublished] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title)
      setContent(initialData.content)
      setCategory(initialData.category)
      setTargetType(initialData.target_type)
      setTargetGroups(initialData.target_groups ?? [])
      setTargetCitizenId(initialData.target_citizen_id ?? '')
      setTargetUserName(initialData.target_user_name ?? '')
      setPriority(initialData.priority ?? 'normal')
      setAllowReply(initialData.allow_reply ?? false)
      setAttachmentsNote(initialData.attachments_note ?? '')
      setIsPublished(initialData.is_published)
    } else {
      setTitle('')
      setContent('')
      setCategory(defaultCategory)
      setTargetType('all')
      setTargetGroups([])
      setTargetCitizenId('')
      setTargetUserName('')
      setPriority('normal')
      setAllowReply(false)
      setAttachmentsNote('')
      setIsPublished(true)
    }
  }, [initialData, open])

  function handleIndividualChange(citizenId: string, name: string) {
    setTargetCitizenId(citizenId)
    setTargetUserName(name)
  }

  async function handleSubmit() {
    if (!title.trim() || !content.trim()) return
    if (targetType === 'group' && targetGroups.length === 0) return
    if (targetType === 'individual' && !targetCitizenId) return
    setSaving(true)
    try {
      await onSave({
        id: initialData?.id,
        title: title.trim(),
        content: content.trim(),
        category,
        target_type: targetType,
        target_groups: targetType === 'group' ? targetGroups : [],
        target_citizen_id: targetType === 'individual' ? targetCitizenId : null,
        target_user_name: targetType === 'individual' ? targetUserName : null,
        priority,
        allow_reply: allowReply,
        attachments_note: attachmentsNote.trim(),
        is_published: isPublished,
      })
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  const isEdit = !!initialData?.id
  const priorityMeta = PRIORITY_OPTIONS.find((p) => p.value === priority) ?? PRIORITY_OPTIONS[0]

  const canSubmit =
    !!title.trim() &&
    !!content.trim() &&
    !(targetType === 'group' && targetGroups.length === 0) &&
    !(targetType === 'individual' && !targetCitizenId)

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
            <Label htmlFor="ann-title" className="text-base">Tiêu đề</Label>
            <Input
              id="ann-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề thông báo..."
              className="h-10 text-base"
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="ann-content" className="text-base">Nội dung</Label>
            <Textarea
              id="ann-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nhập nội dung thông báo..."
              className="min-h-[96px] text-base"
            />
          </div>

          {/* Category + Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-base">Danh mục</Label>
              <Select value={category} onValueChange={(v) => setCategory(v ?? defaultCategory)}>
                <SelectTrigger className="h-10 w-full text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-base">
                Mức độ ưu tiên
                <Badge variant="secondary" className={`ml-2 text-xs ${priorityMeta.className}`}>
                  {priorityMeta.label}
                </Badge>
              </Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
                <SelectTrigger className="h-10 w-full text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Targeting */}
          <AnnouncementTargetSelector
            targetType={targetType}
            onTargetTypeChange={setTargetType}
            targetGroups={targetGroups}
            onTargetGroupsChange={setTargetGroups}
            targetCitizenId={targetCitizenId}
            targetUserName={targetUserName}
            onTargetIndividualChange={handleIndividualChange}
          />

          {/* Attachments note */}
          <div className="space-y-2">
            <Label htmlFor="ann-attachments" className="text-base">Liên kết tham khảo</Label>
            <Input
              id="ann-attachments"
              value={attachmentsNote}
              onChange={(e) => setAttachmentsNote(e.target.value)}
              placeholder="https://... (tuỳ chọn)"
              className="h-10 text-base"
            />
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-6 pt-1">
            <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
              <Checkbox
                checked={allowReply}
                onCheckedChange={(v) => setAllowReply(v === true)}
              />
              <span className="text-base">Cho phép phản hồi</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
              <Checkbox
                checked={isPublished}
                onCheckedChange={(v) => setIsPublished(v === true)}
              />
              <span className="text-base">{isPublished ? 'Đã đăng' : 'Bản nháp'}</span>
            </label>
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
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
