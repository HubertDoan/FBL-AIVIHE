'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { OverviewCards } from '@/components/dashboard/overview-cards'
import { BulletinBoard } from '@/components/dashboard/bulletin-board'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { MedicationReminderCard } from '@/components/dashboard/medication-reminder-card'
import { useAuth } from '@/hooks/use-auth'
import { GuestDashboard } from '@/components/membership/guest-dashboard'
import { CustomerHealthStatusOverviewWithAiSummary } from '@/components/dashboard/customer-health-status-overview-with-ai-summary'
import { CustomerRecentMedicalActivitiesTimeline } from '@/components/dashboard/customer-recent-medical-activities-timeline'
import { CustomerServicePackagesDashboardCards } from '@/components/dashboard/customer-service-packages-dashboard-cards'
import { CustomerCenterInfoWithPromotionsAndAnnouncements } from '@/components/dashboard/customer-center-info-with-promotions-and-announcements'
import { CustomerServiceRegistrationListWithQrPayment } from '@/components/services/customer-service-registration-list-with-qr-payment'
import { Upload, Clock, Stethoscope } from 'lucide-react'
import type { ExamRegistration, MedicationReminder } from '@/lib/demo/demo-exam-registration-data'

interface ReminderItem extends MedicationReminder {
  regId: string
  index: number
}

/**
 * Customer dashboard — UX đi thẳng vào vấn đề chăm sóc sức khỏe:
 * 1. Tình trạng sức khỏe chung (AI tổng hợp) — top priority
 * 2. Hoạt động khám/xét nghiệm/điều trị mới nhất
 * 3. Gói dịch vụ đang dùng + đăng ký mới (collapsible)
 * 4. Thông tin từ trung tâm (notifications + chương trình khuyến mãi)
 *
 * Staff/admin/director: giữ overview cards + bulletin board cũ.
 */
export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const [counts, setCounts] = useState({ documents: 0, visits: 0, pending: 0, family: 0 })
  const [recentDocs, setRecentDocs] = useState<Array<{ id: string; original_filename: string | null; document_type: string; created_at: string }>>([])
  const [pendingExtractions] = useState<Array<{ id: string; field_name: string; field_value: string | null; document_id: string }>>([])
  const [activeReminders, setActiveReminders] = useState<ReminderItem[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const router = useRouter()

  const isCustomer = user?.role === 'member' || user?.role === 'citizen'

  useEffect(() => {
    if (authLoading || !user) return

    async function fetchDashboard() {
      try {
        const [statsRes, docsRes, examRes] = await Promise.all([
          fetch('/api/dashboard/stats'),
          fetch('/api/documents?limit=5'),
          fetch('/api/exam-registration'),
        ])

        if (statsRes.ok) {
          const stats = await statsRes.json()
          setCounts({
            documents: stats.documentCount ?? 0,
            visits: stats.visitCount ?? 0,
            pending: stats.pendingCount ?? 0,
            family: stats.familyCount ?? 0,
          })
        }

        if (docsRes.ok) {
          const docsData = await docsRes.json()
          setRecentDocs(docsData.documents ?? [])
        }

        if (examRes.ok) {
          const examData = await examRes.json()
          const regs: ExamRegistration[] = examData.registrations ?? []
          const reminders: ReminderItem[] = []
          regs.forEach((reg) => {
            if (
              (reg.status === 'completed' || reg.status === 'results_returned') &&
              reg.medication_reminders && reg.medication_reminders.length > 0
            ) {
              reg.medication_reminders.forEach((med, i) => {
                reminders.push({ ...med, regId: reg.id, index: i })
              })
            }
          })
          setActiveReminders(reminders)
        }
      } catch {
        // silent
      }
      setDataLoading(false)
    }

    fetchDashboard()
  }, [authLoading, user])

  if (authLoading) {
    return <CenterSpinner label="Đang tải..." />
  }

  if (user?.role === 'guest') return <GuestDashboard />

  // Staff redirect to work area
  if (user?.role === 'reception' || user?.role === 'admin_staff') {
    router.push('/dashboard/reception')
    return null
  }

  if (dataLoading) return <CenterSpinner label="Đang tải dữ liệu..." />

  // ─── CUSTOMER DASHBOARD (member/citizen) ───────────────────────────
  if (isCustomer) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        {/* 1. Tình trạng sức khỏe chung — AI tổng hợp */}
        <CustomerHealthStatusOverviewWithAiSummary userName={user?.fullName || 'bạn'} />

        {/* Nhắc thuốc nếu có (đặt sau health overview) */}
        {activeReminders.length > 0 && (
          <MedicationReminderCard reminders={activeReminders} />
        )}

        {/* 2. Hoạt động khám/xét nghiệm/điều trị mới nhất */}
        <CustomerRecentMedicalActivitiesTimeline />

        {/* 3. Gói dịch vụ đang dùng + đăng ký mới */}
        <CustomerServiceRegistrationListWithQrPayment />
        <CustomerServicePackagesDashboardCards />

        {/* 4. Thông tin từ trung tâm (notifications + chương trình & khuyến mãi) */}
        <CustomerCenterInfoWithPromotionsAndAnnouncements />
      </div>
    )
  }

  // ─── STAFF/ADMIN/DIRECTOR DASHBOARD ────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tổng quan</h1>
        <p className="text-lg text-muted-foreground mt-1">
          Xin chào, {user?.fullName || 'bạn'}!
        </p>
      </div>

      <OverviewCards
        documentCount={counts.documents}
        visitCount={counts.visits}
        pendingCount={counts.pending}
        familyCount={counts.family}
      />

      <BulletinBoard />
      <RecentActivity recentDocs={recentDocs} pendingExtractions={pendingExtractions} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Button className="h-14 text-base" onClick={() => router.push('/dashboard/upload')}>
          <Upload className="size-5 mr-2" /> Tải tài liệu mới
        </Button>
        <Button variant="outline" className="h-14 text-base" onClick={() => router.push('/dashboard/timeline')}>
          <Clock className="size-5 mr-2" /> Xem dòng thời gian
        </Button>
        <Button variant="outline" className="h-14 text-base" onClick={() => router.push('/dashboard/visit-prep')}>
          <Stethoscope className="size-5 mr-2" /> Chuẩn bị đi khám
        </Button>
      </div>
    </div>
  )
}

function CenterSpinner({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center space-y-3">
        <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-lg text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}
