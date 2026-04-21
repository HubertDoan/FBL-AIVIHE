'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Stethoscope, Loader2, RefreshCw, X, Check } from 'lucide-react'
import type { DoctorRegistrationRequest } from '@/lib/demo/demo-doctor-registration-request-in-memory-store'

/**
 * Danh sách BS đăng ký — dành cho Reception
 * Workflow: xem danh sách → gọi BS → đánh dấu contacted → bổ sung extended_info → chuyển GĐ duyệt
 */

const STATUS_LABEL: Record<string, string> = {
  new: 'Mới',
  contacted: 'Đã liên hệ',
  info_completed: 'Đủ thông tin',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
  converted: 'Đã tạo acc',
}

const STATUS_COLOR: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-amber-100 text-amber-700',
  info_completed: 'bg-purple-100 text-purple-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  converted: 'bg-gray-100 text-gray-600',
}

const DOCTOR_TYPE_LABEL: Record<string, string> = {
  general: 'BS Đa khoa',
  oriental: 'BS Đông y',
  family_medicine: 'Y học Gia đình',
  specialist: 'BS Chuyên khoa',
}

export function DoctorApplicationListForReception({ userRole }: { userRole: string }) {
  const [requests, setRequests] = useState<DoctorRegistrationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [selected, setSelected] = useState<DoctorRegistrationRequest | null>(null)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/doctor-application')
      if (res.ok) {
        const data = await res.json()
        setRequests(data.requests || [])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter)

  const counts = {
    all: requests.length,
    new: requests.filter(r => r.status === 'new').length,
    contacted: requests.filter(r => r.status === 'contacted').length,
    info_completed: requests.filter(r => r.status === 'info_completed').length,
    approved: requests.filter(r => r.status === 'approved').length,
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Stethoscope className="size-5 text-teal-600" />
          BS đăng ký ({counts.all})
        </h2>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`size-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Tải lại
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: `Tất cả (${counts.all})` },
          { key: 'new', label: `Mới (${counts.new})` },
          { key: 'contacted', label: `Đã liên hệ (${counts.contacted})` },
          { key: 'info_completed', label: `Đủ thông tin (${counts.info_completed})` },
          { key: 'approved', label: `Đã duyệt (${counts.approved})` },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-sm border transition ${
              filter === f.key
                ? 'border-teal-500 bg-teal-50 text-teal-700 font-semibold'
                : 'border-gray-200 bg-white text-gray-700 hover:border-teal-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 text-gray-500">
          <Loader2 className="size-5 animate-spin mr-2" /> Đang tải...
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <Card><CardContent className="pt-6 pb-6 text-center text-gray-500">
          Không có yêu cầu nào.
        </CardContent></Card>
      )}

      <div className="space-y-2">
        {filtered.map(r => (
          <Card key={r.id} className="hover:shadow-md transition cursor-pointer" onClick={() => setSelected(r)}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-bold text-base">{r.full_name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[r.status] || 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_LABEL[r.status] || r.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    📞 <a href={`tel:${r.phone}`} className="text-teal-600 font-medium" onClick={e => e.stopPropagation()}>{r.phone}</a>
                    <span className="ml-3 text-gray-500">{DOCTOR_TYPE_LABEL[r.doctor_type] || r.doctor_type}</span>
                    {r.employment_type && (
                      <span className="ml-2 text-gray-400 text-xs">
                        · {r.employment_type === 'fulltime' ? 'Toàn thời gian' : 'Bán thời gian'}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    CCHN: {r.license_number} · Gửi: {new Date(r.created_at).toLocaleString('vi-VN')}
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); setSelected(r) }}>Chi tiết</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selected && (
        <DoctorApplicationDetailDialog
          request={selected}
          userRole={userRole}
          onClose={() => setSelected(null)}
          onUpdated={updated => {
            setRequests(prev => prev.map(r => r.id === updated.id ? updated : r))
            setSelected(updated)
          }}
        />
      )}
    </div>
  )
}

// ─── Detail dialog ────────────────────────────────────────────────────────────

const RECEPTION_ROLES = ['reception', 'admin', 'admin_staff', 'manager', 'super_admin']

function DoctorApplicationDetailDialog({
  request, userRole, onClose, onUpdated,
}: {
  request: DoctorRegistrationRequest
  userRole: string
  onClose: () => void
  onUpdated: (r: DoctorRegistrationRequest) => void
}) {
  const isReception = RECEPTION_ROLES.includes(userRole)
  const [extInfo, setExtInfo] = useState(request.extended_info || {})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function patch(body: Record<string, unknown>) {
    setSaving(true); setError('')
    try {
      const res = await fetch(`/api/doctor-application/${request.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Không thể lưu'); return null }
      onUpdated(data.request)
      return data.request as DoctorRegistrationRequest
    } catch {
      setError('Lỗi kết nối')
      return null
    } finally {
      setSaving(false)
    }
  }

  const canEdit = isReception && !['approved', 'rejected', 'converted'].includes(request.status)

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start md:items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <Card className="w-full max-w-2xl my-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <CardContent className="pt-6 pb-6 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-bold">{request.full_name}</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[request.status] || ''}`}>
                  {STATUS_LABEL[request.status]}
                </span>
              </div>
              <p className="text-gray-600 mt-1">
                📞 <a href={`tel:${request.phone}`} className="text-teal-600 font-semibold">{request.phone}</a>
                {request.email && <span className="ml-3 text-gray-500">✉ {request.email}</span>}
              </p>
              <p className="text-sm text-gray-500 mt-0.5">
                {DOCTOR_TYPE_LABEL[request.doctor_type]} · CCHN: {request.license_number}
              </p>
              {request.main_qualification && (
                <p className="text-sm text-gray-500">Bằng: {request.main_qualification}</p>
              )}
              <p className="text-xs text-gray-400 mt-0.5">
                Gửi: {new Date(request.created_at).toLocaleString('vi-VN')}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="size-5" />
            </Button>
          </div>

          {/* Status timeline */}
          {request.contacted_at && (
            <div className="text-sm text-gray-600 bg-amber-50 rounded-md p-2.5 border border-amber-100">
              ✓ Đã liên hệ lúc {new Date(request.contacted_at).toLocaleString('vi-VN')}
            </div>
          )}
          {request.approved_at && (
            <div className="text-sm bg-green-50 rounded-md p-2.5 border border-green-100 text-green-800">
              ✓ {request.status === 'rejected' ? 'Từ chối' : 'Đã duyệt'} lúc {new Date(request.approved_at).toLocaleString('vi-VN')}
              {request.rejected_reason && <p className="mt-1 text-red-700">Lý do: {request.rejected_reason}</p>}
            </div>
          )}

          {/* Reception actions */}
          {canEdit && (
            <div className="border-t pt-4 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="font-semibold text-gray-900">Bổ sung thông tin BS</p>
                <Button size="sm" variant="outline" onClick={() => patch({ status: 'contacted' })} disabled={saving}>
                  <Check className="size-4 mr-1" /> Đánh dấu đã liên hệ
                </Button>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-sm">Phí/buổi (VNĐ)</Label>
                  <Input
                    type="number"
                    placeholder="200000"
                    value={extInfo.fee_per_session || ''}
                    onChange={e => setExtInfo({ ...extInfo, fee_per_session: Number(e.target.value) || undefined })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm">Phí/ngày (VNĐ)</Label>
                  <Input
                    type="number"
                    placeholder="500000"
                    value={extInfo.fee_per_day || ''}
                    onChange={e => setExtInfo({ ...extInfo, fee_per_day: Number(e.target.value) || undefined })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm">Khu vực phục vụ</Label>
                  <Input
                    placeholder="VD: Quận Cầu Giấy, Đống Đa"
                    value={extInfo.location || ''}
                    onChange={e => setExtInfo({ ...extInfo, location: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm">Số năm kinh nghiệm</Label>
                  <Input
                    type="number"
                    placeholder="5"
                    value={extInfo.experience_years || ''}
                    onChange={e => setExtInfo({ ...extInfo, experience_years: Number(e.target.value) || undefined })}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="house_visit"
                  checked={extInfo.house_visit || false}
                  onChange={e => setExtInfo({ ...extInfo, house_visit: e.target.checked })}
                  className="size-4 accent-teal-600"
                />
                <Label htmlFor="house_visit" className="text-sm cursor-pointer">Có đến nhà bệnh nhân</Label>
              </div>
              <div className="space-y-1">
                <Label className="text-sm">Ghi chú lịch làm việc</Label>
                <Textarea
                  rows={2}
                  placeholder="VD: Thứ 2-4-6 buổi sáng, thứ 7 cả ngày..."
                  value={extInfo.schedule_notes || ''}
                  onChange={e => setExtInfo({ ...extInfo, schedule_notes: e.target.value })}
                  className="resize-none"
                />
              </div>
              <Button
                onClick={() => patch({ extended_info: extInfo, status: 'info_completed' })}
                disabled={saving}
                className="w-full bg-teal-600 hover:bg-teal-700"
              >
                Lưu thông tin & chuyển GĐ duyệt
              </Button>
            </div>
          )}

          {saving && <div className="text-sm text-gray-500 flex items-center gap-1"><Loader2 className="size-4 animate-spin" /> Đang lưu...</div>}
          {error && <p className="text-sm text-destructive bg-destructive/10 rounded p-2">{error}</p>}
        </CardContent>
      </Card>
    </div>
  )
}
