'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MEDICAL_SPECIALTIES } from '@/lib/constants/medical-specialties'
import type { TimelineFilters } from '@/hooks/use-timeline'

const EVENT_TYPE_OPTIONS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'visit', label: 'Lần khám' },
  { value: 'lab_result', label: 'Xét nghiệm' },
  { value: 'medication', label: 'Thuốc' },
  { value: 'vaccination', label: 'Tiêm chủng' },
  { value: 'diagnosis', label: 'Chẩn đoán' },
  { value: 'imaging', label: 'Chẩn đoán hình ảnh' },
] as const

interface TimelineFiltersBarProps {
  filters: TimelineFilters
  onChange: (filters: TimelineFilters) => void
}

export function TimelineFiltersBar({ filters, onChange }: TimelineFiltersBarProps) {
  const handleClear = () => {
    onChange({ eventType: 'all', specialty: '', fromDate: '', toDate: '' })
  }

  const hasFilters =
    (filters.eventType && filters.eventType !== 'all') ||
    filters.specialty ||
    filters.fromDate ||
    filters.toDate

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Loại sự kiện</Label>
          <select
            className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
            value={filters.eventType ?? 'all'}
            onChange={(e) => onChange({ ...filters, eventType: e.target.value })}
          >
            {EVENT_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Chuyên khoa</Label>
          <select
            className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
            value={filters.specialty ?? ''}
            onChange={(e) => onChange({ ...filters, specialty: e.target.value })}
          >
            <option value="">Tất cả chuyên khoa</option>
            {MEDICAL_SPECIALTIES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Từ ngày</Label>
          <Input
            type="date"
            value={filters.fromDate ?? ''}
            onChange={(e) => onChange({ ...filters, fromDate: e.target.value })}
            className="h-10"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Đến ngày</Label>
          <Input
            type="date"
            value={filters.toDate ?? ''}
            onChange={(e) => onChange({ ...filters, toDate: e.target.value })}
            className="h-10"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button size="sm" onClick={() => onChange({ ...filters })}>
          Lọc
        </Button>
        {hasFilters && (
          <button
            type="button"
            onClick={handleClear}
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>
    </div>
  )
}
