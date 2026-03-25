import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  isDemoMode,
  getDemoUser,
  demoResponse,
  demoUnauthorized,
  demoForbidden,
} from '@/lib/demo/demo-api-helper'
import {
  getDirectorAnnouncements,
  createDirectorAnnouncement,
  type DirectorAnnouncementCategory,
  type DirectorAnnouncementPriority,
  type DirectorTargetType,
} from '@/lib/demo/demo-director-announcement-data'

const DIRECTOR_ROLES = ['director', 'branch_director'] as const

function isDirectorRole(role: string): boolean {
  return (DIRECTOR_ROLES as readonly string[]).includes(role)
}

export async function GET(request: NextRequest) {
  // ── Demo mode ──
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()
    if (!isDirectorRole(demoUser.role)) return demoForbidden()

    const mine = request.nextUrl.searchParams.get('mine') === 'true'
    const items = mine
      ? getDirectorAnnouncements(demoUser.id)
      : getDirectorAnnouncements()

    return demoResponse({ data: items, total: items.length })
  }

  // ── Supabase mode ──
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Bạn chưa đăng nhập.' }, { status: 401 })
    }

    const { data: citizen } = await supabase
      .from('citizens')
      .select('role')
      .eq('id', user.id)
      .single()
    if (!citizen || !isDirectorRole(citizen.role)) {
      return NextResponse.json({ error: 'Bạn không có quyền truy cập.' }, { status: 403 })
    }

    const mine = request.nextUrl.searchParams.get('mine') === 'true'
    let query = supabase
      .from('director_announcements')
      .select('*')
      .order('created_at', { ascending: false })

    if (mine) query = query.eq('created_by', user.id)

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ data: data ?? [], total: data?.length ?? 0 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Lỗi không xác định'
    return NextResponse.json({ error: 'Lỗi lấy thông báo: ' + message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // ── Demo mode ──
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()
    if (!isDirectorRole(demoUser.role)) return demoForbidden()

    const body = await request.json()
    const newItem = createDirectorAnnouncement({
      title: body.title ?? '',
      content: body.content ?? '',
      category: (body.category ?? 'activity') as DirectorAnnouncementCategory,
      priority: (body.priority ?? 'normal') as DirectorAnnouncementPriority,
      target_type: (body.target_type ?? 'all') as DirectorTargetType,
      target_roles: body.target_roles ?? [],
      target_user_id: body.target_user_id ?? null,
      target_user_name: body.target_user_name ?? null,
      allow_replies: body.allow_replies ?? true,
      created_by: demoUser.id,
      created_by_name: demoUser.fullName,
    })
    return demoResponse(newItem, 201)
  }

  // ── Supabase mode ──
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Bạn chưa đăng nhập.' }, { status: 401 })
    }

    const { data: citizen } = await supabase
      .from('citizens')
      .select('role, full_name')
      .eq('id', user.id)
      .single()
    if (!citizen || !isDirectorRole(citizen.role)) {
      return NextResponse.json({ error: 'Bạn không có quyền truy cập.' }, { status: 403 })
    }

    const body = await request.json()
    const { data, error } = await supabase
      .from('director_announcements')
      .insert({
        title: body.title,
        content: body.content,
        category: body.category ?? 'activity',
        priority: body.priority ?? 'normal',
        target_type: body.target_type ?? 'all',
        target_roles: body.target_roles ?? [],
        target_user_id: body.target_user_id ?? null,
        target_user_name: body.target_user_name ?? null,
        allow_replies: body.allow_replies ?? true,
        created_by: user.id,
        created_by_name: citizen.full_name,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Lỗi không xác định'
    return NextResponse.json({ error: 'Lỗi tạo thông báo: ' + message }, { status: 500 })
  }
}
