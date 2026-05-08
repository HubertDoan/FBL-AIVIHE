'use client'

/**
 * T27 — Doctor Patient Sleep Detail
 * BS xem chi tiết phiên ngủ, báo cáo AI, ghi tư vấn cho 1 bệnh nhân.
 * Yêu cầu active consent từ bệnh nhân đó.
 */

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, ArrowLeft, Moon, Sparkles, FileText, AlertCircle, Plus, RefreshCw, ClipboardList } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface Session { id: string; start_time: string; end_time: string | null; sleep_score: number | null; status: string; ai_report_markdown: string | null; ai_generated_at: string | null; duration_minutes: number | null }
interface DoctorNote { id: string; session_id: string | null; author_name: string; content: string; recommendation: string | null; created_at: string }

function fmtDate(iso: string | null): string {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) } catch { return '' }
}

export default function DoctorPatientDetailPage() {
  const { id: citizenId } = useParams<{ id: string }>()
  const [sessions, setSessions] = useState<Session[]>([])
  const [notes, setNotes] = useState<DoctorNote[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showNoteForm, setShowNoteForm] = useState(false)
  const [noteContent, setNoteContent] = useState('')
  const [noteRec, setNoteRec] = useState('')
  const [savingNote, setSavingNote] = useState(false)

  const fetchAll = useCallback(async () => {
    setError(null)
    try {
      const [sRes, nRes] = await Promise.all([
        fetch(`/api/sleepcare/sessions?citizen_id=${citizenId}&limit=10`),
        fetch(`/api/sleepcare/doctor-notes?citizen_id=${citizenId}`),
      ])
      if (!sRes.ok || !nRes.ok) throw new Error('Không thể tải dữ liệu.')
      const [sd, nd] = await Promise.all([sRes.json(), nRes.json()])
      const completed = (sd.sessions ?? []).filter((s: Session) => s.status === 'completed')
      setSessions(completed)
      setNotes(nd.notes ?? [])
      if (completed.length > 0 && !selectedId) setSelectedId(completed[0].id)
    } catch (e) { setError(e instanceof Error ? e.message : 'Lỗi.') }
    finally { setLoading(false) }
  }, [citizenId, selectedId])

  useEffect(() => { fetchAll() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const selected = sessions.find(s => s.id === selectedId) ?? null

  async function generateReport() {
    if (!selectedId) return
    setGenerating(true); setError(null)
    try {
      const res = await fetch('/api/sleepcare/generate-ai-report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id: selectedId }) })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Lỗi.') }
      await fetchAll()
    } catch (e) { setError(e instanceof Error ? e.message : 'Lỗi.') }
    finally { setGenerating(false) }
  }

  async function saveNote(e: React.FormEvent) {
    e.preventDefault()
    if (!noteContent.trim()) return
    setSavingNote(true); setError(null)
    try {
      const res = await fetch('/api/sleepcare/doctor-notes', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ citizen_id: citizenId, session_id: selectedId, content: noteContent, recommendation: noteRec || null }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Lỗi.') }
      setNoteContent(''); setNoteRec(''); setShowNoteForm(false)
      await fetchAll()
    } catch (e) { setError(e instanceof Error ? e.message : 'Lỗi.') }
    finally { setSavingNote(false) }
  }

  if (loading) return <div className="flex items-center justify-center py-20 gap-2 text-slate-500"><Loader2 className="size-5 animate-spin" /> Đang tải...</div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/sleepcare/doctor-patients" className="text-slate-400 hover:text-slate-700"><ArrowLeft className="size-5" /></Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Moon className="size-5 text-indigo-500" /> Chi tiết giấc ngủ bệnh nhân</h1>
          <p className="text-sm text-slate-500">Phiên ngủ, báo cáo AI và ghi chú tư vấn</p>
        </div>
      </div>

      {error && <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-rose-700 text-sm"><AlertCircle className="size-4 shrink-0" /> {error}</div>}

      {sessions.length === 0 ? (
        <div className="text-center py-14 text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
          <Moon className="size-9 mx-auto mb-3 opacity-30" /><p>Bệnh nhân chưa có phiên ngủ nào hoàn thành.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-[220px_1fr] gap-5">
          {/* Session list */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Phiên ngủ</p>
            {sessions.map(s => (
              <button key={s.id} onClick={() => setSelectedId(s.id)}
                className={`w-full text-left rounded-xl border px-3 py-2.5 text-sm transition-all ${selectedId === s.id ? 'bg-indigo-50 border-indigo-300 text-indigo-900' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'}`}>
                <div className="font-semibold">{fmtDate(s.end_time ?? s.start_time)}</div>
                <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                  {s.sleep_score != null && <span className="font-medium">{s.sleep_score}đ</span>}
                  {s.ai_report_markdown ? <span className="text-emerald-600 flex items-center gap-0.5"><FileText className="size-3" /> Báo cáo</span> : <span className="text-amber-600">Chưa có BC</span>}
                </div>
              </button>
            ))}
          </div>

          {/* Report + notes */}
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 min-h-[240px]">
              {selected?.ai_report_markdown ? (
                <div className="prose prose-sm prose-slate max-w-none">
                  <ReactMarkdown>{selected.ai_report_markdown}</ReactMarkdown>
                  <p className="text-xs text-slate-400 mt-4 not-prose italic">Sinh lúc {selected.ai_generated_at ? new Date(selected.ai_generated_at).toLocaleString('vi-VN') : '—'}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                  <Sparkles className="size-9 text-indigo-300" />
                  <p className="text-slate-600 font-semibold">Chưa có báo cáo AI</p>
                  <button onClick={generateReport} disabled={generating}
                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg disabled:opacity-60 text-sm">
                    {generating ? <><Loader2 className="size-4 animate-spin" /> Đang sinh...</> : <><RefreshCw className="size-4" /> Sinh báo cáo AI</>}
                  </button>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-800 flex items-center gap-1.5 text-sm"><ClipboardList className="size-4" /> Ghi chú tư vấn ({notes.length})</p>
                <button onClick={() => setShowNoteForm(v => !v)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1.5 rounded-lg">
                  <Plus className="size-3.5" /> Thêm ghi chú
                </button>
              </div>

              {showNoteForm && (
                <form onSubmit={saveNote} className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-200">
                  <textarea value={noteContent} onChange={e => setNoteContent(e.target.value)} rows={3} required
                    placeholder="Nhận xét lâm sàng..." className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white resize-none" />
                  <input value={noteRec} onChange={e => setNoteRec(e.target.value)}
                    placeholder="Khuyến nghị (tùy chọn)..." className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white" />
                  <div className="flex gap-2 justify-end">
                    <button type="button" onClick={() => setShowNoteForm(false)} className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Huỷ</button>
                    <button type="submit" disabled={savingNote} className="px-3 py-1.5 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-60 inline-flex items-center gap-1.5">
                      {savingNote ? <><Loader2 className="size-3 animate-spin" /> Đang lưu...</> : 'Lưu ghi chú'}
                    </button>
                  </div>
                </form>
              )}

              {notes.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">Chưa có ghi chú nào.</p>
              ) : (
                notes.map(n => (
                  <div key={n.id} className="border-l-2 border-indigo-200 pl-3 py-1">
                    <p className="text-sm text-slate-800">{n.content}</p>
                    {n.recommendation && <p className="text-xs text-indigo-700 mt-1 font-medium">→ {n.recommendation}</p>}
                    <p className="text-xs text-slate-400 mt-1">{n.author_name} · {new Date(n.created_at).toLocaleString('vi-VN')}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-slate-400 text-center italic">AI chỉ hỗ trợ tổng hợp — không chẩn đoán, không kê đơn. Dữ liệu chỉ hiển thị khi bệnh nhân còn cấp quyền.</p>
    </div>
  )
}
