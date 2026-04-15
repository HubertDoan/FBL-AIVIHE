// POST /api/service-registration/record-usage-by-service-code
// BS/KTV nhập mã dịch vụ của khách để trừ 1 lượt sử dụng
// Body: { service_code: "SVC-HN-000001" }

import { NextRequest, NextResponse } from 'next/server'
import { isDemoMode, getDemoUser } from '@/lib/demo/demo-api-helper'
import {
  findByServiceCode,
  recordServiceUsage,
} from '@/lib/demo/demo-service-registration-in-memory-store'

const SERVICE_PROVIDER_ROLES = [
  'doctor', 'exam_doctor', 'specialist',
  'technician', 'tech_assistant', 'nurse',
  'reception', 'admin', 'admin_staff', 'manager',
  'director', 'branch_director', 'super_admin',
]

export async function POST(request: NextRequest) {
  if (isDemoMode()) {
    const user = await getDemoUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!SERVICE_PROVIDER_ROLES.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const code = (body.service_code || '').toString().trim().toUpperCase()

    if (!code || !/^SVC-[A-Z]{2}-\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: 'Mã dịch vụ không hợp lệ. Định dạng: SVC-HN-000001' },
        { status: 400 }
      )
    }

    const reg = findByServiceCode(code)
    if (!reg) {
      return NextResponse.json({ error: 'Không tìm thấy mã dịch vụ' }, { status: 404 })
    }

    if (reg.status !== 'active') {
      return NextResponse.json(
        { error: `Gói dịch vụ ở trạng thái "${reg.status}", không sử dụng được` },
        { status: 400 }
      )
    }

    if (reg.total_visits > 0 && reg.used_visits >= reg.total_visits) {
      return NextResponse.json(
        { error: 'Đã hết số lượt sử dụng. Khách cần đăng ký gói mới.' },
        { status: 400 }
      )
    }

    const updated = recordServiceUsage(reg.id)
    if (!updated) return NextResponse.json({ error: 'Không thể ghi nhận' }, { status: 500 })

    return NextResponse.json({
      ok: true,
      registration: updated,
      message: `Đã trừ 1 lượt. Còn lại: ${updated.total_visits === 0 ? 'không giới hạn' : `${updated.total_visits - updated.used_visits} lượt`}`,
    })
  }

  return NextResponse.json({ error: 'Chức năng này đang bảo trì' }, { status: 503 })
}
