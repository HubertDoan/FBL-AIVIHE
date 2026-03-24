import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  isDemoMode,
  getDemoUser,
  demoResponse,
  demoUnauthorized,
  demoForbidden,
} from '@/lib/demo/demo-api-helper'
import { getDemoBranchById } from '@/lib/demo/demo-branch-data'

export async function POST(request: NextRequest) {
  if (isDemoMode()) {
    const user = await getDemoUser(request)
    if (!user) return demoUnauthorized()
    if (user.role !== 'super_admin') return demoForbidden()

    const body = await request.json()
    const source = getDemoBranchById(body.sourceBranchId)
    if (!source) return demoResponse({ error: 'Chi nhánh nguồn không tồn tại.' }, 404)

    return demoResponse({
      id: 'branch-clone-' + Date.now(),
      name: body.newName,
      code: body.newCode,
      address: source.address,
      phone: '',
      email: '',
      director_id: body.directorId ?? null,
      director_name: body.directorName ?? '',
      parent_branch_id: source.id,
      is_headquarters: false,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      staff_count: 0,
      cloned_from: source.name,
    }, 201)
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 })

    const { data: citizen } = await supabase.from('citizens').select('role').eq('auth_id', user.id).single()
    if (!citizen || citizen.role !== 'super_admin') {
      return NextResponse.json({ error: 'Chỉ Super Admin được clone chi nhánh.' }, { status: 403 })
    }

    const body = await request.json()
    const { sourceBranchId, newName, newCode, directorId } = body
    if (!sourceBranchId || !newName || !newCode) {
      return NextResponse.json({ error: 'Thiếu thông tin bắt buộc.' }, { status: 400 })
    }

    const { data: source, error: srcErr } = await supabase
      .from('branches')
      .select('*')
      .eq('id', sourceBranchId)
      .single()
    if (srcErr || !source) {
      return NextResponse.json({ error: 'Chi nhánh nguồn không tồn tại.' }, { status: 404 })
    }

    const { data: newBranch, error } = await supabase.from('branches').insert({
      name: newName,
      code: newCode,
      address: source.address,
      phone: '',
      email: '',
      director_id: directorId ?? null,
      parent_branch_id: source.id,
      is_headquarters: false,
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(newBranch, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Lỗi máy chủ' }, { status: 500 })
  }
}
