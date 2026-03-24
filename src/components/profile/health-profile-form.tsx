'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { X } from 'lucide-react'
import type { HealthProfile } from '@/types/database'

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

interface HealthProfileFormProps {
  profile: HealthProfile | null
  editing: boolean
  onSave: (data: Partial<HealthProfile>) => Promise<void>
}

export function HealthProfileForm({ profile, editing, onSave }: HealthProfileFormProps) {
  const [bloodType, setBloodType] = useState(profile?.blood_type ?? '')
  const [heightCm, setHeightCm] = useState(profile?.height_cm?.toString() ?? '')
  const [weightKg, setWeightKg] = useState(profile?.weight_kg?.toString() ?? '')
  const [allergies, setAllergies] = useState<string[]>(profile?.allergies ?? [])
  const [conditions, setConditions] = useState<string[]>(profile?.chronic_conditions ?? [])
  const [medications, setMedications] = useState<string[]>(profile?.current_medications ?? [])
  const [lifestyle, setLifestyle] = useState(
    JSON.stringify(profile?.lifestyle_notes ?? {}, null, 2) === '{}' ? '' : JSON.stringify(profile?.lifestyle_notes ?? {})
  )
  const [tagInput, setTagInput] = useState({ allergies: '', conditions: '', medications: '' })
  const [saving, setSaving] = useState(false)

  const bmi = useMemo(() => {
    const h = parseFloat(heightCm)
    const w = parseFloat(weightKg)
    if (!h || !w || h <= 0) return null
    return (w / ((h / 100) ** 2)).toFixed(1)
  }, [heightCm, weightKg])

  const addTag = (field: 'allergies' | 'conditions' | 'medications') => {
    const val = tagInput[field].trim()
    if (!val) return
    const setters = { allergies: setAllergies, conditions: setConditions, medications: setMedications }
    setters[field]((prev) => (prev.includes(val) ? prev : [...prev, val]))
    setTagInput((p) => ({ ...p, [field]: '' }))
  }

  const removeTag = (field: 'allergies' | 'conditions' | 'medications', idx: number) => {
    const setters = { allergies: setAllergies, conditions: setConditions, medications: setMedications }
    setters[field]((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave({
        blood_type: bloodType || null,
        height_cm: heightCm ? parseFloat(heightCm) : null,
        weight_kg: weightKg ? parseFloat(weightKg) : null,
        allergies,
        chronic_conditions: conditions,
        current_medications: medications,
        lifestyle_notes: lifestyle ? JSON.parse(lifestyle) : {},
      })
    } finally {
      setSaving(false)
    }
  }

  const TagField = ({ label, field, items }: { label: string; field: 'allergies' | 'conditions' | 'medications'; items: string[] }) => (
    <div className="space-y-2">
      <Label className="text-base font-medium">{label}</Label>
      <div className="flex flex-wrap gap-2 mb-2">
        {items.map((item, i) => (
          <Badge key={i} variant="secondary" className="text-base px-3 py-1 h-auto">
            {item}
            {editing && (
              <button onClick={() => removeTag(field, i)} className="ml-1">
                <X className="size-3" />
              </button>
            )}
          </Badge>
        ))}
      </div>
      {editing && (
        <div className="flex gap-2">
          <Input
            className="h-12 text-lg flex-1"
            placeholder={`Thêm ${label.toLowerCase()}...`}
            value={tagInput[field]}
            onChange={(e) => setTagInput((p) => ({ ...p, [field]: e.target.value }))}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag(field))}
          />
          <Button variant="outline" className="h-12" onClick={() => addTag(field)}>
            Thêm
          </Button>
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label className="text-base font-medium">Nhóm máu</Label>
        {editing ? (
          <Select value={bloodType} onValueChange={(v) => setBloodType(v ?? '')}>
            <SelectTrigger className="h-12 text-lg w-full">
              <SelectValue placeholder="Chọn nhóm máu" />
            </SelectTrigger>
            <SelectContent>
              {BLOOD_TYPES.map((bt) => (
                <SelectItem key={bt} value={bt}>{bt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input className="h-12 text-lg" readOnly value={bloodType} />
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-base font-medium">Chiều cao (cm)</Label>
          <Input className="h-12 text-lg" type="number" value={heightCm} readOnly={!editing} onChange={(e) => setHeightCm(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label className="text-base font-medium">Cân nặng (kg)</Label>
          <Input className="h-12 text-lg" type="number" value={weightKg} readOnly={!editing} onChange={(e) => setWeightKg(e.target.value)} />
        </div>
      </div>

      {bmi && (
        <p className="text-lg font-medium">
          BMI: <span className="text-primary">{bmi}</span>
        </p>
      )}

      <TagField label="Dị ứng" field="allergies" items={allergies} />
      <TagField label="Bệnh mãn tính" field="conditions" items={conditions} />
      <TagField label="Thuốc đang dùng" field="medications" items={medications} />

      <div className="space-y-2">
        <Label className="text-base font-medium">Lối sống</Label>
        <Textarea
          className="min-h-24 text-lg"
          placeholder="Ghi chú về lối sống, chế độ ăn uống, tập luyện..."
          value={lifestyle}
          readOnly={!editing}
          onChange={(e) => setLifestyle(e.target.value)}
        />
      </div>

      {editing && (
        <Button className="w-full h-12 text-lg mt-4" onClick={handleSave} disabled={saving}>
          {saving ? 'Đang lưu...' : 'Lưu hồ sơ sức khỏe'}
        </Button>
      )}
    </div>
  )
}
