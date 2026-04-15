'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { MultiFileUploaderWithAiClassifyReview } from '@/components/documents/multi-file-uploader-with-ai-classify-review'
import { DocumentList } from '@/components/documents/document-list'
import { SmartUploadDocumentTypeChips } from '@/components/documents/smart-upload-document-type-chips'
import type { DocumentTypeValue } from '@/components/documents/smart-upload-document-type-chips'
import { SmartUploadPatientCheckBanner } from '@/components/documents/smart-upload-patient-check-banner'
import { useAuth } from '@/hooks/use-auth'

/**
 * Trang upload thông minh (port từ SSK-VNeID "Upload thông minh" + Widget V7 multi-file)
 * - Patient check banner: xác minh thông tin BN trước khi AI so sánh
 * - Document type chips: gợi ý loại tài liệu để AI classify chính xác hơn
 * - Multi-file uploader: PDF · JPG · PNG · TXT · nhiều file cùng lúc
 * - Review dialog: xác thực extracted data + category
 */
export default function UploadPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const citizenId = user?.citizenId ?? null
  const [selectedDocType, setSelectedDocType] = useState<DocumentTypeValue | null>(null)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-lg text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (!citizenId) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-destructive">Không tìm thấy hồ sơ. Vui lòng hoàn tất đăng ký.</p>
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')} className="gap-1">
        <ArrowLeft className="size-4" /> Về tổng quan
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <div className="size-11 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 text-white flex items-center justify-center">
              <Sparkles className="size-6" />
            </div>
            Upload thông minh
          </CardTitle>
          <p className="text-muted-foreground text-sm leading-relaxed mt-1">
            AI tự động đọc, <strong>xác minh bệnh nhân</strong> và phân loại vào 4 mục hồ sơ.
            Tải nhiều tệp cùng lúc: PDF · JPG · PNG · TXT.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Patient check */}
          <SmartUploadPatientCheckBanner
            fullName={user?.fullName || 'Khách hàng'}
          />

          {/* Document type chips */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-700">
              Loại tài liệu (tùy chọn — giúp AI phân loại chính xác hơn)
            </p>
            <SmartUploadDocumentTypeChips selected={selectedDocType} onSelect={setSelectedDocType} />
          </div>

          {/* Multi-file uploader */}
          <MultiFileUploaderWithAiClassifyReview
            citizenId={citizenId}
            customerName={user?.fullName || 'Khách hàng'}
            onAllDone={() => {
              setTimeout(() => router.push('/dashboard/health-record'), 800)
            }}
          />
        </CardContent>
      </Card>

      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-4 pb-4 text-sm text-amber-900">
          <p className="font-semibold mb-1">💡 Mẹo để AI hoạt động tốt nhất:</p>
          <ul className="space-y-0.5 text-amber-800">
            <li>• Dùng file PDF gốc hoặc ảnh rõ nét, đủ ánh sáng</li>
            <li>• Báo cáo tổng hợp nhiều lần khám cho kết quả tốt nhất</li>
            <li>• Đặt tên file có từ khóa (VD: <code>xet-nghiem-thang-4.pdf</code>, <code>xquang-goi.jpg</code>)</li>
            <li>• Tên trên tài liệu phải khớp với tên trong tài khoản — nếu không, AI sẽ cảnh báo</li>
          </ul>
        </CardContent>
      </Card>

      <DocumentList citizenId={citizenId} />
    </div>
  )
}
