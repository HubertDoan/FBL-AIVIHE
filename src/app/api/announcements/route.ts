// Public announcements API — returns published announcements visible to current user
// Filters by target_type (all / group matching user role / individual by citizenId)
// Returns reply_count and allow_reply fields for frontend display

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  isDemoMode,
  getDemoUser,
  demoResponse,
} from '@/lib/demo/demo-api-helper'
import {
  demoAnnouncementsStore,
  getDemoReplyCount,
} from '@/lib/demo/demo-announcement-data'

// Map internal demo role to target group name used in announcements
function mapRoleToGroup(role: string): string {
  const map: Record<string, string> = {
    citizen: 'member',
    doctor: 'doctor',
    admin: 'staff',
    staff: 'staff',
    branch_director: 'branch_director',
    director: 'director',
    super_admin: 'director',
    reception: 'staff',
    exam_doctor: 'doctor',
    guest: 'guest',
  }
  return map[role] ?? 'guest'
}

export async function GET(request: NextRequest) {
  // ── Demo mode ──
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    const userRole = demoUser?.role ?? 'guest'
    const mappedGroup = mapRoleToGroup(userRole)
    const citizenId = demoUser?.citizenId ?? null

    const visible = demoAnnouncementsStore.filter((a) => {
      if (!a.is_published) return false
      if (a.target_type === 'all') return true
      if (a.target_type === 'group') return a.target_groups.includes(mappedGroup)
      if (a.target_type === 'individual') return !!citizenId && a.target_citizen_id === citizenId
      return false
    })

    const result = visible.map((a) => ({
      id: a.id,
      title: a.title,
      content: a.content,
      category: a.category,
      target_type: a.target_type,
      priority: a.priority,
      allow_reply: a.allow_reply,
      attachments_note: a.attachments_note,
      published_at: a.published_at,
      reply_count: getDemoReplyCount(a.id),
    }))

    return demoResponse(result)
  }

  // ── Supabase mode ──
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let mappedGroup = 'guest'
    let citizenId: string | null = null

    if (user) {
      citizenId = user.id
      const { data: citizen } = await supabase
        .from('citizens')
        .select('role')
        .eq('id', user.id)
        .single()
      if (citizen) mappedGroup = mapRoleToGroup(citizen.role)
    }

    const conditions = [
      'target_type.eq.all',
      `and(target_type.eq.group,target_groups.cs.{${mappedGroup}})`,
    ]
    if (citizenId) {
      conditions.push(`and(target_type.eq.individual,target_citizen_id.eq.${citizenId})`)
    }

    const { data, error } = await supabase
      .from('announcements')
      .select('id, title, content, category, target_type, priority, allow_reply, attachments_note, published_at, reply_count')
      .eq('is_published', true)
      .or(conditions.join(','))
      .order('published_at', { ascending: false })
      .limit(20)

    if (error) throw error
    return NextResponse.json(data ?? [])
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Lỗi không xác định'
    return NextResponse.json({ error: 'Lỗi lấy thông báo: ' + message }, { status: 500 })
  }
}
