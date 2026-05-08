'use client'

/**
 * SleepSensorChart — Recharts ComposedChart đa cảm biến với Brush time-range
 * Sensors: spo2 (%), heart_rate (bpm), co2 (ppm), temp (°C), humidity (%)
 * Threshold đỏ nét đứt: SpO2 < 90%, HR > 100bpm
 * Responsive · mobile-friendly · elder-friendly font
 */

import { useMemo } from 'react'
import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Brush, ReferenceLine,
} from 'recharts'

export interface SensorReading {
  recorded_at: string
  sensor_type: string
  value: number
}

export interface SleepSensorChartProps {
  readings: SensorReading[]
  visibleSensors?: string[]
  height?: number
}

interface SensorSpec {
  key: string
  label: string
  unit: string
  color: string
  yAxis: 'left' | 'right'
}

const SENSORS: Record<string, SensorSpec> = {
  spo2:       { key: 'spo2',       label: 'SpO₂',     unit: '%',   color: '#ef4444', yAxis: 'left'  },
  heart_rate: { key: 'heart_rate', label: 'Nhịp tim', unit: 'bpm', color: '#0ea5e9', yAxis: 'left'  },
  co2:        { key: 'co2',        label: 'CO₂',      unit: 'ppm', color: '#a855f7', yAxis: 'right' },
  temp:       { key: 'temp',       label: 'Nhiệt độ', unit: '°C',  color: '#f59e0b', yAxis: 'left'  },
  humidity:   { key: 'humidity',   label: 'Độ ẩm',    unit: '%',   color: '#10b981', yAxis: 'left'  },
}

const DEFAULT_VISIBLE = ['spo2', 'heart_rate', 'co2']

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  } catch { return '' }
}

interface ChartRow {
  t: number          // epoch ms — used for X
  label: string      // display "HH:mm"
  [sensor: string]: number | string
}

function pivot(readings: SensorReading[], visible: string[]): ChartRow[] {
  // Pivot to wide rows keyed by recorded_at minute bucket
  const buckets = new Map<number, ChartRow>()
  for (const r of readings) {
    if (!visible.includes(r.sensor_type)) continue
    const t = new Date(r.recorded_at).getTime()
    if (Number.isNaN(t)) continue
    const minute = Math.floor(t / 60000) * 60000
    let row = buckets.get(minute)
    if (!row) {
      row = { t: minute, label: formatTime(new Date(minute).toISOString()) }
      buckets.set(minute, row)
    }
    row[r.sensor_type] = r.value
  }
  return Array.from(buckets.values()).sort((a, b) => a.t - b.t)
}

export function SleepSensorChart({
  readings,
  visibleSensors = DEFAULT_VISIBLE,
  height = 320,
}: SleepSensorChartProps) {
  const data = useMemo(() => pivot(readings, visibleSensors), [readings, visibleSensors])
  const sensors = visibleSensors.map(k => SENSORS[k]).filter(Boolean)
  const hasLeft  = sensors.some(s => s.yAxis === 'left')
  const hasRight = sensors.some(s => s.yAxis === 'right')

  if (data.length === 0) {
    return (
      <div className="text-center text-gray-500 text-base py-10 border border-dashed border-gray-200 rounded-lg">
        Chưa có dữ liệu cảm biến cho phiên này.
      </div>
    )
  }

  return (
    <div className="w-full" style={{ minHeight: height }}>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={{ top: 10, right: 24, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} minTickGap={32} />
          {hasLeft && (
            <YAxis yAxisId="left" tick={{ fontSize: 12 }} domain={['auto', 'auto']} />
          )}
          {hasRight && (
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} domain={['auto', 'auto']} />
          )}
          <Tooltip
            contentStyle={{ fontSize: 14, borderRadius: 8 }}
            formatter={(value, name) => {
              const key = String(name ?? '')
              const spec = SENSORS[key]
              const num = typeof value === 'number' ? value : Number(value)
              return [`${Number.isFinite(num) ? num : '-'} ${spec?.unit ?? ''}`, spec?.label ?? key]
            }}
            labelFormatter={(label) => `Thời gian: ${String(label ?? '')}`}
          />
          <Legend wrapperStyle={{ fontSize: 14 }} />
          {/* Threshold lines */}
          {visibleSensors.includes('spo2') && (
            <ReferenceLine y={90} yAxisId="left" stroke="#dc2626" strokeDasharray="4 4" label={{ value: 'SpO₂ 90%', fontSize: 11, fill: '#dc2626' }} />
          )}
          {visibleSensors.includes('heart_rate') && (
            <ReferenceLine y={100} yAxisId="left" stroke="#dc2626" strokeDasharray="4 4" label={{ value: 'HR 100', fontSize: 11, fill: '#dc2626' }} />
          )}
          {sensors.map(s => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.key}
              stroke={s.color}
              strokeWidth={2}
              dot={false}
              connectNulls
              yAxisId={s.yAxis}
              isAnimationActive={false}
            />
          ))}
          <Brush dataKey="label" height={24} travellerWidth={12} stroke="#0ea5e9" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
