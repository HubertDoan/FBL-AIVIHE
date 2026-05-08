'use client'

/**
 * T26 — Doctor Sleepcare Patients List
 * BS gia đình xem danh sách bệnh nhân đã cấp quyền xem dữ liệu giấc ngủ.
 * GET /api/sleepcare/doctor-patients
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Loader2, ArrowLeft, Moon, Users, TrendingUp, AlertCircle,
  ChevronRight, ShieldCheck, FileText,
} from 'lucide-react'

interface Patient {
  citizen_id: string
  citizen_name: string
  consent_type: string
  scope: string
  expires_at: string | null
  granted_at: string
  last_sleep_score: number | null
  last_session_at: string | null
  session_count: number
  has_ai_report: boolean
}

const SCOPE_LABEL: Record<string, string> = {
  full: 'Toàn bộ',
  summary_only: 'Tóm tắt',
}

function scoreColor(score: number | null): string {
  if (score === null) return 'text-slate-400'
  if (score >= 80) return 'text-emerald-600'
  if (score >= 60) return 'text-amber-600'
  return 'text-rose-600'
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) } catch { return '' }
}

export default function DoctorPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/sleepcare/doctor-patients')
      .then(r => r.ok ? r.json() : Promise.reject('Không thể tải danh sách.'))
      .then(d => setPatients(d.patients ?? []))
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/sleepcare" className="text-slate-400 hover:text-slate-700">
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="size-5 text-indigo-600" /> Bệnh nhân giấc ngủ
          </h1>
          <p className="text-sm text-slate-500">Bệnh nhân đã cấp quyền xem dữ liệu giấc ngủ cho bạn</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-rose-700 text-sm">
          <AlertCircle className="size-4 shrink-0" /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-slate-400 text-sm py-8">
          <Loader2 className="size-4 animate-spin" /> Đang tải...
        </div>
      ) : patients.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200">
          <ShieldCheck className="size-10 mx-auto mb-3 text-slate-300" />
          <p className="font-medium text-slate-500">Chưa có bệnh nhân nào chia sẻ dữ liệu</p>
          <p className="text-sm text-slate-400 mt-1">Bệnh nhân cần cấp quyền từ trang "Chia sẻ dữ liệu"</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">
            {patients.length} bệnh nhân đang chia sẻ
          </p>
          {patients.map(p => (
            <Link
              key={p.citizen_id}
              href={`/dashboard/sleepcare/doctor-patients/${p.citizen_id}`}
              className="block bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-sm rounded-2xl px-4 py-4 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="size-11 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                  <Moon className="size-5 text-indigo-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-slate-900">{p.citizen_name}</p>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                      {SCOPE_LABEL[p.scope]}
                    </span>
                    {p.has_ai_report && (
                      <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <FileText className="size-3" /> Có báo cáo AI
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="size-3" />
                      Điểm ngủ cuối:{' '}
                      <span className={`font-semibold ${scoreColor(p.last_sleep_score)}`}>
                        {p.last_sleep_score ?? '—'}
                      </span>
                    </span>
                    <span>{p.session_count} phiên</span>
                    <span>Phiên gần nhất: {fmtDate(p.last_session_at)}</span>
                    <span>Hết hạn: {fmtDate(p.expires_at)}</span>
                  </div>
                </div>
                <ChevronRight className="size-4 text-slate-400 shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      )}

      <p className="text-xs text-slate-400 text-center italic">
        Dữ liệu chỉ hiển thị khi bệnh nhân còn hiệu lực cấp quyền. Quyền truy cập có thể bị thu hồi bất cứ lúc nào.
      </p>
    </div>
  )
}
