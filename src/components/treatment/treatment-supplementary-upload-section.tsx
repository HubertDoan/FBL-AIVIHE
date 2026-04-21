'use client'

// Supplementary upload section embedded in the treatment page
// Allows patient to upload additional documents (lab results, imaging, prescriptions)
// Reuses MultiFileUploaderWithAiClassifyReview + SmartUploadPatientCheckBanner
// AI extracts → user must confirm before saving (AIVIHE hard rule)
// Toast warning if AI-detected name/phone/DoB does not match patient profile

import { useState } from 'react'
import { Upload, ChevronDown, ChevronUp, Info } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MultiFileUploaderWithAiClassifyReview } from '@/components/documents/multi-file-uploader-with-ai-classify-review'
import { SmartUploadPatientCheckBanner } from '@/components/documents/smart-upload-patient-check-banner'
import { SmartUploadDocumentTypeChips } from '@/components/documents/smart-upload-document-type-chips'
import type { DocumentTypeValue } from '@/components/documents/smart-upload-document-type-chips'

interface Props {
  citizenId: string
  fullName: string
  dob?: string | null
  gender?: string | null
  bloodType?: string | null
  onUploadComplete?: () => void
}

export function TreatmentSupplementaryUploadSection({
  citizenId,
  fullName,
  dob,
  gender,
  bloodType,
  onUploadComplete,
}: Props) {
  const [expanded, setExpanded] = useState(false)
  const [selectedDocType, setSelectedDocType] = useState<DocumentTypeValue | null>(null)

  return (
    <Card className="border-teal-200">
      <CardContent className="p-4 space-y-4">
        {/* Collapsible header */}
        <button
          type="button"
          className="w-full flex items-center justify-between gap-2 text-left"
          onClick={() => setExpanded((v) => !v)}
        >
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0">
              <Upload className="size-4" />
            </div>
            <div>
              <p className="text-base font-semibold text-gray-900">Upload bổ sung</p>
              <p className="text-xs text-gray-500">Xét nghiệm · Chẩn đoán hình ảnh · Siêu âm · Bệnh án mới</p>
            </div>
          </div>
          {expanded ? (
            <ChevronUp className="size-5 text-gray-400 shrink-0" />
          ) : (
            <ChevronDown className="size-5 text-gray-400 shrink-0" />
          )}
        </button>

        {expanded && (
          <div className="space-y-4 pt-1">
            {/* AI disclaimer */}
            <div className="flex items-start gap-2 bg-teal-50 border border-teal-200 rounded-lg p-3 text-sm text-teal-800">
              <Info className="size-4 shrink-0 mt-0.5 text-teal-600" />
              <p>
                Sau khi upload, <strong>AI sẽ tự đọc</strong> và yêu cầu bạn{' '}
                <strong>xác nhận trước khi lưu</strong>. Nếu tên/ngày sinh trên tài liệu
                không khớp hồ sơ, bạn sẽ được cảnh báo.
              </p>
            </div>

            {/* Patient verify banner */}
            <SmartUploadPatientCheckBanner
              fullName={fullName}
              dob={dob}
              gender={gender}
              bloodType={bloodType}
            />

            {/* Document type hint chips */}
            <div>
              <p className="text-xs text-gray-500 mb-2">Chọn loại tài liệu (gợi ý, không bắt buộc):</p>
              <SmartUploadDocumentTypeChips
                selected={selectedDocType}
                onSelect={setSelectedDocType}
              />
            </div>

            {/* Multi-file uploader */}
            <MultiFileUploaderWithAiClassifyReview
              citizenId={citizenId}
              customerName={fullName}
              onAllDone={onUploadComplete}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
