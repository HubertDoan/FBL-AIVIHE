'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Loader2, MessageCircleQuestion, Plus, Clock, CheckCircle } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import type { ConsultationRequestToDoctor } from '@/lib/demo/demo-consultation-requests-in-memory-store'

/**
 * Trang danh sách yêu cầu tư vấn của KH
 * Tabs: Pending (chờ BS trả lời) / Answered (đã có phản hồi)
 */
export default function ConsultationListPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [items, setItems] = useState<ConsultationRequestToDoctor[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'pending' | 'answered'>('answered')

  useEffect(() => {
    if (authLoading || !user) return
    fetch('/api/consultation')
      .then(r => r.ok ? r.json() : { requests: [] })
      .then(d => setItems(d.requests || []))
      .finally(() => setLoading(false))
  }, [authLoading, user])

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        <Loader2 className="size-5 animate-spin mr-2" /> Đang tải...
      </div>
    )
  }

  const pending = items.filter(r => r.status === 'pending')
  const answered = items.filter(r => r.status === 'answered')
  const currentList = tab === 'pending' ? pending : answered

  return (
    <div className="space-y-5 max-w-4xl">
      <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1">
        <ArrowLeft className="size-4" /> Về tổng quan
      </Link>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <MessageCircleQuestion className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Hỏi Bác sĩ</h1>
            <p className="text-muted-foreground text-sm">Gửi câu hỏi sức khỏe → BS gia đình / chuyên khoa trả lời</p>
          </div>
        </div>
        <Button onClick={() => router.push('/dashboard/consultation/new')} className="bg-teal-600 hover:bg-teal-700 gap-1">
          <Plus className="size-4" /> Gửi câu hỏi mới
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setTab('pending')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${tab === 'pending' ? 'border-amber-500 text-amber-700' : 'border-transparent text-gray-500'}`}
        >
          <Clock className="size-4 inline mr-1" />
          Chờ trả lời ({pending.length})
        </button>
        <button
          onClick={() => setTab('answered')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${tab === 'answered' ? 'border-green-500 text-green-700' : 'border-transparent text-gray-500'}`}
        >
          <CheckCircle className="size-4 inline mr-1" />
          Đã phản hồi ({answered.length})
        </button>
      </div>

      {currentList.length === 0 ? (
        <Card>
          <CardContent className="pt-6 pb-6 text-center text-gray-500">
            <MessageCircleQuestion className="size-12 text-gray-300 mx-auto mb-2" />
            <p>{tab === 'pending' ? 'Không có câu hỏi nào đang chờ.' : 'Chưa có câu hỏi nào được trả lời.'}</p>
            <Button variant="link" onClick={() => router.push('/dashboard/consultation/new')} className="mt-2">
              Gửi câu hỏi mới <ArrowRight className="size-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {currentList.map(r => <ConsultationCard key={r.id} req={r} />)}
        </div>
      )}
    </div>
  )
}

function ConsultationCard({ req }: { req: ConsultationRequestToDoctor }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-4 pb-4 space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
          <span className="bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 font-medium">{req.specialty}</span>
          <span className="text-gray-500">{new Date(req.created_at).toLocaleString('vi-VN')}</span>
        </div>

        {/* Patient question */}
        <div className="relative pl-6 border-l-2 border-teal-200">
          <div className="absolute -left-2 top-0 size-4 rounded-full bg-teal-500" />
          <p className="text-sm font-semibold text-gray-700">Bạn hỏi:</p>
          <p className="text-gray-900 mt-0.5 whitespace-pre-wrap">{req.question}</p>
          {req.medical_evidence_tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {req.medical_evidence_tags.map((t, i) => (
                <span key={i} className="text-xs bg-slate-100 text-slate-700 rounded px-1.5 py-0.5">{t}</span>
              ))}
            </div>
          )}
        </div>

        {/* Doctor response */}
        {req.status === 'answered' && req.doctor_answer && (
          <div className="relative pl-6 border-l-2 border-blue-300 bg-blue-50 rounded-r-lg py-2 -mx-1 px-3">
            <div className="absolute -left-2 top-2 size-4 rounded-full bg-blue-600" />
            <p className="text-sm font-semibold text-blue-900">{req.target_doctor_name} trả lời:</p>
            <p className="text-blue-900 mt-0.5 whitespace-pre-wrap text-sm leading-relaxed">{req.doctor_answer}</p>
            {req.follow_up_recommendations.length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-semibold text-blue-800">Khuyến nghị tiếp theo:</p>
                <ul className="text-xs text-blue-900 list-disc list-inside mt-0.5">
                  {req.follow_up_recommendations.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}
            <p className="text-xs text-blue-600 mt-1">
              Trả lời lúc {new Date(req.doctor_answered_at!).toLocaleString('vi-VN')}
            </p>
          </div>
        )}

        {req.status === 'pending' && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-2 text-xs text-amber-900">
            ⏳ Bác sĩ {req.target_doctor_name} sẽ trả lời trong 24 giờ.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
