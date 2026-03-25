'use client'

// Sub-component for the announcement targeting section
// Handles: all / group (multi-select roles) / individual (search by phone)

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Search, Loader2 } from 'lucide-react'
import { useState } from 'react'

export type TargetType = 'all' | 'group' | 'individual'

const GROUP_OPTIONS = [
  { value: 'member', label: 'Thành viên' },
  { value: 'doctor', label: 'Bác sĩ' },
  { value: 'staff', label: 'Nhân viên' },
  { value: 'branch_director', label: 'Giám đốc chi nhánh' },
  { value: 'director', label: 'Giám đốc' },
  { value: 'guest', label: 'Khách' },
]

interface FoundUser {
  citizenId: string
  name: string
}

interface Props {
  targetType: TargetType
  onTargetTypeChange: (t: TargetType) => void
  targetGroups: string[]
  onTargetGroupsChange: (groups: string[]) => void
  targetCitizenId: string
  targetUserName: string
  onTargetIndividualChange: (citizenId: string, name: string) => void
}

export function AnnouncementTargetSelector({
  targetType,
  onTargetTypeChange,
  targetGroups,
  onTargetGroupsChange,
  targetCitizenId,
  targetUserName,
  onTargetIndividualChange,
}: Props) {
  const [phone, setPhone] = useState('')
  const [searching, setSearching] = useState(false)
  const [notFound, setNotFound] = useState(false)

  function toggleGroup(value: string) {
    if (targetGroups.includes(value)) {
      onTargetGroupsChange(targetGroups.filter((g) => g !== value))
    } else {
      onTargetGroupsChange([...targetGroups, value])
    }
  }

  async function handleSearchPhone() {
    if (!phone.trim()) return
    setSearching(true)
    setNotFound(false)
    try {
      const res = await fetch(`/api/admin/users/search-by-phone?phone=${encodeURIComponent(phone.trim())}`)
      if (res.ok) {
        const data: FoundUser = await res.json()
        onTargetIndividualChange(data.citizenId, data.name)
        setNotFound(false)
      } else {
        onTargetIndividualChange('', '')
        setNotFound(true)
      }
    } catch {
      setNotFound(true)
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="space-y-3">
      <Label className="text-base">Đối tượng nhận</Label>

      {/* Target type radio-like buttons */}
      <div className="flex flex-wrap gap-2">
        {([
          { value: 'all', label: 'Gửi toàn thể' },
          { value: 'group', label: 'Gửi theo nhóm' },
          { value: 'individual', label: 'Gửi cá nhân' },
        ] as { value: TargetType; label: string }[]).map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onTargetTypeChange(opt.value)}
            className={[
              'px-3 py-1.5 rounded-full text-sm border transition-colors min-h-[36px]',
              targetType === opt.value
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background border-border text-muted-foreground hover:border-primary/60',
            ].join(' ')}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Group multi-select */}
      {targetType === 'group' && (
        <div className="flex flex-wrap gap-3 pl-1">
          {GROUP_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer min-h-[36px]">
              <Checkbox
                checked={targetGroups.includes(opt.value)}
                onCheckedChange={() => toggleGroup(opt.value)}
              />
              <span className="text-base">{opt.label}</span>
            </label>
          ))}
        </div>
      )}

      {/* Individual search */}
      {targetType === 'individual' && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Nhập số điện thoại..."
              className="h-10 text-base"
              onKeyDown={(e) => e.key === 'Enter' && handleSearchPhone()}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleSearchPhone}
              disabled={searching}
              className="min-h-[40px]"
            >
              {searching ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
            </Button>
          </div>
          {targetUserName && (
            <Badge variant="secondary" className="text-sm">
              Đã chọn: {targetUserName}
            </Badge>
          )}
          {notFound && (
            <p className="text-sm text-destructive">Không tìm thấy người dùng với số điện thoại này.</p>
          )}
          {!targetCitizenId && !notFound && (
            <p className="text-xs text-muted-foreground">Tìm theo số điện thoại để chọn người nhận.</p>
          )}
        </div>
      )}
    </div>
  )
}
