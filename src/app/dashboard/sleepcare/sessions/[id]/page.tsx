'use client'

/**
 * SleepCare Session Detail — chi tiết 1 phiên ngủ
 * Header: phiên ID, thời gian, thời lượng, score
 * Body: SleepSensorChart (T21) + SessionEventsTimeline (T20)
 * Footer: link xem báo cáo AI (nếu có)
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Loader2, ArrowLeft, AlertCircle, Sparkles, Clock } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { SleepScoreBadge } from '@/components/sleepcare/sleep-score-badge-with-trend-indicator'
import {
  SessionEventsTimeline,
  type SessionEvent,
} from '@/components/sleepcare/session-events-timeline-with-posture-and-snore'
import {
  SleepSensorChart,
  type SensorReading,
} from '@/components/sleepcare/sleep-sensor-multi-line-chart-with-brush'

interface Session {
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
  ai_report_markdown: string | null
  ai_generated_at: string | null
}

function fmtDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })
  } catch { return '—' }
}

function fmtDuration(minutes: number | null): string {
  if (minutes == null) return '—'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}h ${m.toString().padStart(2, '0')}p`
}

function statusLabel(status: Session['status']): { text: string; className: string } {
  switch (status) {
    case 'active':      return { text: 'Đang theo dõi',  className: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
    case 'completed':   return { text: 'Hoàn tất',        className: 'bg-slate-50 text-slate-700 border-slate-200' }
    case 'interrupted': return { text: 'Bị ngắt',         className: 'bg-amber-50 text-amber-700 border-amber-200' }
  }
}

export default function SleepCareSessionDetailPage() {
  const params = useParams<{ id: string }>()
  const sessionId = params?.id
  const { user, loading: authLoading } = useAuth()
  const [session, setSession] = useState<Session | null>(null)
  const [events, setEvents] = useState<SessionEvent[]>([])
  // Demo: backend không lưu raw readings; chart sẽ rỗng cho đến khi production wire-up
  const [readings] = useState<SensorReading[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading || !user || !sessionId) return
    let cancel = false
    async function load() {
      try {
        setLoading(true)
        const res = await fetch(`/api/sleepcare/sessions/${sessionId}`)
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.error ?? `Lỗi tải dữ liệu (${res.status}).`)
        }
        const data = await res.json()
        if (cancel) return
        setSession(data.session)
        setEvents(data.events ?? [])
      } catch (e) {
        if (!cancel) setError(e instanceof Error ? e.message : 'Không tải được dữ liệu.')
      } finally {
        if (!cancel) setLoading(false)
      }
    }
    load()
    return () => { cancel = true }
  }, [authLoading, user, sessionId])

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-600 gap-3">
        <Loader2 className="size-6 animate-spin" /> Đang tải chi tiết phiên…
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          <AlertCircle className="size-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Không tải được phiên ngủ</p>
            <p className="text-sm mt-1">{error ?? 'Phiên không tồn tại.'}</p>
            <Link href="/dashboard/sleepcare/sessions" className="text-red-700 underline text-sm mt-2 inline-block">
              ← Quay lại danh sách
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const status = statusLabel(session.status)

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard/sleepcare/sessions"
          className="inline-flex items-center gap-1.5 text-gray-600 hover:text-gray-900 text-base"
        >
          <ArrowLeft className="size-4" /> Danh sách phiên
        </Link>
      </div>

      {/* Header */}
      <header className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">Phiên #{session.id}</h1>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium border ${status.className}`}>
                {status.text}
              </span>
            </div>
            <p className="text-base text-gray-700 inline-flex items-center gap-1.5">
              <Clock className="size-4 text-gray-500" />
              {fmtDateTime(session.start_time)}
              {session.end_time && <> → {fmtDateTime(session.end_time)}</>}
            </p>
            <p className="text-base text-gray-600">
              Thời lượng: <span className="font-semibold text-gray-900">{fmtDuration(session.duration_minutes)}</span>
              <span className="mx-2 text-gray-300">·</span>
              {session.events_count} sự kiện
              <span className="mx-2 text-gray-300">·</span>
              {session.readings_count} điểm đo
            </p>
          </div>
          <SleepScoreBadge score={session.sleep_score} size="md" label="Điểm giấc ngủ" />
        </div>
      </header>

      {/* Sensor chart */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Biểu đồ cảm biến</h2>
        <SleepSensorChart readings={readings} height={320} />
        <p className="text-xs text-gray-500 mt-2">
          Dữ liệu cảm biến raw chỉ khả dụng khi giường SmartBed đang gửi telemetry.
        </p>
      </section>

      {/* Events timeline */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Sự kiện trong đêm</h2>
        <SessionEventsTimeline events={events} />
      </section>

      {/* AI report link */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-start gap-3">
            <div className="size-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Báo cáo AI</h2>
              <p className="text-sm text-gray-600 mt-0.5">
                {session.ai_report_markdown
                  ? `Tạo lúc ${session.ai_generated_at ? fmtDateTime(session.ai_generated_at) : ''}`
                  : 'Chưa có báo cáo. AI sẽ tổng hợp sau khi phiên hoàn tất.'}
              </p>
            </div>
          </div>
          <Link
            href={`/dashboard/sleepcare/ai-report?session=${session.id}`}
            className="px-4 py-2 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700 min-h-[44px] inline-flex items-center"
          >
            Xem báo cáo
          </Link>
        </div>
      </section>
    </div>
  )
}
