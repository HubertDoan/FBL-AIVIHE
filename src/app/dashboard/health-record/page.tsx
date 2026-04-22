'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Home, Stethoscope, Activity, Hospital, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { HealthRecordDaycareActivitiesTab } from '@/components/health-record/health-record-daycare-activities-tab'
import { HealthRecordFamilyDoctorEncountersTab } from '@/components/health-record/health-record-family-doctor-encounters-tab'
import { HealthRecordRehabSessionsTab } from '@/components/health-record/health-record-rehab-sessions-tab'
import { HealthRecordClinicVisitsTab } from '@/components/health-record/health-record-clinic-visits-tab'
import type {
  DaycareActivity,
  FamilyDoctorEncounter,
  RehabSession,
  ClinicVisit,
} from '@/lib/demo/demo-health-record-data'

/**
 * Hồ sơ AIVIHE — 4 mục chính (subset của 11-tab architecture trong spec)
 * 1. Daycare — mirror từ Thong Dong Daycare qua webhook
 * 2. Bác sĩ gia đình — encounters, chẩn đoán, kê đơn
 * 3. Phục hồi chức năng — sessions, tiến triển
 * 4. Khám chữa bệnh — visits tại BV/PK chuyên khoa
 */
export default function HealthRecordPage() {
  const { user, loading: authLoading } = useAuth()
  const searchParams = useSearchParams()
  const initialTab = searchParams.get('tab') || 'daycare'
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<{
    daycare: DaycareActivity[]
    family_doctor: FamilyDoctorEncounter[]
    rehab: RehabSession[]
    clinic_visits: ClinicVisit[]
  }>({ daycare: [], family_doctor: [], rehab: [], clinic_visits: [] })

  useEffect(() => {
    if (authLoading || !user) return
    async function load() {
      try {
        const res = await fetch('/api/health-record')
        if (res.ok) {
          const json = await res.json()
          setData(json)
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [authLoading, user])

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        <Loader2 className="size-6 animate-spin mr-2" /> Đang tải hồ sơ...
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Thông tin sức khỏe của tôi</h1>
        <p className="text-muted-foreground mt-1">
          Ghi nhận và sắp xếp thông tin từ Daycare, Bác sĩ gia đình, PHCN và các lần khám chuyên khoa theo thời gian
        </p>
      </div>

      <Tabs defaultValue={initialTab}>
        <TabsList className="flex flex-wrap h-auto gap-1 w-full">
          <TabsTrigger value="daycare" className="flex-1 min-w-[140px] gap-1.5 py-3 text-base">
            <Home className="size-4" />
            Daycare
            {data.daycare.length > 0 && <span className="ml-1 text-xs bg-teal-100 text-teal-700 rounded-full px-1.5">{data.daycare.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="family-doctor" className="flex-1 min-w-[140px] gap-1.5 py-3 text-base">
            <Stethoscope className="size-4" />
            BS gia đình
            {data.family_doctor.length > 0 && <span className="ml-1 text-xs bg-blue-100 text-blue-700 rounded-full px-1.5">{data.family_doctor.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="rehab" className="flex-1 min-w-[140px] gap-1.5 py-3 text-base">
            <Activity className="size-4" />
            PHCN
            {data.rehab.length > 0 && <span className="ml-1 text-xs bg-purple-100 text-purple-700 rounded-full px-1.5">{data.rehab.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="clinic" className="flex-1 min-w-[140px] gap-1.5 py-3 text-base">
            <Hospital className="size-4" />
            Khám chữa bệnh
            {data.clinic_visits.length > 0 && <span className="ml-1 text-xs bg-amber-100 text-amber-700 rounded-full px-1.5">{data.clinic_visits.length}</span>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daycare" className="mt-4">
          <HealthRecordDaycareActivitiesTab items={data.daycare} />
        </TabsContent>
        <TabsContent value="family-doctor" className="mt-4">
          <HealthRecordFamilyDoctorEncountersTab items={data.family_doctor} />
        </TabsContent>
        <TabsContent value="rehab" className="mt-4">
          <HealthRecordRehabSessionsTab items={data.rehab} />
        </TabsContent>
        <TabsContent value="clinic" className="mt-4">
          <HealthRecordClinicVisitsTab items={data.clinic_visits} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
