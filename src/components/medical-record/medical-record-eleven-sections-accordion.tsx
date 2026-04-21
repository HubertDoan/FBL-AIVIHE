'use client'

/**
 * Accordion 11 sections hồ sơ y tế — TT 13/2025/TT-BYT
 * Phase 1: 5 sections KH tự nhập (allergies, illness_history, family_history,
 *           chronic_conditions, immunizations) có nút "+ Thêm" → dialog
 * Phase 2: 6 sections BS nhập — placeholder "Tính năng dành cho BS"
 */

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ChevronDown, ChevronUp, Plus,
  User, AlertTriangle, History, Users as UsersIcon,
  HeartPulse, Stethoscope, Pill, FlaskConical, ScanLine, Activity, Syringe,
  ExternalLink,
} from 'lucide-react'
import type { MedicalRecord11Sections } from '@/lib/demo/demo-medical-record-eleven-sections-data'
import { MedicalRecordAdministrativeSection } from './medical-record-administrative-section'
import { MedicalRecordSimpleListSection } from './medical-record-simple-list-section'
import { MedicalRecordVitalSignsSection } from './medical-record-vital-signs-section'
import { MedicalRecordLabResultsSection } from './medical-record-lab-results-section'
import {
  MedicalRecordSectionAddDialog,
  type MedicalSectionType,
  SECTION_LABELS,
} from './medical-record-section-add-dialog-with-dynamic-form'

interface Props {
  record: MedicalRecord11Sections
  /** Parent gọi để reload data sau khi thêm thành công */
  onReload?: () => void
}

