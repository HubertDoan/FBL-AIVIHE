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

type Params = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params

  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()
    if (!hasAdminAccess(demoUser.role)) return demoForbidden()
    return demoResponse({ success: true, message: 'Đã đặt lại mật khẩu thành công.' })
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 })

    const { data: admin } = await supabase.from('citizens').select('role').eq('id', user.id).single()
    if (!admin || !['admin','super_admin','director','branch_director','manager'].includes(admin.role)) return NextResponse.json({ error: 'Không có quyền.' }, { status: 403 })

    const body = await request.json()
    const { newPassword } = body
    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: 'Mật khẩu phải có ít nhất 6 ký tự.' }, { status: 400 })
    }

    const { error } = await supabase.auth.admin.updateUserById(id, { password: newPassword })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ success: true, message: 'Đã đặt lại mật khẩu thành công.' })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Lỗi máy chủ' }, { status: 500 })
  }
}
