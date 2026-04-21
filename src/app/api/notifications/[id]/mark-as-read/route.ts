// PATCH /api/notifications/[id]/mark-as-read
// Mark a single notification as read — only owner can update their own notification

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  isDemoMode,
  getDemoUser,
  demoResponse,
  demoUnauthorized,
} from '@/lib/demo/demo-api-helper'
import { markNotificationRead } from '@/lib/demo/demo-notification-data'

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // ── Demo mode ──
  if (isDemoMode()) {
    const user = await getDemoUser(_request)
    if (!user) return demoUnauthorized()
    const ok = markNotificationRead(id)
    if (!ok) return NextResponse.json({ error: 'Không tìm thấy thông báo.' }, { status: 404 })
    return demoResponse({ success: true })
  }

  // ── Supabase mode ──
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 })

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', user.id) // RLS: owner only

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Lỗi máy chủ' }, { status: 500 })
  }
}

// Also support POST for legacy callers (existing notifications page uses POST /api/notifications/[id]/read)
export { PATCH as POST }
