// GET /api/medical-record — hồ sơ y tế 11 sections theo TT 13/2025/TT-BYT

import { NextRequest, NextResponse } from 'next/server'
import { isDemoMode, getDemoUser } from '@/lib/demo/demo-api-helper'
import { getMedicalRecord } from '@/lib/demo/demo-medical-record-eleven-sections-data'

export async function GET(request: NextRequest) {
  if (isDemoMode()) {
    const user = await getDemoUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json(getMedicalRecord(user.id))
  }
  // TODO: query Supabase: citizens + allergies + vital_signs + chronic_diseases + lab_tests + imaging...
  return NextResponse.json({
    administrative: null, allergies: [], illness_history: [], family_history: [],
    vital_signs: [], organ_exams: [], chronic_conditions: [],
    lab_results: [], imaging: [], functional_tests: [], immunizations: [],
  })
}
