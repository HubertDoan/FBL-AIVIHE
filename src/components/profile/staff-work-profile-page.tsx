'use client'

// Hồ sơ công việc cho nhân viên (staff) — KHÔNG có thông tin y tế cá nhân
// Tập trung: vai trò, bộ phận, liên hệ công ty, thống kê công việc

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Briefcase, Mail, Phone, Calendar, User, Building2,
  KeyRound, Pencil, X, CheckCircle2, Loader2, ShieldCheck,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

// Nhãn hiển thị cho từng role
const ROLE_LABELS: Record<string, string> = {
  director: 'Giám đốc công ty',
  branch_director: 'Giám đốc chi nhánh',
  admin: 'Quản trị kỹ thuật',
  super_admin: 'Super Admin',
  manager: 'Quản lý',
  reception: 'Hành chính / Tiếp đón',
  admin_staff: 'Nhân viên hành chính',
  staff: 'Nhân viên',
  accountant: 'Kế toán',
  technician: 'Kỹ thuật viên',
  tech_assistant: 'Trợ lý kỹ thuật',
  nurse: 'Điều dưỡng',
  support_staff: 'Nhân viên hỗ trợ',
  intern: 'Thực tập sinh',
  exam_doctor: 'Bác sĩ khám bệnh',
  doctor: 'Bác sĩ',
  specialist: 'Bác sĩ chuyên khoa',
}

// Phạm vi phụ trách theo role (placeholder)
const ROLE_SCOPE_LABEL: Record<string, string> = {
  director: 'Toàn bộ hệ thống Thong Dong Life',
  branch_director: 'Chi nhánh được phân công',
  manager: 'Vận hành hàng ngày của trung tâm',
  reception: 'Tiếp nhận & xử lý hồ sơ thành viên',
  admin_staff: 'Hành chính, hồ sơ nội bộ',
  admin: 'Cấu hình hệ thống & phân quyền',
  super_admin: 'Toàn quyền hệ thống',
  accountant: 'Quản lý thanh toán & tài chính',
  nurse: 'Theo dõi sức khỏe thành viên',
  technician: 'Hạ tầng kỹ thuật',
}

interface PasswordForm {
  current: string
  next: string
  confirm: string
}

