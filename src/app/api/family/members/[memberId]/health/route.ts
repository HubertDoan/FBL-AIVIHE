import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isDemoMode, getDemoUser, demoResponse, demoUnauthorized } from '@/lib/demo/demo-api-helper'
import { getDemoMemberHealth } from '@/lib/demo/demo-invitation-data'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  const { memberId } = await params

  // ── Demo mode ──
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()
    const result = getDemoMemberHealth(demoUser.id, memberId)
    if ('error' in result) return demoResponse(result, 403)
    return demoResponse(result)
  }

  // ── Supabase mode ──
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Bạn chưa đăng nhập.' }, { status: 401 })
    }

    const { data: requester } = await supabase
      .from('citizens').select('id').eq('id', user.id).single()
    if (!requester) {
      return NextResponse.json({ error: 'Không tìm thấy hồ sơ.' }, { status: 404 })
    }

    // Verify requester is owner of a family containing this member
    const { data: requesterMemberships } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('citizen_id', requester.id)
      .eq('role', 'owner')

    if (!requesterMemberships?.length) {
      return NextResponse.json(
        { error: 'Bạn không có quyền xem thông tin sức khỏe.' },
        { status: 403 }
      )
    }

    const familyIds = requesterMemberships.map((m) => m.family_id)

    // Check if memberId belongs to one of these families
    const { data: targetMember } = await supabase
      .from('family_members')
      .select('citizen_id')
      .eq('id', memberId)
      .in('family_id', familyIds)
      .single()

    if (!targetMember) {
      return NextResponse.json(
        { error: 'Thành viên không thuộc gia đình của bạn.' },
        { status: 403 }
      )
    }

    const citizenId = targetMember.citizen_id

    // Fetch citizen info
    const { data: citizen } = await supabase
      .from('citizens')
      .select('full_name, date_of_birth, gender, phone')
      .eq('id', citizenId)
      .single()

    // Fetch health profile
    const { data: healthProfile } = await supabase
      .from('health_profiles')
      .select('chronic_conditions, current_medications, blood_type, allergies')
      .eq('citizen_id', citizenId)
      .single()

    // Fetch recent health events
    const { data: recentEvents } = await supabase
      .from('health_events')
      .select('event_type, title, event_date, details')
      .eq('citizen_id', citizenId)
      .order('event_date', { ascending: false })
      .limit(5)

    return NextResponse.json({
      citizen,
      healthProfile: healthProfile ?? null,
      recentEvents: recentEvents ?? [],
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi không xác định'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
