import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  isDemoMode,
  getDemoUser,
  demoResponse,
  demoUnauthorized,
  demoForbidden,
} from '@/lib/demo/demo-api-helper'
import { getDemoBranches, getDemoBranchesForUser, DEMO_BRANCH_STAFF } from '@/lib/demo/demo-branch-data'

const DIRECTOR_ROLES = ['director', 'super_admin']

export async function GET(request: NextRequest) {
  if (isDemoMode()) {
    const user = await getDemoUser(request)
    if (!user) return demoUnauthorized()

    const branches = getDemoBranchesForUser(user.id, user.role)
    const enriched = branches.map((b) => ({
      ...b,
      staff_count: DEMO_BRANCH_STAFF.filter((s) => s.branch_id === b.id).length,
    }))
    return demoResponse({ branches: enriched })
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 })

    const { data: citizen } = await supabase
      .from('citizens')
      .select('id, role')
      .eq('auth_id', user.id)
      .single()
    if (!citizen) return NextResponse.json({ error: 'Không tìm thấy tài khoản.' }, { status: 404 })

    let query = supabase.from('branches').select('*').eq('is_active', true)

    if (!DIRECTOR_ROLES.includes(citizen.role)) {
      const { data: staffLinks } = await supabase
        .from('branch_staff')
        .select('branch_id')
        .eq('citizen_id', citizen.id)
      const branchIds = (staffLinks ?? []).map((s) => s.branch_id)

      if (citizen.role === 'branch_director') {
        const { data: dirBranches } = await supabase
          .from('branches')
          .select('id')
          .eq('director_id', citizen.id)
        const dirIds = (dirBranches ?? []).map((b) => b.id)
        const allIds = [...new Set([...branchIds, ...dirIds])]
        if (allIds.length === 0) return NextResponse.json({ branches: [] })
        query = query.in('id', allIds)
      } else {
        if (branchIds.length === 0) return NextResponse.json({ branches: [] })
        query = query.in('id', branchIds)
      }
    }

    const { data: branches, error } = await query.order('is_headquarters', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ branches: branches ?? [] })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Lỗi máy chủ' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (isDemoMode()) {
    const user = await getDemoUser(request)
    if (!user) return demoUnauthorized()
    if (user.role !== 'super_admin') return demoForbidden()

    const body = await request.json()
    const newBranch = {
      id: 'branch-new-' + Date.now(),
      name: body.name,
      code: body.code,
      address: body.address ?? '',
      phone: body.phone ?? '',
      email: body.email ?? '',
      director_id: body.director_id ?? null,
      director_name: body.director_name ?? '',
      parent_branch_id: body.parent_branch_id ?? null,
      is_headquarters: false,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      staff_count: 0,
    }
    return demoResponse(newBranch, 201)
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 })

    const { data: citizen } = await supabase.from('citizens').select('role').eq('auth_id', user.id).single()
    if (!citizen || citizen.role !== 'super_admin') {
      return NextResponse.json({ error: 'Chỉ Super Admin được tạo chi nhánh.' }, { status: 403 })
    }

    const body = await request.json()
    if (!body.name || !body.code) {
      return NextResponse.json({ error: 'Thiếu tên hoặc mã chi nhánh.' }, { status: 400 })
    }

    const { data: branch, error } = await supabase.from('branches').insert({
      name: body.name,
      code: body.code,
      address: body.address,
      phone: body.phone,
      email: body.email,
      director_id: body.director_id,
      parent_branch_id: body.parent_branch_id,
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(branch, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Lỗi máy chủ' }, { status: 500 })
  }
}
