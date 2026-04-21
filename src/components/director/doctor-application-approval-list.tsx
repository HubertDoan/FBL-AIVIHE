'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { CheckCircle, XCircle, Stethoscope, Clock, UserPlus } from 'lucide-react'
import type { DoctorRegistrationRequest } from '@/lib/demo/demo-doctor-registration-request-in-memory-store'

/**
 * GĐ duyệt BS đăng ký — director/dashboard
 * Workflow: xem danh sách info_completed → approve → call /convert → tạo acc BS
 */

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700 border-blue-200',
  contacted: 'bg-amber-100 text-amber-700 border-amber-200',
  info_completed: 'bg-purple-100 text-purple-700 border-purple-200',
  approved: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  converted: 'bg-gray-100 text-gray-600 border-gray-200',
}

const STATUS_LABELS: Record<string, string> = {
  new: 'Mới',
  contacted: 'Đã liên hệ',
  info_completed: 'Đủ thông tin',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
  converted: 'Đã tạo acc',
}

const DOCTOR_TYPE_LABEL: Record<string, string> = {
  general: 'BS Đa khoa',
  oriental: 'BS Đông y',
  family_medicine: 'Y học Gia đình',
  specialist: 'BS Chuyên khoa',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

type FilterValue = 'info_completed' | 'approved' | 'rejected' | 'all'

export function DoctorApplicationApprovalList() {
  const [requests, setRequests] = useState<DoctorRegistrationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterValue>('info_completed')
  const [actingId, setActingId] = useState<string | null>(null)

  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; req: DoctorRegistrationRequest | null }>({
    open: false, req: null,
  })
  const [rejectReason, setRejectReason] = useState('')

  const [convertResult, setConvertResult] = useState<{ name: string; email: string; password: string } | null>(null)

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/doctor-application')
      if (res.ok) {
        const data = await res.json()
        setRequests(data.requests ?? [])
      }
    } catch { /* silent */ }
    setLoading(false)
  }, [])

  useEffect(() => { fetchRequests() }, [fetchRequests])

  const filtered = filter === 'all'
    ? requests
    : requests.filter(r => r.status === filter)

  async function handleApproveAndConvert(req: DoctorRegistrationRequest) {
    setActingId(req.id)
    try {
      // Step 1: approve
      const approveRes = await fetch(`/api/doctor-application/${req.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      })
      if (!approveRes.ok) {
        const err = await approveRes.json()
        toast.error(err.error ?? 'Duyệt thất bại.')
        setActingId(null)
        return
      }

      // Step 2: convert → create account
      const convertRes = await fetch(`/api/doctor-application/${req.id}/convert`, { method: 'POST' })
      const convertData = await convertRes.json()

      if (!convertRes.ok) {
        toast.error(convertData.error ?? 'Tạo tài khoản thất bại.')
        await fetchRequests()
        setActingId(null)
        return
      }

      toast.success(`Đã duyệt và tạo tài khoản cho ${req.full_name}.`)

      if (convertData.temp_email && convertData.temp_password) {
        setConvertResult({
          name: req.full_name,
          email: convertData.temp_email,
          password: convertData.temp_password,
        })
      } else if (convertData.note) {
        // Demo mode note
        toast.info(convertData.note)
      }

      await fetchRequests()
    } catch {
      toast.error('Lỗi kết nối.')
    }
    setActingId(null)
  }

  function openRejectDialog(req: DoctorRegistrationRequest) {
    setRejectDialog({ open: true, req })
    setRejectReason('')
  }

  async function handleRejectConfirm() {
    if (!rejectDialog.req) return
    if (!rejectReason.trim()) { toast.error('Vui lòng nhập lý do từ chối.'); return }
    const req = rejectDialog.req
    setActingId(req.id)
    setRejectDialog({ open: false, req: null })
    try {
      const res = await fetch(`/api/doctor-application/${req.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected', rejected_reason: rejectReason.trim() }),
      })
      if (res.ok) {
        toast.success(`Đã từ chối yêu cầu của ${req.full_name}.`)
        await fetchRequests()
      } else {
        const err = await res.json()
        toast.error(err.error ?? 'Từ chối thất bại.')
      }
    } catch { toast.error('Lỗi kết nối.') }
    setActingId(null)
  }

  const filterOptions: Array<{ value: FilterValue; label: string }> = [
    { value: 'info_completed', label: 'Chờ duyệt' },
    { value: 'approved', label: 'Đã duyệt' },
    { value: 'rejected', label: 'Từ chối' },
    { value: 'all', label: 'Tất cả' },
  ]

  return (
    <div className="space-y-4">
      {/* Filter */}
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
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-10 text-center">
          <Stethoscope className="size-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-base text-muted-foreground">
            {filter === 'info_completed' ? 'Không có BS nào đang chờ duyệt.' : 'Không có yêu cầu nào.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(req => (
            <div key={req.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Stethoscope className="size-4 text-teal-600 shrink-0" />
                    <p className="font-semibold text-base">{req.full_name}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[req.status]}`}>
                      {STATUS_LABELS[req.status]}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    📞 {req.phone}
                    {req.email && <span className="ml-2">· ✉ {req.email}</span>}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {DOCTOR_TYPE_LABEL[req.doctor_type]}
                    {req.main_qualification && ` · ${req.main_qualification}`}
                    {` · CCHN: ${req.license_number}`}
                  </p>
                  {req.extended_info && (
                    <p className="text-xs text-muted-foreground">
                      {req.extended_info.location && `📍 ${req.extended_info.location}`}
                      {req.extended_info.experience_years && ` · ${req.extended_info.experience_years} năm KN`}
                      {req.extended_info.house_visit && ' · Đến nhà BN'}
                      {req.extended_info.fee_per_session && ` · ${req.extended_info.fee_per_session.toLocaleString('vi-VN')}đ/buổi`}
                    </p>
                  )}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="size-3" />
                    <span>Gửi: {formatDate(req.created_at)}</span>
                    {req.contacted_at && <span>· Đã liên hệ: {formatDate(req.contacted_at)}</span>}
                  </div>
                  {req.rejected_reason && (
                    <p className="text-sm text-red-600">Lý do từ chối: {req.rejected_reason}</p>
                  )}
                  {req.converted_to_doctor_id && (
                    <p className="text-xs text-green-700">✓ ID tài khoản: {req.converted_to_doctor_id}</p>
                  )}
                </div>
              </div>

              {/* Actions — only for info_completed */}
              {req.status === 'info_completed' && (
                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    className="h-10 text-sm gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                    disabled={actingId === req.id}
                    onClick={() => handleApproveAndConvert(req)}
                  >
                    <UserPlus className="size-4" />
                    Duyệt & Tạo tài khoản BS
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-10 text-sm gap-1.5 text-destructive border-destructive hover:bg-destructive/10"
                    disabled={actingId === req.id}
                    onClick={() => openRejectDialog(req)}
                  >
                    <XCircle className="size-4" />
                    Từ chối
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reject dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={open => setRejectDialog(d => ({ ...d, open }))}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">Từ chối đăng ký BS</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-base text-muted-foreground">
              Từ chối yêu cầu của{' '}
              <span className="font-semibold text-foreground">{rejectDialog.req?.full_name}</span>.
            </p>
            <div className="space-y-1.5">
              <Label className="text-base">Lý do từ chối *</Label>
              <Textarea
                placeholder="Nhập lý do để thông báo cho BS..."
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                rows={3}
                className="text-base resize-none"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="h-11" onClick={() => setRejectDialog({ open: false, req: null })}>
              Huỷ
            </Button>
            <Button className="h-11 gap-2 bg-red-600 hover:bg-red-700" onClick={handleRejectConfirm}>
              <XCircle className="size-4" /> Xác nhận từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Convert result dialog — show temp credentials */}
      <Dialog open={!!convertResult} onOpenChange={open => { if (!open) setConvertResult(null) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="size-5 text-emerald-600" />
              Tạo tài khoản thành công
            </DialogTitle>
          </DialogHeader>
          {convertResult && (
            <div className="space-y-3 py-2 text-sm">
              <p className="text-muted-foreground">
                Tài khoản bác sĩ cho <strong>{convertResult.name}</strong> đã được tạo.
                Gửi thông tin đăng nhập cho BS qua điện thoại hoặc email.
              </p>
              <div className="bg-muted rounded-lg p-3 space-y-1.5 font-mono text-xs">
                <p><span className="text-muted-foreground">Email:</span> {convertResult.email}</p>
                <p><span className="text-muted-foreground">Mật khẩu tạm:</span> {convertResult.password}</p>
              </div>
              <p className="text-xs text-amber-600">
                Yêu cầu BS đổi mật khẩu sau lần đăng nhập đầu tiên.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button className="h-10 bg-teal-600 hover:bg-teal-700" onClick={() => setConvertResult(null)}>
              Đã ghi nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
