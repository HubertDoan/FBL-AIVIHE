import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { familySchema } from '@/lib/validators/family-schemas'
import { isDemoMode, getDemoUser, demoResponse, demoUnauthorized } from '@/lib/demo/demo-api-helper'
import { getDemoFamilyMemberships } from '@/lib/demo/demo-data'

export async function GET(request: NextRequest) {
  // ── Demo mode ──
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()
    return demoResponse(getDemoFamilyMemberships(demoUser.id))
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

    const { data: memberships } = await supabase
      .from('family_members')
      .select('family_id, role, families(id, name, created_at)')
      .eq('citizen_id', citizen.id)

    return NextResponse.json(memberships ?? [])
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi không xác định'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // ── Demo mode ── (POST not supported in demo, return mock)
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()
    return demoResponse({ error: 'Tính năng tạo gia đình không khả dụng trong chế độ demo.' }, 400)
  }

  // ── Supabase mode ──
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Bạn chưa đăng nhập.' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = familySchema.safeParse(body)

    if (!parsed.success) {
      const msg = parsed.error.issues.map((i) => i.message).join('; ')
      return NextResponse.json({ error: msg }, { status: 400 })
    }

    const { data: citizen } = await supabase
      .from('citizens').select('id').eq('auth_id', user.id).single()

    if (!citizen) {
      return NextResponse.json({ error: 'Không tìm thấy hồ sơ.' }, { status: 404 })
    }

    const { data: family, error: famErr } = await supabase
      .from('families')
      .insert({
        name: parsed.data.name,
        family_doctor_name: parsed.data.familyDoctorName ?? null,
        family_doctor_phone: parsed.data.familyDoctorPhone ?? null,
        address: parsed.data.address ?? null,
        created_by: citizen.id,
      })
      .select()
      .single()

    if (famErr) {
      return NextResponse.json({ error: 'Tạo gia đình thất bại: ' + famErr.message }, { status: 500 })
    }

    await supabase.from('family_members').insert({
      citizen_id: citizen.id,
      family_id: family.id,
      role: 'owner',
      relationship: null,
      permissions: { can_view: true, can_edit: true, can_upload: true },
    })

    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'create_family',
      target_table: 'families',
      target_id: family.id,
      details: { name: parsed.data.name },
    })

    return NextResponse.json(family)
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi không xác định'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
