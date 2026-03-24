import { NextRequest, NextResponse } from 'next/server'
import {
  isDemoMode,
  DEMO_COOKIE_NAME,
  findDemoAccountById,
} from '@/lib/demo/demo-accounts'

export async function GET(request: NextRequest) {
  if (!isDemoMode()) {
    return NextResponse.json(
      { error: 'Demo mode is not enabled' },
      { status: 403 }
    )
  }

  const cookie = request.cookies.get(DEMO_COOKIE_NAME)

  if (!cookie?.value) {
    return NextResponse.json({ user: null })
  }

  try {
    const session = JSON.parse(cookie.value)
    // Verify the account still exists
    const account = findDemoAccountById(session.id)
    if (!account) {
      return NextResponse.json({ user: null })
    }

    const { password: _pw, ...user } = account
    return NextResponse.json({ user })
  } catch {
    return NextResponse.json({ user: null })
  }
}
