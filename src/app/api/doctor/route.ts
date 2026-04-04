import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isDemoMode, getDemoUser, demoResponse, demoUnauthorized } from '@/lib/demo/demo-api-helper'

export async function GET(request: NextRequest) {
  // ── Demo mode ──
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()
    // Demo mode: no doctor functionality
    return demoResponse({ isDoctor: false, patients: [] })
  }

  // ── Supabase mode ──
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Bạn chưa đăng nhập.' }, { status: 401 })
    }

    const { data: myCitizen } = await supabase
      .from('citizens')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!myCitizen) {
      return NextResponse.json({ isDoctor: false, patients: [] })
    }

    // Check if this user has doctor role in any family
    const { data: doctorMemberships } = await supabase
      .from('family_members')
      .select('family_id, citizen_id')
      .eq('citizen_id', myCitizen.id)
      .eq('role', 'doctor')

    if (!doctorMemberships || doctorMemberships.length === 0) {
      return NextResponse.json({ isDoctor: false, patients: [] })
    }

    // Get all family members from families where I'm a doctor
    const familyIds = doctorMemberships.map((f) => f.family_id)
    const { data: members } = await supabase
      .from('family_members')
      .select('citizen_id')
      .in('family_id', familyIds)
      .neq('citizen_id', myCitizen.id)

    const citizenIds = [...new Set((members ?? []).map((m) => m.citizen_id))]

    const patients = []
    for (const cid of citizenIds) {
      const { data: citizen } = await supabase
        .from('citizens').select('*').eq('id', cid).single()
      if (!citizen) continue

      const { data: diseases } = await supabase
        .from('chronic_diseases').select('*').eq('citizen_id', cid)
      const { data: meds } = await supabase
        .from('medications').select('*').eq('citizen_id', cid).eq('is_active', true)

      patients.push({
        citizen,
        chronicDiseases: diseases ?? [],
        medications: meds ?? [],
      })
    }

    return NextResponse.json({ isDoctor: true, patients })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi không xác định'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
