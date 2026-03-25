import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  isDemoMode,
  getDemoUser,
  demoUnauthorized,
  demoForbidden,
} from '@/lib/demo/demo-api-helper'
import { DEMO_ACCOUNTS } from '@/lib/demo/demo-accounts'

const DIRECTOR_ROLES = ['director', 'branch_director'] as const

function isDirectorRole(role: string): boolean {
  return (DIRECTOR_ROLES as readonly string[]).includes(role)
}

export async function GET(request: NextRequest) {
  const phone = request.nextUrl.searchParams.get('phone') ?? ''

  // ── Demo mode ──
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()
    if (!isDirectorRole(demoUser.role)) return demoForbidden()

    const found = DEMO_ACCOUNTS.find((a) => a.phone === phone.trim())
    if (!found) {
      return NextResponse.json({ error: 'Không tìm thấy thành viên.' }, { status: 404 })
    }
    return NextResponse.json({ id: found.id, fullName: found.fullName, phone: found.phone })
  }

  // ── Supabase mode ──
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Bạn chưa đăng nhập.' }, { status: 401 })

    const { data: citizen } = await supabase.from('citizens').select('role').eq('id', user.id).single()
    if (!citizen || !isDirectorRole(citizen.role)) {
      return NextResponse.json({ error: 'Bạn không có quyền truy cập.' }, { status: 403 })
    }

    const { data: member, error } = await supabase
      .from('citizens')
      .select('id, full_name, phone')
      .eq('phone', phone.trim())
      .single()

    if (error || !member) {
      return NextResponse.json({ error: 'Không tìm thấy thành viên.' }, { status: 404 })
    }
    return NextResponse.json({ id: member.id, fullName: member.full_name, phone: member.phone })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Lỗi không xác định'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
