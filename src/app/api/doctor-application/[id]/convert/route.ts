import { NextRequest, NextResponse } from 'next/server'
import { isDemoMode } from '@/lib/demo/demo-api-helper'
import {
  getDoctorRegistrationRequestById,
  updateDoctorRegistrationRequest,
} from '@/lib/demo/demo-doctor-registration-request-in-memory-store'

/**
 * POST /api/doctor-application/[id]/convert
 * Director approves and creates auth user + citizen + doctor_profile.
 * Only allowed when status === 'approved'.
 * Returns the new doctor citizen id.
 */

const DIRECTOR_ROLES = ['director', 'branch_director', 'super_admin']

function getDemoSession(request: NextRequest): { id: string; role: string; full_name?: string } | null {
  const cookie = request.cookies.get('demo-auth-session')
  if (!cookie?.value) return null
  try { return JSON.parse(cookie.value) } catch { return null }
}

const DOCTOR_TYPE_LABEL: Record<string, string> = {
  general: 'BS Đa khoa',
  oriental: 'BS Đông y',
  family_medicine: 'BS Y học Gia đình',
  specialist: 'BS Chuyên khoa',
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (isDemoMode()) {
    const user = getDemoSession(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!DIRECTOR_ROLES.includes(user.role)) {
      return NextResponse.json({ error: 'Chỉ Giám đốc mới có thể tạo tài khoản bác sĩ' }, { status: 403 })
    }

    const req = getDoctorRegistrationRequestById(id)
    if (!req) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (req.status !== 'approved') {
      return NextResponse.json({ error: 'Yêu cầu chưa được duyệt' }, { status: 400 })
    }
    if (req.converted_to_doctor_id) {
      return NextResponse.json({ error: 'Tài khoản đã được tạo trước đó', doctor_id: req.converted_to_doctor_id }, { status: 409 })
    }

    // Demo: simulate creating doctor account
    const fakeDocId = `doctor-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    updateDoctorRegistrationRequest(id, {
      status: 'converted',
      converted_to_doctor_id: fakeDocId,
    })

    return NextResponse.json({
      ok: true,
      message: `Đã tạo tài khoản bác sĩ cho ${req.full_name}`,
      doctor_id: fakeDocId,
      note: 'Demo mode — tài khoản thực sẽ được tạo qua Supabase Auth khi deploy production',
    })
  }

  // Production: create real Supabase auth user + citizen + doctor_profile
  const { createServiceClient } = await import('@/lib/supabase/server')
  const supabase = await createServiceClient()

  // Auth check
  const { createClient } = await import('@/lib/supabase/server')
  const supabaseUser = await createClient()
  const { data: { user } } = await supabaseUser.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: director } = await supabase
    .from('citizens').select('role').eq('id', user.id).single()
  if (!director || !DIRECTOR_ROLES.includes(director.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: req, error: fetchErr } = await supabase
    .from('doctor_registration_requests').select('*').eq('id', id).single()

  if (fetchErr || !req) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (req.status !== 'approved') {
    return NextResponse.json({ error: 'Yêu cầu chưa được duyệt' }, { status: 400 })
  }
  if (req.converted_to_doctor_id) {
    return NextResponse.json({ error: 'Tài khoản đã được tạo', doctor_id: req.converted_to_doctor_id }, { status: 409 })
  }

  // Generate temp password + email
  const tempEmail = req.email || `doctor.${req.phone}@aivihe.vn`
  const tempPassword = `TDL@${req.phone.slice(-4)}${new Date().getFullYear()}`

  // Create auth user
  const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
    email: tempEmail,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name: req.full_name, role: 'doctor' },
  })

  if (authErr || !authData.user) {
    console.error('[doctor-convert] auth create error:', authErr)
    return NextResponse.json({ error: 'Không thể tạo tài khoản: ' + authErr?.message }, { status: 500 })
  }

  const doctorId = authData.user.id

  // Insert citizen record
  const { error: citizenErr } = await supabase.from('citizens').insert({
    id: doctorId,
    full_name: req.full_name,
    phone: req.phone,
    email: tempEmail,
    role: 'doctor',
  })

  if (citizenErr) {
    console.error('[doctor-convert] citizen insert error:', citizenErr)
    return NextResponse.json({ error: 'Tạo hồ sơ bác sĩ thất bại' }, { status: 500 })
  }

  // Insert doctor_profile
  const { error: profileErr } = await supabase.from('doctor_profiles').insert({
    id: doctorId,
    license_number: req.license_number,
    specialty: DOCTOR_TYPE_LABEL[req.doctor_type] || req.doctor_type,
    qualification: req.main_qualification || '',
    employment_type: req.employment_type,
    is_active: true,
  })

  if (profileErr) {
    console.error('[doctor-convert] doctor_profile insert error:', profileErr)
    // Non-fatal: citizen created, profile can be added later
  }

  // Mark request as converted
  await supabase
    .from('doctor_registration_requests')
    .update({ status: 'converted', converted_to_doctor_id: doctorId })
    .eq('id', id)

  return NextResponse.json({
    ok: true,
    message: `Đã tạo tài khoản bác sĩ cho ${req.full_name}`,
    doctor_id: doctorId,
    temp_email: tempEmail,
    temp_password: tempPassword,
  })
}
