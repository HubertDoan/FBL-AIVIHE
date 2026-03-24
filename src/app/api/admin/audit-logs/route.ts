import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isDemoMode, getDemoUser, demoResponse, demoUnauthorized, demoForbidden } from '@/lib/demo/demo-api-helper'
import { getDemoAuditLogs } from '@/lib/demo/demo-data'

export async function GET(request: NextRequest) {
  // ── Demo mode ──
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()
    if (demoUser.role !== 'admin') return demoForbidden()
    const searchParams = new URL(request.url).searchParams
    const page = parseInt(searchParams.get('page') ?? '1', 10)
    const limit = parseInt(searchParams.get('limit') ?? '20', 10)
    return demoResponse(getDemoAuditLogs(page, limit))
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

    if (!citizen || citizen.role !== 'admin') {
      return NextResponse.json(
        { error: 'Bạn không có quyền truy cập.' },
        { status: 403 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') ?? '1', 10)
    const limit = parseInt(searchParams.get('limit') ?? '20', 10)
    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')
    const offset = (page - 1) * limit

    let query = supabase
      .from('audit_logs')
      .select('id, user_id, action, target_table, target_id, details, created_at', {
        count: 'exact',
      })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (dateFrom) {
      query = query.gte('created_at', dateFrom)
    }
    if (dateTo) {
      query = query.lte('created_at', dateTo + 'T23:59:59.999Z')
    }

    const { data: logs, count, error: queryError } = await query

    if (queryError) {
      return NextResponse.json(
        { error: 'Lỗi truy vấn: ' + queryError.message },
        { status: 500 }
      )
    }

    // Get user names for the logs
    const userIds = [...new Set((logs ?? []).map((l) => l.user_id))]
    const { data: citizens } = await supabase
      .from('citizens')
      .select('id, full_name')
      .in('id', userIds.length > 0 ? userIds : ['__none__'])

    const nameMap: Record<string, string> = {}
    for (const c of citizens ?? []) {
      nameMap[c.id] = c.full_name
    }

    const logsWithNames = (logs ?? []).map((l) => ({
      ...l,
      user_name: nameMap[l.user_id] ?? 'Không rõ',
    }))

    return NextResponse.json({
      logs: logsWithNames,
      total: count ?? 0,
      page,
      limit,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Lỗi không xác định'
    return NextResponse.json(
      { error: 'Lỗi lấy nhật ký: ' + message },
      { status: 500 }
    )
  }
}
