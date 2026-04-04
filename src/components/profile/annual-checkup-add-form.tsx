'use client'

// annual-checkup-add-form — form to add a new annual health checkup record
// Used inside annual-checkup-records-tab when editing mode is active

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { CheckupStatus } from '@/lib/demo/demo-annual-checkup-data'

export interface CheckupFormData {
  year: string
  examDate: string
  facility: string
  doctorName: string
  generalHealth: string
  bloodPressure: string
  heartRate: string
  weight: string
  height: string
  bloodSugar: string
  cholesterol: string
  notes: string
  status: CheckupStatus
}

const EMPTY: CheckupFormData = {
  year: String(new Date().getFullYear()),
  examDate: '',
  facility: '',
  doctorName: '',
  generalHealth: '',
  bloodPressure: '',
  heartRate: '',
  weight: '',
  height: '',
  bloodSugar: '',
  cholesterol: '',
  notes: '',
  status: 'normal',
}

interface Props {
  onSave: (data: CheckupFormData) => Promise<void>
  onCancel: () => void
}

export function AnnualCheckupAddForm({ onSave, onCancel }: Props) {
  const [form, setForm] = useState<CheckupFormData>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set(key: keyof CheckupFormData, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.examDate || !form.facility || !form.doctorName || !form.generalHealth) {
      setError('Vui lòng điền đầy đủ các trường bắt buộc.')
      return
    }
    setError('')
    setSaving(true)
    try {
      await onSave(form)
      setForm(EMPTY)
    } catch {
      setError('Không thể lưu. Vui lòng thử lại.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-4 space-y-4 bg-muted/30">
      <p className="text-base font-semibold">Thêm lần khám mới</p>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="ck-year">Năm *</Label>
          <Input id="ck-year" type="number" min="2000" max="2099"
            value={form.year} onChange={(e) => set('year', e.target.value)}
            className="min-h-[48px] text-base" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="ck-date">Ngày khám *</Label>
          <Input id="ck-date" type="date"
            value={form.examDate} onChange={(e) => set('examDate', e.target.value)}
            className="min-h-[48px] text-base" />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="ck-facility">Cơ sở khám *</Label>
        <Input id="ck-facility" placeholder="BV Đông Anh, Phòng khám Đa khoa..."
          value={form.facility} onChange={(e) => set('facility', e.target.value)}
          className="min-h-[48px] text-base" />
      </div>

      <div className="space-y-1">
        <Label htmlFor="ck-doctor">Bác sĩ *</Label>
        <Input id="ck-doctor" placeholder="BS. Nguyễn Văn A"
          value={form.doctorName} onChange={(e) => set('doctorName', e.target.value)}
          className="min-h-[48px] text-base" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="ck-bp">Huyết áp</Label>
          <Input id="ck-bp" placeholder="120/80"
            value={form.bloodPressure} onChange={(e) => set('bloodPressure', e.target.value)}
            className="min-h-[48px] text-base" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="ck-hr">Nhịp tim (lần/phút)</Label>
          <Input id="ck-hr" type="number" placeholder="72"
            value={form.heartRate} onChange={(e) => set('heartRate', e.target.value)}
            className="min-h-[48px] text-base" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="ck-sugar">Đường huyết</Label>
          <Input id="ck-sugar" placeholder="100 mg/dL"
            value={form.bloodSugar} onChange={(e) => set('bloodSugar', e.target.value)}
            className="min-h-[48px] text-base" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="ck-chol">Cholesterol</Label>
          <Input id="ck-chol" placeholder="180 mg/dL"
            value={form.cholesterol} onChange={(e) => set('cholesterol', e.target.value)}
            className="min-h-[48px] text-base" />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="ck-general">Nhận xét sức khỏe tổng quát *</Label>
        <Textarea id="ck-general" rows={2}
          value={form.generalHealth} onChange={(e) => set('generalHealth', e.target.value)}
          className="text-base resize-none" />
      </div>

      <div className="space-y-1">
        <Label htmlFor="ck-notes">Ghi chú thêm</Label>
        <Textarea id="ck-notes" rows={2}
          value={form.notes} onChange={(e) => set('notes', e.target.value)}
          className="text-base resize-none" />
      </div>

      <div className="space-y-1">
        <Label>Kết quả *</Label>
        <Select value={form.status} onValueChange={(v) => set('status', v as CheckupStatus)}>
          <SelectTrigger className="min-h-[48px] text-base">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="normal">Bình thường</SelectItem>
            <SelectItem value="follow_up">Cần tái khám</SelectItem>
            <SelectItem value="abnormal">Bất thường</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} className="min-h-[48px]">
          Huỷ
        </Button>
        <Button type="submit" disabled={saving} className="min-h-[48px]">
          {saving ? 'Đang lưu...' : 'Lưu'}
        </Button>
      </div>
    </form>
  )
}
