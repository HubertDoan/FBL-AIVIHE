import { NextResponse } from 'next/server'
import { isDemoMode, DEMO_COOKIE_NAME } from '@/lib/demo/demo-accounts'

export async function POST() {
  if (!isDemoMode()) {
    return NextResponse.json(
      { error: 'Demo mode is not enabled' },
      { status: 403 }
    )
  }

  const response = NextResponse.json({ success: true })

  response.cookies.set(DEMO_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })

  return response
}
