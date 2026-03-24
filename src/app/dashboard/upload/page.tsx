'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DocumentUploader } from '@/components/documents/document-uploader'
import { DocumentList } from '@/components/documents/document-list'
import { useAuth } from '@/hooks/use-auth'

export default function UploadPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const citizenId = user?.citizenId ?? null

  const handleUploadComplete = (documentId: string) => {
    router.push(`/dashboard/extraction/${documentId}`)
  }

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
        <p className="text-lg text-destructive">
          Không tìm thấy hồ sơ. Vui lòng hoàn tất đăng ký.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            Tải tài liệu sức khỏe
          </CardTitle>
          <p className="text-muted-foreground text-lg">
            Tải lên kết quả xét nghiệm, đơn thuốc, hoặc tài liệu y tế khác.
            AI sẽ trích xuất dữ liệu để bạn xác nhận.
          </p>
        </CardHeader>
        <CardContent>
          <DocumentUploader
            citizenId={citizenId}
            onUploadComplete={handleUploadComplete}
          />
        </CardContent>
      </Card>

      <DocumentList citizenId={citizenId} />
    </div>
  )
}
