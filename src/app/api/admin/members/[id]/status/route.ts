import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  isDemoMode,
  getDemoUser,
  demoResponse,
  demoUnauthorized,
  demoForbidden,
} from '@/lib/demo/demo-api-helper'

type Params = { params: Promise<{ id: string }> }

const ACTION_MAP: Record<string, { status: string; is_active: boolean; message: string }> = {
  suspend: { status: 'suspended', is_active: false, message: 'Đã tạm dừng tài khoản.' },
  activate: { status: 'active', is_active: true, message: 'Đã kích hoạt tài khoản.' },
  approve: { status: 'active', is_active: true, message: 'Đã duyệt đăng ký thành viên.' },
}

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params

  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()
    if (demoUser.role !== 'admin') return demoForbidden()
    const body = await request.json()
    const info = ACTION_MAP[body.action]
    if (!info) return demoResponse({ error: 'Hành động không hợp lệ.' }, 400)
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

    const { error } = await supabase
      .from('citizens')
      .update({ status: info.status, is_active: info.is_active, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true, message: info.message, status: info.status })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Lỗi máy chủ' }, { status: 500 })
  }
}
