'use client'

/**
 * Generic "Thêm mục" dialog cho 5 sections KH tự nhập:
 * allergies | illness_history | family_history | chronic_conditions | immunizations
 *
 * Nhận sectionType → render đúng form fields → POST /api/medical-record/sections/[type]
 * onSaved() gọi lại để parent reload data
 */

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export type MedicalSectionType =
  | 'allergies'
  | 'illness_history'
  | 'family_history'
  | 'chronic_conditions'
  | 'immunizations'

export const SECTION_LABELS: Record<MedicalSectionType, string> = {
  allergies: 'Dị ứng',
  illness_history: 'Tiền sử bệnh',
  family_history: 'Tiền sử gia đình',
  chronic_conditions: 'Bệnh nền & mạn tính',
  immunizations: 'Tiêm chủng',
}

interface Props {
  open: boolean
  sectionType: MedicalSectionType
  onClose: () => void
  onSaved: () => void
}

// ---------- Field renderers per section ----------

/** Safely extract a string value from the untyped form map */
function str(form: Record<string, unknown>, key: string, fallback = ''): string {
  const v = form[key]
  return typeof v === 'string' ? v : fallback
}

function AllergiesForm({ form, set }: FormProps) {
  return (
    <>
      <Field label="Tác nhân dị ứng *" htmlFor="agent">
        <Input id="agent" className="h-11" placeholder="Vd: Penicillin, Tôm, Phấn hoa" value={str(form, 'agent')} onChange={e => set('agent', e.target.value)} />
      </Field>
      <Field label="Loại *" htmlFor="type">
        <Select value={str(form, 'type')} onValueChange={v => set('type', v)}>
          <SelectTrigger className="h-11"><SelectValue placeholder="Chọn loại" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="drug">Thuốc</SelectItem>
            <SelectItem value="food">Thực phẩm</SelectItem>
            <SelectItem value="environment">Môi trường</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field label="Mức độ *" htmlFor="severity">
        <Select value={str(form, 'severity')} onValueChange={v => set('severity', v)}>
          <SelectTrigger className="h-11"><SelectValue placeholder="Chọn mức độ" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="mild">Nhẹ</SelectItem>
            <SelectItem value="moderate">Trung bình</SelectItem>
            <SelectItem value="severe">Nặng</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field label="Phản ứng *" htmlFor="reaction">
        <Input id="reaction" className="h-11" placeholder="Vd: Phát ban, khó thở, ngứa" value={str(form, 'reaction')} onChange={e => set('reaction', e.target.value)} />
      </Field>
      <Field label="Ngày ghi nhận" htmlFor="noted_at">
        <Input id="noted_at" type="date" className="h-11" value={str(form, 'noted_at')} onChange={e => set('noted_at', e.target.value)} />
      </Field>
      <Field label="Ghi chú" htmlFor="notes">
        <Textarea id="notes" rows={2} placeholder="Thông tin thêm (nếu có)" value={str(form, 'notes')} onChange={e => set('notes', e.target.value)} />
      </Field>
    </>
  )
}

function IllnessHistoryForm({ form, set }: FormProps) {
  return (
    <>
      <Field label="Tên bệnh *" htmlFor="condition">
        <Input id="condition" className="h-11" placeholder="Vd: Viêm loét dạ dày, Sỏi thận" value={str(form, 'condition')} onChange={e => set('condition', e.target.value)} />
      </Field>
      <Field label="Từ năm / tháng" htmlFor="since">
        <Input id="since" className="h-11" placeholder="Vd: 2018 hoặc 2018-06" value={str(form, 'since')} onChange={e => set('since', e.target.value)} />
      </Field>
      <Field label="Trạng thái" htmlFor="status">
        <Select value={str(form, 'status', 'active')} onValueChange={v => set('status', v)}>
          <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Đang theo dõi</SelectItem>
            <SelectItem value="resolved">Đã khỏi</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field label="Ghi chú" htmlFor="notes">
        <Textarea id="notes" rows={2} placeholder="Diễn biến, điều trị..." value={str(form, 'notes')} onChange={e => set('notes', e.target.value)} />
      </Field>
    </>
  )
}

function FamilyHistoryForm({ form, set }: FormProps) {
  return (
    <>
      <Field label="Quan hệ *" htmlFor="relation">
        <Input id="relation" className="h-11" placeholder="Vd: Cha, Mẹ, Anh, Chị" value={str(form, 'relation')} onChange={e => set('relation', e.target.value)} />
      </Field>
      <Field label="Bệnh *" htmlFor="condition">
        <Input id="condition" className="h-11" placeholder="Vd: Đái tháo đường type 2" value={str(form, 'condition')} onChange={e => set('condition', e.target.value)} />
      </Field>
      <Field label="Ghi chú" htmlFor="note">
        <Textarea id="note" rows={2} placeholder="Thông tin thêm (nếu có)" value={str(form, 'note')} onChange={e => set('note', e.target.value)} />
      </Field>
    </>
  )
}

