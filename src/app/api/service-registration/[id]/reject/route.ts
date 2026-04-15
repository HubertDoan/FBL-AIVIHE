// POST /api/service-registration/[id]/reject — GĐ từ chối đăng ký dịch vụ

import { NextRequest, NextResponse } from 'next/server'
import { isDemoMode, getDemoUser } from '@/lib/demo/demo-api-helper'
import { rejectServiceRegistration } from '@/lib/demo/demo-service-registration-in-memory-store'

const DIRECTOR_ROLES = ['director', 'branch_director', 'super_admin']

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (isDemoMode()) {
    const user = await getDemoUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!DIRECTOR_ROLES.includes(user.role)) {
      return NextResponse.json({ error: 'Chỉ GĐ mới được từ chối' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    if (!body.reason || typeof body.reason !== 'string') {
      return NextResponse.json({ error: 'Thiếu lý do từ chối' }, { status: 400 })
    }

    const reg = rejectServiceRegistration(id, user.id, body.reason)
    if (!reg) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ ok: true, registration: reg })
  }

  return NextResponse.json({ error: 'Chức năng này đang bảo trì' }, { status: 503 })
}
