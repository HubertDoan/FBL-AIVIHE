'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { OverviewCards } from '@/components/dashboard/overview-cards'
import { BulletinBoard } from '@/components/dashboard/bulletin-board'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { useAuth } from '@/hooks/use-auth'
import { Upload, Clock, Stethoscope } from 'lucide-react'

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const [counts, setCounts] = useState({ documents: 0, visits: 0, pending: 0, family: 0 })
  const [recentDocs, setRecentDocs] = useState<Array<{ id: string; original_filename: string | null; document_type: string; created_at: string }>>([])
  const [pendingExtractions, setPendingExtractions] = useState<Array<{ id: string; field_name: string; field_value: string | null; document_id: string }>>([])
  const [dataLoading, setDataLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (authLoading || !user) return

    async function fetchDashboard() {
      try {
        const [statsRes, docsRes] = await Promise.all([
          fetch('/api/dashboard/stats'),
          fetch('/api/documents?limit=5'),
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
      } catch {
        // Silently handle fetch errors
      }
      setDataLoading(false)
    }

    fetchDashboard()
  }, [authLoading, user])

  if (authLoading || dataLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-lg text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tổng quan sức khỏe</h1>
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

      <RecentActivity
        recentDocs={recentDocs}
        pendingExtractions={pendingExtractions}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Button
          className="h-14 text-base"
          onClick={() => router.push('/dashboard/upload')}
        >
          <Upload className="size-5 mr-2" />
          Tải tài liệu mới
        </Button>
        <Button
          variant="outline"
          className="h-14 text-base"
          onClick={() => router.push('/dashboard/timeline')}
        >
          <Clock className="size-5 mr-2" />
          Xem dòng thời gian
        </Button>
        <Button
          variant="outline"
          className="h-14 text-base"
          onClick={() => router.push('/dashboard/visit-prep')}
        >
          <Stethoscope className="size-5 mr-2" />
          Chuẩn bị đi khám
        </Button>
      </div>
    </div>
  )
}
