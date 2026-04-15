'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { MultiFileUploaderWithAiClassifyReview } from '@/components/documents/multi-file-uploader-with-ai-classify-review'
import { DocumentList } from '@/components/documents/document-list'
import { useAuth } from '@/hooks/use-auth'

/**
 * Trang tải tài liệu sức khỏe
 * - Hỗ trợ multi-file (PDF, ảnh, text) cùng lúc
 * - AI tự phân loại mỗi file → 4 mục (Daycare/BSGĐ/PHCN/Khám chữa bệnh)
 * - User xác thực tên BN + sửa thông tin → lưu vào đúng hồ sơ
 */
export default function UploadPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const citizenId = user?.citizenId ?? null

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
            <Sparkles className="size-6 text-teal-600" />
            Tải tài liệu sức khỏe
          </CardTitle>
          <p className="text-muted-foreground text-base leading-relaxed mt-1">
            Tải lên <strong>nhiều tệp cùng lúc</strong> (PDF, ảnh, text). AI tự động phân loại tài liệu
            vào 4 mục: Daycare, Bác sĩ gia đình, Phục hồi chức năng, Khám chữa bệnh.
            Bạn sẽ xác thực tên bệnh nhân và thông tin trước khi lưu.
          </p>
        </CardHeader>
        <CardContent>
          <MultiFileUploaderWithAiClassifyReview
            citizenId={citizenId}
            customerName={user?.fullName || 'Khách hàng'}
            onAllDone={() => {
              setTimeout(() => router.push('/dashboard/health-record'), 800)
            }}
          />
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4 pb-4 text-sm text-blue-900">
          <p className="font-semibold mb-1">💡 Mẹo đặt tên tệp để AI phân loại chính xác hơn:</p>
          <ul className="space-y-0.5 text-blue-800">
            <li>• <strong>kham-bsgd-*</strong>, <strong>family-doctor-*</strong> → Bác sĩ gia đình</li>
            <li>• <strong>phcn-*</strong>, <strong>rehab-*</strong>, <strong>tri-lieu-*</strong> → Phục hồi chức năng</li>
            <li>• <strong>xquang-*</strong>, <strong>xet-nghiem-*</strong>, <strong>bv-*</strong> → Khám chữa bệnh chuyên khoa</li>
            <li>• <strong>daycare-*</strong>, <strong>sinh-hoat-*</strong> → Daycare</li>
          </ul>
        </CardContent>
      </Card>

      <DocumentList citizenId={citizenId} />
    </div>
  )
}
