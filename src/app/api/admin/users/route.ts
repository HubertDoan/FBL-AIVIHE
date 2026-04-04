import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isDemoMode, getDemoUser, demoResponse, demoUnauthorized, demoForbidden, hasAdminAccess } from '@/lib/demo/demo-api-helper'
import { getDemoAdminUsers } from '@/lib/demo/demo-data'

export async function GET(request: NextRequest) {
  // ── Demo mode ──
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()
    if (!hasAdminAccess(demoUser.role)) return demoForbidden()
    const searchParams = new URL(request.url).searchParams
    const page = parseInt(searchParams.get('page') ?? '1', 10)
    const limit = parseInt(searchParams.get('limit') ?? '20', 10)
    const search = searchParams.get('search') ?? ''
    return demoResponse(getDemoAdminUsers(page, limit, search))
  }

  // ── Supabase mode ──
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Bạn chưa đăng nhập.' },
        { status: 401 }
      )
    }

    // Check admin role
    const { data: citizen } = await supabase
      .from('citizens')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!citizen || !['admin','super_admin','director','branch_director','manager'].includes(citizen.role)) {
      return NextResponse.json(
        { error: 'Bạn không có quyền truy cập.' },
        { status: 403 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') ?? '1', 10)
    const limit = parseInt(searchParams.get('limit') ?? '20', 10)
    const search = searchParams.get('search') ?? ''
    const offset = (page - 1) * limit

    let query = supabase
      .from('citizens')
      .select('id, full_name, phone, email, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (search.trim()) {
      query = query.or(
        `full_name.ilike.%${search}%,phone.ilike.%${search}%`
      )
    }

    const { data: users, count, error: queryError } = await query

    if (queryError) {
      return NextResponse.json(
        { error: 'Lỗi truy vấn: ' + queryError.message },
        { status: 500 }
      )
    }

    // Get document counts per user
    const userIds = (users ?? []).map((u) => u.id)
    const { data: docCounts } = await supabase
      .from('source_documents')
      .select('citizen_id')
      .in('citizen_id', userIds.length > 0 ? userIds : ['__none__'])

    const countMap: Record<string, number> = {}
    for (const doc of docCounts ?? []) {
      countMap[doc.citizen_id] = (countMap[doc.citizen_id] ?? 0) + 1
    }

    const usersWithDocs = (users ?? []).map((u) => ({
      ...u,
      document_count: countMap[u.id] ?? 0,
    }))

    return NextResponse.json({
      users: usersWithDocs,
      total: count ?? 0,
      page,
      limit,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Lỗi không xác định'
    return NextResponse.json(
      { error: 'Lỗi lấy danh sách người dùng: ' + message },
      { status: 500 }
    )
  }
}
