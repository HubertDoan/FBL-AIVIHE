import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isDemoMode, getDemoUser, demoResponse, demoUnauthorized, demoForbidden, hasAdminAccess } from '@/lib/demo/demo-api-helper'
import { getDemoAdminStats } from '@/lib/demo/demo-data'

export async function GET(request: NextRequest) {
  // ── Demo mode ──
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()
    if (!hasAdminAccess(demoUser.role)) return demoForbidden()
    return demoResponse(getDemoAdminStats())
  }

  // ── Supabase mode ──
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Bạn chưa đăng nhập.' },
        { status: 401 }
      )
    }

    // Check admin role
    const { data: citizen } = await supabase
      .from('citizens')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!citizen || citizen.role !== 'admin') {
      return NextResponse.json(
        { error: 'Bạn không có quyền truy cập.' },
        { status: 403 }
      )
    }

    const today = new Date().toISOString().slice(0, 10)

    const [usersRes, docsRes, visitsRes, docsTodayRes] = await Promise.all([
      supabase.from('citizens').select('id', { count: 'exact', head: true }),
      supabase.from('source_documents').select('id', { count: 'exact', head: true }),
      supabase.from('health_visits').select('id', { count: 'exact', head: true }),
      supabase
        .from('source_documents')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', today + 'T00:00:00.000Z'),
    ])

    return NextResponse.json({
      total_users: usersRes.count ?? 0,
      total_documents: docsRes.count ?? 0,
      total_visits: visitsRes.count ?? 0,
      documents_today: docsTodayRes.count ?? 0,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Lỗi không xác định'
    return NextResponse.json(
      { error: 'Lỗi lấy thống kê: ' + message },
      { status: 500 }
    )
  }
}
