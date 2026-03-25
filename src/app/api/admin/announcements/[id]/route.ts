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
import { demoAnnouncementsStore } from '@/lib/demo/demo-announcement-data'

type RouteContext = { params: Promise<{ id: string }> }

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const { id } = await params

  // ── Demo mode ──
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()
    if (!hasAdminAccess(demoUser.role)) return demoForbidden()

    const body = await request.json()
    const idx = demoAnnouncementsStore.findIndex((a) => a.id === id)
    if (idx === -1) return NextResponse.json({ error: 'Không tìm thấy thông báo.' }, { status: 404 })

    const updated = {
      ...demoAnnouncementsStore[idx],
      title: body.title ?? demoAnnouncementsStore[idx].title,
      content: body.content ?? demoAnnouncementsStore[idx].content,
      category: body.category ?? demoAnnouncementsStore[idx].category,
      target_type: body.target_type ?? demoAnnouncementsStore[idx].target_type,
      target_groups: body.target_groups ?? demoAnnouncementsStore[idx].target_groups,
      target_citizen_id: body.target_citizen_id ?? demoAnnouncementsStore[idx].target_citizen_id,
      target_user_name: body.target_user_name ?? demoAnnouncementsStore[idx].target_user_name,
      priority: body.priority ?? demoAnnouncementsStore[idx].priority,
      allow_reply: body.allow_reply ?? demoAnnouncementsStore[idx].allow_reply,
      attachments_note: body.attachments_note ?? demoAnnouncementsStore[idx].attachments_note,
      is_published: body.is_published ?? demoAnnouncementsStore[idx].is_published,
      updated_at: new Date().toISOString(),
    }
    demoAnnouncementsStore[idx] = updated
    return demoResponse(updated)
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
      .update({
        title: body.title,
        content: body.content,
        category: body.category,
        target_type: body.target_type,
        target_groups: body.target_groups,
        target_citizen_id: body.target_citizen_id,
        target_user_name: body.target_user_name,
        priority: body.priority,
        allow_reply: body.allow_reply,
        attachments_note: body.attachments_note,
        is_published: body.is_published,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Lỗi không xác định'
    return NextResponse.json({ error: 'Lỗi cập nhật: ' + message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const { id } = await params

  // ── Demo mode ──
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()
    if (!hasAdminAccess(demoUser.role)) return demoForbidden()

    const idx = demoAnnouncementsStore.findIndex((a) => a.id === id)
    if (idx !== -1) demoAnnouncementsStore.splice(idx, 1)
    return demoResponse({ success: true, id })
  }

  // ── Supabase mode ── soft delete
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Bạn chưa đăng nhập.' }, { status: 401 })

    const { data: citizen } = await supabase.from('citizens').select('role').eq('id', user.id).single()
    if (!hasAdminAccess(citizen?.role ?? '')) {
      return NextResponse.json({ error: 'Bạn không có quyền truy cập.' }, { status: 403 })
    }

    const { error } = await supabase
      .from('announcements')
      .update({ is_published: false, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ success: true, id })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Lỗi không xác định'
    return NextResponse.json({ error: 'Lỗi xóa thông báo: ' + message }, { status: 500 })
  }
}
