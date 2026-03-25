// API route for announcement replies
// GET  /api/announcements/[id]/replies  — list replies (admin sees all, user sees own)
// POST /api/announcements/[id]/replies  — submit a reply (authenticated users)

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  isDemoMode,
  getDemoUser,
  demoResponse,
  demoUnauthorized,
} from '@/lib/demo/demo-api-helper'
import {
  demoAnnouncementsStore,
  demoRepliesStore,
  type DemoAnnouncementReply,
} from '@/lib/demo/demo-announcement-data'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { id } = await params

  // ── Demo mode ──
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()

    const isAdmin = ['admin', 'director', 'branch_director', 'super_admin'].includes(demoUser.role)
    const replies = demoRepliesStore.filter((r) => r.announcement_id === id)
    const visible = isAdmin ? replies : replies.filter((r) => r.user_id === demoUser.id)

    return demoResponse(visible)
  }

  // ── Supabase mode ──
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Bạn chưa đăng nhập.' }, { status: 401 })

    const { data: citizen } = await supabase
      .from('citizens')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = ['admin', 'director', 'branch_director', 'super_admin'].includes(citizen?.role ?? '')

    let query = supabase
      .from('announcement_replies')
      .select('*')
      .eq('announcement_id', id)
      .order('created_at', { ascending: true })

    if (!isAdmin) {
      query = query.eq('user_id', user.id)
    }

    const { data, error } = await query
    if (error) throw error
    return NextResponse.json(data ?? [])
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Lỗi không xác định'
    return NextResponse.json({ error: 'Lỗi lấy phản hồi: ' + message }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const { id } = await params

  // ── Demo mode ──
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()

    // Check announcement exists and allows replies
    const ann = demoAnnouncementsStore.find((a) => a.id === id)
    if (!ann) return NextResponse.json({ error: 'Không tìm thấy thông báo.' }, { status: 404 })
    if (!ann.allow_reply) {
      return NextResponse.json({ error: 'Thông báo này không cho phép phản hồi.' }, { status: 400 })
    }

    const body = await request.json()
    if (!body.content?.trim()) {
      return NextResponse.json({ error: 'Nội dung phản hồi không được để trống.' }, { status: 400 })
    }

    const reply: DemoAnnouncementReply = {
      id: `reply-${Date.now()}`,
      announcement_id: id,
      user_id: demoUser.id,
      user_name: demoUser.fullName,
      user_role: demoUser.role,
      content: body.content.trim(),
      created_at: new Date().toISOString(),
      admin_response: null,
      admin_name: null,
      admin_responded_at: null,
    }

    demoRepliesStore.push(reply)
    ann.reply_count = demoRepliesStore.filter((r) => r.announcement_id === id).length

    return demoResponse(reply, 201)
  }

  // ── Supabase mode ──
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Bạn chưa đăng nhập.' }, { status: 401 })

    const { data: ann } = await supabase
      .from('announcements')
      .select('allow_reply')
      .eq('id', id)
      .single()

    if (!ann) return NextResponse.json({ error: 'Không tìm thấy thông báo.' }, { status: 404 })
    if (!ann.allow_reply) {
      return NextResponse.json({ error: 'Thông báo này không cho phép phản hồi.' }, { status: 400 })
    }

    const body = await request.json()
    if (!body.content?.trim()) {
      return NextResponse.json({ error: 'Nội dung phản hồi không được để trống.' }, { status: 400 })
    }

    const { data: citizen } = await supabase
      .from('citizens')
      .select('full_name, role')
      .eq('id', user.id)
      .single()

    const { data, error } = await supabase
      .from('announcement_replies')
      .insert({
        announcement_id: id,
        user_id: user.id,
        user_name: citizen?.full_name ?? 'Người dùng',
        user_role: citizen?.role ?? 'citizen',
        content: body.content.trim(),
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Lỗi không xác định'
    return NextResponse.json({ error: 'Lỗi gửi phản hồi: ' + message }, { status: 500 })
  }
}