function ChronicConditionsForm({ form, set }: FormProps) {
  const [medInput, setMedInput] = useState('')
  const meds: string[] = Array.isArray(form.medications) ? (form.medications as string[]) : []

  const addMed = () => {
    const v = medInput.trim()
    if (!v) return
    set('medications', [...meds, v])
    setMedInput('')
  }

  const removeMed = (i: number) => {
    set('medications', meds.filter((_, idx) => idx !== i))
  }

  return (
    <>
      <Field label="Tên bệnh *" htmlFor="condition">
        <Input id="condition" className="h-11" placeholder="Vd: Đái tháo đường type 2" value={str(form, 'condition')} onChange={e => set('condition', e.target.value)} />
      </Field>
      <Field label="Mã ICD-10" htmlFor="icd10">
        <Input id="icd10" className="h-11" placeholder="Vd: E11" value={str(form, 'icd10')} onChange={e => set('icd10', e.target.value)} />
      </Field>
      <Field label="Từ tháng/năm" htmlFor="since">
        <Input id="since" className="h-11" placeholder="Vd: 2020-01" value={str(form, 'since')} onChange={e => set('since', e.target.value)} />
      </Field>
      <Field label="Trạng thái" htmlFor="status">
        <Select value={str(form, 'status', 'active')} onValueChange={v => set('status', v)}>
          <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Đang hoạt động</SelectItem>
            <SelectItem value="controlled">Ổn định</SelectItem>
            <SelectItem value="remission">Thuyên giảm</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field label="Thuốc đang dùng" htmlFor="med-input">
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              id="med-input"
              className="h-11 flex-1"
              placeholder="Vd: Metformin 1000mg 2v/ngày"
              value={medInput}
              onChange={e => setMedInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addMed() } }}
            />
            <Button type="button" variant="outline" className="h-11" onClick={addMed}>Thêm</Button>
          </div>
          {meds.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {meds.map((m, i) => (
                <span key={i} className="inline-flex items-center gap-1 bg-teal-50 text-teal-800 text-xs px-2 py-1 rounded-full">
                  {m}
                  <button type="button" className="ml-1 hover:text-red-600" onClick={() => removeMed(i)}>×</button>
                </span>
              ))}
            </div>
          )}
        </div>
      </Field>
      <Field label="Tần suất theo dõi" htmlFor="monitoring_frequency">
        <Input id="monitoring_frequency" className="h-11" placeholder="Vd: Hàng tháng, HbA1c/3 tháng" value={str(form, 'monitoring_frequency')} onChange={e => set('monitoring_frequency', e.target.value)} />
      </Field>
      <Field label="Ghi chú" htmlFor="notes">
        <Textarea id="notes" rows={2} value={str(form, 'notes')} onChange={e => set('notes', e.target.value)} />
      </Field>
    </>
  )
}

function ImmunizationsForm({ form, set }: FormProps) {
  return (
    <>
      <Field label="Tên vaccine *" htmlFor="vaccine_name">
        <Input id="vaccine_name" className="h-11" placeholder="Vd: Vaccine cúm (Influenza)" value={str(form, 'vaccine_name')} onChange={e => set('vaccine_name', e.target.value)} />
      </Field>
      <Field label="Ngày tiêm" htmlFor="date">
        <Input id="date" type="date" className="h-11" value={str(form, 'date')} onChange={e => set('date', e.target.value)} />
      </Field>
      <Field label="Số mũi" htmlFor="dose_number">
        <Input id="dose_number" type="number" min={1} max={10} className="h-11" value={str(form, 'dose_number', '1')} onChange={e => set('dose_number', e.target.value)} />
      </Field>
      <Field label="Cơ sở tiêm" htmlFor="facility">
        <Input id="facility" className="h-11" placeholder="Vd: Trạm y tế phường, BV Bạch Mai" value={str(form, 'facility')} onChange={e => set('facility', e.target.value)} />
      </Field>
      <Field label="Trạng thái" htmlFor="status">
        <Select value={str(form, 'status', 'completed')} onValueChange={v => set('status', v)}>
          <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="completed">Đủ mũi</SelectItem>
            <SelectItem value="partial">Chưa đủ mũi</SelectItem>
            <SelectItem value="pending">Đang chờ</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field label="Ghi chú" htmlFor="notes">
        <Textarea id="notes" rows={2} value={str(form, 'notes')} onChange={e => set('notes', e.target.value)} />
      </Field>
    </>
  )
}

// ---------- Shared helpers ----------

interface FormProps {
  form: Record<string, unknown>
  set: (key: string, value: unknown) => void
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-sm font-medium text-gray-700">{label}</Label>
      {children}
    </div>
  )
}

function renderForm(type: MedicalSectionType, form: Record<string, unknown>, set: (k: string, v: unknown) => void) {
  switch (type) {
    case 'allergies': return <AllergiesForm form={form} set={set} />
    case 'illness_history': return <IllnessHistoryForm form={form} set={set} />
    case 'family_history': return <FamilyHistoryForm form={form} set={set} />
    case 'chronic_conditions': return <ChronicConditionsForm form={form} set={set} />
    case 'immunizations': return <ImmunizationsForm form={form} set={set} />
  }
}

// ---------- Main Dialog ----------

export function MedicalRecordSectionAddDialog({ open, sectionType, onClose, onSaved }: Props) {
  const [form, setForm] = useState<Record<string, unknown>>({})
  const [saving, setSaving] = useState(false)

  const setField = (key: string, value: unknown) => setForm(prev => ({ ...prev, [key]: value }))

  const handleClose = () => {
    setForm({})
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(`/api/medical-record/sections/${sectionType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error ?? 'Không lưu được, thử lại sau.')
        return
      }
      toast.success(`Đã thêm ${SECTION_LABELS[sectionType]} thành công`)
      setForm({})
      onSaved()
    } catch {
      toast.error('Lỗi kết nối, thử lại sau.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) handleClose() }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-teal-700">
            Thêm {SECTION_LABELS[sectionType]}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {renderForm(sectionType, form, setField)}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1 h-11" onClick={handleClose} disabled={saving}>
              Hủy
            </Button>
            <Button type="submit" className="flex-1 h-11 bg-teal-600 hover:bg-teal-700 text-white" disabled={saving}>
              {saving && <Loader2 className="size-4 mr-2 animate-spin" />}
              Lưu
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
