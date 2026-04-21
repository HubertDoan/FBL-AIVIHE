'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft, Loader2, Upload, FolderHeart, FileText,
  FlaskConical, Image as ImageIcon, Pill, Hospital, FileCheck, ExternalLink,
} from 'lucide-react'

/**
 * Trang "Tài liệu sức khỏe" — list source_documents KH đã upload
 * (kết quả khám, đơn thuốc, xét nghiệm, hình ảnh chẩn đoán...)
 * Dùng để đối chiếu/minh chứng khi cần.
 * Group by document_type với icon riêng.
 */

interface HealthDoc {
  id: string
  original_filename: string | null
  document_type: string
  document_date: string | null
  facility_name: string | null
  file_url: string
  file_size_bytes: number | null
  created_at: string
}

const DOC_TYPE_META: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  prescription:        { label: 'Đơn thuốc',           icon: Pill,          color: 'bg-amber-100 text-amber-700' },
  lab_report:          { label: 'Kết quả xét nghiệm',  icon: FlaskConical,  color: 'bg-blue-100 text-blue-700' },
  imaging:             { label: 'Chẩn đoán hình ảnh',  icon: ImageIcon,     color: 'bg-purple-100 text-purple-700' },
  discharge_summary:   { label: 'Tóm tắt xuất viện',   icon: Hospital,      color: 'bg-rose-100 text-rose-700' },
  vaccination_record:  { label: 'Sổ tiêm chủng',       icon: FileCheck,     color: 'bg-emerald-100 text-emerald-700' },
  medical_certificate: { label: 'Giấy chứng nhận y tế', icon: FileText,     color: 'bg-teal-100 text-teal-700' },
  referral:            { label: 'Giấy chuyển viện',    icon: FileText,      color: 'bg-cyan-100 text-cyan-700' },
  other:               { label: 'Tài liệu khác',       icon: FileText,      color: 'bg-slate-100 text-slate-700' },
}

export default function HealthDocumentsPage() {
  const [docs, setDocs] = useState<HealthDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    fetch('/api/documents?limit=200')
      .then((r) => r.ok ? r.json() : { documents: [] })
      .then((d) => setDocs(d.documents ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filteredDocs = filter === 'all' ? docs : docs.filter((d) => d.document_type === filter)
  const counts: Record<string, number> = { all: docs.length }
  docs.forEach((d) => { counts[d.document_type] = (counts[d.document_type] || 0) + 1 })

  return (
    <div className="space-y-5 max-w-4xl">
      <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1">
        <ArrowLeft className="size-4" /> Về tổng quan
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-900">
            <FolderHeart className="size-6 text-teal-600" /> Tài liệu sức khỏe
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {docs.length} tài liệu đã upload — dùng để đối chiếu/minh chứng khi cần
          </p>
        </div>
        <Link
          href="/dashboard/upload"
          className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-4 py-2 rounded-lg"
        >
          <Upload className="size-4" /> Upload thêm
        </Link>
      </div>

      {/* Type filter chips */}
      {docs.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <FilterChip active={filter === 'all'} onClick={() => setFilter('all')} label={`Tất cả (${counts.all})`} />
          {Object.entries(DOC_TYPE_META).map(([key, meta]) => {
            const c = counts[key] || 0
            if (c === 0) return null
            return (
              <FilterChip
                key={key}
                active={filter === key}
                onClick={() => setFilter(key)}
                label={`${meta.label} (${c})`}
              />
            )
          })}
        </div>
      )}

      {/* List */}
      <Card>
        <CardContent className="pt-4 pb-4">
          {loading ? (
            <div className="text-center py-6">
              <Loader2 className="size-5 animate-spin mx-auto text-slate-400 mb-2" />
              <p className="text-sm text-slate-500">Đang tải...</p>
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="text-center py-10">
              <FolderHeart className="size-12 mx-auto text-teal-200 mb-3" />
              <p className="text-sm text-slate-600 mb-3">
                {filter === 'all' ? 'Chưa có tài liệu sức khỏe nào.' : 'Không có tài liệu thuộc nhóm này.'}
              </p>
              <Link
                href="/dashboard/upload"
                className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-4 py-2 rounded-lg"
              >
                <Upload className="size-4" /> Upload tài liệu đầu tiên
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {filteredDocs.map((doc) => {
                const meta = DOC_TYPE_META[doc.document_type] || DOC_TYPE_META.other
                const Icon = meta.icon
                const sizeKb = doc.file_size_bytes ? (doc.file_size_bytes / 1024).toFixed(1) + ' KB' : ''
                return (
                  <li key={doc.id} className="py-3 flex items-center gap-3">
                    <div className={`size-10 rounded-lg flex items-center justify-center shrink-0 ${meta.color}`}>
                      <Icon className="size-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {doc.original_filename || meta.label}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
                        <span className={`px-1.5 py-0.5 rounded ${meta.color}`}>{meta.label}</span>
                        {doc.facility_name && <span>· {doc.facility_name}</span>}
                        {doc.document_date && (
                          <span>· {new Date(doc.document_date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                        )}
                        {sizeKb && <span>· {sizeKb}</span>}
                      </div>
                    </div>
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-teal-600 hover:text-teal-700 font-medium inline-flex items-center gap-1 shrink-0"
                    >
                      Xem <ExternalLink className="size-3" />
                    </a>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`text-xs font-medium px-3 py-1.5 rounded-full border transition ${
        active
          ? 'bg-teal-600 border-teal-600 text-white'
          : 'bg-white border-slate-200 text-slate-700 hover:border-teal-300'
      }`}
    >
      {label}
    </button>
  )
}
