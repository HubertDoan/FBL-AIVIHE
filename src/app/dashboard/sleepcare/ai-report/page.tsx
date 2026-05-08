'use client'

/**
 * T25 — AI Report Page
 * Citizen xem báo cáo AI của phiên ngủ gần nhất có report.
 * POST /api/sleepcare/generate-ai-report để tạo nếu chưa có.
 */

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Loader2, Moon, Sparkles, FileText, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface SessionWithReport {
  id: string
  start_time: string
  end_time: string | null
  sleep_score: number | null
  status: string
  ai_report_markdown: string | null
  ai_generated_at: string | null
}

function fmtDate(iso: string): string {
  try { return new Date(iso).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }) } catch { return '' }
}

export default function AiReportPage() {
  const [sessions, setSessions] = useState<SessionWithReport[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSessions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/sleepcare/sessions?limit=10')
      if (!res.ok) throw new Error('Không thể tải danh sách phiên.')
      const data = await res.json()
      const completed: SessionWithReport[] = (data.sessions ?? []).filter(
        (s: SessionWithReport) => s.status === 'completed'
      )
      setSessions(completed)
      if (completed.length > 0 && !selectedId) setSelectedId(completed[0].id)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi không xác định.')
    } finally {
      setLoading(false)
    }
  }, [selectedId])

  useEffect(() => { fetchSessions() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const selected = sessions.find(s => s.id === selectedId) ?? null

  async function generateReport() {
    if (!selectedId) return
    setGenerating(true)
    setError(null)
    try {
      const res = await fetch('/api/sleepcare/generate-ai-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: selectedId }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Lỗi sinh báo cáo.')
      }
      await fetchSessions()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi không xác định.')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20 gap-2 text-slate-500">
      <Loader2 className="size-5 animate-spin" /> Đang tải...
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/sleepcare" className="text-slate-400 hover:text-slate-700 transition-colors">
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="size-5 text-indigo-500" /> Báo cáo AI giấc ngủ
          </h1>
          <p className="text-sm text-slate-500">AI tổng hợp từ dữ liệu cảm biến SmartBed mỗi đêm</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-rose-700 text-sm">
          <AlertCircle className="size-4 shrink-0" /> {error}
        </div>
      )}

      {sessions.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Moon className="size-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Chưa có phiên ngủ nào đã hoàn thành</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-[240px_1fr] gap-5">
          {/* Session list */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Chọn phiên ngủ</p>
            {sessions.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedId(s.id)}
                className={`w-full text-left rounded-xl border px-3 py-2.5 transition-all text-sm ${
                  selectedId === s.id
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-900'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="font-semibold">{s.end_time ? fmtDate(s.end_time) : fmtDate(s.start_time)}</div>
                <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                  {s.sleep_score != null && <span className="font-medium">{s.sleep_score}đ</span>}
                  {s.ai_report_markdown
                    ? <span className="text-emerald-600 flex items-center gap-0.5"><FileText className="size-3" /> Có báo cáo</span>
                    : <span className="text-amber-600">Chưa có báo cáo</span>}
                </div>
              </button>
            ))}
          </div>

          {/* Report content */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 min-h-[300px]">
            {selected?.ai_report_markdown ? (
              <div className="prose prose-sm prose-slate max-w-none">
                <ReactMarkdown>{selected.ai_report_markdown}</ReactMarkdown>
                <p className="text-xs text-slate-400 mt-6 not-prose italic">
                  Báo cáo sinh lúc {selected.ai_generated_at ? new Date(selected.ai_generated_at).toLocaleString('vi-VN') : '—'}
                </p>
              </div>
            ) : selected ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                <Sparkles className="size-10 text-indigo-300" />
                <div>
                  <p className="font-semibold text-slate-700 mb-1">Chưa có báo cáo AI cho phiên này</p>
                  <p className="text-sm text-slate-500">AI sẽ tổng hợp dữ liệu cảm biến và sinh báo cáo cho bạn.</p>
                </div>
                <button
                  onClick={generateReport}
                  disabled={generating}
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-lg disabled:opacity-60 transition-all text-sm"
                >
                  {generating ? <><Loader2 className="size-4 animate-spin" /> Đang sinh báo cáo...</> : <><RefreshCw className="size-4" /> Sinh báo cáo AI</>}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-slate-400 text-center italic">
        AI chỉ hỗ trợ tổng hợp và giải thích — không chẩn đoán, không kê đơn, không thay thế bác sĩ.
        Dữ liệu thuộc về bạn và chỉ được chia sẻ khi bạn cho phép.
      </p>
    </div>
  )
}
