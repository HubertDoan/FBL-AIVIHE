import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  isDemoMode,
  getDemoUser,
  demoResponse,
  demoUnauthorized,
  demoForbidden,
  hasAdminAccess,
} from '@/lib/demo/demo-api-helper'
import { addNotification } from '@/lib/demo/demo-notification-data'

type Params = { params: Promise<{ id: string }> }

const ACTION_MAP: Record<string, { status: string; is_active: boolean; message: string }> = {
  suspend: { status: 'suspended', is_active: false, message: 'Đã tạm dừng tài khoản.' },
  activate: { status: 'active', is_active: true, message: 'Đã kích hoạt tài khoản.' },
  approve: { status: 'active', is_active: true, message: 'Thành viên đã được duyệt thành công.' },
}

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params

  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()
    if (!hasAdminAccess(demoUser.role)) return demoForbidden()
    const body = await request.json()
    const info = ACTION_MAP[body.action]
    if (!info) return demoResponse({ error: 'Hành động không hợp lệ.' }, 400)

    // On approve: create in-app notification for the member
    if (body.action === 'approve') {
      addNotification(
        id,
        'Chúc mừng! Bạn đã trở thành thành viên AIVIHE',
        'Bạn đã được chấp nhận làm thành viên AIVIHE. Thẻ Bạc đã kích hoạt. Phí thành viên 1.800.000đ (6 tháng) đã được xác nhận.'
      )
    }

    return demoResponse({ success: true, message: info.message, status: info.status })
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 })

    const { data: admin } = await supabase.from('citizens').select('role').eq('id', user.id).single()
    if (!admin || admin.role !== 'admin') return NextResponse.json({ error: 'Không có quyền.' }, { status: 403 })

    const body = await request.json()
    const info = ACTION_MAP[body.action]
    if (!info) return NextResponse.json({ error: 'Hành động không hợp lệ.' }, { status: 400 })

    const updates: Record<string, unknown> = {
      status: info.status,
      is_active: info.is_active,
      updated_at: new Date().toISOString(),
    }

    // On approve: promote role to member and set member_since
    if (body.action === 'approve') {
      updates.role = 'member'
      updates.member_since = new Date().toISOString().split('T')[0]
    }

    const { error } = await supabase
      .from('citizens')
      .update(updates)
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true, message: info.message, status: info.status })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Lỗi máy chủ' }, { status: 500 })
  }
}
