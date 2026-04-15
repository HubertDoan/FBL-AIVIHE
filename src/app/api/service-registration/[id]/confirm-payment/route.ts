// POST /api/service-registration/[id]/confirm-payment
// Khách hàng click "Tôi đã chuyển khoản" (fallback nếu SePay webhook chưa nhận được)
// Hoặc staff confirm thủ công. Sinh service_code + activate.

import { NextRequest, NextResponse } from 'next/server'
import { isDemoMode, getDemoUser } from '@/lib/demo/demo-api-helper'
import {
  confirmPaymentForServiceRegistration,
  getServiceRegistrationById,
} from '@/lib/demo/demo-service-registration-in-memory-store'

const STAFF_ROLES = ['reception', 'admin', 'admin_staff', 'manager', 'director', 'branch_director', 'super_admin']

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (isDemoMode()) {
    const user = await getDemoUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const reg = getServiceRegistrationById(id)
    if (!reg) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Chỉ chủ đăng ký hoặc staff được confirm
    const isOwner = reg.citizen_id === user.id
    const isStaff = STAFF_ROLES.includes(user.role)
    if (!isOwner && !isStaff) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (reg.status !== 'payment_pending') {
      return NextResponse.json(
        { error: 'Đăng ký không ở trạng thái chờ thanh toán' },
        { status: 400 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const updated = confirmPaymentForServiceRegistration(id, body.sepay_transaction_id)
    return NextResponse.json({ ok: true, registration: updated })
  }

  return NextResponse.json({ error: 'Chức năng này đang bảo trì' }, { status: 503 })
}
