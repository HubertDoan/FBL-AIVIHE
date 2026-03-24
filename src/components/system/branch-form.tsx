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
import { Loader2 } from 'lucide-react'

interface BranchFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit' | 'clone'
  initialData?: {
    id?: string
    name?: string
    code?: string
    address?: string
    phone?: string
    email?: string
    director_id?: string
  }
  sourceBranchName?: string
  onSubmit: (data: BranchFormData) => Promise<void>
}

export interface BranchFormData {
  name: string
  code: string
  address: string
  phone: string
  email: string
  director_id: string
  sourceBranchId?: string
}

const TITLES: Record<string, string> = {
  create: 'Tạo chi nhánh mới',
  edit: 'Chỉnh sửa chi nhánh',
  clone: 'Clone chi nhánh',
}

export function BranchForm({
  open,
  onOpenChange,
  mode,
  initialData,
  sourceBranchName,
  onSubmit,
}: BranchFormProps) {
  const [name, setName] = useState(initialData?.name ?? '')
  const [code, setCode] = useState(initialData?.code ?? '')
  const [address, setAddress] = useState(initialData?.address ?? '')
  const [phone, setPhone] = useState(initialData?.phone ?? '')
  const [email, setEmail] = useState(initialData?.email ?? '')
  const [directorId, setDirectorId] = useState(initialData?.director_id ?? '')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await onSubmit({
        name,
        code,
        address,
        phone,
        email,
        director_id: directorId,
        sourceBranchId: initialData?.id,
      })
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{TITLES[mode]}</DialogTitle>
          {mode === 'clone' && sourceBranchName && (
            <DialogDescription>
              Clone từ: {sourceBranchName}
            </DialogDescription>
          )}
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="branch-name">Tên chi nhánh *</Label>
            <Input
              id="branch-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Chi nhánh Sóc Sơn"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="branch-code">Mã chi nhánh *</Label>
            <Input
              id="branch-code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="VD: SOCSON"
              required
              disabled={mode === 'edit'}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="branch-address">Địa chỉ</Label>
            <Input
              id="branch-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Địa chỉ chi nhánh"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="branch-phone">Điện thoại</Label>
              <Input
                id="branch-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="024 xxxx xxxx"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch-email">Email</Label>
              <Input
                id="branch-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="branch@fbl.vn"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="branch-director">ID Giám đốc chi nhánh</Label>
            <Input
              id="branch-director"
              value={directorId}
              onChange={(e) => setDirectorId(e.target.value)}
              placeholder="UUID giám đốc"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={saving || !name || !code}>
              {saving && <Loader2 className="size-4 mr-2 animate-spin" />}
              {mode === 'clone' ? 'Clone' : mode === 'edit' ? 'Lưu' : 'Tạo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
