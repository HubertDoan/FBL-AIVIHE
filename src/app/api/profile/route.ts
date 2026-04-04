import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateCitizenSchema } from '@/lib/validators/profile-schemas'
import { logActionSafe } from '@/lib/utils/audit-logger'
import { isDemoMode, getDemoUser, demoResponse, demoUnauthorized } from '@/lib/demo/demo-api-helper'
import { getDemoCitizen, getDemoHealthProfile } from '@/lib/demo/demo-data'

export async function GET(request: NextRequest) {
  // ── Demo mode ──
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()
    const citizen = getDemoCitizen(demoUser.id)
    if (!citizen) return demoResponse({ error: 'Không tìm thấy hồ sơ công dân.' }, 404)
    const healthProfile = getDemoHealthProfile(demoUser.id) ?? null
    return demoResponse({ citizen, healthProfile })
  }

  // ── Supabase mode ──
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Bạn chưa đăng nhập.' }, { status: 401 })
    }

    const { data: citizen, error: citizenErr } = await supabase
      .from('citizens')
      .select('*')
      .eq('id', user.id)
      .single()

    if (citizenErr || !citizen) {
      return NextResponse.json({ error: 'Không tìm thấy hồ sơ công dân.' }, { status: 404 })
    }

    const { data: healthProfile } = await supabase
      .from('health_profiles')
      .select('*')
      .eq('citizen_id', citizen.id)
      .single()

    return NextResponse.json({
      citizen,
      healthProfile: healthProfile ?? null,
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi không xác định'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  // ── Demo mode: read-only ──
  if (isDemoMode()) {
    return demoResponse({ error: 'Chế độ demo không hỗ trợ cập nhật hồ sơ.' }, 400)
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Bạn chưa đăng nhập.' }, { status: 401 })
    }

    const body = await request.json()

    const { data: citizen } = await supabase
      .from('citizens')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!citizen) {
      return NextResponse.json({ error: 'Không tìm thấy hồ sơ công dân.' }, { status: 404 })
    }

    const parsed = updateCitizenSchema.safeParse({ ...body, citizenId: citizen.id })

    if (!parsed.success) {
      const msg = parsed.error.issues.map((i) => i.message).join('; ')
      return NextResponse.json({ error: msg }, { status: 400 })
    }

    const { citizenId: _, ...fields } = parsed.data

    const updateData: Record<string, unknown> = {}
    if (fields.fullName !== undefined) updateData.full_name = fields.fullName
    if (fields.dateOfBirth !== undefined) updateData.date_of_birth = fields.dateOfBirth
    if (fields.gender !== undefined) updateData.gender = fields.gender
    if (fields.nationalId !== undefined) updateData.national_id = fields.nationalId
    if (fields.phone !== undefined) updateData.phone = fields.phone
    if (fields.email !== undefined) updateData.email = fields.email
    if (fields.address !== undefined) updateData.address = fields.address
    if (fields.ethnicity !== undefined) updateData.ethnicity = fields.ethnicity
    if (fields.occupation !== undefined) updateData.occupation = fields.occupation

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'Không có thông tin cần cập nhật.' }, { status: 400 })
    }

    updateData.updated_at = new Date().toISOString()

    const { data: updated, error: updateErr } = await supabase
      .from('citizens')
      .update(updateData)
      .eq('id', citizen.id)
      .select()
      .single()

    if (updateErr) {
      return NextResponse.json(
        { error: 'Cập nhật hồ sơ thất bại: ' + updateErr.message },
        { status: 500 },
      )
    }

    await logActionSafe({
      userId: user.id,
      action: 'update_citizen',
      targetTable: 'citizens',
      targetId: citizen.id,
      details: { updatedFields: Object.keys(updateData) },
    })

    return NextResponse.json(updated)
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi không xác định'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
