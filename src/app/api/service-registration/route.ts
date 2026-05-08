// Service registration API — GET list + POST create
// Demo mode: in-memory store. Production: Supabase service_enrollments table.

import { NextRequest } from 'next/server'
import {
  isDemoMode,
  getDemoUser,
  demoResponse,
  demoUnauthorized,
  demoForbidden,
} from '@/lib/demo/demo-api-helper'
import {
  getServiceRegistrations,
  createServiceRegistration,
} from '@/lib/demo/demo-service-registration-in-memory-store'

// GET /api/service-registration — list current user's registrations
export async function GET(request: NextRequest) {
  if (!isDemoMode()) {
    // TODO: query Supabase service_enrollments for authenticated user
    return demoResponse({ registrations: [] })
  }

  const user = await getDemoUser(request)
  if (!user) return demoUnauthorized()
  if (user.role !== 'citizen') return demoForbidden()

  const registrations = getServiceRegistrations(user.id)
  return demoResponse({ registrations })
}

// POST /api/service-registration — register for a service package
// Body: { package_type, selected_doctor_id?, phcn_location?, specialist_type? }
export async function POST(request: NextRequest) {
  if (!isDemoMode()) {
    // TODO: insert into Supabase service_enrollments with status='pending_approval'
    return demoResponse({ error: 'Chức năng này chưa khả dụng.' }, 503)
  }

  const user = await getDemoUser(request)
  if (!user) return demoUnauthorized()
  if (user.role !== 'citizen') return demoForbidden()

  try {
    const body = await request.json()
    const { package_type, selected_doctor_id, phcn_location, specialist_type } = body

    if (package_type === undefined || package_type === null) {
      return demoResponse({ error: 'Thiếu thông tin gói dịch vụ.' }, 400)
    }
    if (typeof package_type !== 'number' || package_type < 0 || package_type > 4) {
      return demoResponse({ error: 'Gói dịch vụ không hợp lệ.' }, 400)
    }

    // packageType 1+ requires a doctor selection
    if (package_type >= 1 && !selected_doctor_id) {
      return demoResponse({ error: 'Vui lòng chọn bác sĩ cho gói này.' }, 400)
    }

    // packageType 3 requires specialty type
    if (package_type === 3 && !specialist_type) {
      return demoResponse({ error: 'Vui lòng chọn chuyên khoa.' }, 400)
    }

    const registration = createServiceRegistration({
      citizen_id: user.id,
      package_type,
      selected_doctor_id: selected_doctor_id ?? null,
      phcn_location: phcn_location ?? null,
      specialist_type: specialist_type ?? null,
    })

    return demoResponse({
      ok: true,
      registration: {
        id: registration.id,
        status: registration.status,
        package_type: registration.package_type,
        created_at: registration.created_at,
      },
    })
  } catch {
    return demoResponse({ error: 'Yêu cầu không hợp lệ.' }, 400)
  }
}
