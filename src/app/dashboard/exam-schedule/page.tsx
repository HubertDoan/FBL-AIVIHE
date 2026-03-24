'use client'

// Exam schedule page for exam doctors — view assigned patients and submit exam results

import { useState, useEffect, useCallback } from 'react'
import { Loader2, Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { ExamScheduleCard } from '@/components/dashboard/exam-schedule-card'
import type { ExamRegistration } from '@/lib/demo/demo-exam-registration-data'

export default function ExamSchedulePage() {
  const { user, loading: authLoading } = useAuth()
  const [registrations, setRegistrations] = useState<ExamRegistration[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const res = await fetch('/api/exam-registration')
      if (!res.ok) return
      const data = await res.json()
      setRegistrations(data.registrations ?? [])
    } catch {
      toast.error('Không thể tải dữ liệu.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading && user?.role === 'exam_doctor') {
      loadData()
    } else if (!authLoading) {
      setLoading(false)
    }
  }, [authLoading, user, loadData])

  if (!authLoading && user?.role !== 'exam_doctor') {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground text-lg">Bạn không có quyền truy cập trang này.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Lịch khám bệnh</h1>
        <p className="text-muted-foreground mt-1">Danh sách bệnh nhân được phân công khám</p>
      </div>

      {loading || authLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : registrations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="size-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Chưa có lịch khám nào</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {registrations.map((reg) => (
            <ExamScheduleCard key={reg.id} reg={reg} onUpdated={loadData} />
          ))}
        </div>
      )}
    </div>
  )
}
