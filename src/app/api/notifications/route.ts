// Notifications API: list, create, mark-as-read
// Demo mode uses in-memory store from demo-notification-data.ts
// Production mode uses Supabase notifications table

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
  getNotifications,
  addNotification,
  markNotificationRead,
} from '@/lib/demo/demo-notification-data'

// GET /api/notifications — list notifications for current user
export async function GET(request: NextRequest) {
  if (isDemoMode()) {
    const user = await getDemoUser(request)
    if (!user) return demoUnauthorized()
    const notifications = getNotifications(user.id)
    const unread_count = notifications.filter((n) => !n.is_read).length
    return demoResponse({ notifications, unread_count })
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 })

    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const unread_count = (notifications ?? []).filter((n) => !n.is_read).length
    return NextResponse.json({ notifications: notifications ?? [], unread_count })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Lỗi máy chủ' }, { status: 500 })
  }
}

// POST /api/notifications — create notification (admin only)
export async function POST(request: NextRequest) {
  if (isDemoMode()) {
    const user = await getDemoUser(request)
    if (!user) return demoUnauthorized()
    if (!hasAdminAccess(user.role)) return demoForbidden()

    const body = await request.json()
    if (!body.user_id || !body.title) {
      return demoResponse({ error: 'Thiếu user_id hoặc title.' }, 400)
    }

    const notif = addNotification(body.user_id, body.title, body.content ?? '')
    return demoResponse(notif, 201)
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 })

    const { data: citizen } = await supabase
      .from('citizens')
      .select('role')
      .eq('auth_id', user.id)
      .single()
    if (!citizen || !hasAdminAccess(citizen.role)) {
      return NextResponse.json({ error: 'Không có quyền tạo thông báo.' }, { status: 403 })
    }

    const body = await request.json()
    if (!body.user_id || !body.title) {
      return NextResponse.json({ error: 'Thiếu user_id hoặc title.' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('notifications')
      .insert({ user_id: body.user_id, title: body.title, content: body.content ?? '' })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Lỗi máy chủ' }, { status: 500 })
  }
}

// PATCH /api/notifications — mark notification as read
export async function PATCH(request: NextRequest) {
  if (isDemoMode()) {
    const user = await getDemoUser(request)
    if (!user) return demoUnauthorized()

    const body = await request.json()
    if (!body.id) return demoResponse({ error: 'Thiếu notification id.' }, 400)

    const ok = markNotificationRead(body.id)
    if (!ok) return demoResponse({ error: 'Không tìm thấy thông báo.' }, 404)
    return demoResponse({ success: true })
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 })

    const body = await request.json()
    if (!body.id) return NextResponse.json({ error: 'Thiếu notification id.' }, { status: 400 })

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', body.id)
      .eq('user_id', user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Lỗi máy chủ' }, { status: 500 })
  }
}
