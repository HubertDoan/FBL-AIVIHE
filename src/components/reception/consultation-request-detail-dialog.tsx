'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { X, Check, Loader2, UserCheck, Ban } from 'lucide-react'
import type { ConsultationRequest } from '@/lib/demo/demo-consultation-request-in-memory-store'
import { ConsultationRequestStatusBadge } from './consultation-request-status-badge'

/**
 * Dialog chi tiết yêu cầu tư vấn
 * - Reception: bổ sung info, đổi status: new → contacted → info_completed
 * - GĐ/Super admin: duyệt (approved) hoặc từ chối (rejected)
 */

const RECEPTION_ROLES = ['reception', 'admin', 'admin_staff', 'manager', 'super_admin']
const DIRECTOR_ROLES = ['director', 'branch_director', 'super_admin']

export function ConsultationRequestDetailDialog({
  request, userRole, onClose, onUpdated,
}: {
  request: ConsultationRequest
  userRole: string
  onClose: () => void
  onUpdated: (r: ConsultationRequest) => void
}) {
  const isReception = RECEPTION_ROLES.includes(userRole)
  const isDirector = DIRECTOR_ROLES.includes(userRole)

  const [extInfo, setExtInfo] = useState(request.extended_info || {})
  const [rejectReason, setRejectReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function patch(body: Record<string, unknown>) {
    setSaving(true); setError('')
    try {
      const res = await fetch(`/api/consultation-request/${request.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Không thể lưu')
        return null
      }
      onUpdated(data.request)
      return data.request as ConsultationRequest
    } catch {
      setError('Lỗi kết nối')
      return null
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-start md:items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-2xl my-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <CardContent className="pt-6 pb-6 space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-bold">{request.full_name}</h3>
                <ConsultationRequestStatusBadge status={request.status} />
              </div>
              <p className="text-gray-600 mt-1">
                📞 <a href={`tel:${request.phone}`} className="text-teal-600 font-semibold">{request.phone}</a>
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Gửi lúc: {new Date(request.created_at).toLocaleString('vi-VN')}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="size-5" />
            </Button>
          </div>

          {request.contacted_at && (
            <div className="text-sm text-gray-600 bg-amber-50 rounded-md p-2.5 border border-amber-100">
              ✓ Đã liên hệ lúc {new Date(request.contacted_at).toLocaleString('vi-VN')}
            </div>
          )}
          {request.approved_at && (
            <div className="text-sm bg-green-50 rounded-md p-2.5 border border-green-100 text-green-800">
              ✓ Đã duyệt lúc {new Date(request.approved_at).toLocaleString('vi-VN')}
              {request.rejected_reason && <p className="mt-1">Lý do từ chối: {request.rejected_reason}</p>}
            </div>
          )}

          {isReception && request.status !== 'approved' && request.status !== 'rejected' && (
            <ReceptionActions
              extInfo={extInfo}
              setExtInfo={setExtInfo}
              onMarkContacted={() => patch({ status: 'contacted' })}
              onSaveInfo={async () => {
                await patch({ extended_info: extInfo, status: 'info_completed' })
              }}
              saving={saving}
            />
          )}

          {isDirector && request.status === 'info_completed' && (
            <div className="border-t pt-4 space-y-2">
              <p className="font-semibold text-gray-900">Giám đốc phê duyệt</p>
              <div className="flex gap-2 flex-wrap">
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => patch({ status: 'approved' })}
                  disabled={saving}
                >
                  <UserCheck className="size-4 mr-1" /> Duyệt
                </Button>
              </div>
              <div className="pt-2 space-y-1.5">
                <Label className="text-sm">Lý do từ chối (nếu có)</Label>
                <Textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="VD: thông tin không phù hợp..."
                  rows={2}
                />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => patch({ status: 'rejected', rejected_reason: rejectReason })}
                  disabled={saving || !rejectReason.trim()}
                >
                  <Ban className="size-4 mr-1" /> Từ chối
                </Button>
              </div>
            </div>
          )}

          {saving && <div className="text-sm text-gray-500 flex items-center gap-1"><Loader2 className="size-4 animate-spin" /> Đang lưu...</div>}
          {error && <p className="text-sm text-destructive bg-destructive/10 rounded p-2">{error}</p>}
        </CardContent>
      </Card>
    </div>
  )
}

function ReceptionActions({
  extInfo, setExtInfo, onMarkContacted, onSaveInfo, saving,
}: {
  extInfo: NonNullable<ConsultationRequest['extended_info']>
  setExtInfo: (v: NonNullable<ConsultationRequest['extended_info']>) => void
  onMarkContacted: () => void
  onSaveInfo: () => void
  saving: boolean
}) {
  return (
    <div className="border-t pt-4 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="font-semibold text-gray-900">Bổ sung thông tin khách hàng</p>
        <Button size="sm" variant="outline" onClick={onMarkContacted} disabled={saving}>
          <Check className="size-4 mr-1" /> Đánh dấu đã liên hệ
        </Button>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-sm">Ngày sinh</Label>
          <Input type="date" value={extInfo.date_of_birth || ''} onChange={e => setExtInfo({ ...extInfo, date_of_birth: e.target.value })} />
        </div>
        <div className="space-y-1">
          <Label className="text-sm">Giới tính</Label>
          <select
            className="w-full h-10 px-3 rounded-md border border-input bg-transparent text-base"
            value={extInfo.gender || ''}
            onChange={e => setExtInfo({ ...extInfo, gender: e.target.value as 'male' | 'female' | 'other' })}
          >
            <option value="">-- Chọn --</option>
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
            <option value="other">Khác</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label className="text-sm">CCCD</Label>
          <Input value={extInfo.national_id || ''} onChange={e => setExtInfo({ ...extInfo, national_id: e.target.value })} />
        </div>
        <div className="space-y-1">
          <Label className="text-sm">Địa chỉ</Label>
          <Input value={extInfo.address || ''} onChange={e => setExtInfo({ ...extInfo, address: e.target.value })} />
        </div>
        <div className="space-y-1">
          <Label className="text-sm">Người thân (tên)</Label>
          <Input value={extInfo.emergency_contact_name || ''} onChange={e => setExtInfo({ ...extInfo, emergency_contact_name: e.target.value })} />
        </div>
        <div className="space-y-1">
          <Label className="text-sm">SĐT người thân</Label>
          <Input value={extInfo.emergency_contact_phone || ''} onChange={e => setExtInfo({ ...extInfo, emergency_contact_phone: e.target.value })} />
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-sm">Ghi chú / Quan tâm gói nào</Label>
        <Textarea
          value={extInfo.notes || ''}
          onChange={e => setExtInfo({ ...extInfo, notes: e.target.value })}
          rows={2}
          placeholder="Khách quan tâm BSGĐ gói tháng, đã khám tim mạch..."
        />
      </div>
      <Button onClick={onSaveInfo} disabled={saving} className="w-full bg-teal-600 hover:bg-teal-700">
        Lưu thông tin & chuyển duyệt GĐ
      </Button>
    </div>
  )
}