export function StaffWorkProfilePage() {
  const { user } = useAuth()
  const [editing, setEditing] = useState(false)
  const [phone, setPhone] = useState('')
  const [personalEmail, setPersonalEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [pwForm, setPwForm] = useState<PasswordForm>({ current: '', next: '', confirm: '' })
  const [pwChanging, setPwChanging] = useState(false)
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)
  const [memberSince, setMemberSince] = useState<string>('')

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/profile')
      if (!res.ok) return
      const data = await res.json()
      if (data.citizen) {
        setPhone(data.citizen.phone ?? '')
        setPersonalEmail(data.citizen.personal_email ?? data.citizen.email ?? '')
        setMemberSince(data.citizen.created_at ?? '')
      }
    } catch { /* silent */ }
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, personal_email: personalEmail }),
      })
      setSaved(true)
      setEditing(false)
      setTimeout(() => setSaved(false), 2500)
    } catch { /* silent */ }
    setSaving(false)
  }

  const handleChangePassword = async () => {
    setPwError('')
    if (pwForm.next !== pwForm.confirm) {
      setPwError('Mật khẩu mới không khớp.')
      return
    }
    if (pwForm.next.length < 8) {
      setPwError('Mật khẩu mới tối thiểu 8 ký tự.')
      return
    }
    setPwChanging(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }),
      })
      if (!res.ok) {
        const err = await res.json()
        setPwError(err.message ?? 'Đổi mật khẩu thất bại.')
      } else {
        setPwSuccess(true)
        setPwForm({ current: '', next: '', confirm: '' })
        setTimeout(() => setPwSuccess(false), 3000)
      }
    } catch {
      setPwError('Lỗi kết nối. Vui lòng thử lại.')
    }
    setPwChanging(false)
  }

  const role = user?.role ?? ''
  const roleLabel = ROLE_LABELS[role] ?? role
  const roleScope = ROLE_SCOPE_LABEL[role] ?? 'Thực hiện nhiệm vụ được giao'
  const formattedSince = memberSince
    ? new Date(memberSince).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '—'

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="size-6 text-teal-600" />
            Hồ sơ nhân viên
          </h1>
          <p className="text-muted-foreground mt-0.5">Thông tin công việc — Trung tâm Thong Dong Care</p>
        </div>
        <Button
          variant={editing ? 'destructive' : 'outline'}
          className="h-11 text-base"
          onClick={() => { setEditing(!editing); setSaved(false) }}
        >
          {editing ? <><X className="size-4 mr-1" /> Hủy</> : <><Pencil className="size-4 mr-1" /> Chỉnh sửa</>}
        </Button>
      </div>

      {saved && (
        <div className="flex items-center gap-2 text-teal-700 bg-teal-50 border border-teal-200 px-4 py-3 rounded-lg text-base">
          <CheckCircle2 className="size-5" />
          Đã lưu thông tin thành công.
        </div>
      )}

      {/* Thông tin vai trò */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="size-4 text-teal-600" />
            Vai trò & Bộ phận
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InfoRow icon={<User className="size-4 text-gray-500" />} label="Họ và tên" value={user?.fullName ?? '—'} />
          <InfoRow
            icon={<ShieldCheck className="size-4 text-teal-600" />}
            label="Vai trò"
            value={<Badge variant="secondary" className="text-sm px-3 py-1">{roleLabel}</Badge>}
          />
          <InfoRow icon={<Building2 className="size-4 text-gray-500" />} label="Phụ trách" value={roleScope} />
          <InfoRow
            icon={<Calendar className="size-4 text-gray-500" />}
            label="Ngày bắt đầu công tác"
            value={formattedSince}
          />
        </CardContent>
      </Card>

      {/* Liên hệ */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="size-4 text-teal-600" />
            Thông tin liên hệ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InfoRow icon={<Mail className="size-4 text-gray-500" />} label="Email công ty" value={user?.email ?? '—'} />

          <div className="space-y-1">
            <Label className="text-base font-medium flex items-center gap-1.5">
              <Mail className="size-4 text-gray-500" /> Email cá nhân
            </Label>
            <Input
              className="h-12 text-base"
              type="email"
              value={personalEmail}
              readOnly={!editing}
              onChange={e => setPersonalEmail(e.target.value)}
              placeholder="Email cá nhân (tùy chọn)"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-base font-medium flex items-center gap-1.5">
              <Phone className="size-4 text-gray-500" /> Số điện thoại
            </Label>
            <Input
              className="h-12 text-base"
              type="tel"
              value={phone}
              readOnly={!editing}
              onChange={e => setPhone(e.target.value)}
            />
          </div>

          {editing && (
            <Button className="w-full h-12 text-base bg-teal-600 hover:bg-teal-700" onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 className="size-4 mr-2 animate-spin" /> Đang lưu...</> : 'Lưu thông tin liên hệ'}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Đổi mật khẩu */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <KeyRound className="size-4 text-teal-600" />
            Đổi mật khẩu
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pwSuccess && (
            <div className="flex items-center gap-2 text-teal-700 bg-teal-50 border border-teal-200 px-3 py-2 rounded text-base">
              <CheckCircle2 className="size-4" /> Đổi mật khẩu thành công!
            </div>
          )}
          {pwError && (
            <p className="text-destructive text-base">{pwError}</p>
          )}
          <div className="space-y-1">
            <Label className="text-base">Mật khẩu hiện tại</Label>
            <Input className="h-12 text-base" type="password" value={pwForm.current}
              onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <Label className="text-base">Mật khẩu mới</Label>
            <Input className="h-12 text-base" type="password" value={pwForm.next}
              onChange={e => setPwForm(p => ({ ...p, next: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <Label className="text-base">Xác nhận mật khẩu mới</Label>
            <Input className="h-12 text-base" type="password" value={pwForm.confirm}
              onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} />
          </div>
          <Button
            variant="outline"
            className="w-full h-12 text-base"
            onClick={handleChangePassword}
            disabled={pwChanging || !pwForm.current || !pwForm.next}
          >
            {pwChanging ? <><Loader2 className="size-4 mr-2 animate-spin" /> Đang xử lý...</> : 'Đổi mật khẩu'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper hiển thị dòng thông tin
function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="text-base font-medium mt-0.5 break-words">
          {typeof value === 'string' ? value : value}
        </div>
      </div>
    </div>
  )
}
