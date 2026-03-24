'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { PersonalInfoForm } from '@/components/profile/personal-info-form'
import { HealthProfileForm } from '@/components/profile/health-profile-form'
import { EmergencyCard } from '@/components/profile/emergency-card'
import { createClient } from '@/lib/supabase/client'
import { Pencil, X } from 'lucide-react'
import type { Citizen, HealthProfile } from '@/types/database'

export default function ProfilePage() {
  const [citizen, setCitizen] = useState<Citizen | null>(null)
  const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(null)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchData = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: c } = await supabase
      .from('citizens')
      .select('*')
      .eq('auth_id', user.id)
      .single()

    if (c) {
      setCitizen(c as Citizen)
      const { data: hp } = await supabase
        .from('health_profiles')
        .select('*')
        .eq('citizen_id', c.id)
        .single()
      setHealthProfile(hp as HealthProfile | null)
    }
    setLoading(false)
  }, [router])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSaveCitizen = async (data: Partial<Citizen>) => {
    if (!citizen) return
    const supabase = createClient()
    await supabase.from('citizens').update(data).eq('id', citizen.id)
    await fetchData()
    setEditing(false)
  }

  const handleSaveHealth = async (data: Partial<HealthProfile>) => {
    if (!citizen) return
    const supabase = createClient()
    if (healthProfile) {
      await supabase.from('health_profiles').update(data).eq('id', healthProfile.id)
    } else {
      await supabase.from('health_profiles').insert({ citizen_id: citizen.id, ...data })
    }
    await fetchData()
    setEditing(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-lg text-muted-foreground">\u0110ang t\u1EA3i...</p>
        </div>
      </div>
    )
  }

  if (!citizen) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-destructive">
          Kh\u00F4ng t\u00ECm th\u1EA5y h\u1ED3 s\u01A1. Vui l\u00F2ng ho\u00E0n t\u1EA5t \u0111\u0103ng k\u00FD.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">H\u1ED3 s\u01A1 c\u00E1 nh\u00E2n</h1>
        <Button
          variant={editing ? 'destructive' : 'outline'}
          className="h-12 text-base"
          onClick={() => setEditing(!editing)}
        >
          {editing ? <><X className="size-4 mr-1" /> H\u1EE7y</> : <><Pencil className="size-4 mr-1" /> Ch\u1EC9nh s\u1EEDa</>}
        </Button>
      </div>

      <Tabs defaultValue={0}>
        <TabsList className="w-full h-auto flex">
          <TabsTrigger value={0} className="flex-1 py-3 text-base">
            Th\u00F4ng tin c\u00E1 nh\u00E2n
          </TabsTrigger>
          <TabsTrigger value={1} className="flex-1 py-3 text-base">
            S\u1EE9c kh\u1ECFe n\u1EC1n
          </TabsTrigger>
          <TabsTrigger value={2} className="flex-1 py-3 text-base">
            C\u1EA5p c\u1EE9u
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
