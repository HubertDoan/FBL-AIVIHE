import { NextRequest, NextResponse } from 'next/server'
import {
  isDemoMode,
  DEMO_COOKIE_NAME,
  DEMO_ACCOUNTS,
  findDemoAccountById,
} from '@/lib/demo/demo-accounts'

const VALID_ROLES = [
  'member',
  'doctor',
  'staff',
  'director',
  'secretary',
  'admin_staff',
  'accountant',
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { citizenId, gender, dateOfBirth, role, address, occupation } = body

    // Validate required fields
    if (!citizenId || !gender || !dateOfBirth || !role || !address) {
      return NextResponse.json(
        { error: 'Vui lòng điền đầy đủ thông tin bắt buộc.' },
        { status: 400 }
      )
    }

    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json(
        { error: 'Loại thành viên không hợp lệ.' },
        { status: 400 }
      )
    }

    if (isDemoMode()) {
      // Demo mode: update the in-memory account role
      const cookie = request.cookies.get(DEMO_COOKIE_NAME)
      if (cookie?.value) {
        const session = JSON.parse(cookie.value)
        const account = findDemoAccountById(session.id)
        if (account) {
          // Map role for demo: 'member' -> 'citizen', 'doctor' -> 'doctor'
          const demoRole = role === 'doctor' ? 'doctor' : 'citizen'
          // Mutate in-memory for this session
          const idx = DEMO_ACCOUNTS.findIndex((a) => a.id === account.id)
          if (idx !== -1) {
            ;(DEMO_ACCOUNTS[idx] as { role: string }).role = demoRole
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Đăng ký thành viên thành công!',
      })
    }

    // Production: update via Supabase
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    const { error } = await supabase
      .from('citizens')
      .update({
        role,
        gender,
        date_of_birth: dateOfBirth,
        address,
        occupation: occupation || null,
      })
      .eq('id', citizenId)

    if (error) {
      return NextResponse.json(
        { error: 'Không thể cập nhật thông tin. Vui lòng thử lại.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Đăng ký thành viên thành công!',
    })
  } catch {
    return NextResponse.json(
      { error: 'Có lỗi xảy ra. Vui lòng thử lại sau.' },
      { status: 500 }
    )
  }
}
