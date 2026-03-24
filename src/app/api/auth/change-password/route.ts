import { NextRequest, NextResponse } from 'next/server'
import { isDemoMode } from '@/lib/demo/demo-accounts'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { currentPassword, newPassword, confirmPassword } = body

    // Validate inputs
    if (!currentPassword) {
      return NextResponse.json(
        { error: 'Vui lòng nhập mật khẩu hiện tại.' },
        { status: 400 }
      )
    }

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Mật khẩu mới phải có ít nhất 6 ký tự.' },
        { status: 400 }
      )
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'Xác nhận mật khẩu không khớp.' },
        { status: 400 }
      )
    }

    if (isDemoMode()) {
      // Demo mode: simulate success
      return NextResponse.json({
        message: 'Đổi mật khẩu thành công! (Chế độ demo)',
      })
    }

    // Production mode: update via Supabase
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      console.error('Change password error:', error)
      return NextResponse.json(
        { error: 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại.' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Đổi mật khẩu thành công!',
    })
  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi. Vui lòng thử lại sau.' },
      { status: 500 }
    )
  }
}
