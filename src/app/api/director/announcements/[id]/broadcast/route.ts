// POST /api/director/announcements/[id]/broadcast
// Fan-out director announcement into notifications table for each targeted member
// Supports: all, by-service (member_package), by-location (province+commune)
// Chunk size: 500 inserts per batch to avoid DB timeouts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  isDemoMode,
  getDemoUser,
  demoResponse,
  demoUnauthorized,
  demoForbidden,
} from '@/lib/demo/demo-api-helper'
import { getDirectorAnnouncementById } from '@/lib/demo/demo-director-announcement-data'
import { addNotification } from '@/lib/demo/demo-notification-data'
import { DEMO_ACCOUNTS } from '@/lib/demo/demo-accounts'

const DIRECTOR_ROLES = ['director', 'branch_director', 'super_admin'] as const
const CHUNK_SIZE = 500

function isDirectorRole(role: string): boolean {
  return (DIRECTOR_ROLES as readonly string[]).includes(role)
}

export interface BroadcastTarget {
  type: 'all' | 'by-service' | 'by-location'
  services?: string[]   // FD, RH, DC, SP
  province?: string
  commune?: string
}

export async function POST(
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
    if (!ann) return NextResponse.json({ error: 'Không tìm thấy thông báo.' }, { status: 404 })

    const body: BroadcastTarget = await request.json().catch(() => ({ type: 'all' }))

    // Filter citizen accounts in demo
    let targets = DEMO_ACCOUNTS.filter((a) => a.role === 'citizen')
    if (body.type === 'by-service' && body.services?.length) {
      // Demo: no service data, just use all citizens as approximation
      targets = targets
    }
    // by-location: demo has no province data, fall back to all citizens

    const sent = targets.map((t) =>
      addNotification(t.id, ann.title, ann.content)
    )

    return demoResponse({ sent: sent.length, announcement_id: id }, 200)
  }

  // ── Supabase mode ──
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Bạn chưa đăng nhập.' }, { status: 401 })

    const { data: citizen } = await supabase
      .from('citizens')
      .select('role, full_name')
      .eq('id', user.id)
      .single()
    if (!citizen || !isDirectorRole(citizen.role)) {
      return NextResponse.json({ error: 'Bạn không có quyền.' }, { status: 403 })
    }

    // Fetch announcement
    const { data: ann, error: annErr } = await supabase
      .from('director_announcements')
      .select('id, title, content, category')
      .eq('id', id)
      .single()
    if (annErr || !ann) {
      return NextResponse.json({ error: 'Không tìm thấy thông báo.' }, { status: 404 })
    }

    const body: BroadcastTarget = await request.json().catch(() => ({ type: 'all' }))

    // Build target query
    let query = supabase
      .from('citizens')
      .select('id')
      .eq('role', 'member')

    if (body.type === 'by-service' && body.services?.length) {
      query = query.in('member_package', body.services)
    } else if (body.type === 'by-location') {
      if (body.province) query = query.eq('province', body.province)
      if (body.commune) query = query.eq('commune', body.commune)
    }

    const { data: targets, error: targetsErr } = await query
    if (targetsErr) throw targetsErr

    if (!targets || targets.length === 0) {
      // Mark as published even with 0 targets
      await supabase
        .from('director_announcements')
        .update({ is_published: true, updated_at: new Date().toISOString() })
        .eq('id', id)
      return NextResponse.json({ sent: 0, announcement_id: id })
    }

    // Chunk insert to avoid DB timeouts
    const notifRows = targets.map((t: { id: string }) => ({
      user_id: t.id,
      title: ann.title,
      content: ann.content ?? '',
      category: ann.category ?? 'director',
    }))

    let totalSent = 0
    for (let i = 0; i < notifRows.length; i += CHUNK_SIZE) {
      const chunk = notifRows.slice(i, i + CHUNK_SIZE)
      const { error: insertErr } = await supabase.from('notifications').insert(chunk)
      if (insertErr) throw insertErr
      totalSent += chunk.length
    }

    // Mark announcement as published
    await supabase
      .from('director_announcements')
      .update({ is_published: true, updated_at: new Date().toISOString() })
      .eq('id', id)

    return NextResponse.json({ sent: totalSent, announcement_id: id })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Lỗi không xác định'
    return NextResponse.json({ error: 'Lỗi broadcast: ' + message }, { status: 500 })
  }
}
