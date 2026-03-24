'use client'

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceArea,
  CartesianGrid,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import type { TrendPoint } from '@/hooks/use-trend-data'

interface TrendChartProps {
  data: TrendPoint[]
  title: string
  unit: string
  referenceRange?: { min: number; max: number } | null
}

function parseRefRange(raw: string | null): { min: number; max: number } | null {
  if (!raw) return null
  const match = raw.match(/([\d.]+)\s*[-–]\s*([\d.]+)/)
  if (!match) return null
  return { min: parseFloat(match[1]), max: parseFloat(match[2]) }
}

export function TrendChart({ data, title, unit, referenceRange }: TrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        Chưa có dữ liệu
      </div>
    )
  }

  const refRange = referenceRange ?? parseRefRange(data[0]?.referenceRange ?? null)

  const chartData = data.map((point) => ({
    ...point,
    dateLabel: format(parseISO(point.date), 'dd/MM'),
    fullDate: format(parseISO(point.date), 'dd/MM/yyyy'),
    isAbnormal: refRange ? point.value < refRange.min || point.value > refRange.max : false,
  }))

  const values = data.map((d) => d.value)
  const minVal = Math.min(...values, refRange?.min ?? Infinity)
  const maxVal = Math.max(...values, refRange?.max ?? -Infinity)
  const padding = (maxVal - minVal) * 0.15 || 1

  return (
    <div>
      <h4 className="text-base font-semibold mb-2">
        {title} ({unit})
      </h4>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="dateLabel" tick={{ fontSize: 12 }} />
          <YAxis
            domain={[minVal - padding, maxVal + padding]}
            tick={{ fontSize: 12 }}
            unit={` ${unit}`}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const d = payload[0].payload
              return (
                <div className="rounded-lg border bg-background p-2 shadow-md text-sm">
                  <p className="font-medium">{d.fullDate}</p>
                  <p className={d.isAbnormal ? 'text-red-600 font-semibold' : ''}>
                    {d.value} {unit}
                  </p>
                </div>
              )
            }}
          />
          {refRange && (
            <ReferenceArea
              y1={refRange.min}
              y2={refRange.max}
              fill="#22c55e"
              fillOpacity={0.1}
              stroke="#22c55e"
              strokeOpacity={0.3}
            />
          )}
          <Line
            type="monotone"
            dataKey="value"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={({ cx, cy, payload }) => (
              <circle
                key={`${cx}-${cy}`}
                cx={cx}
                cy={cy}
                r={5}
                fill={payload.isAbnormal ? '#ef4444' : 'hsl(var(--primary))'}
                stroke="#fff"
                strokeWidth={2}
              />
            )}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
