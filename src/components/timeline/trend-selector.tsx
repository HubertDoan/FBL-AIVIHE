'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface TrendIndicator {
  key: string
  label: string
  unit: string
  referenceRange?: { min: number; max: number }
}

export const TREND_INDICATORS: TrendIndicator[] = [
  { key: 'HbA1c', label: 'HbA1c', unit: '%', referenceRange: { min: 4, max: 5.6 } },
  { key: 'Glucose', label: 'Đường huyết', unit: 'mmol/L', referenceRange: { min: 3.9, max: 5.6 } },
  { key: 'Huyết áp', label: 'Huyết áp', unit: 'mmHg' },
  { key: 'Cholesterol', label: 'Cholesterol', unit: 'mmol/L', referenceRange: { min: 0, max: 5.2 } },
  { key: 'Cân nặng', label: 'Cân nặng', unit: 'kg' },
  { key: 'Triglyceride', label: 'Triglyceride', unit: 'mmol/L', referenceRange: { min: 0, max: 1.7 } },
]

interface TrendSelectorProps {
  selected: string
  onSelect: (key: string) => void
}

export function TrendSelector({ selected, onSelect }: TrendSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {TREND_INDICATORS.map((indicator) => (
        <Button
          key={indicator.key}
          variant={selected === indicator.key ? 'default' : 'outline'}
          size="sm"
          className={cn(
            'h-9 text-sm',
            selected === indicator.key && 'shadow-sm'
          )}
          onClick={() => onSelect(indicator.key)}
        >
          {indicator.label}
          <span className="ml-1 text-xs opacity-70">({indicator.unit})</span>
        </Button>
      ))}
    </div>
  )
}
