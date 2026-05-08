'use client'

/**
 * SleepCare Devices Placeholder — danh sách pods (giường SmartBed) của citizen
 * Status badge: online · offline · maintenance · error
 * Nút "Yêu cầu lắp đặt" → link tới /dashboard/services (placeholder route)
 * Sprint 1: không cần realtime — chỉ render snapshot + last_seen_at
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Loader2, ArrowLeft, AlertCircle, Bed, Wifi, WifiOff, Wrench, AlertTriangle,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'

interface Pod {
  id: string
  serial_number: string
  facility: string
  status: 'online' | 'offline' | 'error' | 'maintenance'
  last_seen_at: string | null
  variant: string
  room: string | null
}

const STATUS: Record<Pod['status'], { label: string; icon: typeof Wifi; className: string }> = {
  online:      { label: 'Đang kết nối',  icon: Wifi,            className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  offline:     { label: 'Mất kết nối',   icon: WifiOff,         className: 'bg-gray-50 text-gray-600 border-gray-200' },
  maintenance: { label: 'Đang bảo trì',  icon: Wrench,          className: 'bg-amber-50 text-amber-700 border-amber-200' },
  error:       { label: 'Lỗi',           icon: AlertTriangle,   className: 'bg-red-50 text-red-700 border-red-200' },
}

const VARIANT_LABEL: Record<string, string> = {
  b1_personal: 'B1 — Cá nhân',
  b2_family:   'B2 — Gia đình',
  b3_clinic:   'B3 — Phòng khám',
}

function fmtRelative(iso: string | null): string {
  if (!iso) return '—'
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return '—'
  const diffMin = Math.round((Date.now() - t) / 60000)
  if (diffMin < 1)   return 'vừa xong'
  if (diffMin < 60)  return `${diffMin} phút trước`
  if (diffMin < 1440) return `${Math.floor(diffMin / 60)} giờ trước`
  return `${Math.floor(diffMin / 1440)} ngày trước`
}

export default function SleepCareDevicesPage() {
  const { user, loading: authLoading } = useAuth()
  const [pods, setPods] = useState<Pod[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading || !user) return
    let cancel = false
    async function load() {
      try {
        setLoading(true)
        const res = await fetch('/api/sleepcare/pods')
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.error ?? `Lỗi tải dữ liệu (${res.status}).`)
        }
        const data = await res.json()
        if (!cancel) setPods(data.pods ?? [])
      } catch (e) {
        if (!cancel) setError(e instanceof Error ? e.message : 'Không tải được dữ liệu.')
      } finally {
        if (!cancel) setLoading(false)
      }
    }
    load()
    return () => { cancel = true }
  }, [authLoading, user])

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-600 gap-3">
        <Loader2 className="size-6 animate-spin" /> Đang tải danh sách thiết bị…
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          <AlertCircle className="size-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Không tải được danh sách thiết bị</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard/sleepcare"
          className="inline-flex items-center gap-1.5 text-gray-600 hover:text-gray-900 text-base"
        >
          <ArrowLeft className="size-4" /> Tổng quan
        </Link>
      </div>

      <header className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Giường SmartBed</h1>
          <p className="text-base text-gray-600 mt-1">{pods.length} thiết bị được gán cho bạn</p>
        </div>
        <Link
          href="/dashboard/services"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 min-h-[44px]"
        >
          Yêu cầu lắp đặt
        </Link>
      </header>

      {pods.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <Bed className="size-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-700 font-medium">Bạn chưa có giường SmartBed nào.</p>
          <p className="text-gray-500 text-sm mt-1">Liên hệ trung tâm Thong Dong Care để được tư vấn lắp đặt.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {pods.map(p => {
            const s = STATUS[p.status]
            const Icon = s.icon
            return (
              <li key={p.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="size-12 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center text-indigo-700 shrink-0">
                      <Bed className="size-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-base">{p.serial_number}</p>
                      <p className="text-sm text-gray-600 mt-0.5">
                        {VARIANT_LABEL[p.variant] ?? p.variant}
                        {p.room && <> · {p.room}</>}
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        Cập nhật: {fmtRelative(p.last_seen_at)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium border',
                      s.className,
                    )}
                  >
                    <Icon className="size-4" />
                    {s.label}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <p className="text-xs text-gray-500 text-center pt-2">
        Trang đặt chỗ — tính năng quản lý chi tiết thiết bị sẽ có ở phiên bản tiếp theo.
      </p>
    </div>
  )
}
