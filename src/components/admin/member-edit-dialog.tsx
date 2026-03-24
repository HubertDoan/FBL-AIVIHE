'use client'

import { useState, useEffect } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

export interface MemberFormData {
  id?: string
  full_name: string
  phone: string
  email: string
  role: string
  status: string
  password?: string
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  member: MemberFormData | null
  onSave: (data: MemberFormData) => Promise<void>
}

const ROLES = [
  { value: 'guest', label: 'Khách' },
  { value: 'member', label: 'Thành viên' },
  { value: 'doctor', label: 'Bác sĩ' },
  { value: 'staff', label: 'Nhân viên' },
  { value: 'admin', label: 'Quản trị viên' },
]

const STATUSES = [
  { value: 'active', label: 'Hoạt động' },
  { value: 'suspended', label: 'Tạm dừng' },
  { value: 'pending', label: 'Chờ duyệt' },
]

export function MemberEditDialog({ open, onOpenChange, member, onSave }: Props) {
  const isNew = !member?.id
  const [form, setForm] = useState<MemberFormData>({
    full_name: '', phone: '', email: '', role: 'member', status: 'active', password: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (member) {
      setForm({ ...member, password: '' })
    } else {
      setForm({ full_name: '', phone: '', email: '', role: 'member', status: 'active', password: '' })
    }
  }, [member, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave(form)
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">
            {isNew ? 'Thêm thành viên mới' : 'Chỉnh sửa thành viên'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-base">Họ tên *</Label>
            <Input
              value={form.full_name}
              onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
              required
              className="min-h-[48px] text-base"
              placeholder="Nhập họ tên"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-base">Số điện thoại *</Label>
            <Input
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              required
              className="min-h-[48px] text-base"
              placeholder="0901..."
            />
          </div>
          <div className="space-y-2">
            <Label className="text-base">Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="min-h-[48px] text-base"
              placeholder="email@example.com"
            />
          </div>
          {isNew && (
            <div className="space-y-2">
              <Label className="text-base">Mật khẩu *</Label>
              <Input
                type="password"
                value={form.password ?? ''}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                minLength={6}
                className="min-h-[48px] text-base"
                placeholder="Tối thiểu 6 ký tự"
              />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-base">Loại thành viên</Label>
              <Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v ?? f.role }))}>
                <SelectTrigger className="min-h-[48px] text-base w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map(r => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {!isNew && (
              <div className="space-y-2">
                <Label className="text-base">Trạng thái</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v ?? f.status }))}>
                  <SelectTrigger className="min-h-[48px] text-base w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map(s => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" size="lg" onClick={() => onOpenChange(false)} disabled={saving}>
              Hủy
            </Button>
            <Button type="submit" size="lg" disabled={saving}>
              {saving ? <><Loader2 className="size-4 animate-spin mr-2" />Đang lưu...</> : 'Lưu'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
