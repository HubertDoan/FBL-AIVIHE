'use client'

// Trang hồ sơ cá nhân — 3 tabs: Thông tin cá nhân, Khám định kỳ, Khám chữa bệnh
// Tất cả users (nhân viên + khách hàng) đều thấy 3 tab này

import { useState, useEffect, useCallback } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { PersonalInfoWithHealthForm } from '@/components/profile/personal-info-with-health-form'
import { AnnualCheckupRecordsTab } from '@/components/profile/annual-checkup-records-tab'
import { HealthExamHistoryList } from '@/components/profile/health-exam-history-list'
import { useAuth } from '@/hooks/use-auth'
import { Pencil, X, User, CalendarHeart, Stethoscope } from 'lucide-react'
import type { Citizen, HealthProfile } from '@/types/database'

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const [citizen, setCitizen] = useState<Citizen | null>(null)
  const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(null)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/profile')
      if (!res.ok) { setLoading(false); return }
      const data = await res.json()
      if (data.citizen) {
        setCitizen(data.citizen as Citizen)
        setHealthProfile((data.healthProfile as HealthProfile) ?? null)
      }
    } catch { /* silent */ }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (authLoading || !user) return
    fetchData()
  }, [authLoading, user, fetchData])

  const handleSave = async (citizenData: Partial<Citizen>, healthData: Partial<HealthProfile>) => {
    if (!citizen) return
    await Promise.all([
      fetch('/api/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(citizenData) }),
      fetch('/api/profile/health', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(healthData) }),
    ])
    await fetchData()
    setEditing(false)
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    )
  }

  if (!citizen) {
    return <div className="text-center py-12"><p className="text-lg text-destructive">Không tìm thấy hồ sơ.</p></div>
  }

  const userId = user?.citizenId ?? user?.id ?? ''

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Hồ sơ cá nhân</h1>
        <Button variant={editing ? 'destructive' : 'outline'} className="h-12 text-base" onClick={() => setEditing(!editing)}>
          {editing ? <><X className="size-4 mr-1" /> Hủy</> : <><Pencil className="size-4 mr-1" /> Chỉnh sửa</>}
        </Button>
      </div>

      <Tabs defaultValue="personal">
        <TabsList className="w-full h-auto flex">
          <TabsTrigger value="personal" className="flex-1 py-3 text-base gap-1.5">
            <User className="size-4" /> Thông tin
          </TabsTrigger>
          <TabsTrigger value="annual" className="flex-1 py-3 text-base gap-1.5">
            <CalendarHeart className="size-4" /> Khám định kỳ
          </TabsTrigger>
          <TabsTrigger value="treatment" className="flex-1 py-3 text-base gap-1.5">
            <Stethoscope className="size-4" /> Khám chữa bệnh
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-4">
          <PersonalInfoWithHealthForm citizen={citizen} healthProfile={healthProfile} editing={editing} onSave={handleSave} />
        </TabsContent>

        <TabsContent value="annual" className="mt-4">
          <AnnualCheckupRecordsTab userId={userId} editing={editing} />
        </TabsContent>

        <TabsContent value="treatment" className="mt-4">
          <HealthExamHistoryList userId={userId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
