import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  isDemoMode,
  getDemoUser,
  demoResponse,
  demoUnauthorized,
  demoForbidden,
} from '@/lib/demo/demo-api-helper'
import { getDemoBranchById, getDemoBranchStaff } from '@/lib/demo/demo-branch-data'

type RouteParams = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  if (isDemoMode()) {
    const user = await getDemoUser(request)
    if (!user) return demoUnauthorized()

    const branch = getDemoBranchById(id)
    if (!branch) return demoResponse({ error: 'Chi nhánh không tồn tại.' }, 404)

    const staff = getDemoBranchStaff(id)
    return demoResponse({ branch, staff })
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 })

    const { data: branch, error } = await supabase
      .from('branches')
      .select('*, director:citizens!director_id(id, full_name)')
      .eq('id', id)
      .single()
    if (error || !branch) return NextResponse.json({ error: 'Chi nhánh không tồn tại.' }, { status: 404 })

    const { data: staff } = await supabase
      .from('branch_staff')
      .select('*, citizen:citizens(id, full_name, phone)')
      .eq('branch_id', id)

    return NextResponse.json({ branch, staff: staff ?? [] })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Lỗi máy chủ' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  if (isDemoMode()) {
    const user = await getDemoUser(request)
    if (!user) return demoUnauthorized()
    if (user.role !== 'super_admin' && user.role !== 'director') return demoForbidden()

    const body = await request.json()
    const branch = getDemoBranchById(id)
    if (!branch) return demoResponse({ error: 'Chi nhánh không tồn tại.' }, 404)
    return demoResponse({ ...branch, ...body, updated_at: new Date().toISOString() })
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 })

    const body = await request.json()
    const { data, error } = await supabase
      .from('branches')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Lỗi máy chủ' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  if (isDemoMode()) {
    const user = await getDemoUser(request)
    if (!user) return demoUnauthorized()
    if (user.role !== 'super_admin') return demoForbidden()
    return demoResponse({ message: 'Đã tạm dừng chi nhánh.' })
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 })

    const { error } = await supabase
      .from('branches')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ message: 'Đã tạm dừng chi nhánh.' })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Lỗi máy chủ' }, { status: 500 })
  }
}
