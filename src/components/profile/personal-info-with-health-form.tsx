'use client'

// Tab 1: Thông tin cá nhân gộp — personal info + health profile + emergency contact
// Gộp từ personal-info-form.tsx + health-profile-form.tsx + emergency-card.tsx

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { X, Heart, ShieldAlert, Phone } from 'lucide-react'
import type { Citizen, HealthProfile } from '@/types/database'

const GENDERS = [{ value: 'male', label: 'Nam' }, { value: 'female', label: 'Nữ' }, { value: 'other', label: 'Khác' }]
const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

interface Props {
  citizen: Citizen
  healthProfile: HealthProfile | null
  editing: boolean
  onSave: (citizenData: Partial<Citizen>, healthData: Partial<HealthProfile>) => Promise<void>
}

export function PersonalInfoWithHealthForm({ citizen, healthProfile, editing, onSave }: Props) {
  const hp = healthProfile
  const [form, setForm] = useState({
    full_name: citizen.full_name,
    date_of_birth: citizen.date_of_birth ?? '',
    gender: citizen.gender ?? '',
    national_id: citizen.national_id ?? '',
    address: citizen.address ?? '',
    ethnicity: citizen.ethnicity ?? '',
    occupation: citizen.occupation ?? '',
  })
  const [bloodType, setBloodType] = useState(hp?.blood_type ?? '')
  const [heightCm, setHeightCm] = useState(hp?.height_cm?.toString() ?? '')
  const [weightKg, setWeightKg] = useState(hp?.weight_kg?.toString() ?? '')
  const [allergies, setAllergies] = useState<string[]>(hp?.allergies ?? [])
  const [conditions, setConditions] = useState<string[]>(hp?.chronic_conditions ?? [])
  const [congenital, setCongenital] = useState<string[]>((hp as unknown as Record<string, unknown>)?.congenital_diseases as string[] ?? [])
  const [medications, setMedications] = useState<string[]>(hp?.current_medications ?? [])
  const [emergencyName, setEmergencyName] = useState(hp?.emergency_contact_name ?? '')
  const [emergencyPhone, setEmergencyPhone] = useState(hp?.emergency_contact_phone ?? '')
  const [emergencyRelation, setEmergencyRelation] = useState(hp?.emergency_contact_relationship ?? '')
  const [tagInput, setTagInput] = useState({ allergies: '', conditions: '', congenital: '', medications: '' })
  const [saving, setSaving] = useState(false)

  const bmi = useMemo(() => {
    const h = parseFloat(heightCm), w = parseFloat(weightKg)
    return h > 0 && w > 0 ? (w / ((h / 100) ** 2)).toFixed(1) : null
  }, [heightCm, weightKg])

  const addTag = (field: keyof typeof tagInput, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    const val = tagInput[field].trim()
    if (!val) return
    setter(prev => prev.includes(val) ? prev : [...prev, val])
    setTagInput(p => ({ ...p, [field]: '' }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(
        { full_name: form.full_name, date_of_birth: form.date_of_birth || null, gender: (form.gender as Citizen['gender']) || null, national_id: form.national_id || null, address: form.address || null, ethnicity: form.ethnicity || null, occupation: form.occupation || null },
        { blood_type: bloodType || null, height_cm: heightCm ? parseFloat(heightCm) : null, weight_kg: weightKg ? parseFloat(weightKg) : null, allergies, chronic_conditions: conditions, current_medications: medications, emergency_contact_name: emergencyName || null, emergency_contact_phone: emergencyPhone || null, emergency_contact_relationship: emergencyRelation || null, congenital_diseases: congenital } as Partial<HealthProfile>,
      )
    } finally { setSaving(false) }
  }

  const Field = ({ label, value, onChange, type = 'text', readOnly = false }: { label: string; value: string; onChange: (v: string) => void; type?: string; readOnly?: boolean }) => (
    <div className="space-y-1">
      <Label className="text-base font-medium">{label}</Label>
      <Input className="h-12 text-lg" type={type} value={value} readOnly={!editing || readOnly} onChange={e => onChange(e.target.value)} />
    </div>
  )

  const TagField = ({ label, field, items, setter }: { label: string; field: keyof typeof tagInput; items: string[]; setter: React.Dispatch<React.SetStateAction<string[]>> }) => (
    <div className="space-y-1">
      <Label className="text-base font-medium">{label}</Label>
      <div className="flex flex-wrap gap-2 mb-1">
        {items.map((item, i) => (
          <Badge key={i} variant="secondary" className="text-base px-3 py-1 h-auto">
            {item}
            {editing && <button onClick={() => setter(prev => prev.filter((_, j) => j !== i))} className="ml-1"><X className="size-3" /></button>}
          </Badge>
        ))}
      </div>
      {editing && (
        <div className="flex gap-2">
          <Input className="h-12 text-lg flex-1" placeholder={`Thêm ${label.toLowerCase()}...`} value={tagInput[field]}
            onChange={e => setTagInput(p => ({ ...p, [field]: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag(field, setter))} />
          <Button variant="outline" className="h-12" onClick={() => addTag(field, setter)}>Thêm</Button>
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Thông tin cơ bản */}
      <div className="space-y-4">
        <Field label="Họ và tên" value={form.full_name} onChange={v => setForm(p => ({ ...p, full_name: v }))} />
        <Field label="Ngày sinh" value={form.date_of_birth} onChange={v => setForm(p => ({ ...p, date_of_birth: v }))} type="date" />
        <div className="space-y-1">
          <Label className="text-base font-medium">Giới tính</Label>
          {editing ? (
            <Select value={form.gender} onValueChange={v => setForm(p => ({ ...p, gender: v ?? '' }))}>
              <SelectTrigger className="h-12 text-lg w-full"><SelectValue placeholder="Chọn" /></SelectTrigger>
              <SelectContent>{GENDERS.map(g => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}</SelectContent>
            </Select>
          ) : <Input className="h-12 text-lg" readOnly value={GENDERS.find(g => g.value === form.gender)?.label ?? ''} />}
        </div>
        <Field label="Số điện thoại" value={citizen?.phone ?? ''} onChange={() => {}} readOnly />
        <Field label="Địa chỉ" value={form.address} onChange={v => setForm(p => ({ ...p, address: v }))} />
        <Field label="Số CMND/CCCD" value={form.national_id} onChange={v => setForm(p => ({ ...p, national_id: v }))} />
        <Field label="Dân tộc" value={form.ethnicity} onChange={v => setForm(p => ({ ...p, ethnicity: v }))} />
        <Field label="Nghề nghiệp" value={form.occupation} onChange={v => setForm(p => ({ ...p, occupation: v }))} />
      </div>

      {/* Sức khỏe */}
      <div className="border-t pt-4 space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2"><Heart className="size-5 text-red-500" /> Thông tin sức khỏe</h3>
        <div className="space-y-1">
          <Label className="text-base font-medium">Nhóm máu</Label>
          {editing ? (
            <Select value={bloodType} onValueChange={v => setBloodType(v ?? '')}>
              <SelectTrigger className="h-12 text-lg w-full"><SelectValue placeholder="Chọn nhóm máu" /></SelectTrigger>
              <SelectContent>{BLOOD_TYPES.map(bt => <SelectItem key={bt} value={bt}>{bt}</SelectItem>)}</SelectContent>
            </Select>
          ) : <Input className="h-12 text-lg" readOnly value={bloodType} />}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Chiều cao (cm)" value={heightCm} onChange={setHeightCm} type="number" />
          <Field label="Cân nặng (kg)" value={weightKg} onChange={setWeightKg} type="number" />
        </div>
        {bmi && <p className="text-lg font-medium">BMI: <span className="text-primary">{bmi}</span></p>}
        <TagField label="Bệnh bẩm sinh" field="congenital" items={congenital} setter={setCongenital} />
        <TagField label="Bệnh mãn tính" field="conditions" items={conditions} setter={setConditions} />
        <TagField label="Dị ứng" field="allergies" items={allergies} setter={setAllergies} />
        <TagField label="Thuốc đang dùng" field="medications" items={medications} setter={setMedications} />
      </div>

      {/* Liên hệ khẩn cấp */}
      <div className="border-t pt-4 space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2"><ShieldAlert className="size-5 text-red-500" /> Liên hệ khẩn cấp</h3>
        <Field label="Họ tên người liên hệ" value={emergencyName} onChange={setEmergencyName} />
        <Field label="Số điện thoại" value={emergencyPhone} onChange={setEmergencyPhone} />
        <Field label="Quan hệ" value={emergencyRelation} onChange={setEmergencyRelation} />
        {!editing && emergencyPhone && (
          <a href={`tel:${emergencyPhone}`} className="flex items-center gap-2 text-red-600 font-semibold text-lg">
            <Phone className="size-5" /> Gọi {emergencyName || 'liên hệ khẩn cấp'}
          </a>
        )}
      </div>

      {editing && (
        <Button className="w-full h-12 text-lg" onClick={handleSave} disabled={saving}>
          {saving ? 'Đang lưu...' : 'Lưu thông tin'}
        </Button>
      )}
    </div>
  )
}
