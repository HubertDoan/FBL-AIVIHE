import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { inviteMemberSchema, updateFamilyMemberSchema } from '@/lib/validators/family-schemas'
import { isDemoMode, getDemoUser, demoResponse, demoUnauthorized } from '@/lib/demo/demo-api-helper'
import { getDemoFamilyMembers } from '@/lib/demo/demo-data'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const familyId = searchParams.get('familyId')

  // ── Demo mode ──
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()
    if (!familyId) return demoResponse({ error: 'Thiếu familyId.' }, 400)
    return demoResponse(getDemoFamilyMembers(familyId))
  }

  // ── Supabase mode ── (no GET in original, return empty)
  return NextResponse.json([])
}

export async function POST(request: NextRequest) {
  // ── Demo mode ──
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()
    return demoResponse({ error: 'Tính năng thêm thành viên không khả dụng trong chế độ demo.' }, 400)
  }

  // ── Supabase mode ──
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Bạn chưa đăng nhập.' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = inviteMemberSchema.safeParse(body)

    if (!parsed.success) {
      const msg = parsed.error.issues.map((i) => i.message).join('; ')
      return NextResponse.json({ error: msg }, { status: 400 })
    }

    const { familyId, phone, role, relationship } = parsed.data

    // Verify caller is owner/manager of this family
    const { data: callerCitizen } = await supabase
      .from('citizens').select('id').eq('id', user.id).single()

    if (!callerCitizen) {
      return NextResponse.json({ error: 'Không tìm thấy hồ sơ.' }, { status: 404 })
    }

    const { data: callerMember } = await supabase
      .from('family_members')
      .select('role')
      .eq('citizen_id', callerCitizen.id)
      .eq('family_id', familyId)
      .single()

    if (!callerMember || !['owner', 'manager'].includes(callerMember.role)) {
      return NextResponse.json({ error: 'Bạn không có quyền thêm thành viên.' }, { status: 403 })
    }

    // Find citizen by phone
    const { data: targetCitizen } = await supabase
      .from('citizens').select('id').eq('phone', phone).single()

    if (!targetCitizen) {
      return NextResponse.json(
        { error: 'Không tìm thấy người dùng với số điện thoại này.' },
        { status: 404 }
      )
    }

    // Check if already a member
    const { data: existing } = await supabase
      .from('family_members')
      .select('id')
      .eq('citizen_id', targetCitizen.id)
      .eq('family_id', familyId)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Người này đã là thành viên.' }, { status: 409 })
    }

    const permissions = role === 'manager'
      ? { can_view: true, can_edit: true, can_upload: true }
      : role === 'viewer'
        ? { can_view: true, can_edit: false, can_upload: false }
        : { can_view: true, can_edit: false, can_upload: true }

    const { data: member, error: insertErr } = await supabase
      .from('family_members')
      .insert({
        citizen_id: targetCitizen.id,
        family_id: familyId,
        role,
        relationship: relationship ?? null,
        permissions,
      })
      .select()
      .single()

    if (insertErr) {
      return NextResponse.json({ error: 'Thêm thành viên thất bại: ' + insertErr.message }, { status: 500 })
    }

    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'add_family_member',
      target_table: 'family_members',
      target_id: member.id,
      details: { phone, role, relationship },
    })

    return NextResponse.json(member)
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi không xác định'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  // ── Demo mode ──
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()
    return demoResponse({ error: 'Tính năng cập nhật thành viên không khả dụng trong chế độ demo.' }, 400)
  }

  // ── Supabase mode ──
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Bạn chưa đăng nhập.' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = updateFamilyMemberSchema.safeParse(body)

    if (!parsed.success) {
      const msg = parsed.error.issues.map((i) => i.message).join('; ')
      return NextResponse.json({ error: msg }, { status: 400 })
    }

    const { memberId, role, relationship, permissions } = parsed.data

    const updates: Record<string, unknown> = {}
    if (role) updates.role = role
    if (relationship !== undefined) updates.relationship = relationship
    if (permissions) updates.permissions = permissions

    const { data: updated, error: updateErr } = await supabase
      .from('family_members')
      .update(updates)
      .eq('id', memberId)
      .select()
      .single()

    if (updateErr) {
      return NextResponse.json({ error: 'Cập nhật thất bại: ' + updateErr.message }, { status: 500 })
    }

    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'update_family_member',
      target_table: 'family_members',
      target_id: memberId,
      details: updates,
    })

    return NextResponse.json(updated)
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi không xác định'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
