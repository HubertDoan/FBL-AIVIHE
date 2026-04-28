'use client'

/**
 * Panel phân tích AI: tương quan bối cảnh (thuốc, ăn uống, vận động, tinh thần)
 * với sự thay đổi chỉ số sức khỏe → gợi ý điều chỉnh lối sống.
 * Chỉ hiển thị khi có ≥3 bản ghi có context_notes.
 */

import { useState } from 'react'
import { Sparkles, TrendingUp, TrendingDown, Minus, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { AiFactorAnalysisResult, FactorInsight } from '@/app/api/vitals/ai-factor-analysis/route'
import type { VitalRecord } from './vitals-frequent-indicators-section-blood-pressure-glucose-heart-rate'

interface Props {
  vitals: VitalRecord[]
}

const FACTOR_TYPE_ICON: Record<string, string> = {
  diet:       '🍽',
  exercise:   '🏃',
  medication: '💊',
  mental:     '🧠',
}

const INDICATOR_LABEL: Record<string, string> = {
  blood_pressure: 'Huyết áp',
  blood_glucose:  'Đường huyết',
  weight:         'Cân nặng',
  heart_rate:     'Nhịp tim',
}

function DirectionIcon({ d }: { d: FactorInsight['direction'] }) {
  if (d === 'up')   return <TrendingUp   className="size-3.5 text-red-400 inline ml-1" />
  if (d === 'down') return <TrendingDown className="size-3.5 text-green-500 inline ml-1" />
  return <Minus className="size-3.5 text-gray-400 inline ml-1" />
}

export function VitalsAiFactorAnalysisPanel({ vitals }: Props) {
  const [expanded, setExpanded]   = useState(false)
  const [loading, setLoading]     = useState(false)
  const [result, setResult]       = useState<AiFactorAnalysisResult | null>(null)
  const [error, setError]         = useState<string | null>(null)

  // Only show if enough records with context
  const contextCount = vitals.filter(v => v.context_notes).length
  if (contextCount < 3) return null

  async function runAnalysis() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/vitals/ai-factor-analysis', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Lỗi phân tích')
      setResult(data.result)
      setExpanded(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi không xác định')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-violet-200 bg-violet-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-violet-600" />
          <span className="text-xs font-bold text-violet-700 uppercase tracking-widest">Phân tích AI</span>
          <span className="text-[10px] text-violet-500">{contextCount} bản ghi có bối cảnh</span>
        </div>
        <div className="flex items-center gap-2">
          {result && (
            <button onClick={() => setExpanded(e => !e)} className="text-violet-500 hover:text-violet-700">
              {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </button>
          )}
          <Button
            size="sm"
            onClick={runAnalysis}
            disabled={loading}
            className="h-7 text-xs gap-1 bg-violet-600 hover:bg-violet-700 text-white"
          >
            {loading ? <Loader2 className="size-3 animate-spin" /> : <Sparkles className="size-3" />}
            {loading ? 'Đang phân tích...' : result ? 'Phân tích lại' : 'Phân tích ngay'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="px-4 pb-3 text-xs text-red-600 bg-red-50 border-t border-red-100 py-2">{error}</div>
      )}

      {result && expanded && (
        <div className="border-t border-violet-200 px-4 py-4 space-y-4 bg-white">
          {/* Summary */}
          <p className="text-sm text-gray-700 leading-relaxed">{result.summary}</p>

          {/* Insights */}
          {result.insights.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Các yếu tố ảnh hưởng</h3>
              <div className="space-y-1.5">
                {result.insights.map((ins, i) => (
                  <div key={i} className={`rounded-lg px-3 py-2 text-sm border ${
                    ins.direction === 'up'   ? 'bg-red-50 border-red-100' :
                    ins.direction === 'down' ? 'bg-green-50 border-green-100' :
                    'bg-gray-50 border-gray-100'
                  }`}>
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-medium text-gray-800">
                        {FACTOR_TYPE_ICON[ins.factor_type] ?? '•'} {ins.factor}
                      </span>
                      <span className="text-[10px] text-gray-400 shrink-0">
                        {INDICATOR_LABEL[ins.indicator] ?? ins.indicator}
                        <DirectionIcon d={ins.direction} />
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5">{ins.effect}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Gợi ý điều chỉnh</h3>
              <ul className="space-y-1">
                {result.recommendations.map((rec, i) => (
                  <li key={i} className="text-sm text-gray-700 flex gap-2">
                    <span className="text-violet-400 font-bold shrink-0">→</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-[10px] text-gray-400 border-t border-gray-100 pt-2">
            AI chỉ hỗ trợ tổng hợp thông tin từ dữ liệu bạn cung cấp, không thay thế bác sĩ và không chẩn đoán bệnh.
            · Phân tích từ {result.records_analyzed} bản ghi · {new Date(result.generated_at).toLocaleDateString('vi-VN')}
          </p>
        </div>
      )}
    </div>
  )
}
