import { NextRequest, NextResponse } from 'next/server'
import {
  isDemoMode,
  getDemoUser,
  demoResponse,
  demoUnauthorized,
} from '@/lib/demo/demo-api-helper'
import { createClient } from '@/lib/supabase/server'

const BENEFITS = [
  'Quản lý hồ sơ sức khỏe trọn đời',
  'AI trích xuất dữ liệu y tế',
  'Theo dõi xu hướng sức khỏe',
  'Chuẩn bị đi khám bệnh',
  'Chia sẻ hồ sơ gia đình',
  'Tư vấn bác sĩ gia đình',
]

export async function GET(request: NextRequest) {
  // ── Demo mode ──
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()

    const now = new Date()
    return demoResponse({
      tier: 'silver',
      memberSince: `${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`,
      fullName: demoUser.fullName,
      memberId: demoUser.citizenId,
      benefits: BENEFITS,
    })
  }

  // ── Supabase mode ──
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Chưa đăng nhập.' },
        { status: 401 }
      )
    }

    const { data: citizen } = await supabase
      .from('citizens')
      .select('id, full_name, role, created_at')
      .eq('id', user.id)
      .single()

    if (!citizen) {
      return NextResponse.json(
        { error: 'Không tìm thấy hồ sơ.' },
        { status: 404 }
      )
    }

    const createdAt = new Date(citizen.created_at)
    const memberSince = `${String(createdAt.getMonth() + 1).padStart(2, '0')}/${createdAt.getFullYear()}`

    return NextResponse.json({
      tier: 'silver',
      memberSince,
      fullName: citizen.full_name,
      memberId: citizen.id,
      benefits: BENEFITS,
    })
  } catch (error) {
    const msg =
      error instanceof Error ? error.message : 'Lỗi không xác định'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
