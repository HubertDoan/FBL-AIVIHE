'use client'

// Reception dashboard — Tab 1: tiếp nhận khám, Tab 2: đăng ký thành viên chờ duyệt

import { useState, useEffect, useCallback } from 'react'
import { Loader2, ClipboardList } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/use-auth'
import { ReceptionPatientCard } from '@/components/dashboard/reception-patient-card'
import { ReceptionPendingMemberRegistrationList } from '@/components/reception/reception-pending-member-registration-list'
import type { ExamRegistration } from '@/lib/demo/demo-exam-registration-data'

function ExamReceptionTab() {
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
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading) loadData()
  }, [authLoading, loadData])

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  if (registrations.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <ClipboardList className="size-12 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Không có hồ sơ nào đang chờ</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {registrations.map((reg) => (
        <ReceptionPatientCard key={reg.id} reg={reg} onUpdated={loadData} />
      ))}
    </div>
  )
}

export default function ReceptionPage() {
  const { user, loading: authLoading } = useAuth()

  if (!authLoading && user?.role !== 'reception') {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground text-lg">Bạn không có quyền truy cập trang này.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Tiếp đón</h1>
        <p className="text-muted-foreground mt-1">
          Quản lý hồ sơ khám bệnh và đăng ký thành viên mới
        </p>
      </div>

      <Tabs defaultValue="exam">
        <TabsList className="mb-4">
          <TabsTrigger value="exam" className="text-base min-h-[44px]">
            Tiếp nhận khám
          </TabsTrigger>
          <TabsTrigger value="members" className="text-base min-h-[44px]">
            Đăng ký thành viên
          </TabsTrigger>
        </TabsList>

        <TabsContent value="exam">
          <ExamReceptionTab />
        </TabsContent>

        <TabsContent value="members">
          <ReceptionPendingMemberRegistrationList />
        </TabsContent>
      </Tabs>
    </div>
  )
}
