'use client'

// Dialog to start a new conversation: search contacts, filter by group, select type, write first message
// Supports multi-select: click individual contacts or select entire group at once

import { useMemo, useState } from 'react'
import { Check, Loader2, Search, Users, X } from 'lucide-react'
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
  reception: 'bg-orange-100 text-orange-700',
  exam_doctor: 'bg-emerald-100 text-emerald-700',
  staff: 'bg-slate-100 text-slate-700',
  accountant: 'bg-amber-100 text-amber-700',
  admin_staff: 'bg-pink-100 text-pink-700',
  manager: 'bg-violet-100 text-violet-700',
  technician: 'bg-cyan-100 text-cyan-700',
  tech_assistant: 'bg-sky-100 text-sky-700',
  nurse: 'bg-rose-100 text-rose-700',
  support_staff: 'bg-lime-100 text-lime-700',
  intern: 'bg-gray-100 text-gray-500',
  guest: 'bg-gray-100 text-gray-600',
}

// Groups available for "select all" feature
const GROUP_FILTERS: { role: string; label: string }[] = [
  { role: 'all', label: 'Tất cả' },
  { role: 'citizen', label: 'Thành viên' },
  { role: 'doctor', label: 'Bác sĩ' },
  { role: 'specialist', label: 'BS Chuyên khoa' },
  { role: 'admin', label: 'Admin' },
  { role: 'director', label: 'Giám đốc' },
  { role: 'staff_all', label: 'Nhân viên' },
]

// Roles considered "staff" for grouping
const STAFF_ROLES = new Set(['reception', 'exam_doctor', 'staff', 'accountant', 'admin_staff', 'manager', 'technician', 'tech_assistant', 'nurse', 'support_staff', 'intern'])

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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [activeGroup, setActiveGroup] = useState<string | null>(null)
  const [convType, setConvType] = useState<ConversationType>('admin')
  const [subject, setSubject] = useState('')
  const [firstMessage, setFirstMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Filter contacts by search text
  const filtered = useMemo(() => {
    let list = contacts
    // Filter by active group
    if (activeGroup && activeGroup !== 'all') {
      if (activeGroup === 'staff_all') {
        list = list.filter((c) => STAFF_ROLES.has(c.role))
      } else {
        list = list.filter((c) => c.role === activeGroup)
      }
    }
    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.roleLabel.toLowerCase().includes(q)
      )
    }
    return list
  }, [contacts, search, activeGroup])

  // Get selected contacts for display
  const selectedContacts = contacts.filter((c) => selectedIds.has(c.id))

  function toggleContact(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleSelectGroup(groupRole: string) {
    if (activeGroup === groupRole) {
      // Deselect: clear group filter
      setActiveGroup(null)
      return
    }
    setActiveGroup(groupRole)

    // Auto-select all contacts in this group
    let groupContacts: ContactOption[]
    if (groupRole === 'all') {
      groupContacts = contacts
    } else if (groupRole === 'staff_all') {
      groupContacts = contacts.filter((c) => STAFF_ROLES.has(c.role))
    } else {
      groupContacts = contacts.filter((c) => c.role === groupRole)
    }

    // Check if all in group are already selected → deselect them
    const allSelected = groupContacts.every((c) => selectedIds.has(c.id))
    setSelectedIds((prev) => {
      const next = new Set(prev)
      for (const c of groupContacts) {
        if (allSelected) next.delete(c.id)
        else next.add(c.id)
      }
      return next
    })
  }

  function removeSelected(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  function handleClose() {
    setSearch('')
    setSelectedIds(new Set())
    setActiveGroup(null)
    setSubject('')
    setFirstMessage('')
    setError('')
    onClose()
  }

  async function handleSubmit() {
    if (selectedIds.size === 0) { setError('Vui lòng chọn người nhận.'); return }
    if (!firstMessage.trim()) { setError('Vui lòng nhập nội dung tin nhắn đầu tiên.'); return }
    setError('')
    setSubmitting(true)
    try {
      // Send to each selected recipient
      const recipientIds = Array.from(selectedIds)
      for (const recipientId of recipientIds) {
        const contact = contacts.find((c) => c.id === recipientId)
        const sub = subject.trim() || `Cuộc trò chuyện với ${contact?.name ?? 'người nhận'}`
        await onStart(recipientId, convType, sub, firstMessage.trim())
      }
      handleClose()
    } catch {
      setError('Không thể tạo cuộc trò chuyện. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Tin nhắn mới</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Selected recipients chips */}
          {selectedContacts.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selectedContacts.map((c) => (
                <span
                  key={c.id}
                  className="inline-flex items-center gap-1 bg-primary/10 text-primary rounded-full px-2.5 py-1 text-sm"
                >
                  {c.name}
                  <button
                    type="button"
                    onClick={() => removeSelected(c.id)}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
              <span className="text-sm text-muted-foreground self-center ml-1">
                ({selectedContacts.length} người)
              </span>
            </div>
          )}

          {/* Contact search + group filter */}
          <div>
            <Label className="text-base mb-2 block">Người nhận</Label>

            {/* Group filter chips */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {GROUP_FILTERS.map((g) => {
                const count = g.role === 'all'
                  ? contacts.length
                  : g.role === 'staff_all'
                    ? contacts.filter((c) => STAFF_ROLES.has(c.role)).length
                    : contacts.filter((c) => c.role === g.role).length
                if (count === 0) return null
                return (
                  <button
                    key={g.role}
                    onClick={() => handleSelectGroup(g.role)}
                    className={cn(
                      'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors',
                      activeGroup === g.role
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-accent'
                    )}
                  >
                    <Users className="size-3" />
                    {g.label} ({count})
                  </button>
                )
              })}
            </div>

            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên hoặc vai trò..."
                className="pl-9 text-base"
              />
            </div>
            <div className="border border-border rounded-lg max-h-48 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Không tìm thấy liên hệ</p>
              ) : (
                filtered.map((c) => {
                  const isSelected = selectedIds.has(c.id)
                  return (
                    <button
                      key={c.id}
                      onClick={() => toggleContact(c.id)}
                      className={cn(
                        'w-full text-left px-3 py-2.5 flex items-center gap-2 hover:bg-accent transition-colors border-b border-border/50 last:border-0',
                        isSelected && 'bg-primary/10'
                      )}
                    >
                      {/* Checkbox indicator */}
                      <div className={cn(
                        'size-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors',
                        isSelected ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/30'
                      )}>
                        {isSelected && <Check className="size-3" />}
                      </div>
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
                  )
                })
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
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : selectedIds.size > 1 ? (
              `Gửi (${selectedIds.size} người)`
            ) : (
              'Gửi'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
