'use client'

import { useState, useEffect, useCallback } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { PersonalInfoForm } from '@/components/profile/personal-info-form'
import { HealthProfileForm } from '@/components/profile/health-profile-form'
import { EmergencyCard } from '@/components/profile/emergency-card'
import { useAuth } from '@/hooks/use-auth'
import { Pencil, X } from 'lucide-react'
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
    } catch {
      // Silently handle fetch errors
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (authLoading || !user) return
    fetchData()
  }, [authLoading, user, fetchData])

  const handleSaveCitizen = async (data: Partial<Citizen>) => {
    if (!citizen) return
    await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    await fetchData()
    setEditing(false)
  }

  const handleSaveHealth = async (data: Partial<HealthProfile>) => {
    if (!citizen) return
    await fetch('/api/profile/health', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    await fetchData()
    setEditing(false)
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-lg text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (!citizen) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-destructive">
          Không tìm thấy hồ sơ. Vui lòng hoàn tất đăng ký.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Hồ sơ cá nhân</h1>
        <Button
          variant={editing ? 'destructive' : 'outline'}
          className="h-12 text-base"
          onClick={() => setEditing(!editing)}
        >
          {editing ? <><X className="size-4 mr-1" /> Hủy</> : <><Pencil className="size-4 mr-1" /> Chỉnh sửa</>}
        </Button>
      </div>

      <Tabs defaultValue={0}>
        <TabsList className="w-full h-auto flex">
          <TabsTrigger value={0} className="flex-1 py-3 text-base">
            Thông tin cá nhân
          </TabsTrigger>
          <TabsTrigger value={1} className="flex-1 py-3 text-base">
            Sức khỏe nền
          </TabsTrigger>
          <TabsTrigger value={2} className="flex-1 py-3 text-base">
            Cấp cứu
          </TabsTrigger>
        </TabsList>

        <TabsContent value={0} className="mt-4">
          <PersonalInfoForm
            citizen={citizen}
            editing={editing}
            onSave={handleSaveCitizen}
          />
        </TabsContent>

        <TabsContent value={1} className="mt-4">
          <HealthProfileForm
            profile={healthProfile}
            editing={editing}
            onSave={handleSaveHealth}
          />
        </TabsContent>

        <TabsContent value={2} className="mt-4">
          <EmergencyCard citizen={citizen} healthProfile={healthProfile} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
