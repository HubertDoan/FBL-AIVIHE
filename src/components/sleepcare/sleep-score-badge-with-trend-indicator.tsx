'use client'

/**
 * SleepScoreBadge — hiển thị điểm giấc ngủ + xu hướng (↑↓→)
 * Elder-friendly: font ≥18px, viền rõ, độ tương phản cao
 * Score: ≥80 xanh lá · 60–79 vàng · <60 đỏ
 */

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SleepScoreBadgeProps {
  score: number | null
  trend?: 'up' | 'down' | 'stable'
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

function colorFor(score: number | null): { bg: string; text: string; border: string; ring: string } {
  if (score == null) return { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-300', ring: 'ring-gray-200' }
  if (score >= 80) return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-400', ring: 'ring-emerald-200' }
  if (score >= 60) return { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-400',   ring: 'ring-amber-200'   }
  return                  { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-400',     ring: 'ring-red-200'     }
}

const SIZE = {
  sm: { score: 'text-2xl',  label: 'text-sm',    box: 'p-3 min-w-[120px]', icon: 'size-4' },
  md: { score: 'text-4xl',  label: 'text-base',  box: 'p-4 min-w-[160px]', icon: 'size-5' },
  lg: { score: 'text-6xl',  label: 'text-lg',    box: 'p-6 min-w-[200px]', icon: 'size-6' },
}

function trendIcon(trend: 'up' | 'down' | 'stable' | undefined, iconClass: string) {
  if (trend === 'up')   return <TrendingUp   className={cn(iconClass, 'text-emerald-600')} aria-label="Tăng" />
  if (trend === 'down') return <TrendingDown className={cn(iconClass, 'text-red-600')}     aria-label="Giảm" />
  if (trend === 'stable') return <Minus      className={cn(iconClass, 'text-gray-500')}    aria-label="Ổn định" />
  return null
}

function trendLabel(trend?: 'up' | 'down' | 'stable'): string {
  if (trend === 'up')     return 'Tốt hơn hôm trước'
  if (trend === 'down')   return 'Kém hơn hôm trước'
  if (trend === 'stable') return 'Ổn định'
  return ''
}

export function SleepScoreBadge({ score, trend, size = 'md', label = 'Điểm giấc ngủ' }: SleepScoreBadgeProps) {
  const c = colorFor(score)
  const s = SIZE[size]
  const display = score == null ? '—' : Math.round(score)

  return (
    <div
      className={cn(
        'inline-flex flex-col items-center justify-center rounded-2xl border-2 ring-4',
        c.bg, c.border, c.ring, s.box,
      )}
      role="group"
      aria-label={`${label}: ${display}/100`}
    >
      <span className={cn('font-medium', s.label, c.text)}>{label}</span>
      <span className={cn('font-bold leading-none my-1', s.score, c.text)}>
        {display}
        {score != null && <span className={cn('text-base font-medium ml-0.5', c.text)}>/100</span>}
      </span>
      {trend && (
        <span className={cn('inline-flex items-center gap-1.5 mt-1 text-sm', c.text)}>
          {trendIcon(trend, s.icon)}
          <span>{trendLabel(trend)}</span>
        </span>
      )}
    </div>
  )
}
