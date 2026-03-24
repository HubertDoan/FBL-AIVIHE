import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  isDemoMode,
  getDemoUser,
  demoResponse,
  demoUnauthorized,
  demoForbidden,
} from '@/lib/demo/demo-api-helper'
import { getDemoBranchStaff } from '@/lib/demo/demo-branch-data'

type RouteParams = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  if (isDemoMode()) {
    const user = await getDemoUser(request)
    if (!user) return demoUnauthorized()
    const staff = getDemoBranchStaff(id)
    return demoResponse({ staff })
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 })

    const { data: staff, error } = await supabase
      .from('branch_staff')
      .select('*, citizen:citizens(id, full_name, phone)')
      .eq('branch_id', id)
      .order('is_primary', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ staff: staff ?? [] })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Lỗi máy chủ' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  if (isDemoMode()) {
    const user = await getDemoUser(request)
    if (!user) return demoUnauthorized()
    if (!['super_admin', 'director', 'branch_director'].includes(user.role)) return demoForbidden()

    const body = await request.json()
    return demoResponse({
      id: 'bs-new-' + Date.now(),
      branch_id: id,
      citizen_id: body.citizen_id,
      citizen_name: body.citizen_name ?? 'Nhân viên mới',
      position: body.position,
      is_primary: body.is_primary ?? true,
      started_at: new Date().toISOString(),
    }, 201)
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 })

    const body = await request.json()
    if (!body.citizen_id || !body.position) {
      return NextResponse.json({ error: 'Thiếu thông tin nhân viên.' }, { status: 400 })
    }

    const { data, error } = await supabase.from('branch_staff').insert({
      branch_id: id,
      citizen_id: body.citizen_id,
      position: body.position,
      is_primary: body.is_primary ?? true,
    }).select('*, citizen:citizens(id, full_name, phone)').single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Lỗi máy chủ' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  if (isDemoMode()) {
    const user = await getDemoUser(request)
    if (!user) return demoUnauthorized()
    if (!['super_admin', 'director', 'branch_director'].includes(user.role)) return demoForbidden()
    return demoResponse({ message: 'Đã xóa nhân viên khỏi chi nhánh.' })
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 })

    const sp = new URL(request.url).searchParams
    const citizenId = sp.get('citizen_id')
    if (!citizenId) return NextResponse.json({ error: 'Thiếu citizen_id.' }, { status: 400 })

    const { error } = await supabase
      .from('branch_staff')
      .delete()
      .eq('branch_id', id)
      .eq('citizen_id', citizenId)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ message: 'Đã xóa nhân viên khỏi chi nhánh.' })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Lỗi máy chủ' }, { status: 500 })
  }
}
