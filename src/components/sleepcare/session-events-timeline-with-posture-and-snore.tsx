'use client'

/**
 * SessionEventsTimeline — danh sách sự kiện trong 1 phiên ngủ
 * Sự kiện: snore_detected, posture_change, movement, safety_alert, motor_action
 * Mỗi event: icon theo type · giờ · mô tả VN
 * Compact mode (maxItems=3) cho overview page
 */

import { Volume2, RefreshCw, Move, AlertTriangle, Wrench, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SessionEvent {
  id?: string
  occurred_at: string
  event_type: string
  event_data: Record<string, unknown>
}

export interface SessionEventsTimelineProps {
  events: SessionEvent[]
  maxItems?: number
  emptyMessage?: string
}

interface EventStyle {
  icon: typeof Volume2
  label: string
  color: string
  bg: string
}

const EVENT_STYLES: Record<string, EventStyle> = {
  snore_detected: { icon: Volume2,        label: 'Ngáy',          color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200' },
  posture_change: { icon: RefreshCw,      label: 'Trở mình',      color: 'text-sky-700',     bg: 'bg-sky-50 border-sky-200' },
  movement:       { icon: Move,           label: 'Cử động',       color: 'text-indigo-700',  bg: 'bg-indigo-50 border-indigo-200' },
  safety_alert:   { icon: AlertTriangle,  label: 'Cảnh báo',      color: 'text-red-700',     bg: 'bg-red-50 border-red-200' },
  motor_action:   { icon: Wrench,         label: 'Điều khiển',    color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
}

const POSTURE_VI: Record<string, string> = {
  supine: 'nằm ngửa',
  prone: 'nằm sấp',
  lateral_left: 'nghiêng trái',
  lateral_right: 'nghiêng phải',
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  } catch { return '--:--' }
}

function describe(ev: SessionEvent): string {
  const d = ev.event_data ?? {}
  switch (ev.event_type) {
    case 'snore_detected': {
      const intensity = String(d.intensity ?? '')
      const count = typeof d.count === 'number' ? d.count : null
      const intensityVi = intensity === 'mild' ? 'nhẹ' : intensity === 'moderate' ? 'vừa' : intensity === 'severe' ? 'mạnh' : intensity
      return [intensityVi && `mức ${intensityVi}`, count != null && `${count} lần`].filter(Boolean).join(' · ')
    }
    case 'posture_change': {
      const from = POSTURE_VI[String(d.from ?? '')] ?? d.from
      const to = POSTURE_VI[String(d.to ?? '')] ?? d.to
      return from && to ? `${from} → ${to}` : ''
    }
    case 'movement': {
      const dur = typeof d.duration_seconds === 'number' ? d.duration_seconds : null
      return dur != null ? `kéo dài ${dur}s` : ''
    }
    case 'safety_alert':
      return String(d.reason ?? d.message ?? 'cảnh báo an toàn')
    case 'motor_action':
      return String(d.action ?? d.command ?? 'điều khiển thiết bị')
    default:
      return ''
  }
}

export function SessionEventsTimeline({
  events,
  maxItems,
  emptyMessage = 'Chưa có sự kiện nào trong phiên này.',
}: SessionEventsTimelineProps) {
  const sorted = [...events].sort(
    (a, b) => new Date(a.occurred_at).getTime() - new Date(b.occurred_at).getTime(),
  )
  const visible = maxItems ? sorted.slice(0, maxItems) : sorted
  const overflow = maxItems ? Math.max(0, sorted.length - maxItems) : 0

  if (sorted.length === 0) {
    return (
      <div className="text-center text-gray-500 text-base py-6 border border-dashed border-gray-200 rounded-lg">
        {emptyMessage}
      </div>
    )
  }

  return (
    <ul className="space-y-2">
      {visible.map((ev, idx) => {
        const style = EVENT_STYLES[ev.event_type] ?? { icon: Circle, label: ev.event_type, color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200' }
        const Icon = style.icon
        return (
          <li
            key={ev.id ?? `${ev.occurred_at}-${idx}`}
            className={cn('flex items-start gap-3 p-3 rounded-lg border', style.bg)}
          >
            <span className={cn('flex items-center justify-center size-10 rounded-full bg-white border', style.color)}>
              <Icon className="size-5" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn('font-semibold text-base', style.color)}>{style.label}</span>
                <span className="text-sm text-gray-500 tabular-nums">{formatTime(ev.occurred_at)}</span>
              </div>
              {describe(ev) && (
                <p className="text-sm text-gray-700 mt-0.5 break-words">{describe(ev)}</p>
              )}
            </div>
          </li>
        )
      })}
      {overflow > 0 && (
        <li className="text-sm text-gray-500 text-center py-1">
          còn {overflow} sự kiện khác…
        </li>
      )}
    </ul>
  )
}
