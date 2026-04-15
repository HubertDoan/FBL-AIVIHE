'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { QrCode, Copy, Check, RefreshCw, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import type { ServiceRegistration } from '@/lib/demo/demo-service-registration-in-memory-store'

/**
 * Hiển thị danh sách gói đăng ký của khách hàng + QR thanh toán + mã dịch vụ
 * Các status: pending_approval / payment_pending / active / rejected / completed
 */

const PACKAGE_LABELS: Record<number, string> = {
  0: 'Cơ bản (Miễn phí)',
  1: 'Bác sĩ gia đình',
  2: 'Phục hồi chức năng',
  3: 'Chuyên khoa sâu',
}

const STATUS_LABELS: Record<string, { text: string; color: string }> = {
  pending_approval: { text: 'Chờ giám đốc duyệt', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  payment_pending: { text: 'Chờ thanh toán', color: 'bg-blue-50 text-blue-800 border-blue-200' },
  active: { text: 'Đang sử dụng', color: 'bg-green-50 text-green-800 border-green-200' },
  rejected: { text: 'Đã từ chối', color: 'bg-red-50 text-red-800 border-red-200' },
  completed: { text: 'Đã kết thúc', color: 'bg-gray-50 text-gray-700 border-gray-200' },
  expired: { text: 'Hết hạn', color: 'bg-gray-50 text-gray-700 border-gray-200' },
  cancelled: { text: 'Đã hủy', color: 'bg-gray-50 text-gray-700 border-gray-200' },
  suspended: { text: 'Tạm ngưng', color: 'bg-gray-50 text-gray-700 border-gray-200' },
}

export function CustomerServiceRegistrationListWithQrPayment() {
  const [items, setItems] = useState<ServiceRegistration[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/service-registration')
      if (res.ok) {
        const data = await res.json()
        setItems(data.registrations || [])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function confirmPaid(id: string) {
    try {
      const res = await fetch(`/api/service-registration/${id}/confirm-payment`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Không thể xác nhận')
        return
      }
      toast.success('Đã xác nhận thanh toán. Mã dịch vụ đã được cấp!')
      load()
    } catch {
      toast.error('Lỗi kết nối')
    }
  }

  function copyCode(id: string, text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id)
      toast.success('Đã sao chép')
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  if (loading) {
    return <div className="py-6 flex items-center text-gray-500"><Loader2 className="size-4 animate-spin mr-2" /> Đang tải...</div>
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 pb-6 text-center text-gray-500">
          Bạn chưa đăng ký gói dịch vụ nào.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Sparkles className="size-5 text-teal-600" />
          Gói dịch vụ của bạn
        </h2>
        <Button variant="outline" size="sm" onClick={load}>
          <RefreshCw className="size-4 mr-1" /> Tải lại
        </Button>
      </div>

      {items.map(r => (
        <Card key={r.id}>
          <CardContent className="pt-5 pb-5 space-y-3">
            <div className="flex justify-between items-start gap-3 flex-wrap">
              <div>
                <h3 className="font-bold text-lg">{PACKAGE_LABELS[r.package_type]}</h3>
                <span className={`inline-block mt-1 text-xs font-medium px-2.5 py-0.5 rounded-full border ${STATUS_LABELS[r.status]?.color}`}>
                  {STATUS_LABELS[r.status]?.text || r.status}
                </span>
              </div>
              {r.price_amount > 0 && (
                <div className="text-right">
                  <p className="text-sm text-gray-500">Số tiền</p>
                  <p className="text-lg font-bold text-teal-700">{r.price_amount.toLocaleString('vi-VN')}đ</p>
                </div>
              )}
            </div>

            {r.status === 'pending_approval' && (
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm text-amber-900">
                <p className="font-medium mb-1">⏳ Đang chờ giám đốc duyệt</p>
                <p>Giám đốc sẽ xem xét đăng ký của bạn trong 24 giờ. Sau khi duyệt, bạn sẽ nhận được hướng dẫn thanh toán.</p>
              </div>
            )}

            {r.status === 'payment_pending' && r.payment_content && (
              <div className="border-t pt-3 space-y-3">
                <p className="font-semibold text-gray-900">Hướng dẫn thanh toán</p>
                <div className="flex gap-4 flex-wrap items-start">
                  <img
                    src={`https://img.vietqr.io/image/970418-12310000073672-compact2.png?amount=${r.price_amount}&addInfo=${encodeURIComponent(r.payment_content)}&accountName=${encodeURIComponent('DOAN NGOC HAI')}`}
                    alt="QR chuyển khoản"
                    className="w-48 h-48 border rounded-lg"
                  />
                  <div className="flex-1 min-w-0 space-y-2 text-sm">
                    <PaymentDetailRow label="Ngân hàng" value="BIDV" />
                    <PaymentDetailRow label="Số tài khoản" value="12310000073672" onCopy={() => copyCode(r.id + '-acc', '12310000073672')} copied={copiedId === r.id + '-acc'} />
                    <PaymentDetailRow label="Chủ tài khoản" value="DOAN NGOC HAI" />
                    <PaymentDetailRow label="Số tiền" value={`${r.price_amount.toLocaleString('vi-VN')}đ`} />
                    <PaymentDetailRow
                      label="Nội dung CK"
                      value={r.payment_content}
                      highlight
                      onCopy={() => copyCode(r.id + '-msg', r.payment_content!)}
                      copied={copiedId === r.id + '-msg'}
                    />
                  </div>
                </div>
                <Button size="sm" variant="outline" className="w-full" onClick={() => confirmPaid(r.id)}>
                  Tôi đã chuyển khoản (xác nhận để kích hoạt ngay)
                </Button>
                <p className="text-xs text-gray-500 italic">
                  Hệ thống sẽ tự động xác nhận khi SePay nhận được tiền. Nếu chưa thấy kích hoạt sau 5 phút, bạm nút trên.
                </p>
              </div>
            )}

            {r.status === 'active' && r.service_code && (
              <div className="border-t pt-3 bg-green-50 -mx-5 -mb-5 px-5 pb-5 pt-3 rounded-b-lg">
                <div className="flex items-center gap-2 mb-2">
                  <QrCode className="size-5 text-green-700" />
                  <p className="font-semibold text-green-900">Mã dịch vụ của bạn</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <code className="text-2xl font-mono font-bold text-green-800 bg-white px-4 py-2 rounded border border-green-300">
                    {r.service_code}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyCode(r.id, r.service_code!)}
                  >
                    {copiedId === r.id ? <Check className="size-4" /> : <Copy className="size-4" />}
                  </Button>
                </div>
                <p className="text-sm text-green-800 mt-2">
                  📌 Xuất trình mã này tại <strong>Thong Dong Daycare</strong> hoặc khi <strong>bác sĩ gia đình đến nhà</strong> để trừ lượt sử dụng.
                </p>
                {r.total_visits > 0 && (
                  <p className="text-sm text-green-800 mt-1">
                    Lượt còn lại: <span className="font-bold">{r.total_visits - r.used_visits}</span> / {r.total_visits}
                  </p>
                )}
              </div>
            )}

            {r.status === 'rejected' && r.rejected_reason && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-900">
                <p className="font-medium">Lý do từ chối:</p>
                <p className="mt-1">{r.rejected_reason}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function PaymentDetailRow({ label, value, highlight, onCopy, copied }: {
  label: string; value: string; highlight?: boolean; onCopy?: () => void; copied?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-gray-500">{label}:</span>
      <div className="flex items-center gap-1">
        <span className={`font-medium ${highlight ? 'text-teal-700 font-mono' : 'text-gray-900'}`}>{value}</span>
        {onCopy && (
          <button onClick={onCopy} className="p-1 hover:bg-gray-100 rounded">
            {copied ? <Check className="size-3.5 text-green-600" /> : <Copy className="size-3.5 text-gray-400" />}
          </button>
        )}
      </div>
    </div>
  )
}