export function MedicalRecord11SectionsAccordion({ record, onReload }: Props) {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['I']))
  const [dialogType, setDialogType] = useState<MedicalSectionType | null>(null)

  const toggle = (key: string) => {
    setOpenSections(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const openDialog = (type: MedicalSectionType, e: React.MouseEvent) => {
    e.stopPropagation() // prevent accordion toggle
    setDialogType(type)
  }

  const handleSaved = () => {
    setDialogType(null)
    onReload?.()
  }

  const sections: SectionDef[] = [
    { key: 'I',    roman: 'I',    title: 'Hành chính',             subtitle: 'Thông tin định danh, BHYT, người thân', icon: User,        count: record.administrative ? 1 : 0 },
    { key: 'II',   roman: 'II',   title: 'Dị ứng',                 subtitle: 'Dị ứng thuốc, thực phẩm, môi trường',  icon: AlertTriangle, count: record.allergies.length },
    { key: 'III',  roman: 'III',  title: 'Tiền sử bệnh',           subtitle: 'Bệnh đã mắc trong quá khứ',            icon: History,      count: record.illness_history.length },
    { key: 'IV',   roman: 'IV',   title: 'Tiền sử gia đình',       subtitle: 'Bệnh di truyền, bệnh trong gia đình',   icon: UsersIcon,    count: record.family_history.length },
    { key: 'V',    roman: 'V',    title: 'Sinh hiệu & Khám toàn thân', subtitle: 'HA, nhịp tim, nhiệt độ, BMI',      icon: HeartPulse,   count: record.vital_signs.length },
    { key: 'VI',   roman: 'VI',   title: 'Khám các cơ quan',       subtitle: 'ENT, tim mạch, hô hấp, tiêu hóa...',   icon: Stethoscope,  count: record.organ_exams.length },
    { key: 'VII',  roman: 'VII',  title: 'Bệnh nền & mạn tính',    subtitle: 'ICD-10 · Thuốc đang dùng',             icon: Pill,         count: record.chronic_conditions.length },
    { key: 'VIII', roman: 'VIII', title: 'Cận lâm sàng & XN',      subtitle: 'Huyết học, hóa sinh, miễn dịch',       icon: FlaskConical, count: record.lab_results.length },
    { key: 'IX',   roman: 'IX',   title: 'Chẩn đoán hình ảnh',     subtitle: 'X-quang, CT, MRI, siêu âm',            icon: ScanLine,     count: record.imaging.length },
    { key: 'X',    roman: 'X',    title: 'Thăm dò chức năng',      subtitle: 'ECG, spirometry, stress test',          icon: Activity,     count: record.functional_tests.length },
    { key: 'XI',   roman: 'XI',   title: 'Tiêm chủng',             subtitle: 'Lịch sử tiêm vaccine',                 icon: Syringe,      count: record.immunizations.length },
  ]

  return (
    <>
      <div className="space-y-2">
        {sections.map((s) => {
          const isOpen = openSections.has(s.key)
          return (
            <Card key={s.key} className="overflow-hidden">
              {/* Accordion header */}
              <button
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-left"
                onClick={() => toggle(s.key)}
              >
                <div className="size-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 text-xs font-bold">
                  {s.roman}
                </div>
                <s.icon className="size-5 text-teal-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-base text-gray-900 truncate">{s.title}</p>
                    <span className="text-xs bg-gray-100 text-gray-700 rounded-full px-2 py-0.5">
                      {s.count === 0 ? 'Trống' : `${s.count} mục`}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{s.subtitle}</p>
                </div>

                {/* "+ Thêm" button cho 5 sections KH tự nhập */}
                {SECTION_KEY_TO_TYPE[s.key] && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="shrink-0 h-8 text-xs border-teal-300 text-teal-700 hover:bg-teal-50 gap-1"
                    onClick={(e) => openDialog(SECTION_KEY_TO_TYPE[s.key]!, e)}
                  >
                    <Plus className="size-3" />
                    Thêm
                  </Button>
                )}

                {isOpen ? <ChevronUp className="size-4 text-gray-400 shrink-0" /> : <ChevronDown className="size-4 text-gray-400 shrink-0" />}
              </button>

              {/* Accordion body */}
              {isOpen && (
                <CardContent className="pt-0 pb-4 px-4 border-t bg-white">
                  {renderSectionContent(s.key, record, (type, e) => openDialog(type, e))}
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      {/* Dialog */}
      {dialogType && (
        <MedicalRecordSectionAddDialog
          open={!!dialogType}
          sectionType={dialogType}
          onClose={() => setDialogType(null)}
          onSaved={handleSaved}
        />
      )}
    </>
  )
}

/** Map accordion key → MedicalSectionType (null = defer / BS only) */
const SECTION_KEY_TO_TYPE: Record<string, MedicalSectionType | null> = {
  I: null,   // Hành chính → /dashboard/profile
  II: 'allergies',
  III: 'illness_history',
  IV: 'family_history',
  V: null,   // Vitals → /dashboard/vitals
  VI: null,  // Organ exams → BS
  VII: 'chronic_conditions',
  VIII: null, // Lab → BS / upload
  IX: null,   // Imaging → BS / upload
  X: null,    // Functional → BS / upload
  XI: 'immunizations',
}

interface SectionDef {
  key: string
  roman: string
  title: string
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
  count: number
}

// ---------- Deferred section placeholders ----------

function DeferredDoctorOnlyPlaceholder({ message }: { message: string }) {
  return (
    <div className="py-4 text-center">
      <p className="text-sm text-gray-400 italic">{message}</p>
    </div>
  )
}

// ---------- Section content renderer ----------

function renderSectionContent(
  key: string,
  record: MedicalRecord11Sections,
  onAdd: (type: MedicalSectionType, e: React.MouseEvent) => void,
) {
  switch (key) {
    case 'I':
      return (
        <div className="space-y-2 pt-3">
          <MedicalRecordAdministrativeSection data={record.administrative} />
          <Link
            href="/dashboard/profile"
            className="inline-flex items-center gap-1 text-xs text-teal-600 hover:underline mt-1"
          >
            <ExternalLink className="size-3" /> Chỉnh sửa hồ sơ cá nhân
          </Link>
        </div>
      )

    case 'II':
      return (
        <div className="space-y-2 pt-3">
          <MedicalRecordSimpleListSection
            items={record.allergies.map(a => ({
              id: a.id,
              title: `${a.agent} (${a.type === 'drug' ? 'Thuốc' : a.type === 'food' ? 'Thực phẩm' : 'Môi trường'})`,
              subtitle: `Mức độ: ${a.severity === 'severe' ? 'Nặng' : a.severity === 'moderate' ? 'Trung bình' : 'Nhẹ'}`,
              detail: a.reaction,
              date: a.noted_at,
            }))}
            emptyMessage="Chưa ghi nhận dị ứng nào."
          />
          <AddMoreButton label={`+ Thêm ${SECTION_LABELS['allergies']}`} onClick={e => onAdd('allergies', e)} />
        </div>
      )

    case 'III':
      return (
        <div className="space-y-2 pt-3">
          <MedicalRecordSimpleListSection
            items={record.illness_history.map(i => ({
              id: i.id,
              title: i.condition,
              subtitle: `${i.since ? `Từ ${i.since} · ` : ''}${i.status === 'resolved' ? 'Đã khỏi' : 'Đang theo dõi'}`,
              detail: i.notes ?? undefined,
            }))}
            emptyMessage="Chưa có tiền sử bệnh."
          />
          <AddMoreButton label={`+ Thêm ${SECTION_LABELS['illness_history']}`} onClick={e => onAdd('illness_history', e)} />
        </div>
      )

    case 'IV':
      return (
        <div className="space-y-2 pt-3">
          <MedicalRecordSimpleListSection
            items={record.family_history.map(f => ({
              id: f.id,
              title: `${f.relation}: ${f.condition}`,
              detail: f.note,
            }))}
            emptyMessage="Chưa có tiền sử gia đình."
          />
          <AddMoreButton label={`+ Thêm ${SECTION_LABELS['family_history']}`} onClick={e => onAdd('family_history', e)} />
        </div>
      )

    case 'V':
      return (
        <div className="space-y-2 pt-3">
          <MedicalRecordVitalSignsSection items={record.vital_signs} />
          <Link
            href="/dashboard/vitals"
            className="inline-flex items-center gap-1 text-xs text-teal-600 hover:underline"
          >
            <ExternalLink className="size-3" /> Nhập chỉ số tại trang Chỉ số sức khỏe
          </Link>
        </div>
      )

    case 'VI':
      return <DeferredDoctorOnlyPlaceholder message="Tính năng dành cho Bác sĩ — sẽ tự động cập nhật từ tài liệu upload" />

    case 'VII':
      return (
        <div className="space-y-2 pt-3">
          <MedicalRecordSimpleListSection
            items={record.chronic_conditions.map(c => ({
              id: c.id,
              title: `${c.condition}${c.icd10 ? ` (${c.icd10})` : ''}`,
              subtitle: `${c.since ? `Từ ${c.since} · ` : ''}${c.monitoring_frequency ?? ''}`,
              detail: `Thuốc: ${c.medications.join(', ') || '—'}${c.notes ? ` · ${c.notes}` : ''}`,
              badge: c.status === 'controlled' ? 'Ổn định' : c.status === 'active' ? 'Đang hoạt động' : 'Thuyên giảm',
              badgeColor: c.status === 'controlled' ? 'green' : c.status === 'active' ? 'amber' : 'blue',
            }))}
            emptyMessage="Chưa có bệnh mạn tính."
          />
          <AddMoreButton label={`+ Thêm ${SECTION_LABELS['chronic_conditions']}`} onClick={e => onAdd('chronic_conditions', e)} />
        </div>
      )

    case 'VIII':
      return (
        <div className="pt-3">
          <MedicalRecordLabResultsSection items={record.lab_results} />
          <DeferredDoctorOnlyPlaceholder message="Tính năng dành cho Bác sĩ — sẽ tự động cập nhật từ tài liệu upload" />
        </div>
      )

    case 'IX':
      return (
        <div className="pt-3">
          <MedicalRecordSimpleListSection
            items={record.imaging.map(i => ({
              id: i.id,
              title: `${modalityLabel(i.modality)} — ${i.body_part}`,
              subtitle: `${i.date} · ${i.facility} · BS ${i.doctor}`,
              detail: `${i.findings}. Kết luận: ${i.conclusion}`,
              badge: i.status === 'normal' ? 'Bình thường' : i.status === 'abnormal' ? 'Bất thường' : 'Nặng',
              badgeColor: i.status === 'normal' ? 'green' : i.status === 'abnormal' ? 'amber' : 'red',
            }))}
            emptyMessage="Chưa có chẩn đoán hình ảnh."
          />
          <DeferredDoctorOnlyPlaceholder message="Tính năng dành cho Bác sĩ — sẽ tự động cập nhật từ tài liệu upload" />
        </div>
      )

    case 'X':
      return (
        <div className="pt-3">
          <MedicalRecordSimpleListSection
            items={record.functional_tests.map(t => ({
              id: t.id,
              title: t.test_type,
              subtitle: `${t.date} · ${t.facility}`,
              detail: t.result + (t.notes ? ` · ${t.notes}` : ''),
              badge: t.status === 'normal' ? 'Bình thường' : t.status === 'limited' ? 'Hạn chế' : 'Bất thường',
              badgeColor: t.status === 'normal' ? 'green' : t.status === 'limited' ? 'amber' : 'red',
            }))}
            emptyMessage="Chưa có thăm dò chức năng."
          />
          <DeferredDoctorOnlyPlaceholder message="Tính năng dành cho Bác sĩ — sẽ tự động cập nhật từ tài liệu upload" />
        </div>
      )

    case 'XI':
      return (
        <div className="space-y-2 pt-3">
          <MedicalRecordSimpleListSection
            items={record.immunizations.map(v => ({
              id: v.id,
              title: v.vaccine_name,
              subtitle: `${v.date} · mũi ${v.dose_number} · ${v.facility}`,
              badge: v.status === 'completed' ? 'Đủ mũi' : v.status === 'partial' ? 'Chưa đủ' : 'Đang chờ',
              badgeColor: v.status === 'completed' ? 'green' : v.status === 'partial' ? 'amber' : 'gray',
            }))}
            emptyMessage="Chưa có lịch sử tiêm chủng."
          />
          <AddMoreButton label={`+ Thêm ${SECTION_LABELS['immunizations']}`} onClick={e => onAdd('immunizations', e)} />
        </div>
      )

    default:
      return null
  }
}

function AddMoreButton({ label, onClick }: { label: string; onClick: (e: React.MouseEvent) => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-2 w-full rounded-lg border border-dashed border-teal-300 py-2 text-sm text-teal-600 hover:bg-teal-50 transition-colors"
    >
      {label}
    </button>
  )
}

function modalityLabel(m: string): string {
  const map: Record<string, string> = { xray: 'X-quang', ct: 'CT', mri: 'MRI', ultrasound: 'Siêu âm', endoscopy: 'Nội soi', other: 'Khác' }
  return map[m] || m
}
