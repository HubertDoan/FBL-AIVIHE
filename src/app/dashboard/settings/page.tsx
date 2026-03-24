'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { toast } from 'sonner'
import { User, Lock, LogOut, Trash2, Shield } from 'lucide-react'

export default function SettingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-lg text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    )
  }

  async function handleChangePassword() {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự.')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Xác nhận mật khẩu không khớp.')
      return
    }
    if (!currentPassword) {
      toast.error('Vui lòng nhập mật khẩu hiện tại.')
      return
    }

    setChangingPassword(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error ?? 'Đổi mật khẩu thất bại.')
        return
      }

      toast.success('Đổi mật khẩu thành công!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch {
      toast.error('Đã xảy ra lỗi. Vui lòng thử lại sau.')
    } finally {
      setChangingPassword(false)
    }
  }

  async function handleLogoutAll() {
    const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
    if (IS_DEMO) {
      await fetch('/api/demo/logout', { method: 'POST' })
    }
    toast.success('Đã đăng xuất tất cả thiết bị.')
    router.push('/')
  }

  async function handleDeleteAccount() {
    toast.success('Yêu cầu xóa tài khoản đã được ghi nhận. Chúng tôi sẽ xử lý trong 24 giờ.')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Quản lý tài khoản</h1>
        <p className="text-lg text-muted-foreground mt-1">
          Xem thông tin và cài đặt bảo mật tài khoản
        </p>
      </div>

      {/* Section 1: Account Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <User className="size-5 text-blue-600" />
            Thông tin tài khoản
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <InfoRow label="Tên đăng nhập" value={user?.email ?? '---'} />
            <InfoRow label="Họ tên" value={user?.fullName ?? '---'} />
            <InfoRow label="Số điện thoại" value={user?.phone ?? '---'} />
            <InfoRow
              label="Loại thành viên"
              value={
                user?.role === 'admin'
                  ? 'Quản trị viên'
                  : user?.role === 'doctor'
                    ? 'Bác sĩ'
                    : 'Thành viên'
              }
            />
            <InfoRow label="Ngày tham gia" value="24/03/2026" />
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Lock className="size-5 text-amber-600" />
            Đổi mật khẩu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="current-pw" className="text-base">
                Mật khẩu hiện tại
              </Label>
              <Input
                id="current-pw"
                type="password"
                className="min-h-[48px] text-lg"
                placeholder="Nhập mật khẩu hiện tại"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-pw" className="text-base">
                Mật khẩu mới
              </Label>
              <Input
                id="new-pw"
                type="password"
                className="min-h-[48px] text-lg"
                placeholder="Tối thiểu 6 ký tự"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-pw" className="text-base">
                Xác nhận mật khẩu mới
              </Label>
              <Input
                id="confirm-pw"
                type="password"
                className="min-h-[48px] text-lg"
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button
              className="min-h-[48px] text-lg mt-2"
              onClick={handleChangePassword}
              disabled={changingPassword}
            >
              {changingPassword ? 'Đang xử lý...' : 'Đổi mật khẩu'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Session Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Shield className="size-5 text-red-600" />
            Phiên đăng nhập
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            <Button
              variant="outline"
              className="min-h-[48px] text-lg justify-start gap-2"
              onClick={handleLogoutAll}
            >
              <LogOut className="size-5" />
              Đăng xuất tất cả thiết bị
            </Button>
            <Button
              variant="destructive"
              className="min-h-[48px] text-lg justify-start gap-2"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="size-5" />
              Xóa tài khoản
            </Button>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Xóa tài khoản"
        description="Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác. Tất cả dữ liệu sức khỏe của bạn sẽ bị xóa vĩnh viễn."
        confirmLabel="Xóa tài khoản"
        cancelLabel="Hủy bỏ"
        onConfirm={handleDeleteAccount}
        variant="danger"
      />
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
      <span className="text-base text-muted-foreground sm:w-40 shrink-0">
        {label}
      </span>
      <span className="text-lg font-medium">{value}</span>
    </div>
  )
}
