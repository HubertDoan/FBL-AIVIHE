import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { respondInvitationSchema } from '@/lib/validators/family-schemas'
import { isDemoMode, getDemoUser, demoResponse, demoUnauthorized } from '@/lib/demo/demo-api-helper'
import { respondDemoInvitation } from '@/lib/demo/demo-invitation-data'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: invitationId } = await params

  // ── Demo mode ──
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()
    const body = await request.json()
    const parsed = respondInvitationSchema.safeParse(body)
    if (!parsed.success) {
      return demoResponse({ error: 'Hành động không hợp lệ.' }, 400)
    }
    const result = respondDemoInvitation(demoUser.id, invitationId, parsed.data.action)
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
    const parsed = respondInvitationSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Hành động không hợp lệ.' }, { status: 400 })
    }

    const { data: citizen } = await supabase
      .from('citizens').select('id').eq('id', user.id).single()
    if (!citizen) {
      return NextResponse.json({ error: 'Không tìm thấy hồ sơ.' }, { status: 404 })
    }

    // Get the invitation
    const { data: invitation } = await supabase
      .from('family_invitations')
      .select('*')
      .eq('id', invitationId)
      .eq('invitee_id', citizen.id)
      .eq('status', 'pending')
      .single()

    if (!invitation) {
      return NextResponse.json(
        { error: 'Không tìm thấy lời mời hoặc đã được xử lý.' },
        { status: 404 }
      )
    }

    const { action } = parsed.data

    if (action === 'accept') {
      // Add invitee as family member
      const { error: memberErr } = await supabase.from('family_members').insert({
        citizen_id: citizen.id,
        family_id: invitation.family_id,
        role: 'member',
        relationship: invitation.relationship,
        permissions: { can_view: true, can_edit: false, can_upload: true },
      })
      if (memberErr) {
        return NextResponse.json(
          { error: 'Không thể thêm vào gia đình: ' + memberErr.message },
          { status: 500 }
        )
      }
    }

    // Update invitation status
    const { data: updated, error: updateErr } = await supabase
      .from('family_invitations')
      .update({
        status: action === 'accept' ? 'accepted' : 'declined',
        responded_at: new Date().toISOString(),
      })
      .eq('id', invitationId)
      .select()
      .single()

    if (updateErr) {
      return NextResponse.json(
        { error: 'Cập nhật lời mời thất bại.' },
        { status: 500 }
      )
    }

    return NextResponse.json(updated)
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi không xác định'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
