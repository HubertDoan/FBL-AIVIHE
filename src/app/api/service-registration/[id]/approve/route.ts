// POST /api/service-registration/[id]/approve — GĐ duyệt đăng ký dịch vụ
// Chuyển status: pending_approval → payment_pending, tạo payment_content

import { NextRequest, NextResponse } from 'next/server'
import { isDemoMode, getDemoUser } from '@/lib/demo/demo-api-helper'
import { approveServiceRegistration } from '@/lib/demo/demo-service-registration-in-memory-store'

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
      return NextResponse.json({ error: 'Chỉ GĐ mới được duyệt' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const reg = approveServiceRegistration(id, user.id, body.notes)
    if (!reg) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ ok: true, registration: reg })
  }

  // TODO: Supabase production
  return NextResponse.json({ error: 'Chức năng này đang bảo trì' }, { status: 503 })
}
