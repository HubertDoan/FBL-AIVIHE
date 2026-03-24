'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import type { SourceDocument } from '@/types/database'

const TYPE_LABELS: Record<string, string> = {
  lab_report: 'Xét nghiệm',
  prescription: 'Đơn thuốc',
  imaging: 'Hình ảnh',
  discharge_summary: 'Ra viện',
  vaccination_record: 'Tiêm chủng',
  medical_certificate: 'Giấy khám',
  referral: 'Chuyển viện',
  other: 'Khác',
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

interface Props {
  citizenId: string
}

export function DocumentList({ citizenId }: Props) {
  const [docs, setDocs] = useState<SourceDocument[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchDocs() {
      const supabase = createClient()
      const { data } = await supabase
        .from('source_documents')
        .select('*')
        .eq('citizen_id', citizenId)
        .order('created_at', { ascending: false })
        .limit(10)

      setDocs((data as SourceDocument[]) ?? [])
      setLoading(false)
    }

    fetchDocs()
  }, [citizenId])

  if (loading) {
    return (
      <p className="text-lg text-muted-foreground text-center py-4">
        Đang tải danh sách...
      </p>
    )
  }

  if (docs.length === 0) {
    return (
      <p className="text-lg text-muted-foreground text-center py-4">
        Chưa có tài liệu nào được tải lên.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">Tài liệu gần đây</h2>
      {docs.map((doc) => (
        <Card
          key={doc.id}
          className="cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
          onClick={() => router.push(`/dashboard/extraction/${doc.id}`)}
        >
          <CardContent className="flex items-center gap-4">
            <div className="size-12 rounded-lg bg-muted flex items-center justify-center shrink-0 text-sm font-medium">
              {doc.file_type?.startsWith('image') ? 'IMG' : 'PDF'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-medium truncate">
                {doc.original_filename || 'Tài liệu'}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatDate(doc.created_at)}
              </p>
            </div>
            <Badge variant="secondary">
              {TYPE_LABELS[doc.document_type] ?? 'Khác'}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
