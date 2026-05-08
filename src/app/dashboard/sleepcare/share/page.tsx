'use client'

/**
 * T28 — Share / Consent UI
 * Citizen cấp quyền hoặc thu hồi quyền cho BS gia đình / người thân / coach
 * xem dữ liệu giấc ngủ.
 * GET /api/sleepcare/consents  → danh sách
 * POST /api/sleepcare/consents → grant / revoke
 */

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Loader2, ArrowLeft, UserCheck, Trash2, Plus, AlertCircle, ShieldCheck, Users } from 'lucide-react'

interface SleepConsent {
  id: string
  consent_type: 'doctor_share' | 'family_share' | 'coach_share'
  grantee_name: string
  scope: 'full' | 'summary_only'
  granted_at: string
  expires_at: string | null
  revoked_at: string | null
}

const CONSENT_LABEL: Record<string, string> = {
  doctor_share: 'Bác sĩ gia đình',
  family_share: 'Người thân / chăm sóc',
  coach_share: 'Wellness coach',
}

const SCOPE_LABEL: Record<string, string> = {
  full: 'Toàn bộ dữ liệu',
  summary_only: 'Chỉ tóm tắt',
}

function fmtDate(iso: string | null): string {
  if (!iso) return 'Không giới hạn'
  try { return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) } catch { return '' }
}

export default function ShareConsentPage() {
  const [consents, setConsents] = useState<SleepConsent[]>([])
  const [loading, setLoading] = useState(true)
  const [revoking, setRevoking] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formState, setFormState] = useState({
    consent_type: 'doctor_share',
    grantee_user_id: 'demo-0005-0000-0000-000000000005',
    grantee_name: 'BS. Nguyễn Hải',
    scope: 'full',
    expires_in_days: '90',
  })
  const [granting, setGranting] = useState(false)

  const fetchConsents = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/sleepcare/consents')
      if (!res.ok) throw new Error('Không thể tải danh sách.')
      const data = await res.json()
      setConsents(data.consents ?? [])
    } catch (e) { setError(e instanceof Error ? e.message : 'Lỗi.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchConsents() }, [fetchConsents])

  async function handleRevoke(consentId: string) {
    setRevoking(consentId)
    setError(null)
    try {
      const res = await fetch('/api/sleepcare/consents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'revoke', consent_id: consentId }),
      })
      if (!res.ok) throw new Error('Không thể thu hồi quyền.')
      await fetchConsents()
    } catch (e) { setError(e instanceof Error ? e.message : 'Lỗi.') }
    finally { setRevoking(null) }
  }

  async function handleGrant(e: React.FormEvent) {
    e.preventDefault()
    setGranting(true)
    setError(null)
    try {
      const res = await fetch('/api/sleepcare/consents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'grant',
          consent_type: formState.consent_type,
          grantee_user_id: formState.grantee_user_id,
          grantee_name: formState.grantee_name,
          scope: formState.scope,
          expires_in_days: formState.expires_in_days ? Number(formState.expires_in_days) : null,
        }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Lỗi.') }
      setShowForm(false)
      await fetchConsents()
    } catch (e) { setError(e instanceof Error ? e.message : 'Lỗi.') }
    finally { setGranting(false) }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/sleepcare" className="text-slate-400 hover:text-slate-700">
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="size-5 text-teal-600" /> Chia sẻ dữ liệu giấc ngủ
          </h1>
          <p className="text-sm text-slate-500">Bạn kiểm soát ai được xem thông tin giấc ngủ của mình</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-rose-700 text-sm">
          <AlertCircle className="size-4 shrink-0" /> {error}
        </div>
      )}

      {/* Consent list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
            <Users className="size-4" /> Đang chia sẻ với ({consents.length})
          </p>
          <button
            onClick={() => setShowForm(v => !v)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus className="size-4" /> Cấp quyền mới
          </button>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-slate-400 text-sm py-4"><Loader2 className="size-4 animate-spin" /> Đang tải...</div>
        ) : consents.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm bg-slate-50 rounded-xl border border-slate-200">
            Chưa chia sẻ với ai. Nhấn "Cấp quyền mới" để bắt đầu.
          </div>
        ) : (
          consents.map(c => (
            <div key={c.id} className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3">
              <UserCheck className="size-5 text-teal-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 text-sm truncate">{c.grantee_name}</p>
                <p className="text-xs text-slate-500">
                  {CONSENT_LABEL[c.consent_type]} · {SCOPE_LABEL[c.scope]}
                  {' · '}Hết hạn: {fmtDate(c.expires_at)}
                </p>
                <p className="text-xs text-slate-400">Cấp ngày {fmtDate(c.granted_at)}</p>
              </div>
              <button
                onClick={() => handleRevoke(c.id)}
                disabled={revoking === c.id}
                className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-2 rounded-lg transition-colors disabled:opacity-40"
                title="Thu hồi quyền"
              >
                {revoking === c.id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Grant form */}
      {showForm && (
        <form onSubmit={handleGrant} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
          <h2 className="font-semibold text-slate-800 text-sm">Cấp quyền xem dữ liệu giấc ngủ</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Loại người được cấp</label>
              <select value={formState.consent_type}
                onChange={e => setFormState(p => ({ ...p, consent_type: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white">
                <option value="doctor_share">Bác sĩ gia đình</option>
                <option value="family_share">Người thân / chăm sóc</option>
                <option value="coach_share">Wellness coach</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Phạm vi dữ liệu</label>
              <select value={formState.scope}
                onChange={e => setFormState(p => ({ ...p, scope: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white">
                <option value="full">Toàn bộ dữ liệu</option>
                <option value="summary_only">Chỉ tóm tắt</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Tên người được cấp</label>
              <input value={formState.grantee_name}
                onChange={e => setFormState(p => ({ ...p, grantee_name: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white" placeholder="Tên đầy đủ" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Thời hạn (ngày, để trống = vô hạn)</label>
              <input type="number" value={formState.expires_in_days}
                onChange={e => setFormState(p => ({ ...p, expires_in_days: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white" placeholder="90" min="1" />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              Huỷ
            </button>
            <button type="submit" disabled={granting}
              className="px-4 py-2 text-sm font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg disabled:opacity-60 transition-colors inline-flex items-center gap-1.5">
              {granting ? <><Loader2 className="size-3.5 animate-spin" /> Đang lưu...</> : 'Xác nhận cấp quyền'}
            </button>
          </div>
        </form>
      )}

      <p className="text-xs text-slate-400 text-center italic">
        Bạn có thể thu hồi quyền bất cứ lúc nào. Người được cấp quyền sẽ mất quyền truy cập ngay lập tức.
        Dữ liệu sức khỏe thuộc về bạn và chỉ được chia sẻ khi bạn cho phép.
      </p>
    </div>
  )
}
