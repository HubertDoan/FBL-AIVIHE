'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2, ArrowLeft, FileText } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { MedicalRecord11SectionsAccordion } from '@/components/medical-record/medical-record-eleven-sections-accordion'
import type { MedicalRecord11Sections } from '@/lib/demo/demo-medical-record-eleven-sections-data'

/**
 * Hồ sơ y tế 11 sections theo Thông tư 13/2025/TT-BYT
 *
 * I. Hành chính · II. Dị ứng · III. Tiền sử bệnh · IV. Tiền sử gia đình
 * V. Sinh hiệu & Khám toàn thân · VI. Khám cơ quan · VII. Bệnh mạn tính
 * VIII. Cận lâm sàng · IX. Chẩn đoán hình ảnh · X. Thăm dò chức năng
 * XI. Tiêm chủng
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
    return (
      <div className="text-center py-12 text-destructive">Không tải được hồ sơ</div>
    )
  }

  return (
    <div className="space-y-5 max-w-5xl">
      <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1">
        <ArrowLeft className="size-4" /> Về tổng quan
      </Link>

      <div className="flex items-center gap-3">
        <div className="size-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
          <FileText className="size-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Hồ sơ y tế chuẩn TT 13/2025</h1>
          <p className="text-muted-foreground">
            11 mục theo Bộ Y tế · {record.administrative?.full_name || 'Chưa có thông tin'}
          </p>
        </div>
      </div>

      <MedicalRecord11SectionsAccordion record={record} />

      <div className="text-xs text-gray-500 border-t pt-3">
        <strong>Nguồn chuẩn:</strong> Thông tư 13/2025/TT-BYT của Bộ Y tế quy định cấu trúc hồ sơ bệnh án điện tử.
        Dữ liệu do KH/BSGĐ/BS chuyên khoa cập nhật và xác thực trước khi lưu.
      </div>
    </div>
  )
}
