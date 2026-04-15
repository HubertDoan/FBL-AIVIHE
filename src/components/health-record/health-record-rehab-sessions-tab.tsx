'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Activity, Calendar, MapPin, Clock, TrendingUp, TrendingDown } from 'lucide-react'
import type { RehabSession } from '@/lib/demo/demo-health-record-data'

/**
 * Tab "Phục hồi chức năng" trong hồ sơ AIVIHE
 * Các buổi trị liệu PHCN — bài tập, đánh giá đau, tiến triển vận động
 */

export function HealthRecordRehabSessionsTab({ items }: { items: RehabSession[] }) {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 pb-6 text-center text-gray-500">
          <Activity className="size-12 text-gray-300 mx-auto mb-2" />
          <p>Chưa có buổi PHCN nào.</p>
          <p className="text-sm mt-1">Đăng ký gói "Phục hồi chức năng" để bắt đầu.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm text-purple-900">
        <p className="flex items-start gap-2">
          <Activity className="size-4 shrink-0 mt-0.5" />
          <span>
            <strong>Phục hồi chức năng (PHCN)</strong> — KTV đánh giá chức năng và trị liệu tại trung tâm hoặc tại nhà.
            Theo dõi mức độ đau và khả năng vận động qua từng buổi.
          </span>
        </p>
      </div>

      {items.map(s => (
        <Card key={s.id}>
          <CardContent className="pt-5 pb-5 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="font-bold">{s.session_type}</h3>
                <p className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3" />
                    {new Date(s.date).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" /> {s.duration_minutes}ph
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3" /> {s.location === 'center' ? 'Trung tâm' : 'Tại nhà'}
                  </span>
                </p>
              </div>
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded border border-purple-200">
                KTV: {s.technician_name}
              </span>
            </div>

            {/* Exercises */}
            {s.exercises.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Bài tập</p>
                <ul className="space-y-0.5 text-sm text-gray-800">
                  {s.exercises.map((ex, i) => (<li key={i}>• {ex}</li>))}
                </ul>
              </div>
            )}

            {/* Progress metrics */}
            <div className="grid sm:grid-cols-3 gap-3">
              {s.pain_level_before !== null && s.pain_level_after !== null && (
                <div className="bg-slate-50 rounded-md p-3">
                  <p className="text-xs font-semibold text-gray-500 mb-1">Mức đau (0-10)</p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">{s.pain_level_before}</span>
                    {s.pain_level_after < s.pain_level_before ? (
                      <TrendingDown className="size-4 text-green-600" />
                    ) : (
                      <TrendingUp className="size-4 text-red-600" />
                    )}
                    <span className="text-lg font-bold">{s.pain_level_after}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {s.pain_level_after < s.pain_level_before ? `Giảm ${s.pain_level_before - s.pain_level_after}` : 'Không giảm'}
                  </p>
                </div>
              )}
              {s.mobility_score !== null && (
                <div className="bg-slate-50 rounded-md p-3">
                  <p className="text-xs font-semibold text-gray-500 mb-1">Điểm vận động</p>
                  <p className="text-2xl font-bold text-purple-700">{s.mobility_score}/100</p>
                </div>
              )}
              {s.next_session && (
                <div className="bg-amber-50 rounded-md p-3 border border-amber-200">
                  <p className="text-xs font-semibold text-amber-800 mb-1">Buổi tới</p>
                  <p className="text-sm font-medium text-amber-900">{new Date(s.next_session).toLocaleDateString('vi-VN')}</p>
                </div>
              )}
            </div>

            {s.notes && (
              <div className="border-t pt-2 text-sm">
                <span className="text-gray-500">Ghi chú KTV:</span> <em className="text-gray-700">{s.notes}</em>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
