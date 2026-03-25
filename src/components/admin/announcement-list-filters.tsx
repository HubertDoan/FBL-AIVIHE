'use client'

// Filter bar for the announcement manager table: category + priority dropdowns + search

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export interface AnnouncementFilters {
  search: string
  category: string
  priority: string
}

interface Props {
  filters: AnnouncementFilters
  onFiltersChange: (f: AnnouncementFilters) => void
}

const CATEGORY_FILTER_OPTIONS = [
  { value: 'all', label: 'Tất cả danh mục' },
  { value: 'technical', label: 'Kỹ thuật' },
  { value: 'system', label: 'Hệ thống' },
  { value: 'maintenance', label: 'Bảo trì' },
  { value: 'general', label: 'Chung' },
  { value: 'program', label: 'Chương trình' },
  { value: 'director', label: 'Giám đốc' },
]

const PRIORITY_FILTER_OPTIONS = [
  { value: 'all', label: 'Tất cả mức độ' },
  { value: 'urgent', label: 'Khẩn cấp' },
  { value: 'important', label: 'Quan trọng' },
  { value: 'normal', label: 'Bình thường' },
]

export function AnnouncementListFilters({ filters, onFiltersChange }: Props) {
  function set(key: keyof AnnouncementFilters, value: string) {
    onFiltersChange({ ...filters, [key]: value })
  }

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Search */}
      <div className="relative flex-1 min-w-[180px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          value={filters.search}
          onChange={(e) => set('search', e.target.value)}
          placeholder="Tìm tiêu đề..."
          className="pl-9 h-10 text-base"
        />
      </div>

      {/* Category */}
      <Select value={filters.category} onValueChange={(v) => set('category', v ?? 'all')}>
        <SelectTrigger className="h-10 w-[160px] text-base">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {CATEGORY_FILTER_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Priority */}
      <Select value={filters.priority} onValueChange={(v) => set('priority', v ?? 'all')}>
        <SelectTrigger className="h-10 w-[160px] text-base">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PRIORITY_FILTER_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
