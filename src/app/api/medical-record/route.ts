// GET /api/medical-record — thông tin theo dõi sức khỏe 11 sections theo TT 13/2025/TT-BYT

import { NextRequest, NextResponse } from 'next/server'
import { isDemoMode, getDemoUser } from '@/lib/demo/demo-api-helper'
import { getMedicalRecord } from '@/lib/demo/demo-medical-record-eleven-sections-data'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  if (isDemoMode()) {
    const user = await getDemoUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json(getMedicalRecord(user.id))
  }

  // Production: query citizens (administrative) + các section khác (stub rỗng tới khi có API riêng)
  const supabase = await createClient()
  const { data: { user: sbUser } } = await supabase.auth.getUser()
  if (!sbUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: citizen, error } = await supabase
    .from('citizens')
    .select('full_name, date_of_birth, gender, national_id, phone, address, ethnicity, occupation')
    .eq('id', sbUser.id)
    .single()

  if (error || !citizen) {
    return NextResponse.json({
      administrative: null, allergies: [], illness_history: [], family_history: [],
      vital_signs: [], organ_exams: [], chronic_conditions: [],
      lab_results: [], imaging: [], functional_tests: [], immunizations: [],
    })
  }

  const administrative = {
    full_name: citizen.full_name ?? '',
    date_of_birth: citizen.date_of_birth ?? '',
    gender: (citizen.gender as 'male' | 'female' | 'other') ?? 'male',
    national_id: citizen.national_id ?? '',
    phone: citizen.phone ?? '',
    address: citizen.address ?? '',
    insurance_number: null,
    insurance_facility: null,
    ethnicity: citizen.ethnicity ?? null,
    occupation: citizen.occupation ?? null,
    emergency_contact: null,
  }

  return NextResponse.json({
    administrative,
    allergies: [], illness_history: [], family_history: [],
    vital_signs: [], organ_exams: [], chronic_conditions: [],
    lab_results: [], imaging: [], functional_tests: [], immunizations: [],
  })
}
