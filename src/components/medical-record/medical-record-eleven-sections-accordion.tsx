'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  ChevronDown, ChevronUp,
  User, AlertTriangle, History, Users as UsersIcon,
  HeartPulse, Stethoscope, Pill, FlaskConical, ScanLine, Activity, Syringe,
} from 'lucide-react'
import type { MedicalRecord11Sections } from '@/lib/demo/demo-medical-record-eleven-sections-data'
import { MedicalRecordAdministrativeSection } from './medical-record-administrative-section'
import { MedicalRecordSimpleListSection } from './medical-record-simple-list-section'
import { MedicalRecordVitalSignsSection } from './medical-record-vital-signs-section'
import { MedicalRecordLabResultsSection } from './medical-record-lab-results-section'

/**
 * Accordion hiển thị 11 mục hồ sơ y tế chuẩn TT 13/2025/TT-BYT
 * Click header để mở/đóng từng section.
 */

export function MedicalRecord11SectionsAccordion({ record }: { record: MedicalRecord11Sections }) {
  // Section I luôn mở sẵn
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['I']))

  const toggle = (key: string) => {
    setOpenSections(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const sections: SectionDef[] = [
    { key: 'I', roman: 'I', title: 'Hành chính', subtitle: 'Thông tin định danh, BHYT, người thân', icon: User, count: record.administrative ? 1 : 0 },
    { key: 'II', roman: 'II', title: 'Dị ứng', subtitle: 'Dị ứng thuốc, thực phẩm, môi trường', icon: AlertTriangle, count: record.allergies.length },
    { key: 'III', roman: 'III', title: 'Tiền sử bệnh', subtitle: 'Bệnh đã mắc trong quá khứ', icon: History, count: record.illness_history.length },
    { key: 'IV', roman: 'IV', title: 'Tiền sử gia đình', subtitle: 'Bệnh di truyền, bệnh trong gia đình', icon: UsersIcon, count: record.family_history.length },
    { key: 'V', roman: 'V', title: 'Sinh hiệu & Khám toàn thân', subtitle: 'HA, nhịp tim, nhiệt độ, BMI', icon: HeartPulse, count: record.vital_signs.length },
    { key: 'VI', roman: 'VI', title: 'Khám các cơ quan', subtitle: 'ENT, tim mạch, hô hấp, tiêu hóa...', icon: Stethoscope, count: record.organ_exams.length },
    { key: 'VII', roman: 'VII', title: 'Bệnh nền & mạn tính', subtitle: 'ICD-10 · Thuốc đang dùng', icon: Pill, count: record.chronic_conditions.length },
    { key: 'VIII', roman: 'VIII', title: 'Cận lâm sàng & XN', subtitle: 'Huyết học, hóa sinh, miễn dịch', icon: FlaskConical, count: record.lab_results.length },
    { key: 'IX', roman: 'IX', title: 'Chẩn đoán hình ảnh', subtitle: 'X-quang, CT, MRI, siêu âm', icon: ScanLine, count: record.imaging.length },
    { key: 'X', roman: 'X', title: 'Thăm dò chức năng', subtitle: 'ECG, spirometry, stress test', icon: Activity, count: record.functional_tests.length },
    { key: 'XI', roman: 'XI', title: 'Tiêm chủng', subtitle: 'Lịch sử tiêm vaccine', icon: Syringe, count: record.immunizations.length },
  ]

  return (
    <div className="space-y-2">
      {sections.map((s) => {
        const isOpen = openSections.has(s.key)
        return (
          <Card key={s.key} className="overflow-hidden">
            <button
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-left"
              onClick={() => toggle(s.key)}
            >
              <div className="size-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 text-xs font-bold">
                {s.roman}
              </div>
              <s.icon className="size-5 text-blue-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-base text-gray-900 truncate">{s.title}</p>
                  <span className="text-xs bg-gray-100 text-gray-700 rounded-full px-2 py-0.5">
                    {s.count === 0 ? 'Trống' : `${s.count} mục`}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{s.subtitle}</p>
              </div>
              {isOpen ? <ChevronUp className="size-4 text-gray-400" /> : <ChevronDown className="size-4 text-gray-400" />}
            </button>

            {isOpen && (
              <CardContent className="pt-0 pb-4 px-4 border-t bg-white">
                {renderSectionContent(s.key, record)}
              </CardContent>
            )}
          </Card>
        )
      })}
    </div>
  )
}

interface SectionDef {
  key: string
  roman: string
  title: string
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
  count: number
}

function renderSectionContent(key: string, record: MedicalRecord11Sections) {
  switch (key) {
    case 'I':
      return <MedicalRecordAdministrativeSection data={record.administrative} />
    case 'II':
      return (
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
      )
    case 'III':
      return (
        <MedicalRecordSimpleListSection
          items={record.illness_history.map(i => ({
            id: i.id,
            title: i.condition,
            subtitle: `Từ ${i.since} · ${i.status === 'resolved' ? 'Đã khỏi' : 'Đang theo dõi'}`,
            detail: i.notes,
          }))}
          emptyMessage="Chưa có tiền sử bệnh."
        />
      )
    case 'IV':
      return (
        <MedicalRecordSimpleListSection
          items={record.family_history.map(f => ({
            id: f.id,
            title: `${f.relation}: ${f.condition}`,
            detail: f.note,
          }))}
          emptyMessage="Chưa có tiền sử gia đình."
        />
      )
    case 'V':
      return <MedicalRecordVitalSignsSection items={record.vital_signs} />
    case 'VI':
      return (
        <MedicalRecordSimpleListSection
          items={record.organ_exams.map(o => ({
            id: o.id,
            title: systemLabel(o.system),
            subtitle: `${o.date} · BS ${o.examined_by}`,
            detail: o.findings,
            badge: o.status === 'normal' ? 'Bình thường' : o.status === 'abnormal' ? 'Bất thường' : 'Cần theo dõi',
            badgeColor: o.status === 'normal' ? 'green' : o.status === 'abnormal' ? 'red' : 'amber',
          }))}
          emptyMessage="Chưa có kết quả khám cơ quan."
        />
      )
    case 'VII':
      return (
        <MedicalRecordSimpleListSection
          items={record.chronic_conditions.map(c => ({
            id: c.id,
            title: `${c.condition}${c.icd10 ? ` (${c.icd10})` : ''}`,
            subtitle: `Từ ${c.since} · ${c.monitoring_frequency}`,
            detail: `Thuốc: ${c.medications.join(', ') || '—'}${c.notes ? ` · ${c.notes}` : ''}`,
            badge: c.status === 'controlled' ? 'Ổn định' : c.status === 'active' ? 'Đang hoạt động' : 'Thuyên giảm',
            badgeColor: c.status === 'controlled' ? 'green' : c.status === 'active' ? 'amber' : 'blue',
          }))}
          emptyMessage="Chưa có bệnh mạn tính."
        />
      )
    case 'VIII':
      return <MedicalRecordLabResultsSection items={record.lab_results} />
    case 'IX':
      return (
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
      )
    case 'X':
      return (
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
      )
    case 'XI':
      return (
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
      )
    default:
      return null
  }
}

function systemLabel(s: string): string {
  const map: Record<string, string> = {
    ent: 'Tai-Mũi-Họng', cardiovascular: 'Tim mạch', respiratory: 'Hô hấp',
    gastrointestinal: 'Tiêu hóa', neurological: 'Thần kinh', musculoskeletal: 'Cơ xương khớp',
    skin: 'Da-Niêm mạc', psychiatric: 'Tâm thần', gu: 'Tiết niệu-Sinh dục', other: 'Khác',
  }
  return map[s] || s
}

function modalityLabel(m: string): string {
  const map: Record<string, string> = { xray: 'X-quang', ct: 'CT', mri: 'MRI', ultrasound: 'Siêu âm', endoscopy: 'Nội soi', other: 'Khác' }
  return map[m] || m
}
