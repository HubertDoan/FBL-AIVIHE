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

// POST /api/notifications — create notification
// Supports: user_id (single user) OR targetRole (all users with that role)
// Members can send to 'doctor' role (ask family doctor)
export async function POST(request: NextRequest) {
  if (isDemoMode()) {
    const user = await getDemoUser(request)
    if (!user) return demoUnauthorized()

    const body = await request.json()
    if (!body.title) {
      return demoResponse({ error: 'Thiếu title.' }, 400)
    }

    // Send to a specific role (e.g. doctor)
    if (body.targetRole) {
      const { DEMO_ACCOUNTS } = await import('@/lib/demo/demo-accounts')
      const targets = DEMO_ACCOUNTS.filter((a) => a.role === body.targetRole)
      const notifications = targets.map((t) =>
        addNotification(t.id, body.title, body.content ?? '')
      )
      return demoResponse({ sent: notifications.length }, 201)
    }

    // Send to specific user
    if (!body.user_id) {
      return demoResponse({ error: 'Thiếu user_id hoặc targetRole.' }, 400)
    }
    const notif = addNotification(body.user_id, body.title, body.content ?? '')
    return demoResponse(notif, 201)
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 })

    const body = await request.json()
    if (!body.title) {
      return NextResponse.json({ error: 'Thiếu title.' }, { status: 400 })
    }

    // Send to role group
    if (body.targetRole) {
      const { data: targets } = await supabase
        .from('citizens')
        .select('id')
        .eq('role', body.targetRole)
      const inserts = (targets ?? []).map((t: { id: string }) => ({
        user_id: t.id, title: body.title, content: body.content ?? '',
      }))
      if (inserts.length > 0) {
        await supabase.from('notifications').insert(inserts)
      }
      return NextResponse.json({ sent: inserts.length }, { status: 201 })
    }

    // Send to specific user
    if (!body.user_id) {
      return NextResponse.json({ error: 'Thiếu user_id hoặc targetRole.' }, { status: 400 })
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
