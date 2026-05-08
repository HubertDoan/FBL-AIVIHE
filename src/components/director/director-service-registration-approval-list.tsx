'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { RefreshCw, Loader2, Check, X, UserCheck } from 'lucide-react'
import { toast } from 'sonner'
import type { ServiceRegistration } from '@/lib/demo/demo-service-registration-in-memory-store'

/**
 * Tab trong director dashboard — duyệt các đăng ký dịch vụ có phí (gói 1,2,3)
 * Gói 0 (miễn phí) auto-active, không cần duyệt
 */

const PACKAGE_LABELS: Record<number, string> = {
  0: 'Cơ bản (Miễn phí)',
  1: 'Bác sĩ gia đình',
  2: 'Phục hồi chức năng',
  3: 'Chuyên khoa sâu',
  4: 'Chăm sóc giấc ngủ',
}

const STATUS_COLORS: Record<string, string> = {
  pending_approval: 'bg-amber-100 text-amber-800 border-amber-300',
  payment_pending: 'bg-blue-100 text-blue-800 border-blue-300',
  active: 'bg-green-100 text-green-800 border-green-300',
  rejected: 'bg-red-100 text-red-800 border-red-300',
  completed: 'bg-gray-100 text-gray-800 border-gray-300',
  expired: 'bg-gray-100 text-gray-800 border-gray-300',
  cancelled: 'bg-gray-100 text-gray-800 border-gray-300',
  suspended: 'bg-gray-100 text-gray-800 border-gray-300',
}

export function DirectorServiceRegistrationApprovalList() {
  const [items, setItems] = useState<ServiceRegistration[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('pending_approval')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/service-registration/all')
      if (res.ok) {
        const data = await res.json()
        setItems(data.registrations || [])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function approve(id: string) {
    setProcessingId(id)
    try {
      const res = await fetch(`/api/service-registration/${id}/approve`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Không thể duyệt')
        return
      }
      toast.success('Đã duyệt. Khách có thể chuyển khoản.')
      load()
    } finally {
      setProcessingId(null)
    }
  }

  async function reject(id: string) {
    if (!rejectReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối')
      return
    }
    setProcessingId(id)
    try {
      const res = await fetch(`/api/service-registration/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Không thể từ chối')
        return
      }
      toast.success('Đã từ chối')
      setRejectingId(null)
      setRejectReason('')
      load()
    } finally {
      setProcessingId(null)
    }
  }

  const filtered = filter === 'all' ? items : items.filter(i => i.status === filter)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h2 className="text-xl font-bold">Đăng ký dịch vụ — Duyệt</h2>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`size-4 mr-1 ${loading ? 'animate-spin' : ''}`} /> Tải lại
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          { k: 'pending_approval', l: 'Chờ duyệt' },
          { k: 'payment_pending', l: 'Chờ thanh toán' },
          { k: 'active', l: 'Đang dùng' },
          { k: 'rejected', l: 'Đã từ chối' },
          { k: 'all', l: 'Tất cả' },
        ].map(f => (
          <button
            key={f.k}
            onClick={() => setFilter(f.k)}
            className={`px-3 py-1.5 rounded-lg text-sm border ${
              filter === f.k
                ? 'border-teal-500 bg-teal-50 text-teal-700 font-semibold'
                : 'border-gray-200 bg-white text-gray-700 hover:border-teal-300'
            }`}
          >
            {f.l} ({items.filter(i => f.k === 'all' || i.status === f.k).length})
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
          Không có đăng ký nào.
        </CardContent></Card>
      )}

      <div className="space-y-2">
        {filtered.map(r => (
          <Card key={r.id}>
            <CardContent className="pt-4 pb-4 space-y-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-bold text-base">{PACKAGE_LABELS[r.package_type]}</h3>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_COLORS[r.status]}`}>
                      {r.status}
                    </span>
                    {r.price_amount > 0 && (
                      <span className="text-sm font-semibold text-teal-700">
                        {r.price_amount.toLocaleString('vi-VN')}đ
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    KH ID: <span className="font-mono">{r.citizen_id.slice(0, 16)}...</span>
                  </p>
                  {r.selected_doctor_id && (
                    <p className="text-sm text-gray-600">BS: {r.selected_doctor_id}</p>
                  )}
                  {r.phcn_location && <p className="text-sm text-gray-600">Hình thức: {r.phcn_location === 'center' ? 'Tại trung tâm' : 'Tại nhà'}</p>}
                  {r.specialist_type && <p className="text-sm text-gray-600">Chuyên khoa: {r.specialist_type}</p>}
                  {r.service_code && (
                    <p className="text-sm text-teal-700 font-mono mt-1">Mã dịch vụ: {r.service_code}</p>
                  )}
                  {r.rejected_reason && (
                    <p className="text-sm text-red-600 mt-1">Lý do từ chối: {r.rejected_reason}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Đăng ký: {new Date(r.created_at).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>

              {r.status === 'pending_approval' && (
                <div className="border-t pt-3 flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => approve(r.id)}
                    disabled={processingId === r.id}
                  >
                    <Check className="size-4 mr-1" /> Duyệt
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => { setRejectingId(r.id); setRejectReason('') }}
                    disabled={processingId === r.id}
                  >
                    <X className="size-4 mr-1" /> Từ chối
                  </Button>
                </div>
              )}

              {rejectingId === r.id && (
                <div className="border-t pt-3 space-y-2">
                  <Textarea
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    placeholder="Nhập lý do từ chối..."
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" variant="destructive" onClick={() => reject(r.id)} disabled={!rejectReason.trim()}>
                      Xác nhận từ chối
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { setRejectingId(null); setRejectReason('') }}>
                      Hủy
                    </Button>
                  </div>
                </div>
              )}

              {r.status === 'payment_pending' && (
                <div className="border-t pt-3 text-sm bg-blue-50 p-2 rounded">
                  <UserCheck className="size-4 inline mr-1 text-blue-600" />
                  Đã duyệt. Chờ khách chuyển khoản. Nội dung: <span className="font-mono font-semibold">{r.payment_content}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
