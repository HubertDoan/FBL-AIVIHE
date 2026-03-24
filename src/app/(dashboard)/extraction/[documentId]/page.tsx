'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExtractionReview } from '@/components/extraction/extraction-review'
import { createClient } from '@/lib/supabase/client'
import { getDocumentUrl } from '@/lib/supabase/storage'
import type { ExtractedRecord, SourceDocument } from '@/types/database'

export default function ExtractionPage() {
  const { documentId } = useParams<{ documentId: string }>()
  const router = useRouter()
  const [doc, setDoc] = useState<SourceDocument | null>(null)
  const [docUrl, setDocUrl] = useState<string | null>(null)
  const [records, setRecords] = useState<ExtractedRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [extracting, setExtracting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    const supabase = createClient()
    const { data: document } = await supabase
      .from('source_documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (!document) {
      setError('Không tìm thấy tài liệu.')
      setLoading(false)
      return
    }

    setDoc(document as SourceDocument)

    try {
      const url = await getDocumentUrl(supabase, document.file_url)
      setDocUrl(url)
    } catch {
      setDocUrl(null)
    }

    const { data: extracted } = await supabase
      .from('extracted_records')
      .select('*')
      .eq('document_id', documentId)
      .order('id')

    setRecords((extracted as ExtractedRecord[]) ?? [])
    setLoading(false)
  }, [documentId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleExtract = async () => {
    setExtracting(true)
    setError(null)
    try {
      const res = await fetch('/api/ai/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Trích xuất thất bại.')
        return
      }
      setRecords(data.records)
    } catch {
      setError('Lỗi kết nối. Vui lòng thử lại.')
    } finally {
      setExtracting(false)
    }
  }

  const handleConfirm = async (
    id: string,
    value: string,
    unit: string | null
  ) => {
    const res = await fetch('/api/records/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        extractedRecordId: id,
        confirmedValue: value,
        confirmedUnit: unit,
        recordDate: doc?.document_date || null,
        category: null,
      }),
    })

    if (res.ok) {
      setRecords((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'confirmed' as const } : r))
      )
    }
  }

  const handleConfirmAll = async () => {
    const pending = records.filter((r) => r.status === 'pending')
    for (const r of pending) {
      await handleConfirm(r.id, r.field_value ?? '', r.unit ?? null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-lg text-muted-foreground">Đang tải tài liệu...</p>
        </div>
      </div>
    )
  }

  if (error && !doc) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-lg text-destructive">{error}</p>
        <Button
          size="lg"
          variant="outline"
          className="text-lg min-h-[48px]"
          onClick={() => router.push('/dashboard/upload')}
        >
          Quay lại tải lên
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Trích xuất dữ liệu</CardTitle>
          <p className="text-muted-foreground text-lg">
            Kiểm tra và xác nhận dữ liệu AI trích xuất từ tài liệu của bạn.
          </p>
        </CardHeader>
        <CardContent>
          {records.length === 0 && !extracting && (
            <div className="text-center space-y-4 py-6">
              <p className="text-lg">
                Tài liệu chưa được trích xuất. Nhấn nút bên dưới để bắt đầu.
              </p>
              {error && (
                <p className="text-destructive text-lg">{error}</p>
              )}
              <Button
                size="lg"
                className="text-lg min-h-[52px]"
                onClick={handleExtract}
              >
                Bắt đầu trích xuất
              </Button>
            </div>
          )}

          {extracting && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-3">
                <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-lg text-muted-foreground">
                  AI đang trích xuất dữ liệu...
                </p>
              </div>
            </div>
          )}

          {records.length > 0 && docUrl && doc && (
            <ExtractionReview
              documentUrl={docUrl}
              fileType={doc.file_type}
              records={records}
              onConfirm={handleConfirm}
              onConfirmAll={handleConfirmAll}
            />
          )}
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <p className="text-sm text-muted-foreground text-center px-4">
        AI chỉ hỗ trợ tổng hợp và giải thích thông tin từ dữ liệu người dùng
        cung cấp, không thay thế bác sĩ và không chẩn đoán bệnh. Vui lòng
        kiểm tra kỹ trước khi xác nhận.
      </p>
    </div>
  )
}
