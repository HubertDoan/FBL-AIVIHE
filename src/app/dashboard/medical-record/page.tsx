'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { MedicalRecordPatientHeaderGradientCard } from '@/components/medical-record/medical-record-patient-header-gradient-card'
import { MedicalRecordDashboardKpiGrid } from '@/components/medical-record/medical-record-dashboard-kpi-grid'
import { MedicalRecord11SectionsAccordion } from '@/components/medical-record/medical-record-eleven-sections-accordion'
import { MedicalRecordLatestVitalsAndAbnormalPanel } from '@/components/medical-record/medical-record-latest-vitals-and-abnormal-panel'
import type { MedicalRecord11Sections } from '@/lib/demo/demo-medical-record-eleven-sections-data'

/**
 * Hồ sơ y tế — redesign theo SSK-VNeID v10:
 * 1. Patient header gradient card (red, name + DOB + BHYT + recent events)
 * 2. 12 KPI module cards grid (color-coded borders)
 * 3. Chỉ số gần nhất + Bất thường panel
 * 4. 11 sections accordion (expandable)
 */
export default function MedicalRecordPage() {
  const { user, loading: authLoading } = useAuth()
  const [record, setRecord] = useState<MedicalRecord11Sections | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading || !user) return
    fetch('/api/medical-record')
      .then(r => r.ok ? r.json() : null)
      .then(data => setRecord(data))
      .finally(() => setLoading(false))
  }, [authLoading, user])

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        <Loader2 className="size-6 animate-spin mr-2" /> Đang tải hồ sơ y tế...
      </div>
    )
  }

  if (!record) {
    return <div className="text-center py-12 text-destructive">Không tải được hồ sơ</div>
  }

  // Recent events for header badges
  const recentEvents = [
    ...record.organ_exams.slice(0, 2).map(e => `${e.examined_by} — ${e.date}`),
    ...record.imaging.slice(0, 1).map(i => `${i.modality.toUpperCase()} ${i.body_part}`),
  ]

  return (
    <div className="space-y-5 max-w-5xl">
      <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1">
        <ArrowLeft className="size-4" /> Về tổng quan
      </Link>

      {/* Patient header — red gradient */}
      <MedicalRecordPatientHeaderGradientCard
        admin={record.administrative}
        recentEvents={recentEvents}
      />

      {/* 12 KPI cards grid */}
      <MedicalRecordDashboardKpiGrid record={record} />

      {/* Vitals + Abnormal panel */}
      <MedicalRecordLatestVitalsAndAbnormalPanel record={record} />

      {/* 11 sections accordion */}
      <MedicalRecord11SectionsAccordion record={record} />

      <div className="text-xs text-gray-500 border-t pt-3">
        <strong>Nguồn chuẩn:</strong> Thông tư 13/2025/TT-BYT · QĐ 1332 + 2733/QĐ-BYT.
        Dữ liệu do KH/BSGĐ/BS chuyên khoa cập nhật và xác thực trước khi lưu.
      </div>
    </div>
  )
}
