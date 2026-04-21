'use client'

// Director component to review pending family doctor registration requests
// Shows citizen name, doctor name, specialty, requested date; allows approve or reject with reason

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { CheckCircle, XCircle, Stethoscope, Clock, Users } from 'lucide-react'

interface CitizenRef {
  id: string
  full_name: string
  phone: string
}

interface DoctorProfileRef {
  specialty: string
  qualification: string
}

interface DoctorRef extends CitizenRef {
  doctor_profiles: DoctorProfileRef[] | null
}

interface Registration {
  id: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  requested_at: string
  approved_at: string | null
  notes: string | null
  rejected_reason: string | null
  citizen: CitizenRef | null
  doctor: DoctorRef | null
  approver: CitizenRef | null
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
  cancelled: 'Đã huỷ',
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  approved: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function DirectorFamilyDoctorRegistrationApprovalList() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending')
  const [actingId, setActingId] = useState<string | null>(null)

  // Reject dialog state
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; reg: Registration | null }>({
    open: false, reg: null,
  })
  const [rejectReason, setRejectReason] = useState('')

  const fetchRegistrations = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/family-doctor-registrations?status=${filter}`)
      if (res.ok) {
        const data = await res.json()
        setRegistrations(data.registrations ?? [])
      }
    } catch { /* silent */ }
    setLoading(false)
  }, [filter])

  useEffect(() => { fetchRegistrations() }, [fetchRegistrations])

  async function handleApprove(reg: Registration) {
    setActingId(reg.id)
    try {
      const res = await fetch(`/api/family-doctor-registrations/${reg.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      })
      if (res.ok) {
        toast.success(`Đã duyệt đăng ký BS gia đình cho ${reg.citizen?.full_name ?? 'khách hàng'}.`)
        await fetchRegistrations()
      } else {
        const err = await res.json()
        toast.error(err.error ?? 'Duyệt thất bại.')
      }
    } catch { toast.error('Lỗi kết nối.') }
    setActingId(null)
  }

  function openRejectDialog(reg: Registration) {
    setRejectDialog({ open: true, reg })
    setRejectReason('')
  }

  async function handleRejectConfirm() {
    if (!rejectDialog.reg) return
    if (!rejectReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối.')
      return
    }
    const reg = rejectDialog.reg
    setActingId(reg.id)
    setRejectDialog({ open: false, reg: null })
    try {
      const res = await fetch(`/api/family-doctor-registrations/${reg.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', rejected_reason: rejectReason.trim() }),
      })
      if (res.ok) {
        toast.success(`Đã từ chối yêu cầu của ${reg.citizen?.full_name ?? 'khách hàng'}.`)
        await fetchRegistrations()
      } else {
        const err = await res.json()
        toast.error(err.error ?? 'Từ chối thất bại.')
      }
    } catch { toast.error('Lỗi kết nối.') }
    setActingId(null)
  }

  const filterOptions: Array<{ value: typeof filter; label: string }> = [
    { value: 'pending', label: 'Chờ duyệt' },
    { value: 'approved', label: 'Đã duyệt' },
    { value: 'rejected', label: 'Từ chối' },
    { value: 'all', label: 'Tất cả' },
  ]

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {filterOptions.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setFilter(opt.value)}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
              filter === opt.value
                ? 'border-teal-600 bg-teal-50 text-teal-700'
                : 'border-border bg-background hover:bg-accent'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : registrations.length === 0 ? (
        <div className="py-10 text-center">
          <Users className="size-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-base text-muted-foreground">
            {filter === 'pending' ? 'Không có yêu cầu nào đang chờ duyệt.' : 'Không có yêu cầu nào.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {registrations.map(reg => {
            const doctorProfile = reg.doctor?.doctor_profiles?.[0]
            return (
              <div key={reg.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0 flex-1">
                    {/* Citizen info */}
                    <div className="flex items-center gap-2">
                      <Users className="size-4 text-muted-foreground shrink-0" />
                      <p className="font-semibold text-base">
                        {reg.citizen?.full_name ?? '(Không rõ)'} · {reg.citizen?.phone}
                      </p>
                    </div>
                    {/* Doctor info */}
                    <div className="flex items-center gap-2">
                      <Stethoscope className="size-4 text-teal-600 shrink-0" />
                      <p className="text-base">
                        {reg.doctor?.full_name ?? '(Không rõ)'}
                        {doctorProfile ? ` · ${doctorProfile.qualification} · ${doctorProfile.specialty}` : ''}
                      </p>
                    </div>
                    {/* Time */}
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Clock className="size-3.5" />
                      <span>Yêu cầu: {formatDate(reg.requested_at)}</span>
                      {reg.approved_at && (
                        <span>· Xử lý: {formatDate(reg.approved_at)}</span>
                      )}
                    </div>
                    {/* Rejected reason */}
                    {reg.rejected_reason && (
                      <p className="text-sm text-red-600">Lý do từ chối: {reg.rejected_reason}</p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <Badge className={STATUS_COLORS[reg.status]}>
                      {STATUS_LABELS[reg.status]}
                    </Badge>
                  </div>
                </div>

                {/* Action buttons — only for pending */}
                {reg.status === 'pending' && (
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      className="h-10 text-base gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                      disabled={actingId === reg.id}
                      onClick={() => handleApprove(reg)}
                    >
                      <CheckCircle className="size-4" />
                      Duyệt
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-10 text-base gap-1.5 text-destructive border-destructive hover:bg-destructive/10"
                      disabled={actingId === reg.id}
                      onClick={() => openRejectDialog(reg)}
                    >
                      <XCircle className="size-4" />
                      Từ chối
                    </Button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Reject reason dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={open => setRejectDialog(d => ({ ...d, open }))}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">Từ chối yêu cầu đăng ký</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-base text-muted-foreground">
              Đang từ chối yêu cầu của{' '}
              <span className="font-semibold text-foreground">
                {rejectDialog.reg?.citizen?.full_name}
              </span>
              {' '}→ BS <span className="font-semibold text-foreground">
                {rejectDialog.reg?.doctor?.full_name}
              </span>.
            </p>
            <div className="space-y-1.5">
              <Label className="text-base">Lý do từ chối *</Label>
              <Textarea
                placeholder="Nhập lý do để thông báo cho khách hàng..."
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                rows={3}
                className="text-base resize-none"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="h-11 text-base"
              onClick={() => setRejectDialog({ open: false, reg: null })}
            >
              Huỷ
            </Button>
            <Button
              className="h-11 text-base gap-2 bg-red-600 hover:bg-red-700"
              onClick={handleRejectConfirm}
            >
              <XCircle className="size-4" />
              Xác nhận từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
