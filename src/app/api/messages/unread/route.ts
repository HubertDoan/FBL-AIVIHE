// Messages unread count API: returns total unread message count for current user
// Demo mode: in-memory store from demo-messaging-data.ts
// Production mode: Supabase conversations table

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  isDemoMode,
  getDemoUser,
  demoResponse,
  demoUnauthorized,
} from '@/lib/demo/demo-api-helper'
import { getUnreadCount } from '@/lib/demo/demo-messaging-data'

// GET /api/messages/unread — total unread message count for current user
export async function GET(request: NextRequest) {
  if (isDemoMode()) {
    const user = await getDemoUser(request)
    if (!user) return demoUnauthorized()
    const count = getUnreadCount(user.id)
    return demoResponse({ count })
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 })

    const { data, error } = await supabase
      .from('conversations')
      .select('unread_counts')
      .contains('participant_ids', [user.id])

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const count = (data ?? []).reduce((sum: number, row: { unread_counts: Record<string, number> }) => {
      return sum + (row.unread_counts?.[user.id] ?? 0)
    }, 0)

    return NextResponse.json({ count })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Lỗi máy chủ' }, { status: 500 })
  }
}
