// GET /api/service-registration/all — staff view tất cả đăng ký dịch vụ
// Chỉ GĐ/admin/reception xem được

import { NextRequest, NextResponse } from 'next/server'
import { isDemoMode, getDemoUser } from '@/lib/demo/demo-api-helper'
import { getAllServiceRegistrations } from '@/lib/demo/demo-service-registration-in-memory-store'

const STAFF_ROLES = [
  'super_admin', 'director', 'branch_director',
  'admin', 'admin_staff', 'manager', 'reception',
]

export async function GET(request: NextRequest) {
  if (isDemoMode()) {
    const user = await getDemoUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!STAFF_ROLES.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.json({ registrations: getAllServiceRegistrations() })
  }
  return NextResponse.json({ registrations: [] })
}
