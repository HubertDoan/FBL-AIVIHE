import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isDemoMode, getDemoUser, demoResponse, demoUnauthorized } from '@/lib/demo/demo-api-helper'
import { getDemoDashboardStats } from '@/lib/demo/demo-data'

export async function GET(request: NextRequest) {
  // ── Demo mode ──
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()
    return demoResponse(getDemoDashboardStats(demoUser.id))
  }

  // ── Supabase mode ──
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Bạn chưa đăng nhập.' }, { status: 401 })
    }

    const { data: citizen } = await supabase
      .from('citizens')
      .select('id')
      .eq('auth_id', user.id)
      .single()

    if (!citizen) {
      return NextResponse.json({ error: 'Không tìm thấy hồ sơ công dân.' }, { status: 404 })
    }

    const [documentsRes, visitsRes, pendingRes, familyRes] = await Promise.all([
      supabase
        .from('source_documents')
        .select('id', { count: 'exact', head: true })
        .eq('citizen_id', citizen.id),
      supabase
        .from('health_visits')
        .select('id', { count: 'exact', head: true })
        .eq('citizen_id', citizen.id),
      supabase
        .from('extracted_records')
        .select('id, source_documents!inner(citizen_id)', { count: 'exact', head: true })
        .eq('source_documents.citizen_id', citizen.id)
        .eq('status', 'pending'),
      supabase
        .from('family_members')
        .select('id', { count: 'exact', head: true })
        .eq('citizen_id', citizen.id),
    ])

    return NextResponse.json({
      documentCount: documentsRes.count ?? 0,
      visitCount: visitsRes.count ?? 0,
      pendingCount: pendingRes.count ?? 0,
      familyCount: familyRes.count ?? 0,
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi không xác định'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
