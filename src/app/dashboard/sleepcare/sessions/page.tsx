'use client'

/**
 * SleepCare Sessions List — danh sách 30 phiên gần nhất
 * Filter: tuần này / tháng này / tất cả
 * Mỗi row: ngày · thời lượng · sleep score badge · số sự kiện · link detail
 */

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Loader2, ArrowLeft, Bed, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { SleepScoreBadge } from '@/components/sleepcare/sleep-score-badge-with-trend-indicator'

interface SessionListItem {
  id: string
  start_time: string
  end_time: string | null
  status: 'active' | 'completed' | 'interrupted'
  sleep_score: number | null
  duration_minutes: number | null
  events_count: number
}

type Filter = 'week' | 'month' | 'all'

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'week',  label: 'Tuần này' },
  { id: 'month', label: 'Tháng này' },
  { id: 'all',   label: 'Tất cả' },
]

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch { return '' }
}

function fmtDuration(minutes: number | null): string {
  if (minutes == null) return '—'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}h ${m.toString().padStart(2, '0')}p`
}

function withinFilter(iso: string, filter: Filter): boolean {
  if (filter === 'all') return true
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return false
  const now = Date.now()
  const days = filter === 'week' ? 7 : 31
  return now - t <= days * 86400000
}

export default function SleepCareSessionsListPage() {
  const { user, loading: authLoading } = useAuth()
  const [sessions, setSessions] = useState<SessionListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>('all')

  useEffect(() => {
    if (authLoading || !user) return
    let cancel = false
    async function load() {
      try {
        setLoading(true)
        const res = await fetch('/api/sleepcare/sessions?limit=30')
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.error ?? `Lỗi tải dữ liệu (${res.status}).`)
        }
        const data = await res.json()
        if (!cancel) setSessions(data.sessions ?? [])
      } catch (e) {
        if (!cancel) setError(e instanceof Error ? e.message : 'Không tải được dữ liệu.')
      } finally {
        if (!cancel) setLoading(false)
      }
    }
    load()
    return () => { cancel = true }
  }, [authLoading, user])

  const filtered = useMemo(
    () => sessions.filter(s => withinFilter(s.start_time, filter)),
    [sessions, filter],
  )

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-600 gap-3">
        <Loader2 className="size-6 animate-spin" /> Đang tải danh sách phiên ngủ…
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          <AlertCircle className="size-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Không tải được danh sách phiên</p>
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

      <header>
        <h1 className="text-2xl font-bold text-gray-900">Phiên ngủ</h1>
        <p className="text-base text-gray-600 mt-1">
          {filtered.length} phiên · Lọc: {FILTERS.find(f => f.id === filter)?.label}
        </p>
      </header>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map(f => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={
              'px-4 py-2 rounded-full text-base font-medium border transition min-h-[44px] ' +
              (filter === f.id
                ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-slate-50')
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-10 px-4">
            <Bed className="size-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-700 font-medium">Không có phiên ngủ trong khoảng thời gian này.</p>
            <p className="text-gray-500 text-sm mt-1">Thử bộ lọc khác hoặc đợi đêm tiếp theo.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filtered.map(s => (
              <li key={s.id}>
                <Link
                  href={`/dashboard/sleepcare/sessions/${s.id}`}
                  className="flex items-center justify-between gap-4 p-4 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="size-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                      <Bed className="size-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-base truncate">{fmtDate(s.start_time)}</p>
                      <p className="text-sm text-gray-600 mt-0.5">
                        {fmtDuration(s.duration_minutes)} · {s.events_count} sự kiện
                        {s.status === 'active' && <span className="text-emerald-700 ml-2">· Đang theo dõi</span>}
                        {s.status === 'interrupted' && <span className="text-amber-700 ml-2">· Bị ngắt</span>}
                      </p>
                    </div>
                  </div>
                  <SleepScoreBadge score={s.sleep_score} size="sm" label="Điểm" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
