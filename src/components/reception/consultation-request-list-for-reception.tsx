'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PhoneCall, Loader2, RefreshCw } from 'lucide-react'
import type { ConsultationRequest } from '@/lib/demo/demo-consultation-request-in-memory-store'
import { ConsultationRequestStatusBadge } from './consultation-request-status-badge'
import { ConsultationRequestDetailDialog } from './consultation-request-detail-dialog'

/**
 * Danh sách yêu cầu tư vấn từ trang chủ
 * Reception xem, click để bổ sung info, mark 'contacted' → 'info_completed'
 * Sau đó GĐ duyệt (approve/reject)
 */

const CHANNEL_LABEL: Record<string, string> = {
  daycare: '🏠 Daycare',
  'family-doctor': '👨‍⚕️ BS gia đình',
  rehabilitation: '🏥 PHCN',
  unsure: '💭 Chưa rõ',
}

export function ConsultationRequestListForReception({
  userRole,
  defaultFilter = 'all',
}: {
  userRole: string
  /** Filter initial status (mapped từ activeView của parent): 'new' | 'contacted' | 'info_completed' | 'approved' | 'all' */
  defaultFilter?: string
}) {
  const [requests, setRequests] = useState<ConsultationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<ConsultationRequest | null>(null)
  const [filter, setFilter] = useState<string>(defaultFilter)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/consultation-request')
      if (res.ok) {
        const data = await res.json()
        setRequests(data.requests || [])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = filter === 'all'
    ? requests
    : requests.filter(r => r.status === filter)

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
          <PhoneCall className="size-5 text-teal-600" />
          Yêu cầu tư vấn ({counts.all})
        </h2>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`size-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Tải lại
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: `Tất cả (${counts.all})` },
          { key: 'new', label: `Mới (${counts.new})`, color: 'bg-blue-100 text-blue-700' },
          { key: 'contacted', label: `Đã liên hệ (${counts.contacted})`, color: 'bg-amber-100 text-amber-700' },
          { key: 'info_completed', label: `Đủ thông tin (${counts.info_completed})`, color: 'bg-purple-100 text-purple-700' },
          { key: 'approved', label: `Đã duyệt (${counts.approved})`, color: 'bg-green-100 text-green-700' },
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
          <Card
            key={r.id}
            className="hover:shadow-md transition cursor-pointer"
            onClick={() => setSelected(r)}
          >
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-bold text-base">{r.full_name}</h3>
                    <ConsultationRequestStatusBadge status={r.status} />
                  </div>
                  <p className="text-sm text-gray-600">
                    📞 <a href={`tel:${r.phone}`} className="text-teal-600 font-medium">{r.phone}</a>
                    {r.channel && (
                      <span className="ml-3 text-gray-500">
                        {CHANNEL_LABEL[r.channel] || r.channel}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Gửi: {new Date(r.created_at).toLocaleString('vi-VN')}
                  </p>
                </div>
                <Button size="sm" variant="outline">Chi tiết</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selected && (
        <ConsultationRequestDetailDialog
          request={selected}
          userRole={userRole}
          onClose={() => setSelected(null)}
          onUpdated={(updated) => {
            setRequests(prev => prev.map(r => r.id === updated.id ? updated : r))
            setSelected(updated)
          }}
        />
      )}
    </div>
  )
}
