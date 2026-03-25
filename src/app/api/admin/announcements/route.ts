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
import {
  demoAnnouncementsStore,
  getDemoReplyCount,
} from '@/lib/demo/demo-announcement-data'

export async function GET(request: NextRequest) {
  // ── Demo mode ──
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()
    if (!hasAdminAccess(demoUser.role)) return demoForbidden()

    const page = Number(request.nextUrl.searchParams.get('page') ?? '1')
    const limit = Number(request.nextUrl.searchParams.get('limit') ?? '20')
    const start = (page - 1) * limit

    // Attach live reply counts
    const items = demoAnnouncementsStore
      .slice(start, start + limit)
      .map((a) => ({ ...a, reply_count: getDemoReplyCount(a.id) }))

    return demoResponse({ data: items, total: demoAnnouncementsStore.length, page, limit })
  }

  // ── Supabase mode ──
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Bạn chưa đăng nhập.' }, { status: 401 })

    const { data: citizen } = await supabase.from('citizens').select('role').eq('id', user.id).single()
    if (!hasAdminAccess(citizen?.role ?? '')) {
      return NextResponse.json({ error: 'Bạn không có quyền truy cập.' }, { status: 403 })
    }

    const page = Number(request.nextUrl.searchParams.get('page') ?? '1')
    const limit = Number(request.nextUrl.searchParams.get('limit') ?? '20')
    const start = (page - 1) * limit

    const { data, count } = await supabase
      .from('announcements')
      .select('*', { count: 'exact' })
      .order('published_at', { ascending: false })
      .range(start, start + limit - 1)

    return NextResponse.json({ data: data ?? [], total: count ?? 0, page, limit })
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
    if (!hasAdminAccess(demoUser.role)) return demoForbidden()

    const body = await request.json()
    const now = new Date().toISOString()
    const newAnn = {
      id: `ann-${Date.now()}`,
      title: body.title ?? '',
      content: body.content ?? '',
      category: body.category ?? 'general',
      target_type: body.target_type ?? 'all',
      target_groups: body.target_groups ?? [],
      target_citizen_id: body.target_citizen_id ?? null,
      target_user_name: body.target_user_name ?? null,
      priority: body.priority ?? 'normal',
      allow_reply: body.allow_reply ?? false,
      attachments_note: body.attachments_note ?? '',
      is_published: body.is_published ?? true,
      published_at: now,
      created_by: demoUser.id,
      created_at: now,
      updated_at: now,
      reply_count: 0,
    }
    demoAnnouncementsStore.unshift(newAnn)
    return demoResponse(newAnn, 201)
  }

  // ── Supabase mode ──
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Bạn chưa đăng nhập.' }, { status: 401 })

    const { data: citizen } = await supabase.from('citizens').select('role').eq('id', user.id).single()
    if (!hasAdminAccess(citizen?.role ?? '')) {
      return NextResponse.json({ error: 'Bạn không có quyền truy cập.' }, { status: 403 })
    }

    const body = await request.json()
    const { data, error } = await supabase
      .from('announcements')
      .insert({
        title: body.title,
        content: body.content,
        category: body.category ?? 'general',
        target_type: body.target_type ?? 'all',
        target_groups: body.target_groups ?? [],
        target_citizen_id: body.target_citizen_id ?? null,
        target_user_name: body.target_user_name ?? null,
        priority: body.priority ?? 'normal',
        allow_reply: body.allow_reply ?? false,
        attachments_note: body.attachments_note ?? '',
        is_published: body.is_published ?? true,
        created_by: user.id,
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
