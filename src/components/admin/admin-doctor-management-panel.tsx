'use client'

// Admin panel to create and manage doctor profiles
// Admin inputs verified doctor info → creates profile → verifies → doctor becomes available for family registration

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  CheckCircle,
  Plus,
  Stethoscope,
  UserCheck,
} from 'lucide-react'

interface DoctorCitizenInfo {
  id: string
  full_name: string
  phone: string
  email: string
}

interface DoctorProfileRow {
  id: string
  specialty: string
  qualification: string
  experience_years: number
  bio: string | null
  available_for_family_doctor: boolean
  status: 'active' | 'inactive' | 'pending_verification'
  verified_at: string | null
  created_at: string
  citizens: DoctorCitizenInfo | null
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Đã xác minh',
  inactive: 'Ngừng hoạt động',
  pending_verification: 'Chờ xác minh',
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800 border-green-200',
  inactive: 'bg-gray-100 text-gray-700 border-gray-200',
  pending_verification: 'bg-yellow-100 text-yellow-800 border-yellow-200',
}

interface AddDoctorForm {
  doctor_citizen_id: string
  specialty: string
  qualification: string
  experience_years: number
  bio: string
}

const EMPTY_FORM: AddDoctorForm = {
  doctor_citizen_id: '',
  specialty: '',
  qualification: '',
  experience_years: 0,
  bio: '',
}

export function AdminDoctorManagementPanel() {
  const [doctors, setDoctors] = useState<DoctorProfileRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [form, setForm] = useState<AddDoctorForm>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [verifyingId, setVerifyingId] = useState<string | null>(null)

  const fetchDoctors = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/doctors')
      if (res.ok) {
        const data = await res.json()
        setDoctors(data.doctors ?? [])
      }
    } catch { /* silent */ }
    setLoading(false)
  }, [])

  useEffect(() => { fetchDoctors() }, [fetchDoctors])

  function handleFormChange(field: keyof AddDoctorForm, value: string | number) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleAddDoctor() {
    if (!form.doctor_citizen_id.trim() || !form.specialty.trim() || !form.qualification.trim()) {
      toast.error('Vui lòng điền đầy đủ ID người dùng, chuyên khoa và bằng cấp.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          experience_years: Number(form.experience_years),
          available_for_family_doctor: false,
        }),
      })
      if (res.ok) {
        toast.success('Đã tạo hồ sơ bác sĩ. Nhấn "Xác minh" để kích hoạt.')
        setShowAddDialog(false)
        setForm(EMPTY_FORM)
        await fetchDoctors()
      } else {
        const err = await res.json()
        toast.error(err.error ?? 'Tạo hồ sơ thất bại.')
      }
    } catch { toast.error('Lỗi kết nối.') }
    setSubmitting(false)
  }

  async function handleVerify(doctor: DoctorProfileRow) {
    setVerifyingId(doctor.id)
    try {
      const res = await fetch(`/api/admin/doctors/${doctor.id}/verify`, { method: 'PATCH' })
      if (res.ok) {
        toast.success(`Đã xác minh BS ${doctor.citizens?.full_name ?? ''}. Bác sĩ sẵn sàng nhận đăng ký.`)
        await fetchDoctors()
      } else {
        const err = await res.json()
        toast.error(err.error ?? 'Xác minh thất bại.')
      }
    } catch { toast.error('Lỗi kết nối.') }
    setVerifyingId(null)
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-base text-muted-foreground">
          {doctors.length} bác sĩ trong hệ thống
        </p>
        <Button
          className="h-10 text-base gap-2 bg-teal-600 hover:bg-teal-700"
          onClick={() => setShowAddDialog(true)}
        >
          <Plus className="size-4" />
          Thêm bác sĩ mới
        </Button>
      </div>

      {doctors.length === 0 ? (
        <div className="py-10 text-center">
          <Stethoscope className="size-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-base text-muted-foreground">Chưa có bác sĩ nào. Nhấn "Thêm bác sĩ mới" để bắt đầu.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {doctors.map(doctor => (
            <div key={doctor.id} className="border rounded-lg p-4 flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-1">
                <p className="font-semibold text-base">
                  {doctor.citizens?.full_name ?? '(Chưa có tên)'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {doctor.qualification} · {doctor.specialty}
                </p>
                <p className="text-sm text-muted-foreground">
                  {doctor.experience_years} năm kinh nghiệm
                  {doctor.citizens?.phone ? ` · ${doctor.citizens.phone}` : ''}
                </p>
                {doctor.available_for_family_doctor && (
                  <p className="text-xs text-teal-700 font-medium">Nhận đăng ký BS gia đình</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <Badge className={STATUS_COLORS[doctor.status]}>
                  {STATUS_LABELS[doctor.status]}
                </Badge>
                {doctor.status === 'pending_verification' && (
                  <Button
                    size="sm"
                    className="h-9 text-sm gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                    disabled={verifyingId === doctor.id}
                    onClick={() => handleVerify(doctor)}
                  >
                    <UserCheck className="size-4" />
                    {verifyingId === doctor.id ? 'Đang xử lý...' : 'Xác minh'}
                  </Button>
                )}
                {doctor.status === 'active' && (
                  <span className="flex items-center gap-1 text-xs text-green-700">
                    <CheckCircle className="size-3.5" />
                    Đã kích hoạt
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Doctor Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg flex items-center gap-2">
              <Stethoscope className="size-5 text-teal-600" />
              Thêm bác sĩ mới
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-base">ID người dùng (UUID) *</Label>
              <Input
                placeholder="UUID của tài khoản bác sĩ trong hệ thống"
                value={form.doctor_citizen_id}
                onChange={e => handleFormChange('doctor_citizen_id', e.target.value)}
                className="h-11 text-base"
              />
              <p className="text-xs text-muted-foreground">
                Lấy từ trang Quản lý người dùng → cột ID của tài khoản BS
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-base">Chuyên khoa *</Label>
                <Input
                  placeholder="Vd: Nội tổng quát"
                  value={form.specialty}
                  onChange={e => handleFormChange('specialty', e.target.value)}
                  className="h-11 text-base"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-base">Bằng cấp *</Label>
                <Input
                  placeholder="Vd: BS CKI, ThS Y khoa"
                  value={form.qualification}
                  onChange={e => handleFormChange('qualification', e.target.value)}
                  className="h-11 text-base"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-base">Số năm kinh nghiệm</Label>
              <Input
                type="number"
                min={0}
                max={60}
                value={form.experience_years}
                onChange={e => handleFormChange('experience_years', e.target.value)}
                className="h-11 text-base"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-base">Giới thiệu ngắn</Label>
              <Textarea
                placeholder="Mô tả ngắn về bác sĩ, thế mạnh chuyên môn..."
                value={form.bio}
                onChange={e => handleFormChange('bio', e.target.value)}
                rows={3}
                className="text-base resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="h-11 text-base"
              onClick={() => { setShowAddDialog(false); setForm(EMPTY_FORM) }}
            >
              Huỷ
            </Button>
            <Button
              className="h-11 text-base gap-2 bg-teal-600 hover:bg-teal-700"
              onClick={handleAddDoctor}
              disabled={submitting}
            >
              <Plus className="size-4" />
              {submitting ? 'Đang tạo...' : 'Tạo hồ sơ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
