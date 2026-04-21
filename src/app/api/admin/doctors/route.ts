// POST /api/admin/doctors — admin creates a new doctor profile after verifying with real doctor
// GET  /api/admin/doctors — admin lists all doctor profiles with status for management
// Only accessible by admin and super_admin roles

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ADMIN_ROLES = ['admin', 'super_admin']

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Bạn chưa đăng nhập.' }, { status: 401 })
    }

    const { data: admin } = await supabase
      .from('citizens')
      .select('id, role')
      .eq('id', user.id)
      .single()

    if (!admin || !ADMIN_ROLES.includes(admin.role)) {
      return NextResponse.json({ error: 'Chỉ admin mới có quyền xem danh sách bác sĩ.' }, { status: 403 })
    }

    const { data, error } = await supabase
      .from('doctor_profiles')
      .select(`
        id,
        specialty,
        qualification,
        experience_years,
        bio,
        languages,
        available_for_family_doctor,
        avatar_url,
        rating,
        review_count,
        status,
        verified_at,
        created_at,
        citizens!doctor_citizen_id (
          id,
          full_name,
          phone,
          email
        )
      `)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ doctors: data ?? [] })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi không xác định'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Bạn chưa đăng nhập.' }, { status: 401 })
    }

    const { data: admin } = await supabase
      .from('citizens')
      .select('id, role')
      .eq('id', user.id)
      .single()

    if (!admin || !ADMIN_ROLES.includes(admin.role)) {
      return NextResponse.json({ error: 'Chỉ admin mới có quyền tạo hồ sơ bác sĩ.' }, { status: 403 })
    }

    const body = await request.json()
    const {
      doctor_citizen_id,
      specialty,
      qualification,
      experience_years,
      bio,
      languages,
      available_for_family_doctor,
    } = body

    if (!doctor_citizen_id || !specialty || !qualification) {
      return NextResponse.json(
        { error: 'Thiếu thông tin bắt buộc: doctor_citizen_id, specialty, qualification.' },
        { status: 400 }
      )
    }

    // Verify the citizen exists
    const { data: doctorCitizen } = await supabase
      .from('citizens')
      .select('id, full_name, role')
      .eq('id', doctor_citizen_id)
      .single()

    if (!doctorCitizen) {
      return NextResponse.json({ error: 'Không tìm thấy người dùng với ID này.' }, { status: 404 })
    }

    // Ensure citizen role is doctor
    if (doctorCitizen.role !== 'doctor') {
      await supabase
        .from('citizens')
        .update({ role: 'doctor', updated_at: new Date().toISOString() })
        .eq('id', doctor_citizen_id)
    }

    // Check no duplicate profile
    const { data: existing } = await supabase
      .from('doctor_profiles')
      .select('id')
      .eq('doctor_citizen_id', doctor_citizen_id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'Bác sĩ này đã có hồ sơ.' }, { status: 409 })
    }

    const { data: profile, error } = await supabase
      .from('doctor_profiles')
      .insert({
        doctor_citizen_id,
        specialty,
        qualification,
        experience_years: experience_years ?? 0,
        bio: bio ?? null,
        languages: languages ?? ['Tiếng Việt'],
        available_for_family_doctor: available_for_family_doctor ?? false,
        status: 'pending_verification',
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ profile }, { status: 201 })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi không xác định'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
