'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Stethoscope, FlaskConical, Activity, ArrowRight } from 'lucide-react'

/**
 * Đợt khám / xét nghiệm / điều trị mới nhất.
 * Hiển thị tối đa 3 mục mới nhất từ exam_registrations + source_documents
 * gần đây để KH thấy tổng quan hoạt động chăm sóc của mình.
 */
interface ActivityItem {
  id: string
  type: 'exam' | 'lab' | 'treatment' | 'document'
  title: string
  facility?: string
  date: string  // ISO
  status?: string
}

const TYPE_META: Record<ActivityItem['type'], { icon: React.ComponentType<{ className?: string }>; label: string; color: string }> = {
  exam:      { icon: Stethoscope,  label: 'Khám',         color: 'bg-teal-100 text-teal-700' },
  lab:       { icon: FlaskConical, label: 'Xét nghiệm',   color: 'bg-blue-100 text-blue-700' },
  treatment: { icon: Activity,     label: 'Điều trị',     color: 'bg-amber-100 text-amber-700' },
  document:  { icon: Stethoscope,  label: 'Tài liệu',     color: 'bg-emerald-100 text-emerald-700' },
}

export function CustomerRecentMedicalActivitiesTimeline() {
  const [items, setItems] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard/recent-activities?limit=3')
      .then((r) => r.ok ? r.json() : { activities: [] })
      .then((d) => setItems(d.activities ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-900">Hoạt động mới nhất</h2>
          <Link
            href="/dashboard/timeline"
            className="text-xs text-teal-600 hover:text-teal-700 font-medium inline-flex items-center gap-1"
          >
            Xem tất cả <ArrowRight className="size-3" />
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500 py-3 text-center">Đang tải...</p>
        ) : items.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-slate-500 mb-2">Chưa có hoạt động khám / xét nghiệm / điều trị nào.</p>
            <Link
              href="/dashboard/upload"
              className="text-xs text-teal-600 hover:text-teal-700 font-medium"
            >
              Tải lên tài liệu khám đầu tiên →
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => {
              const meta = TYPE_META[item.type]
              const Icon = meta.icon
              return (
                <li key={item.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 transition">
                  <div className={`size-9 rounded-lg flex items-center justify-center shrink-0 ${meta.color}`}>
                    <Icon className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900 truncate">{item.title}</p>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${meta.color} shrink-0`}>
                        {meta.label}
                      </span>
                    </div>
                    {item.facility && (
                      <p className="text-xs text-slate-500 truncate">{item.facility}</p>
                    )}
                    <p className="text-xs text-slate-400">
                      {new Date(item.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      {item.status && ` · ${item.status}`}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
