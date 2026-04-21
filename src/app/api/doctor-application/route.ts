import { NextRequest, NextResponse } from 'next/server'
import { isDemoMode } from '@/lib/demo/demo-api-helper'
import {
  getAllDoctorRegistrationRequests,
  createDoctorRegistrationRequest,
} from '@/lib/demo/demo-doctor-registration-request-in-memory-store'
import {
  checkRateLimit,
  getClientIp,
} from '@/lib/security/rate-limit-upstash-sliding-window'
import { verifyTurnstileToken } from '@/lib/security/cloudflare-turnstile-server-verify'

/**
 * API đăng ký BS gia đình từ trang chủ aivihe.vn
 *
 * POST: public endpoint (không cần auth) — BS submit form
 * GET: reception/admin/director xem danh sách (cần auth)
 */

const VALID_DOCTOR_TYPES = ['general', 'oriental', 'family_medicine', 'specialist'] as const
const VALID_EMPLOYMENT_TYPES = ['fulltime', 'parttime'] as const
const INTERNAL_ROLES = ['super_admin', 'director', 'branch_director', 'admin', 'admin_staff', 'reception', 'manager']

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 3 lần/giờ/IP
    const clientIp = getClientIp(request)
    const limited = await checkRateLimit('doctorApplicationByIp', clientIp)
    if (limited) return limited

    const body = await request.json()
    const {
      full_name, phone, email, license_number,
      doctor_type, specialties, main_qualification,
      additional_certifications, employment_type,
      turnstile_token,
    } = body

    // Turnstile bot protection
    const turnstile = await verifyTurnstileToken(turnstile_token, clientIp)
    if (!turnstile.success) {
      return NextResponse.json(
        { error: 'Xác thực bảo mật thất bại. Vui lòng thử lại.' },
        { status: 400 }
      )
    }

    // Validation
    if (!full_name || typeof full_name !== 'string' || full_name.trim().length < 2) {
      return NextResponse.json({ error: 'Họ và tên không hợp lệ' }, { status: 400 })
    }
    if (!phone || !/^0\d{9}$/.test(phone)) {
      return NextResponse.json({ error: 'Số điện thoại không hợp lệ (10 chữ số, bắt đầu bằng 0)' }, { status: 400 })
    }
    if (!license_number || typeof license_number !== 'string' || license_number.trim().length < 4) {
      return NextResponse.json({ error: 'Số chứng chỉ hành nghề không hợp lệ' }, { status: 400 })
    }
    if (!VALID_DOCTOR_TYPES.includes(doctor_type)) {
      return NextResponse.json({ error: 'Loại bác sĩ không hợp lệ' }, { status: 400 })
    }
    if (!VALID_EMPLOYMENT_TYPES.includes(employment_type)) {
      return NextResponse.json({ error: 'Hình thức công việc không hợp lệ' }, { status: 400 })
    }

    const payload = {
      full_name: full_name.trim(),
      phone: phone.trim(),
      email: email?.trim() || undefined,
      license_number: license_number.trim(),
      doctor_type,
      specialties: Array.isArray(specialties) ? specialties : [],
      main_qualification: main_qualification?.trim() || undefined,
      additional_certifications: Array.isArray(additional_certifications) ? additional_certifications : [],
      employment_type,
    }

    if (isDemoMode()) {
      const req = createDoctorRegistrationRequest(payload)
      return NextResponse.json({ ok: true, message: 'Đã ghi nhận đăng ký bác sĩ', request_id: req.id })
    }

    // Production Supabase
    const { createServiceClient } = await import('@/lib/supabase/server')
    const supabase = await createServiceClient()
    const { data, error } = await supabase
      .from('doctor_registration_requests')
      .insert({ ...payload, status: 'new' })
      .select('id')
      .single()

    if (error) {
      console.error('[doctor-application] insert error:', error)
      return NextResponse.json({ error: 'Không thể lưu yêu cầu. Vui lòng thử lại.' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, message: 'Đã ghi nhận đăng ký bác sĩ', request_id: data.id })
  } catch (err) {
    console.error('[doctor-application] POST error:', err)
    return NextResponse.json({ error: 'Lỗi hệ thống, vui lòng thử lại' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  if (isDemoMode()) {
    const cookie = request.cookies.get('demo-auth-session')
    if (!cookie?.value) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    try {
      const session = JSON.parse(cookie.value)
      if (!INTERNAL_ROLES.includes(session.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    } catch {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }
    return NextResponse.json({ requests: getAllDoctorRegistrationRequests() })
  }

  // Production
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: citizen } = await supabase
    .from('citizens').select('role').eq('id', user.id).single()

  if (!citizen || !INTERNAL_ROLES.includes(citizen.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('doctor_registration_requests')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ requests: data || [] })
}
