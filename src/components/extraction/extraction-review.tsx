'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DocumentPreview } from '@/components/documents/document-preview'
import { ExtractionField } from '@/components/extraction/extraction-field'
import type { ExtractedRecord } from '@/types/database'

interface Props {
  documentUrl: string
  fileType: string
  records: ExtractedRecord[]
  onConfirm: (id: string, value: string, unit: string | null) => Promise<void>
  onConfirmAll: () => Promise<void>
}

export function ExtractionReview({
  documentUrl,
  fileType,
  records,
  onConfirm,
  onConfirmAll,
}: Props) {
  const [confirmingAll, setConfirmingAll] = useState(false)
  const pendingCount = records.filter((r) => r.status === 'pending').length
  const allConfirmed = pendingCount === 0

  const handleConfirmAll = async () => {
    setConfirmingAll(true)
    try {
      await onConfirmAll()
    } finally {
      setConfirmingAll(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: document preview */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Tài liệu gốc</h2>
        <DocumentPreview url={documentUrl} fileType={fileType} />
      </div>

      {/* Right: extracted fields */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Dữ liệu trích xuất</h2>
          <span className="text-sm text-muted-foreground">
            {records.length - pendingCount}/{records.length} đã xác nhận
          </span>
        </div>

        {records.length === 0 && (
          <p className="text-lg text-muted-foreground py-4 text-center">
            Không tìm thấy dữ liệu để trích xuất.
          </p>
        )}

        <div className="space-y-3">
          {records.map((r) => (
            <ExtractionField key={r.id} record={r} onConfirm={onConfirm} />
          ))}
        </div>

        {records.length > 0 && !allConfirmed && (
          <Button
            size="lg"
            className="w-full text-lg min-h-[52px]"
            disabled={confirmingAll}
            onClick={handleConfirmAll}
          >
            {confirmingAll
              ? 'Đang xác nhận...'
              : `Xác nhận tất cả (${pendingCount})`}
          </Button>
        )}

        {allConfirmed && records.length > 0 && (
          <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-center space-y-2">
            <p className="text-lg font-medium text-green-800">
              Tất cả dữ liệu đã được xác nhận!
            </p>
            <Button
              variant="outline"
              size="lg"
              className="text-lg min-h-[48px]"
              onClick={() =>
                (window.location.href = '/dashboard/timeline')
              }
            >
              Xem dòng thời gian
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
