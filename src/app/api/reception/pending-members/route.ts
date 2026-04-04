import { NextRequest, NextResponse } from 'next/server'
import {
  isDemoMode,
  getDemoUser,
  demoResponse,
  demoUnauthorized,
  demoForbidden,
} from '@/lib/demo/demo-api-helper'
import { DEMO_ACCOUNTS } from '@/lib/demo/demo-accounts'

// Access: reception role OR admin-level roles
function hasReceptionAccess(role: string): boolean {
  const allowed = ['reception', 'admin', 'director', 'branch_director', 'super_admin']
  return allowed.includes(role)
}

// GET: list accounts with registrationStatus === 'pending_review'
export async function GET(request: NextRequest) {
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()
    if (!hasReceptionAccess(demoUser.role)) return demoForbidden()

    const pending = DEMO_ACCOUNTS
      .filter((a) => {
        const acc = a as unknown as Record<string, unknown>
        return acc.registrationStatus === 'pending_review'
      })
      .map((a) => {
        const acc = a as unknown as Record<string, unknown>
        return {
          id: a.id,
          fullName: a.fullName,
          phone: a.phone,
          registrationDate: acc.registrationDate ?? null,
          registrationData: acc.registrationData ?? null,
          registrationStatus: acc.registrationStatus,
        }
      })

    return demoResponse({ members: pending })
  }

  // Production: query Supabase
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 })

    const { data: profile } = await supabase
      .from('citizens')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !hasReceptionAccess(profile.role)) {
      return NextResponse.json({ error: 'Không có quyền.' }, { status: 403 })
    }

    const { data, error } = await supabase
      .from('citizens')
      .select('id, full_name, phone, created_at, registration_status')
      .eq('registration_status', 'pending_review')

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const members = (data ?? []).map((r) => ({
      id: r.id,
      fullName: r.full_name,
      phone: r.phone,
      registrationDate: r.created_at,
      registrationStatus: r.registration_status,
    }))

    return NextResponse.json({ members })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Lỗi máy chủ' },
      { status: 500 }
    )
  }
}
