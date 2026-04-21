// GET /api/director/broadcast-target-count
// Returns estimated recipient count for a broadcast target filter
// Used by BroadcastTargetPreviewCount component for live count display
// Query params: type (all|by-service|by-location), services[], province, commune

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  isDemoMode,
  getDemoUser,
  demoResponse,
  demoUnauthorized,
  demoForbidden,
} from '@/lib/demo/demo-api-helper'
import { DEMO_ACCOUNTS } from '@/lib/demo/demo-accounts'

const DIRECTOR_ROLES = ['director', 'branch_director', 'super_admin'] as const

function isDirectorRole(role: string): boolean {
  return (DIRECTOR_ROLES as readonly string[]).includes(role)
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const type = searchParams.get('type') ?? 'all'
  const services = searchParams.getAll('services')
  const province = searchParams.get('province') ?? ''
  const commune = searchParams.get('commune') ?? ''

  // ── Demo mode ──
  if (isDemoMode()) {
    const user = await getDemoUser(request)
    if (!user) return demoUnauthorized()
    if (!isDirectorRole(user.role)) return demoForbidden()

    // Demo: count citizen-role accounts as approximation
    const members = DEMO_ACCOUNTS.filter((a) => a.role === 'citizen')
    // by-service and by-location filters have no demo data — return full count
    return demoResponse({ count: members.length })
  }

  // ── Supabase mode ──
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 })

    const { data: citizen } = await supabase
      .from('citizens')
      .select('role')
      .eq('id', user.id)
      .single()
    if (!citizen || !isDirectorRole(citizen.role)) {
      return NextResponse.json({ error: 'Bạn không có quyền.' }, { status: 403 })
    }

    let query = supabase
      .from('citizens')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'member')

    if (type === 'by-service' && services.length > 0) {
      query = query.in('member_package', services)
    } else if (type === 'by-location') {
      if (province) query = query.eq('province', province)
      if (commune) query = query.eq('commune', commune)
    }

    const { count, error } = await query
    if (error) throw error

    return NextResponse.json({ count: count ?? 0 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Lỗi máy chủ' }, { status: 500 })
  }
}
