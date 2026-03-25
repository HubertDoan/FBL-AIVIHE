'use client'

// Dialog to start a new conversation: search contacts, select type, write first message
// Contact list is filtered by relationship rules based on current user role

import { useState } from 'react'
import { Loader2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { ConversationType } from '@/lib/demo/demo-messaging-data'

export interface ContactOption {
  id: string
  name: string
  role: string
  roleLabel: string
}

const CONV_TYPE_OPTIONS: { value: ConversationType; label: string }[] = [
  { value: 'admin', label: 'Hỗ trợ Admin' },
  { value: 'director', label: 'Giám đốc / Công việc' },
  { value: 'doctor', label: 'Bác sĩ gia đình' },
  { value: 'specialist', label: 'BS Chuyên khoa' },
]

const ROLE_BADGE: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700',
  super_admin: 'bg-red-100 text-red-700',
  director: 'bg-indigo-100 text-indigo-700',
  branch_director: 'bg-indigo-100 text-indigo-700',
  doctor: 'bg-green-100 text-green-700',
  specialist: 'bg-teal-100 text-teal-700',
  citizen: 'bg-blue-100 text-blue-700',
  staff: 'bg-slate-100 text-slate-700',
}

interface NewConversationStartDialogProps {
  open: boolean
  contacts: ContactOption[]
  onClose: () => void
  onStart: (recipientId: string, type: ConversationType, subject: string, firstMessage: string) => Promise<void>
}

export function NewConversationStartDialog({
  open,
  contacts,
  onClose,
  onStart,
}: NewConversationStartDialogProps) {
  const [search, setSearch] = useState('')
  const [selectedContact, setSelectedContact] = useState<ContactOption | null>(null)
  const [convType, setConvType] = useState<ConversationType>('admin')
  const [subject, setSubject] = useState('')
  const [firstMessage, setFirstMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const filtered = contacts.filter((c) =>
    search.trim() === '' ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.roleLabel.toLowerCase().includes(search.toLowerCase())
  )

  function handleClose() {
    setSearch('')
    setSelectedContact(null)
    setSubject('')
    setFirstMessage('')
    setError('')
    onClose()
  }

  async function handleSubmit() {
    if (!selectedContact) { setError('Vui lòng chọn người nhận.'); return }
    if (!firstMessage.trim()) { setError('Vui lòng nhập nội dung tin nhắn đầu tiên.'); return }
    setError('')
    setSubmitting(true)
    try {
      const sub = subject.trim() || `Cuộc trò chuyện với ${selectedContact.name}`
      await onStart(selectedContact.id, convType, sub, firstMessage.trim())
      handleClose()
    } catch {
      setError('Không thể tạo cuộc trò chuyện. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Tin nhắn mới</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Contact search */}
          <div>
            <Label className="text-base mb-2 block">Người nhận</Label>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên hoặc vai trò..."
                className="pl-9 text-base"
              />
            </div>
            <div className="border border-border rounded-lg max-h-36 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Không tìm thấy liên hệ</p>
              ) : (
                filtered.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedContact(c)}
                    className={cn(
                      'w-full text-left px-3 py-2.5 flex items-center gap-2 hover:bg-accent transition-colors border-b border-border/50 last:border-0',
                      selectedContact?.id === c.id && 'bg-primary/10'
                    )}
                  >
                    <div className="size-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold shrink-0">
                      {c.name[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-medium truncate">{c.name}</p>
                    </div>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full shrink-0', ROLE_BADGE[c.role] ?? 'bg-muted text-muted-foreground')}>
                      {c.roleLabel}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Conversation type */}
          <div>
            <Label className="text-base mb-2 block">Loại tin nhắn</Label>
            <div className="flex flex-wrap gap-2">
              {CONV_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setConvType(opt.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                    convType === opt.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-accent'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Subject (optional) */}
          <div>
            <Label htmlFor="new-conv-subject" className="text-base mb-1 block">
              Tiêu đề <span className="text-muted-foreground font-normal">(tuỳ chọn)</span>
            </Label>
            <Input
              id="new-conv-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Nhập tiêu đề..."
              className="text-base"
            />
          </div>

          {/* First message */}
          <div>
            <Label htmlFor="new-conv-msg" className="text-base mb-1 block">Nội dung tin nhắn</Label>
            <Textarea
              id="new-conv-msg"
              value={firstMessage}
              onChange={(e) => setFirstMessage(e.target.value)}
              placeholder="Nhập tin nhắn đầu tiên..."
              className="text-base min-h-[80px]"
              rows={3}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={submitting} className="text-base">
            Huỷ
          </Button>
          <Button onClick={handleSubmit} disabled={submitting} className="text-base min-w-[100px]">
            {submitting ? <Loader2 className="size-4 animate-spin" /> : 'Gửi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
