'use client'

/**
 * Bảng thống kê hàng tuần / tháng cho huyết áp · đường huyết · cân nặng
 * + biểu đồ xu hướng Recharts. Hiển thị dưới phần theo dõi hàng ngày.
 */

import { useState, useMemo } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { VitalRecord } from './vitals-frequent-indicators-section-blood-pressure-glucose-heart-rate'

type Period = 'weekly' | 'monthly'

interface PeriodStats {
  label: string         // "W12" | "Th4/26"
  sortKey: string       // "2026-W12" | "2026-04" for stable sort
  bp_sys: number | null
  glucose: number | null
  weight: number | null
  normal_pct: number    // % records with alert_level === null
}

// ISO week number (standard algorithm)
function isoWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const day = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

function periodKey(date: Date, period: Period): string {
  if (period === 'weekly') {
    const w = isoWeekNumber(date)
    return `${date.getFullYear()}-W${String(w).padStart(2, '0')}`
  }
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function periodLabel(key: string, period: Period): string {
  if (period === 'weekly') {
    const w = parseInt(key.split('-W')[1])
    return `T${w}`   // Tuần 12 → "T12"
  }
  const [year, month] = key.split('-')
  return `Th${parseInt(month)}/${year.slice(2)}`  // "Th4/26"
}

function avg(arr: number[]): number | null {
  return arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null
}

function aggregatePeriods(vitals: VitalRecord[], period: Period): PeriodStats[] {
  const buckets = new Map<string, VitalRecord[]>()

  for (const v of vitals) {
    const k = periodKey(new Date(v.measured_at), period)
    if (!buckets.has(k)) buckets.set(k, [])
    buckets.get(k)!.push(v)
  }

  const limit = period === 'weekly' ? 8 : 6

  return Array.from(buckets.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-limit)
    .map(([key, records]) => {
      const bp  = records.filter(v => v.indicator_type === 'blood_pressure' && 'sys' in v.value)
      const gl  = records.filter(v => v.indicator_type === 'blood_glucose')
      const wt  = records.filter(v => v.indicator_type === 'weight')
      const normal = records.filter(v => !v.alert_level).length
      return {
        label:      periodLabel(key, period),
        sortKey:    key,
        bp_sys:     avg(bp.map(v => v.value.sys ?? 0)),
        glucose:    avg(gl.map(v => v.value.value ?? 0)),
        weight:     avg(wt.map(v => v.value.value ?? 0)),
        normal_pct: records.length ? Math.round((normal / records.length) * 100) : 100,
      }
    })
}

function Trend({ curr, prev }: { curr: number | null; prev: number | null }) {
  if (!curr || !prev) return <Minus className="size-3 text-gray-300 inline ml-0.5" />
  if (curr > prev + 1) return <TrendingUp className="size-3 text-red-400 inline ml-0.5" />
  if (curr < prev - 1) return <TrendingDown className="size-3 text-green-500 inline ml-0.5" />
  return <Minus className="size-3 text-gray-400 inline ml-0.5" />
}

interface Props {
  vitals: VitalRecord[]
}

export function VitalsWeeklyMonthlyStatisticsAndTrendTable({ vitals }: Props) {
  const [period, setPeriod] = useState<Period>('weekly')

  const hasMeasurements = vitals.some(v =>
    ['blood_pressure', 'blood_glucose', 'weight'].includes(v.indicator_type)
  )
  const stats = useMemo(() => aggregatePeriods(vitals, period), [vitals, period])

  if (!hasMeasurements) return null

  const chartData = stats.map(s => ({
    name: s.label,
    'HA': s.bp_sys,
    'ĐH': s.glucose,
    'CN': s.weight,
  }))

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-4">
      {/* Header + tabs */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
          Thống kê xu hướng
        </h2>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
          {(['weekly', 'monthly'] as Period[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1 font-medium transition-colors ${
                period === p ? 'bg-teal-600 text-white' : 'text-gray-500 hover:bg-gray-50'
              }`}>
              {p === 'weekly' ? 'Hàng tuần' : 'Hàng tháng'}
            </button>
          ))}
        </div>
      </div>

      {stats.length < 2 ? (
        <p className="text-sm text-gray-400 text-center py-4 italic">
          Chưa đủ dữ liệu — hãy đo thêm để xem xu hướng
        </p>
      ) : (
        <>
          {/* Recharts line chart */}
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip
                  contentStyle={{ fontSize: 11, padding: '4px 8px' }}
                  formatter={(val, name) => {
                    const label = name === 'HA' ? 'Huyết áp' : name === 'ĐH' ? 'Đường huyết' : 'Cân nặng'
                    return [val != null ? val : '—', label]
                  }}
                />
                <Line type="monotone" dataKey="HA" stroke="#f43f5e" strokeWidth={2} dot={false} connectNulls />
                <Line type="monotone" dataKey="ĐH" stroke="#f59e0b" strokeWidth={2} dot={false} connectNulls />
                <Line type="monotone" dataKey="CN" stroke="#10b981" strokeWidth={2} dot={false} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Summary table */}
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-xs min-w-[340px]">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500">
                  <th className="text-left pb-1.5 font-semibold w-12">Kỳ</th>
                  <th className="text-right pb-1.5 font-semibold text-rose-600">HA<span className="font-normal text-gray-400 ml-0.5">mmHg</span></th>
                  <th className="text-right pb-1.5 font-semibold text-amber-600">ĐH<span className="font-normal text-gray-400 ml-0.5">mg/dL</span></th>
                  <th className="text-right pb-1.5 font-semibold text-emerald-600">CN<span className="font-normal text-gray-400 ml-0.5">kg</span></th>
                  <th className="text-right pb-1.5 font-semibold text-teal-600">% BT</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((s, i) => {
                  const prev = stats[i - 1] ?? null
                  return (
                    <tr key={s.sortKey} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-1.5 font-medium text-gray-700">{s.label}</td>
                      <td className="text-right text-gray-700">
                        {s.bp_sys ?? '—'}<Trend curr={s.bp_sys} prev={prev?.bp_sys ?? null} />
                      </td>
                      <td className="text-right text-gray-700">
                        {s.glucose ?? '—'}<Trend curr={s.glucose} prev={prev?.glucose ?? null} />
                      </td>
                      <td className="text-right text-gray-700">
                        {s.weight ?? '—'}<Trend curr={s.weight} prev={prev?.weight ?? null} />
                      </td>
                      <td className="text-right font-semibold">
                        <span className={
                          s.normal_pct >= 80 ? 'text-green-600'
                          : s.normal_pct >= 60 ? 'text-amber-600'
                          : 'text-red-600'
                        }>
                          {s.normal_pct}%
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="flex gap-3 text-[10px] text-gray-400 justify-end pt-1">
            <span><span className="inline-block size-2 rounded-full bg-rose-400 mr-1" />HA = huyết áp tâm thu TB</span>
            <span><span className="inline-block size-2 rounded-full bg-amber-400 mr-1" />ĐH = đường huyết TB</span>
            <span><span className="inline-block size-2 rounded-full bg-emerald-400 mr-1" />CN = cân nặng TB</span>
          </div>
        </>
      )}
    </div>
  )
}
