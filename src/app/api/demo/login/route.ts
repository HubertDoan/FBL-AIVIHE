import { NextRequest, NextResponse } from 'next/server'
import {
  findDemoAccount,
  isDemoMode,
  DEMO_COOKIE_NAME,
} from '@/lib/demo/demo-accounts'

export async function POST(request: NextRequest) {
  if (!isDemoMode()) {
    return NextResponse.json(
      { error: 'Demo mode is not enabled' },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Vui lòng nhập email và mật khẩu' },
        { status: 400 }
      )
    }

    const account = findDemoAccount(email, password)

    if (!account) {
      return NextResponse.json(
        { error: 'Email hoặc mật khẩu không đúng' },
        { status: 401 }
      )
    }

    // Return user without password
    const { password: _pw, ...user } = account

    const response = NextResponse.json({ user })

    // Set httpOnly cookie with demo session
    response.cookies.set(DEMO_COOKIE_NAME, JSON.stringify(user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch {
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi. Vui lòng thử lại.' },
      { status: 500 }
    )
  }
}
