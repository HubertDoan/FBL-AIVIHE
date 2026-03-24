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
        { error: 'Vui l\u00F2ng nh\u1EADp email v\u00E0 m\u1EADt kh\u1EA9u' },
        { status: 400 }
      )
    }

    const account = findDemoAccount(email, password)

    if (!account) {
      return NextResponse.json(
        { error: 'Email ho\u1EB7c m\u1EADt kh\u1EA9u kh\u00F4ng \u0111\u00FAng' },
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
      { error: '\u0110\u00E3 x\u1EA3y ra l\u1ED7i. Vui l\u00F2ng th\u1EED l\u1EA1i.' },
      { status: 500 }
    )
  }
}
