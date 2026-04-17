'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Clipboard, CheckCircle } from 'lucide-react'
import { MultiFileUploaderWithAiClassifyReview } from '@/components/documents/multi-file-uploader-with-ai-classify-review'
import { DocumentList } from '@/components/documents/document-list'
import { SmartUploadDocumentTypeChips } from '@/components/documents/smart-upload-document-type-chips'
import type { DocumentTypeValue } from '@/components/documents/smart-upload-document-type-chips'
import { SmartUploadPatientCheckBanner } from '@/components/documents/smart-upload-patient-check-banner'
import { useAuth } from '@/hooks/use-auth'

/**
 * Nhập hồ sơ y tế bằng AI (port từ SSK-VNeID)
 * Layout:
 * - Progress stepper 3 bước: Upload → Phân tích → Hoàn tất
 * - Red gradient icon badge lớn
 * - Title + subtitle
 * - 6 document type chips
 * - Drag-drop zone lớn
 * - Yellow tip banner
 * - Big red "Phân tích với AI" button
 */
export default function UploadPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const citizenId = user?.citizenId ?? null
  const [selectedDocType, setSelectedDocType] = useState<DocumentTypeValue | null>(null)
  const [step] = useState<'upload' | 'analyze' | 'done'>('upload')

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <div className="size-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-lg text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (!citizenId) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-destructive">Không tìm thấy tài khoản AIVIHE. Vui lòng hoàn tất đăng ký.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')} className="gap-1">
        <ArrowLeft className="size-4" /> Về tổng quan
      </Button>

      {/* 3-step progress stepper */}
      <UploadProgressStepper currentStep={step} />

      {/* Main card */}
      <Card className="overflow-hidden">
        <CardContent className="pt-8 pb-6 px-6 space-y-5">
          {/* Red icon + title */}
          <div className="text-center space-y-3">
            <div className="inline-flex size-16 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white items-center justify-center shadow-lg">
              <Clipboard className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Nhập thông tin sức khỏe bằng AI</h1>
              <p className="text-muted-foreground text-sm md:text-base mt-1">
                Upload tài liệu y tế — AI tự động trích xuất và điền vào tài khoản AIVIHE
              </p>
            </div>
          </div>

          {/* Patient check banner */}
          <SmartUploadPatientCheckBanner fullName={user?.fullName || 'Khách hàng'} />

          {/* Document type chips */}
          <div className="flex flex-wrap justify-center gap-2">
            <SmartUploadDocumentTypeChips selected={selectedDocType} onSelect={setSelectedDocType} />
          </div>

          {/* Multi-file uploader */}
          <div className="pt-2">
            <MultiFileUploaderWithAiClassifyReview
              citizenId={citizenId}
              customerName={user?.fullName || 'Khách hàng'}
              onAllDone={() => {
                setTimeout(() => router.push('/dashboard/health-record'), 800)
              }}
            />
          </div>

          {/* Yellow tip */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-900 flex items-start gap-2">
            <span className="text-lg">💡</span>
            <div>
              <strong>Mẹo:</strong> Dùng file PDF gốc hoặc ảnh rõ nét. Báo cáo tổng hợp (nhiều lần khám) cho kết quả tốt nhất.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Previous uploads */}
      <DocumentList citizenId={citizenId} />
    </div>
  )
}

/** 3-step progress indicator */
function UploadProgressStepper({ currentStep }: { currentStep: 'upload' | 'analyze' | 'done' }) {
  const steps = [
    { key: 'upload', label: 'Upload', icon: '📤' },
    { key: 'analyze', label: 'Phân tích', icon: '🤖' },
    { key: 'done', label: 'Hoàn tất', icon: '✅' },
  ]

  const getStatus = (key: string) => {
    const currentIdx = steps.findIndex(s => s.key === currentStep)
    const keyIdx = steps.findIndex(s => s.key === key)
    if (keyIdx < currentIdx) return 'done'
    if (keyIdx === currentIdx) return 'active'
    return 'pending'
  }

  return (
    <div className="flex items-center gap-2 max-w-lg mx-auto">
      {steps.map((s, i) => {
        const status = getStatus(s.key)
        return (
          <div key={s.key} className="flex items-center gap-2 flex-1">
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div className={`size-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${
                status === 'done' ? 'bg-green-500 text-white'
                : status === 'active' ? 'bg-red-500 text-white ring-4 ring-red-200'
                : 'bg-gray-200 text-gray-500'
              }`}>
                {status === 'done' ? <CheckCircle className="size-5" /> : i + 1}
              </div>
              <span className={`text-xs font-medium ${status === 'active' ? 'text-red-600' : status === 'done' ? 'text-green-600' : 'text-gray-500'}`}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mb-5 ${status === 'done' ? 'bg-green-500' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
