'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Citizen } from '@/types/database'

interface PersonalInfoFormProps {
  citizen: Citizen
  editing: boolean
  onSave: (data: Partial<Citizen>) => Promise<void>
}

const GENDER_OPTIONS = [
  { value: 'male', label: 'Nam' },
  { value: 'female', label: 'Nữ' },
  { value: 'other', label: 'Khác' },
]

export function PersonalInfoForm({ citizen, editing, onSave }: PersonalInfoFormProps) {
  const [form, setForm] = useState({
    full_name: citizen.full_name,
    date_of_birth: citizen.date_of_birth ?? '',
    gender: citizen.gender ?? '',
    national_id: citizen.national_id ?? '',
    address: citizen.address ?? '',
    ethnicity: citizen.ethnicity ?? '',
    occupation: citizen.occupation ?? '',
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave({
        full_name: form.full_name,
        date_of_birth: form.date_of_birth || null,
        gender: (form.gender as Citizen['gender']) || null,
        national_id: form.national_id || null,
        address: form.address || null,
        ethnicity: form.ethnicity || null,
        occupation: form.occupation || null,
      })
    } finally {
      setSaving(false)
    }
  }

  const field = (label: string, key: keyof typeof form, type = 'text', readOnly = false) => (
    <div className="space-y-2" key={key}>
      <Label className="text-base font-medium">{label}</Label>
      <Input
        className="h-12 text-lg"
        type={type}
        value={form[key]}
        readOnly={!editing || readOnly}
        onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
      />
    </div>
  )

  return (
    <div className="space-y-5">
      {field('Họ và tên', 'full_name')}
      {field('Ngày sinh', 'date_of_birth', 'date')}

      <div className="space-y-2">
        <Label className="text-base font-medium">Giới tính</Label>
        {editing ? (
          <Select
            value={form.gender}
            onValueChange={(val) => setForm((p) => ({ ...p, gender: val as string }))}
          >
            <SelectTrigger className="h-12 text-lg w-full">
              <SelectValue placeholder="Chọn giới tính" />
            </SelectTrigger>
            <SelectContent>
              {GENDER_OPTIONS.map((g) => (
                <SelectItem key={g.value} value={g.value}>
                  {g.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            className="h-12 text-lg"
            readOnly
            value={GENDER_OPTIONS.find((g) => g.value === form.gender)?.label ?? ''}
          />
        )}
      </div>

      {/* Phone is read-only */}
      <div className="space-y-2">
        <Label className="text-base font-medium">Số điện thoại</Label>
        <Input className="h-12 text-lg bg-gray-50" readOnly value={citizen?.phone ?? ""} />
      </div>
      {field('Địa chỉ', 'address')}
      {field('Số CMND/CCCD', 'national_id')}
      {field('Dân tộc', 'ethnicity')}
      {field('Nghề nghiệp', 'occupation')}

      {editing && (
        <Button
          className="w-full h-12 text-lg mt-4"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Đang lưu...' : 'Lưu thông tin'}
        </Button>
      )}
    </div>
  )
}
