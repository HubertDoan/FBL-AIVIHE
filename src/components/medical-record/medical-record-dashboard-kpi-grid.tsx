'use client'

import { useRouter } from 'next/navigation'
import type { MedicalRecord11Sections } from '@/lib/demo/demo-medical-record-eleven-sections-data'

/**
 * 12 KPI module cards — port từ SSK-VNeID v10 dashboard
 * Grid 4 columns với color-coded top border + emoji icon + count + label + sublabel
 * Click → navigate to corresponding section
 */

interface KpiModule {
  key: string
  icon: string
  label: string
  count: number | string
  sublabel: string
  color: string          // border-top color
  href?: string          // click target
}

function computeModules(record: MedicalRecord11Sections): KpiModule[] {
  return [
    { key: 'identity', icon: '👤', label: 'Định danh', count: record.administrative ? '✓' : '—', sublabel: record.administrative ? 'Đầy đủ' : 'Chưa có', color: '#0f172a', href: '#I' },
    { key: 'vitals', icon: '📊', label: 'Chỉ số SK', count: record.vital_signs.length, sublabel: 'lần đo', color: '#3b82f6', href: '#V' },
    { key: 'allergies', icon: '⚠️', label: 'Dị ứng', count: record.allergies.length, sublabel: 'mục', color: '#f59e0b', href: '#II' },
    { key: 'vaccines', icon: '💉', label: 'Tiêm chủng', count: record.immunizations.length, sublabel: 'mũi', color: '#2563eb', href: '#XI' },
    { key: 'events', icon: '🏥', label: 'Đợt KCB', count: record.organ_exams.length, sublabel: 'lần khám', color: '#dc2626', href: '#VI' },
    { key: 'diagnoses', icon: '🩺', label: 'Chẩn đoán', count: record.chronic_conditions.length, sublabel: 'có mã ICD-10', color: '#7c3aed', href: '#VII' },
    { key: 'labs', icon: '🔬', label: 'Siêu âm/XN', count: record.lab_results.length, sublabel: 'bộ kết quả', color: '#0891b2', href: '#VIII' },
    { key: 'imaging', icon: '📷', label: 'CĐHA', count: record.imaging.length, sublabel: 'tài liệu', color: '#9333ea', href: '#IX' },
    { key: 'meds', icon: '💊', label: 'Thuốc', count: record.chronic_conditions.reduce((n, c) => n + c.medications.length, 0), sublabel: 'đang dùng', color: '#16a34a', href: '#VII' },
    { key: 'procedures', icon: '🔪', label: 'PT/Thủ thuật', count: record.functional_tests.length, sublabel: 'ca thực hiện', color: '#b91c1c', href: '#X' },
    { key: 'summary', icon: '📋', label: 'Tóm tắt BA', count: record.organ_exams.length, sublabel: 'có tóm tắt', color: '#1d4ed8', href: '/dashboard/ai-summary' },
    { key: 'docs', icon: '📁', label: 'Tài liệu', count: 0, sublabel: 'đã upload', color: '#64748b', href: '/dashboard/upload' },
  ]
}

export function MedicalRecordDashboardKpiGrid({ record }: { record: MedicalRecord11Sections }) {
  const router = useRouter()
  const modules = computeModules(record)

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
        📋 Kiến trúc chuẩn BYT · QĐ 1332 + 2733/QĐ-BYT · 12 MODULE
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {modules.map(m => (
          <button
            key={m.key}
            onClick={() => {
              if (m.href?.startsWith('/')) router.push(m.href)
              // else scroll to section (# anchor) — handled by accordion open
            }}
            className="bg-white rounded-xl border border-gray-200 p-3 text-left hover:shadow-md transition group"
            style={{ borderTop: `3px solid ${m.color}` }}
          >
            <span className="text-lg">{m.icon}</span>
            <p className="text-xl font-extrabold mt-1" style={{ color: m.color }}>
              {m.count}
            </p>
            <p className="text-[11px] font-bold text-gray-700 leading-tight">{m.label}</p>
            <p className="text-[10px] text-gray-400">{m.sublabel}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
