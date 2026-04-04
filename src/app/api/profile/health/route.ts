import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateHealthProfileSchema } from '@/lib/validators/profile-schemas'
import { logActionSafe } from '@/lib/utils/audit-logger'
import { isDemoMode, getDemoUser, demoResponse, demoUnauthorized } from '@/lib/demo/demo-api-helper'
import { getDemoHealthProfile } from '@/lib/demo/demo-data'

export async function GET(request: NextRequest) {
  // ── Demo mode ──
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()
    return demoResponse(getDemoHealthProfile(demoUser.id) ?? null)
  }

  // ── Supabase mode ──
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Bạn chưa đăng nhập.' }, { status: 401 })
    }

    const { data: citizen } = await supabase
      .from('citizens')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!citizen) {
      return NextResponse.json({ error: 'Không tìm thấy hồ sơ công dân.' }, { status: 404 })
    }

    const { data: healthProfile } = await supabase
      .from('health_profiles')
      .select('*')
      .eq('citizen_id', citizen.id)
      .single()

    return NextResponse.json(healthProfile ?? null)
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi không xác định'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  // ── Demo mode: read-only ──
  if (isDemoMode()) {
    return demoResponse({ error: 'Chế độ demo không hỗ trợ cập nhật hồ sơ sức khỏe.' }, 400)
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

    const parsed = updateHealthProfileSchema.safeParse({ ...body, citizenId: citizen.id })

    if (!parsed.success) {
      const msg = parsed.error.issues.map((i) => i.message).join('; ')
      return NextResponse.json({ error: msg }, { status: 400 })
    }

    const { citizenId: _, ...fields } = parsed.data

    const upsertData: Record<string, unknown> = { citizen_id: citizen.id }
    if (fields.bloodType !== undefined) upsertData.blood_type = fields.bloodType
    if (fields.heightCm !== undefined) upsertData.height_cm = fields.heightCm
    if (fields.weightKg !== undefined) upsertData.weight_kg = fields.weightKg
    if (fields.allergies !== undefined) upsertData.allergies = fields.allergies
    if (fields.disabilities !== undefined) upsertData.disabilities = fields.disabilities
    if (fields.chronicConditions !== undefined) upsertData.chronic_conditions = fields.chronicConditions
    if (fields.currentMedications !== undefined) upsertData.current_medications = fields.currentMedications
    if (fields.pregnancyStatus !== undefined) upsertData.pregnancy_status = fields.pregnancyStatus
    if (fields.organDonationStatus !== undefined) upsertData.organ_donation_status = fields.organDonationStatus
    if (fields.lifestyleNotes !== undefined) upsertData.lifestyle_notes = fields.lifestyleNotes

    upsertData.updated_at = new Date().toISOString()

    const { data: result, error: upsertErr } = await supabase
      .from('health_profiles')
      .upsert(upsertData, { onConflict: 'citizen_id' })
      .select()
      .single()

    if (upsertErr) {
      return NextResponse.json(
        { error: 'Cập nhật hồ sơ sức khỏe thất bại: ' + upsertErr.message },
        { status: 500 },
      )
    }

    await logActionSafe({
      userId: user.id,
      action: 'upsert_health_profile',
      targetTable: 'health_profiles',
      targetId: result.id,
      details: { updatedFields: Object.keys(upsertData) },
    })

    return NextResponse.json(result)
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi không xác định'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
