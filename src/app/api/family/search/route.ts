import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isDemoMode, getDemoUser, demoResponse, demoUnauthorized } from '@/lib/demo/demo-api-helper'
import { DEMO_ACCOUNTS } from '@/lib/demo/demo-accounts'

function maskPhone(phone: string): string {
  if (phone.length < 6) return '****'
  return phone.slice(0, 4) + '***' + phone.slice(-3)
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const phone = searchParams.get('phone')?.trim()

  if (!phone || !/^0\d{9}$/.test(phone)) {
    return NextResponse.json(
      { error: 'Số điện thoại không hợp lệ.' },
      { status: 400 }
    )
  }

  // ── Demo mode ──
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()

    const found = DEMO_ACCOUNTS.find(
      (a) => a.phone === phone && a.id !== demoUser.id
    )
    if (!found) {
      return demoResponse({ found: false, citizen: null })
    }
    return demoResponse({
      found: true,
      citizen: {
        id: found.id,
        full_name: found.fullName,
        phone: maskPhone(found.phone),
      },
    })
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
      .select('id, full_name, phone')
      .eq('phone', phone)
      .single()

    if (!citizen) {
      return NextResponse.json({ found: false, citizen: null })
    }

    return NextResponse.json({
      found: true,
      citizen: {
        id: citizen.id,
        full_name: citizen.full_name,
        phone: maskPhone(citizen.phone),
      },
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi không xác định'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
