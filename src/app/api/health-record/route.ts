// GET /api/health-record — trả về 4 mục hồ sơ của khách hàng hiện tại
// 1. daycare: hoạt động tại Thong Dong Daycare (mirror qua webhook)
// 2. family_doctor: encounters bác sĩ gia đình
// 3. rehab: buổi PHCN
// 4. clinic_visits: các lần khám tại BV/PK chuyên khoa

import { NextRequest, NextResponse } from 'next/server'
import { isDemoMode, getDemoUser } from '@/lib/demo/demo-api-helper'
import {
  getDaycareActivities,
  getFamilyDoctorEncounters,
  getRehabSessions,
  getClinicVisits,
} from '@/lib/demo/demo-health-record-data'

export async function GET(request: NextRequest) {
  if (isDemoMode()) {
    const user = await getDemoUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    return NextResponse.json({
      daycare: getDaycareActivities(user.id),
      family_doctor: getFamilyDoctorEncounters(user.id),
      rehab: getRehabSessions(user.id),
      clinic_visits: getClinicVisits(user.id),
    })
  }

  // TODO Supabase: query daycare_summary_cache, family_doctor_encounters, rehab_sessions, health_visits
  return NextResponse.json({
    daycare: [], family_doctor: [], rehab: [], clinic_visits: [],
  })
}
