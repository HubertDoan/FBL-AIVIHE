'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pencil, Save, X, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import type { AdministrativeInfo } from '@/lib/demo/demo-medical-record-eleven-sections-data'

/**
 * Section I — Thông tin hành chính
 * Có nút Sửa → toggle edit mode → Input fields → Save/Cancel
 * Người dùng có thể cập nhật trực tiếp thông tin hành chính
 */

export function MedicalRecordAdministrativeSection({ data, onSaved }: {
  data: AdministrativeInfo | null
  onSaved?: (updated: AdministrativeInfo) => void
}) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<AdministrativeInfo>(
    data || {
      full_name: '', date_of_birth: '', gender: 'male', national_id: '',
      phone: '', address: '', insurance_number: null, insurance_facility: null,
      ethnicity: null, occupation: null, emergency_contact: null,
    }
  )
  const [saving, setSaving] = useState(false)

  function updateField(field: keyof AdministrativeInfo, value: string) {
    setForm(prev => ({ ...prev, [field]: value || null }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      // Demo mode: gọi API cập nhật
      const res = await fetch('/api/medical-record/update-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        toast.success('Đã cập nhật thông tin hành chính')
        onSaved?.(form)
        setEditing(false)
      } else {
        const d = await res.json().catch(() => ({}))
        toast.error(d.error || 'Lỗi khi lưu')
      }
    } catch {
      toast.error('Lỗi kết nối')
    } finally {
      setSaving(false)
    }
  }

  if (!data && !editing) {
    return (
      <div className="py-3 space-y-2">
        <p className="text-sm text-gray-500 italic">Chưa có thông tin hành chính.</p>
        <Button size="sm" variant="outline" onClick={() => setEditing(true)} className="gap-1">
          <Pencil className="size-3.5" /> Nhập thông tin
        </Button>
      </div>
    )
  }

  if (editing) {
    return (
      <div className="pt-3 space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <EditField label="Họ tên" value={form.full_name} onChange={v => updateField('full_name', v)} />
          <EditField label="Ngày sinh" value={form.date_of_birth} onChange={v => updateField('date_of_birth', v)} type="date" />
          <div className="space-y-1">
            <p className="text-xs uppercase text-gray-500 font-semibold tracking-wide">Giới tính</p>
            <select
              className="w-full h-9 px-3 rounded-md border border-input bg-white text-sm"
              value={form.gender}
              onChange={e => updateField('gender', e.target.value)}
            >
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>
          <EditField label="CCCD" value={form.national_id} onChange={v => updateField('national_id', v)} />
          <EditField label="SĐT" value={form.phone} onChange={v => updateField('phone', v)} />
          <EditField label="Dân tộc" value={form.ethnicity || ''} onChange={v => updateField('ethnicity', v)} />
          <EditField label="Nghề nghiệp" value={form.occupation || ''} onChange={v => updateField('occupation', v)} />
          <EditField label="Số BHYT" value={form.insurance_number || ''} onChange={v => updateField('insurance_number', v)} />
          <EditField label="Nơi KCB ban đầu" value={form.insurance_facility || ''} onChange={v => updateField('insurance_facility', v)} />
          <EditField label="Địa chỉ" value={form.address} onChange={v => updateField('address', v)} fullWidth />
        </div>
        <div className="flex gap-2 pt-2">
          <Button size="sm" onClick={handleSave} disabled={saving} className="bg-teal-600 hover:bg-teal-700 gap-1">
            <Save className="size-3.5" /> {saving ? 'Đang lưu...' : 'Cập nhật'}
          </Button>
          <Button size="sm" variant="outline" onClick={() => { setEditing(false); setForm(data || form) }} disabled={saving}>
            <X className="size-3.5 mr-1" /> Hủy
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-3 space-y-3">
      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={() => setEditing(true)} className="gap-1 text-teal-700 hover:text-teal-800 hover:bg-teal-50">
          <Pencil className="size-3.5" /> Sửa thông tin
        </Button>
      </div>
      <div className="grid sm:grid-cols-2 gap-3 text-sm">
        <ViewField label="Họ tên" value={data!.full_name} />
        <ViewField label="Ngày sinh" value={formatDate(data!.date_of_birth)} />
        <ViewField label="Giới tính" value={data!.gender === 'male' ? 'Nam' : data!.gender === 'female' ? 'Nữ' : 'Khác'} />
        <ViewField label="CCCD" value={data!.national_id} />
        <ViewField label="SĐT" value={data!.phone} />
        <ViewField label="Dân tộc" value={data!.ethnicity || '—'} />
        <ViewField label="Nghề nghiệp" value={data!.occupation || '—'} />
        <ViewField label="BHYT" value={data!.insurance_number || '—'} />
        {data!.insurance_facility && <ViewField label="Nơi KCB ban đầu" value={data!.insurance_facility} />}
        <ViewField label="Địa chỉ" value={data!.address} fullWidth />
        {data!.emergency_contact && (
          <ViewField
            label="Người thân liên hệ"
            value={`${data!.emergency_contact.name} (${data!.emergency_contact.relation}) · ${data!.emergency_contact.phone}`}
            fullWidth
          />
        )}
      </div>
    </div>
  )
}

function EditField({ label, value, onChange, type = 'text', fullWidth }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; fullWidth?: boolean
}) {
  return (
    <div className={`space-y-1 ${fullWidth ? 'sm:col-span-2' : ''}`}>
      <p className="text-xs uppercase text-gray-500 font-semibold tracking-wide">{label}</p>
      <Input type={type} value={value} onChange={e => onChange(e.target.value)} className="h-9 text-sm" />
    </div>
  )
}

function ViewField({ label, value, fullWidth }: { label: string; value: string; fullWidth?: boolean }) {
  return (
    <div className={fullWidth ? 'sm:col-span-2' : ''}>
      <p className="text-xs uppercase text-gray-500 font-semibold tracking-wide">{label}</p>
      <p className="text-gray-900 font-medium">{value}</p>
    </div>
  )
}

function formatDate(d: string): string {
  try { return new Date(d).toLocaleDateString('vi-VN') } catch { return d }
}
