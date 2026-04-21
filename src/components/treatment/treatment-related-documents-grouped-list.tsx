'use client'

// Related documents grouped by type for a treatment episode
// Shows lab reports, imaging, prescriptions, discharge summaries linked to the citizen
// Fetches from /api/documents (demo mode) or Supabase directly (production)
// Groups by document_type: lab_report | imaging | ultrasound | prescription | other

import { useEffect, useState } from 'react'
import { FileText, FlaskConical, Scan, Pill, FolderOpen } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface DocumentItem {
  id: string
  original_filename: string
  document_type: string
  created_at: string
  file_type?: string
}

const TYPE_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  lab_report:        { label: 'Xét nghiệm',         icon: <FlaskConical className="size-4" />, color: 'text-blue-600 bg-blue-50' },
  imaging:           { label: 'CT / X-Quang',        icon: <Scan className="size-4" />,         color: 'text-purple-600 bg-purple-50' },
  ultrasound:        { label: 'Siêu âm',             icon: <Scan className="size-4" />,         color: 'text-indigo-600 bg-indigo-50' },
  prescription:      { label: 'Đơn thuốc',           icon: <Pill className="size-4" />,         color: 'text-emerald-600 bg-emerald-50' },
  discharge_summary: { label: 'Bệnh án ra viện',     icon: <FileText className="size-4" />,     color: 'text-teal-600 bg-teal-50' },
  visit_note:        { label: 'Phiếu khám',          icon: <FileText className="size-4" />,     color: 'text-cyan-600 bg-cyan-50' },
  other:             { label: 'Khác',                icon: <FileText className="size-4" />,     color: 'text-gray-600 bg-gray-50' },
}

const GROUP_ORDER = ['lab_report', 'imaging', 'ultrasound', 'discharge_summary', 'visit_note', 'prescription', 'other']

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

interface Props {
  citizenId: string
}

export function TreatmentRelatedDocumentsGroupedList({ citizenId }: Props) {
  const [docs, setDocs] = useState<DocumentItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!citizenId) return

    async function fetchDocs() {
      try {
        // /api/documents uses session auth — no citizenId query param needed
        const res = await fetch('/api/documents?limit=20')
        if (res.ok) {
          const data = await res.json()
          setDocs(data.documents ?? [])
          setLoading(false)
          return
        }
      } catch {
        // Fall through to empty state
      }
      setLoading(false)
    }

    fetchDocs()
  }, [citizenId])

  if (loading) {
    return (
      <div className="py-4 text-sm text-muted-foreground text-center">Đang tải tài liệu...</div>
    )
  }

  if (docs.length === 0) {
    return (
      <div className="text-center py-8 border border-dashed rounded-lg text-muted-foreground">
        <FolderOpen className="size-10 mx-auto mb-2 opacity-30" />
        <p className="text-sm">Chưa có tài liệu nào liên quan đến đợt điều trị này.</p>
        <p className="text-xs mt-1">Upload bổ sung bên dưới để thêm tài liệu.</p>
      </div>
    )
  }

  // Group docs by document_type
  const groups: Record<string, DocumentItem[]> = {}
  docs.forEach((d) => {
    const key = d.document_type || 'other'
    if (!groups[key]) groups[key] = []
    groups[key].push(d)
  })

  const orderedKeys = [
    ...GROUP_ORDER.filter((k) => groups[k]),
    ...Object.keys(groups).filter((k) => !GROUP_ORDER.includes(k)),
  ]

  return (
    <div className="space-y-4">
      {orderedKeys.map((typeKey) => {
        const meta = TYPE_META[typeKey] ?? TYPE_META.other
        const items = groups[typeKey]
        return (
          <div key={typeKey} className="space-y-2">
            {/* Group header */}
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${meta.color}`}>
                {meta.icon}
                {meta.label}
              </span>
              <span className="text-xs text-gray-400">({items.length})</span>
            </div>

            {/* Doc rows */}
            {items.map((doc) => (
              <Card key={doc.id} className="border-gray-100">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className={`size-9 rounded-lg flex items-center justify-center shrink-0 text-xs font-semibold ${meta.color}`}>
                    {doc.file_type?.startsWith('image') ? 'IMG' : 'PDF'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-gray-900">
                      {doc.original_filename || 'Tài liệu y tế'}
                    </p>
                    <p className="text-xs text-gray-400">{formatDate(doc.created_at)}</p>
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">
                    {meta.label}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      })}
    </div>
  )
}
