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
import { DEMO_MEMBERS } from '../route'

type Params = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params

  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()
    if (!hasAdminAccess(demoUser.role)) return demoForbidden()
    const member = DEMO_MEMBERS.find(m => m.id === id)
    if (!member) return demoResponse({ error: 'Không tìm thấy thành viên.' }, 404)
    return demoResponse(member)
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 })

    const { data: admin } = await supabase.from('citizens').select('role').eq('id', user.id).single()
    if (!admin || !['admin','super_admin','director','branch_director','manager'].includes(admin.role)) return NextResponse.json({ error: 'Không có quyền.' }, { status: 403 })

    const { data: member, error } = await supabase
      .from('citizens')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !member) return NextResponse.json({ error: 'Không tìm thấy.' }, { status: 404 })
    return NextResponse.json(member)
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Lỗi máy chủ' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params

  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()
    if (!hasAdminAccess(demoUser.role)) return demoForbidden()
    const body = await request.json()
    return demoResponse({ id, ...body, updated_at: new Date().toISOString() })
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 })

    const { data: admin } = await supabase.from('citizens').select('role').eq('id', user.id).single()
    if (!admin || !['admin','super_admin','director','branch_director','manager'].includes(admin.role)) return NextResponse.json({ error: 'Không có quyền.' }, { status: 403 })

    const body = await request.json()
    const { full_name, phone, email, role, gender, status: memberStatus } = body

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (full_name !== undefined) updates.full_name = full_name
    if (phone !== undefined) updates.phone = phone
    if (email !== undefined) updates.email = email
    if (role !== undefined) updates.role = role
    if (gender !== undefined) updates.gender = gender
    if (memberStatus !== undefined) updates.status = memberStatus

    const { data: updated, error } = await supabase
      .from('citizens')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(updated)
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Lỗi máy chủ' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const { id } = await params

  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()
    if (!hasAdminAccess(demoUser.role)) return demoForbidden()
    return demoResponse({ success: true, message: 'Đã xóa thành viên.' })
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 })

    const { data: admin } = await supabase.from('citizens').select('role').eq('id', user.id).single()
    if (!admin || !['admin','super_admin','director','branch_director','manager'].includes(admin.role)) return NextResponse.json({ error: 'Không có quyền.' }, { status: 403 })

    const { error } = await supabase
      .from('citizens')
      .update({ is_active: false, status: 'deleted', updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true, message: 'Đã xóa thành viên.' })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Lỗi máy chủ' }, { status: 500 })
  }
}
