import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createInvitationSchema } from '@/lib/validators/family-schemas'
import { isDemoMode, getDemoUser, demoResponse, demoUnauthorized } from '@/lib/demo/demo-api-helper'
import { getDemoInvitations, addDemoInvitation } from '@/lib/demo/demo-invitation-data'

export async function GET(request: NextRequest) {
  // ── Demo mode ──
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()
    return demoResponse(getDemoInvitations(demoUser.id))
  }

  // ── Supabase mode ──
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Bạn chưa đăng nhập.' }, { status: 401 })
    }

    const { data: citizen } = await supabase
      .from('citizens').select('id').eq('auth_id', user.id).single()
    if (!citizen) {
      return NextResponse.json({ error: 'Không tìm thấy hồ sơ.' }, { status: 404 })
    }

    // Received invitations (pending)
    const { data: received } = await supabase
      .from('family_invitations')
      .select('*, inviter:citizens!inviter_id(full_name)')
      .eq('invitee_id', citizen.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    // Sent invitations
    const { data: sent } = await supabase
      .from('family_invitations')
      .select('*, invitee:citizens!invitee_id(full_name)')
      .eq('inviter_id', citizen.id)
      .order('created_at', { ascending: false })
      .limit(20)

    return NextResponse.json({ received: received ?? [], sent: sent ?? [] })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi không xác định'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // ── Demo mode ──
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()
    const body = await request.json()
    const parsed = createInvitationSchema.safeParse(body)
    if (!parsed.success) {
      const msg = parsed.error.issues.map((i) => i.message).join('; ')
      return demoResponse({ error: msg }, 400)
    }
    const result = addDemoInvitation(demoUser.id, parsed.data)
    if ('error' in result) return demoResponse(result, 400)
    return demoResponse(result)
  }

  // ── Supabase mode ──
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Bạn chưa đăng nhập.' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = createInvitationSchema.safeParse(body)
    if (!parsed.success) {
      const msg = parsed.error.issues.map((i) => i.message).join('; ')
      return NextResponse.json({ error: msg }, { status: 400 })
    }

    const { data: inviterCitizen } = await supabase
      .from('citizens').select('id').eq('auth_id', user.id).single()
    if (!inviterCitizen) {
      return NextResponse.json({ error: 'Không tìm thấy hồ sơ.' }, { status: 404 })
    }

    // Find invitee by phone
    const { data: inviteeCitizen } = await supabase
      .from('citizens').select('id').eq('phone', parsed.data.phone).single()
    if (!inviteeCitizen) {
      return NextResponse.json(
        { error: 'Không tìm thấy người dùng với số điện thoại này.' },
        { status: 404 }
      )
    }

    // Get or create family for inviter
    let familyId: string
    const { data: existing } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('citizen_id', inviterCitizen.id)
      .eq('role', 'owner')
      .single()

    if (existing) {
      familyId = existing.family_id
    } else {
      const { data: newFamily, error: famErr } = await supabase
        .from('families')
        .insert({ name: 'Gia đình', created_by: inviterCitizen.id })
        .select()
        .single()
      if (famErr || !newFamily) {
        return NextResponse.json({ error: 'Không thể tạo gia đình.' }, { status: 500 })
      }
      familyId = newFamily.id
      await supabase.from('family_members').insert({
        citizen_id: inviterCitizen.id,
        family_id: familyId,
        role: 'owner',
        relationship: null,
        permissions: { can_view: true, can_edit: true, can_upload: true },
      })
    }

    // Create invitation
    const { data: invitation, error: invErr } = await supabase
      .from('family_invitations')
      .insert({
        family_id: familyId,
        inviter_id: inviterCitizen.id,
        invitee_id: inviteeCitizen.id,
        invitee_phone: parsed.data.phone,
        relationship: parsed.data.relationship,
        message: parsed.data.message ?? null,
      })
      .select()
      .single()

    if (invErr) {
      return NextResponse.json(
        { error: 'Gửi lời mời thất bại: ' + invErr.message },
        { status: 500 }
      )
    }

    return NextResponse.json(invitation)
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi không xác định'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
