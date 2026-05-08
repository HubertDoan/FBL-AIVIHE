'use client'

/**
 * SleepCare Overview — điểm giấc ngủ đêm qua, thống kê 7 ngày, sự kiện gần nhất
 * Data: GET /api/sleepcare/sessions?limit=7
 * Layout: Hero score (T19) → 7-day bar chart → recent events preview (T20)
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2, Moon, ArrowRight, Bed, AlertCircle } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { useAuth } from '@/hooks/use-auth'
import { SleepScoreBadge } from '@/components/sleepcare/sleep-score-badge-with-trend-indicator'
import { SessionEventsTimeline, type SessionEvent } from '@/components/sleepcare/session-events-timeline-with-posture-and-snore'

interface SessionListItem {
  id: string
  pod_id: string
  citizen_id: string
  start_time: string
  end_time: string | null
  status: 'active' | 'completed' | 'interrupted'
  sleep_score: number | null
  duration_minutes: number | null
  events_count: number
  readings_count: number
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
  } catch { return '' }
}

function fmtDuration(minutes: number | null): string {
  if (minutes == null) return '—'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}h ${m.toString().padStart(2, '0')}p`
}

function scoreColor(score: number | null): string {
  if (score == null) return '#cbd5e1'
  if (score >= 80) return '#10b981'
  if (score >= 60) return '#f59e0b'
  return '#ef4444'
}

function computeTrend(current: number | null, previous: number | null): 'up' | 'down' | 'stable' | undefined {
  if (current == null || previous == null) return undefined
  if (current - previous >= 3) return 'up'
  if (previous - current >= 3) return 'down'
  return 'stable'
}

export default function SleepCarePage() {
  const { user, loading: authLoading } = useAuth()
  const [sessions, setSessions] = useState<SessionListItem[]>([])
  const [recentEvents, setRecentEvents] = useState<SessionEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading || !user) return
    let cancel = false
    async function load() {
      try {
        setLoading(true)
        const res = await fetch('/api/sleepcare/sessions?limit=7')
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.error ?? `Lỗi tải dữ liệu (${res.status}).`)
        }
        const data = await res.json()
        const list: SessionListItem[] = data.sessions ?? []
        if (cancel) return
        setSessions(list)
        // Latest completed session — fetch its events for preview
        const last = list.find(s => s.status === 'completed' && s.events_count > 0)
        if (last) {
          // No /sessions/[id] route yet — pull from list endpoint by re-fetch? Demo: skip if not available.
          // For now leave events empty; real fetch wired when T17 detail endpoint lands.
          setRecentEvents([])
        }
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
        <Loader2 className="size-6 animate-spin" /> Đang tải dữ liệu giấc ngủ…
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          <AlertCircle className="size-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Không tải được dữ liệu giấc ngủ</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  const completed = sessions.filter(s => s.status === 'completed' && s.sleep_score != null)
  const lastNight = completed[0] ?? null
  const trend = computeTrend(lastNight?.sleep_score ?? null, completed[1]?.sleep_score ?? null)

  const chartData = [...completed]
    .reverse()
    .map(s => ({
      day: fmtDate(s.start_time),
      score: s.sleep_score ?? 0,
      duration: s.duration_minutes ?? 0,
    }))

  const avgScore = completed.length
    ? Math.round(completed.reduce((sum, s) => sum + (s.sleep_score ?? 0), 0) / completed.length)
    : null

  const totalEvents = sessions.reduce((sum, s) => sum + (s.events_count ?? 0), 0)

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      {/* Header */}
      <header className="flex items-center gap-3">
        <div className="size-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white">
          <Moon className="size-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Giấc ngủ của bạn</h1>
          <p className="text-base text-gray-600">Theo dõi chất lượng giấc ngủ qua giường SmartBed</p>
        </div>
      </header>

      {/* Hero — Last night score */}
      <section className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Đêm qua</h2>
        {lastNight ? (
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <SleepScoreBadge score={lastNight.sleep_score} trend={trend} size="lg" label="Điểm giấc ngủ" />
            <div className="flex-1 space-y-3 w-full">
              <Stat label="Thời lượng" value={fmtDuration(lastNight.duration_minutes)} />
              <Stat label="Bắt đầu" value={new Date(lastNight.start_time).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })} />
              <Stat label="Sự kiện ghi nhận" value={`${lastNight.events_count} sự kiện`} />
              <Link
                href={`/dashboard/sleepcare/sessions/${lastNight.id}`}
                className="inline-flex items-center gap-2 text-teal-700 hover:text-teal-800 font-medium text-base mt-2"
              >
                Xem chi tiết phiên <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        ) : (
          <EmptyHero />
        )}
      </section>

      {/* 7-day trend */}
      <section className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Thống kê 7 ngày gần nhất</h2>
          <div className="flex items-center gap-3 text-sm">
            {avgScore != null && (
              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">
                Trung bình: {avgScore}/100
              </span>
            )}
            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">
              Sự kiện: {totalEvents}
            </span>
          </div>
        </div>
        {chartData.length === 0 ? (
          <p className="text-gray-500 text-base text-center py-8">Chưa đủ phiên ngủ để hiển thị xu hướng.</p>
        ) : (
          <div style={{ minHeight: 220 }}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ fontSize: 14, borderRadius: 8 }}
                  formatter={(v: unknown) => [`${v}/100`, 'Điểm']}
                />
                <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                  {chartData.map((row, idx) => (
                    <Cell key={idx} fill={scoreColor(row.score)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* Recent sessions list (preview, link to full list) */}
      <section className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Phiên gần đây</h2>
          <Link
            href="/dashboard/sleepcare/sessions"
            className="text-teal-700 hover:text-teal-800 font-medium text-base inline-flex items-center gap-1"
          >
            Xem tất cả <ArrowRight className="size-4" />
          </Link>
        </div>
        {sessions.length === 0 ? (
          <p className="text-gray-500 text-base text-center py-6">Chưa có phiên ngủ nào.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {sessions.slice(0, 3).map(s => (
              <li key={s.id}>
                <Link
                  href={`/dashboard/sleepcare/sessions/${s.id}`}
                  className="flex items-center justify-between py-3 px-1 hover:bg-slate-50 rounded-lg transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                      <Bed className="size-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {fmtDate(s.start_time)} — {fmtDuration(s.duration_minutes)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {s.status === 'active' ? 'Đang theo dõi' : `${s.events_count} sự kiện`}
                      </p>
                    </div>
                  </div>
                  <SleepScoreBadge score={s.sleep_score} size="sm" label="Điểm" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {recentEvents.length > 0 && (
        <section className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Sự kiện đáng chú ý</h2>
          <SessionEventsTimeline events={recentEvents} maxItems={3} />
        </section>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-gray-100 pb-2 last:border-0">
      <span className="text-base text-gray-600">{label}</span>
      <span className="text-base font-semibold text-gray-900">{value}</span>
    </div>
  )
}

function EmptyHero() {
  return (
    <div className="text-center py-8 px-4 border border-dashed border-gray-200 rounded-xl">
      <Bed className="size-10 text-gray-300 mx-auto mb-2" />
      <p className="text-gray-700 font-medium">Chưa có phiên ngủ hoàn tất</p>
      <p className="text-gray-500 text-sm mt-1">Sau đêm đầu sử dụng giường SmartBed, điểm giấc ngủ sẽ hiển thị ở đây.</p>
    </div>
  )
}
