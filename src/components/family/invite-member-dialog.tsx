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
  { value: 'father', label: 'B\u1ED1' },
  { value: 'mother', label: 'M\u1EB9' },
  { value: 'son', label: 'Con trai' },
  { value: 'daughter', label: 'Con g\u00E1i' },
  { value: 'grandfather', label: '\u00D4ng' },
  { value: 'grandmother', label: 'B\u00E0' },
  { value: 'wife', label: 'V\u1EE3' },
  { value: 'husband', label: 'Ch\u1ED3ng' },
  { value: 'sibling', label: 'Anh/Ch\u1ECB/Em' },
  { value: 'other', label: 'Kh\u00E1c' },
]

const ROLES = [
  { value: 'manager', label: 'Qu\u1EA3n l\u00FD' },
  { value: 'member', label: 'Th\u00E0nh vi\u00EAn' },
  { value: 'viewer', label: 'Ng\u01B0\u1EDDi xem' },
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
            Th\u00EAm th\u00E0nh vi\u00EAn
          </DialogTitle>
          <DialogDescription>
            Nh\u1EADp s\u1ED1 \u0111i\u1EC7n tho\u1EA1i \u0111\u1EC3 m\u1EDDi th\u00E0nh vi\u00EAn v\u00E0o gia \u0111\u00ECnh.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-base">S\u1ED1 \u0111i\u1EC7n tho\u1EA1i</Label>
            <Input
              className="h-12 text-lg"
              placeholder="0912345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-base">M\u1ED1i quan h\u1EC7</Label>
            <Select value={relationship} onValueChange={(v) => setRelationship(v ?? '')}>
              <SelectTrigger className="h-12 text-lg w-full">
                <SelectValue placeholder="Ch\u1ECDn m\u1ED1i quan h\u1EC7" />
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
            <Label className="text-base">Vai tr\u00F2</Label>
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
            {submitting ? '\u0110ang m\u1EDDi...' : 'M\u1EDDi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
