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
  getDirectorAnnouncementById,
  getAnnouncementReplies,
  updateDirectorAnnouncement,
  deleteDirectorAnnouncement,
  markReplyRead,
  markReplyResolved,
} from '@/lib/demo/demo-director-announcement-data'

const DIRECTOR_ROLES = ['director', 'branch_director'] as const

function isDirectorRole(role: string): boolean {
  return (DIRECTOR_ROLES as readonly string[]).includes(role)
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // ── Demo mode ──
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()
    if (!isDirectorRole(demoUser.role)) return demoForbidden()

    const ann = getDirectorAnnouncementById(id)
    if (!ann) return NextResponse.json({ error: 'Không tìm thấy.' }, { status: 404 })

    const replies = getAnnouncementReplies(id)
    return demoResponse({ ...ann, replies })
  }

  // ── Supabase mode ──
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Bạn chưa đăng nhập.' }, { status: 401 })

    const { data: citizen } = await supabase.from('citizens').select('role').eq('id', user.id).single()
    if (!citizen || !isDirectorRole(citizen.role)) {
      return NextResponse.json({ error: 'Bạn không có quyền truy cập.' }, { status: 403 })
    }

    const { data: ann, error: annErr } = await supabase
      .from('director_announcements').select('*').eq('id', id).single()
    if (annErr || !ann) return NextResponse.json({ error: 'Không tìm thấy.' }, { status: 404 })

    const { data: replies } = await supabase
      .from('director_announcement_replies').select('*').eq('announcement_id', id)
      .order('created_at', { ascending: true })

    return NextResponse.json({ ...ann, replies: replies ?? [] })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Lỗi không xác định'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // ── Demo mode ──
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()
    if (!isDirectorRole(demoUser.role)) return demoForbidden()

    const body = await request.json()

    // Handle reply status updates
    if (body._action === 'mark_read') {
      markReplyRead(body.reply_id)
      return demoResponse({ success: true })
    }
    if (body._action === 'mark_resolved') {
      markReplyResolved(body.reply_id, body.director_reply)
      return demoResponse({ success: true })
    }

    const updated = updateDirectorAnnouncement(id, body)
    if (!updated) return NextResponse.json({ error: 'Không tìm thấy.' }, { status: 404 })
    return demoResponse(updated)
  }

  // ── Supabase mode ──
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Bạn chưa đăng nhập.' }, { status: 401 })

    const { data: citizen } = await supabase.from('citizens').select('role').eq('id', user.id).single()
    if (!citizen || !isDirectorRole(citizen.role)) {
      return NextResponse.json({ error: 'Bạn không có quyền truy cập.' }, { status: 403 })
    }

    const body = await request.json()
    const { data, error } = await supabase
      .from('director_announcements')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', id).select().single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Lỗi không xác định'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // ── Demo mode ──
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()
    if (!isDirectorRole(demoUser.role)) return demoForbidden()

    deleteDirectorAnnouncement(id)
    return demoResponse({ success: true, id })
  }

  // ── Supabase mode ── soft delete
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Bạn chưa đăng nhập.' }, { status: 401 })

    const { data: citizen } = await supabase.from('citizens').select('role').eq('id', user.id).single()
    if (!citizen || !isDirectorRole(citizen.role)) {
      return NextResponse.json({ error: 'Bạn không có quyền truy cập.' }, { status: 403 })
    }

    const { error } = await supabase
      .from('director_announcements')
      .update({ is_deleted: true, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ success: true, id })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Lỗi không xác định'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
