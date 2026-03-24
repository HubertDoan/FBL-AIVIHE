'use client'

import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  memberId: string
  memberName: string
  username: string | null
}

export function PasswordResetDialog({ open, onOpenChange, memberId, memberName, username }: Props) {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp.')
      return
    }
    if (newPassword.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/members/${memberId}/password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      })
      if (res.ok) {
        toast.success('Đã đặt lại mật khẩu thành công.')
        setNewPassword('')
        setConfirmPassword('')
        onOpenChange(false)
      } else {
        const data = await res.json()
        toast.error(data.error ?? 'Lỗi đặt lại mật khẩu.')
      }
    } catch {
      toast.error('Lỗi kết nối máy chủ.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-lg">Đặt lại mật khẩu</DialogTitle>
          <DialogDescription className="text-base">
            Thành viên: <strong>{memberName}</strong>
            {username && <> (username: <strong>{username}</strong>)</>}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleReset} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-base">Mật khẩu mới</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="min-h-[48px] text-base"
              placeholder="Tối thiểu 6 ký tự"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-base">Xác nhận mật khẩu</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              className="min-h-[48px] text-base"
              placeholder="Nhập lại mật khẩu"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" size="lg" onClick={() => onOpenChange(false)} disabled={loading}>
              Hủy
            </Button>
            <Button type="submit" size="lg" disabled={loading}>
              {loading ? <><Loader2 className="size-4 animate-spin mr-2" />Đang xử lý...</> : 'Đặt lại mật khẩu'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
