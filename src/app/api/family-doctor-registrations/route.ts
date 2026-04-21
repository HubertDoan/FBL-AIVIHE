// POST /api/family-doctor-registrations — citizen submits registration request for a family doctor
// GET  /api/family-doctor-registrations — director/admin views pending queue
// Both endpoints require authentication; POST validates no duplicate pending/approved registration

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const STAFF_ROLES = ['director', 'branch_director', 'admin', 'super_admin']

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Bạn chưa đăng nhập.' }, { status: 401 })
    }

    const { data: myCitizen } = await supabase
      .from('citizens')
      .select('id, role')
      .eq('id', user.id)
      .single()

    if (!myCitizen) {
      return NextResponse.json({ error: 'Không tìm thấy hồ sơ người dùng.' }, { status: 404 })
    }

    const url = new URL(request.url)
    const status = url.searchParams.get('status') ?? 'pending'

    // Citizens can see their own registrations
    if (!STAFF_ROLES.includes(myCitizen.role)) {
      const { data, error } = await supabase
        .from('family_doctor_registrations')
        .select(`
          id, status, requested_at, approved_at, notes, rejected_reason,
          doctor:doctor_id (
            id, full_name, phone,
            doctor_profiles ( specialty, qualification, avatar_url )
          )
        `)
        .eq('citizen_id', myCitizen.id)
        .order('requested_at', { ascending: false })

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ registrations: data ?? [] })
    }

    // Staff see queue with citizen + doctor info
    let query = supabase
      .from('family_doctor_registrations')
      .select(`
        id, status, requested_at, approved_at, notes, rejected_reason,
        citizen:citizen_id ( id, full_name, phone ),
        doctor:doctor_id (
          id, full_name, phone,
          doctor_profiles ( specialty, qualification )
        ),
        approver:approved_by ( id, full_name )
      `)
      .order('requested_at', { ascending: false })

    if (status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ registrations: data ?? [] })
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

    const body = await request.json()
    const { doctor_id, notes } = body

    if (!doctor_id) {
      return NextResponse.json({ error: 'Thiếu doctor_id.' }, { status: 400 })
    }

    // Verify doctor is active and available
    const { data: doctorProfile } = await supabase
      .from('doctor_profiles')
      .select('id, status, available_for_family_doctor, doctor_citizen_id')
      .eq('doctor_citizen_id', doctor_id)
      .single()

    if (!doctorProfile || doctorProfile.status !== 'active' || !doctorProfile.available_for_family_doctor) {
      return NextResponse.json({ error: 'Bác sĩ không khả dụng để đăng ký BS gia đình.' }, { status: 400 })
    }

    // Check for duplicate pending/approved registration (partial unique index handles DB side too)
    const { data: existing } = await supabase
      .from('family_doctor_registrations')
      .select('id, status')
      .eq('citizen_id', user.id)
      .eq('doctor_id', doctor_id)
      .in('status', ['pending', 'approved'])
      .maybeSingle()

    if (existing) {
      const msg = existing.status === 'approved'
        ? 'Bạn đã được duyệt làm bệnh nhân của bác sĩ này.'
        : 'Bạn đã gửi yêu cầu đến bác sĩ này, vui lòng chờ duyệt.'
      return NextResponse.json({ error: msg }, { status: 409 })
    }

    const { data: registration, error } = await supabase
      .from('family_doctor_registrations')
      .insert({
        citizen_id: user.id,
        doctor_id,
        status: 'pending',
        notes: notes ?? null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ registration }, { status: 201 })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi không xác định'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
