'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const RELATIONSHIPS = [
  { value: 'father', label: 'Bố' },
  { value: 'mother', label: 'Mẹ' },
  { value: 'son', label: 'Con trai' },
  { value: 'daughter', label: 'Con gái' },
  { value: 'grandfather', label: 'Ông' },
  { value: 'grandmother', label: 'Bà' },
  { value: 'wife', label: 'Vợ' },
  { value: 'husband', label: 'Chồng' },
  { value: 'sibling', label: 'Anh/Chị/Em' },
  { value: 'other', label: 'Khác' },
]

const ROLES = [
  { value: 'manager', label: 'Quản lý' },
  { value: 'member', label: 'Thành viên' },
  { value: 'viewer', label: 'Người xem' },
]

interface InviteMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  familyId: string
  onInvite: (data: { phone: string; relationship: string; role: string }) => Promise<void>
}

export function InviteMemberDialog({
  open,
  onOpenChange,
  onInvite,
}: InviteMemberDialogProps) {
  const [phone, setPhone] = useState('')
  const [relationship, setRelationship] = useState('')
  const [role, setRole] = useState('member')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!phone || !relationship) return
    setSubmitting(true)
    try {
      await onInvite({ phone, relationship, role })
      setPhone('')
      setRelationship('')
      setRole('member')
      onOpenChange(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Thêm thành viên
          </DialogTitle>
          <DialogDescription>
            Nhập số điện thoại để mời thành viên vào gia đình.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-base">Số điện thoại</Label>
            <Input
              className="h-12 text-lg"
              placeholder="0912345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-base">Mối quan hệ</Label>
            <Select value={relationship} onValueChange={(v) => setRelationship(v ?? '')}>
              <SelectTrigger className="h-12 text-lg w-full">
                <SelectValue placeholder="Chọn mối quan hệ" />
              </SelectTrigger>
              <SelectContent>
                {RELATIONSHIPS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-base">Vai trò</Label>
            <Select value={role} onValueChange={(v) => setRole(v ?? 'member')}>
              <SelectTrigger className="h-12 text-lg w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            className="w-full h-12 text-lg"
            onClick={handleSubmit}
            disabled={submitting || !phone || !relationship}
          >
            {submitting ? 'Đang mời...' : 'Mời'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
