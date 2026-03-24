'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { OverviewCards } from '@/components/dashboard/overview-cards'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { createClient } from '@/lib/supabase/client'
import { Upload, Clock, Stethoscope } from 'lucide-react'

export default function DashboardPage() {
  const [userName, setUserName] = useState('')
  const [citizenId, setCitizenId] = useState<string | null>(null)
  const [counts, setCounts] = useState({ documents: 0, visits: 0, pending: 0, family: 0 })
  const [recentDocs, setRecentDocs] = useState<Array<{ id: string; original_filename: string | null; document_type: string; created_at: string }>>([])
  const [pendingExtractions, setPendingExtractions] = useState<Array<{ id: string; field_name: string; field_value: string | null; document_id: string }>>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchDashboard() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: citizen } = await supabase
        .from('citizens')
        .select('id, full_name')
        .eq('auth_id', user.id)
        .single()

      if (!citizen) { setLoading(false); return }
      setUserName(citizen.full_name)
      setCitizenId(citizen.id)

      const [docRes, visitRes, pendRes, famRes, recentRes, extractRes] = await Promise.all([
        supabase.from('source_documents').select('id', { count: 'exact', head: true }).eq('citizen_id', citizen.id),
        supabase.from('health_visits').select('id', { count: 'exact', head: true }).eq('citizen_id', citizen.id),
        supabase.from('extracted_records').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('family_members').select('id', { count: 'exact', head: true }).eq('citizen_id', citizen.id),
        supabase.from('source_documents').select('id, original_filename, document_type, created_at').eq('citizen_id', citizen.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('extracted_records').select('id, field_name, field_value, document_id, source_documents!inner(citizen_id)').eq('status', 'pending').limit(5),
      ])

      setCounts({
        documents: docRes.count ?? 0,
        visits: visitRes.count ?? 0,
        pending: pendRes.count ?? 0,
        family: famRes.count ?? 0,
      })
      setRecentDocs((recentRes.data as typeof recentDocs) ?? [])
      setPendingExtractions((extractRes.data as typeof pendingExtractions) ?? [])
      setLoading(false)
    }
    fetchDashboard()
  }, [router])

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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">T\u1ED5ng quan s\u1EE9c kh\u1ECFe</h1>
        <p className="text-lg text-muted-foreground mt-1">
          Xin ch\u00E0o, {userName || 'b\u1EA1n'}!
        </p>
      </div>

      <OverviewCards
        documentCount={counts.documents}
        visitCount={counts.visits}
        pendingCount={counts.pending}
        familyCount={counts.family}
      />

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
          T\u1EA3i t\u00E0i li\u1EC7u m\u1EDBi
        </Button>
        <Button
          variant="outline"
          className="h-14 text-base"
          onClick={() => router.push('/dashboard/timeline')}
        >
          <Clock className="size-5 mr-2" />
          Xem d\u00F2ng th\u1EDDi gian
        </Button>
        <Button
          variant="outline"
          className="h-14 text-base"
          onClick={() => router.push('/dashboard/visit-prep')}
        >
          <Stethoscope className="size-5 mr-2" />
          Chu\u1EA9n b\u1ECB \u0111i kh\u00E1m
        </Button>
      </div>
    </div>
  )
}
