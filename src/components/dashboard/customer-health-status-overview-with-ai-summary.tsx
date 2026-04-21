'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Sparkles, FileText, HeartPulse, AlertTriangle, ArrowRight } from 'lucide-react'

/**
 * Tình trạng sức khỏe chung — top section của customer dashboard.
 * Hiển thị:
 * - Bản tóm tắt AI về sức khỏe hiện tại
 * - 3 chỉ số: số tài liệu, số chỉ số đã ghi, cảnh báo cần chú ý
 * - Nút "Cập nhật" → upload tài liệu mới
 */
interface HealthSummary {
  summary?: string
  document_count?: number
  vital_count?: number
  alert_count?: number
  last_updated?: string
}

export function CustomerHealthStatusOverviewWithAiSummary({ userName }: { userName: string }) {
  const [data, setData] = useState<HealthSummary>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard/health-overview')
      .then((r) => r.ok ? r.json() : {})
      .then((d) => setData(d ?? {}))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const summary = data.summary || `Chưa có đủ dữ liệu để AI tổng hợp. Hãy bắt đầu bằng việc upload kết quả khám/đơn thuốc gần nhất để AIVIHE tóm tắt tình trạng sức khỏe cho bạn.`
  const docCount = data.document_count ?? 0
  const vitalCount = data.vital_count ?? 0
  const alertCount = data.alert_count ?? 0

  return (
    <Card className="border-teal-200 bg-gradient-to-br from-teal-50 via-white to-emerald-50 overflow-hidden">
      <CardContent className="pt-5 pb-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="size-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-teal-500/20">
            <Sparkles className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-lg font-bold text-teal-900">
                Tình trạng sức khỏe của {userName}
              </h2>
              <span className="text-xs text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full font-medium">
                AI tổng hợp
              </span>
            </div>
            {data.last_updated && (
              <p className="text-xs text-teal-600 mt-0.5">
                Cập nhật: {new Date(data.last_updated).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>
        </div>

        {/* AI summary text */}
        <p className="text-sm text-teal-900/90 leading-relaxed mb-4 pl-13">
          {loading ? 'Đang phân tích dữ liệu sức khỏe của bạn...' : summary}
        </p>

        {/* 3 metric tiles */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <MetricTile icon={FileText} label="Tài liệu" value={docCount} color="teal" />
          <MetricTile icon={HeartPulse} label="Chỉ số" value={vitalCount} color="emerald" />
          <MetricTile icon={AlertTriangle} label="Cần chú ý" value={alertCount} color={alertCount > 0 ? 'rose' : 'slate'} />
        </div>

        {/* CTA */}
        <div className="flex gap-2 flex-wrap">
          <Link
            href="/dashboard/upload"
            className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
          >
            Upload tài liệu mới <ArrowRight className="size-3.5" />
          </Link>
          <Link
            href="/dashboard/ai-summary"
            className="inline-flex items-center gap-1.5 bg-white border border-teal-200 hover:border-teal-400 text-teal-700 text-sm font-semibold px-4 py-2 rounded-lg transition"
          >
            Xem báo cáo AI đầy đủ
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

function MetricTile({ icon: Icon, label, value, color }: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  color: 'teal' | 'emerald' | 'rose' | 'slate'
}) {
  const COLORS = {
    teal: 'bg-teal-100 text-teal-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    rose: 'bg-rose-100 text-rose-700',
    slate: 'bg-slate-100 text-slate-600',
  }
  return (
    <div className="bg-white/70 backdrop-blur rounded-lg px-2.5 py-2 border border-teal-100 flex items-center gap-2">
      <div className={`size-8 rounded-lg flex items-center justify-center ${COLORS[color]}`}>
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <div className="text-base font-bold text-slate-900 leading-none">{value}</div>
        <div className="text-[11px] text-slate-500 truncate">{label}</div>
      </div>
    </div>
  )
}
