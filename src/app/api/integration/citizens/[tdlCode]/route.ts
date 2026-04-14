import { NextRequest, NextResponse } from 'next/server'
import { verifyApiKey } from '@/lib/integration/webhook-verification'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tdlCode: string }> }
) {
  // Verify API key
  const authHeader = request.headers.get('authorization')
  if (!verifyApiKey(authHeader)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { tdlCode } = await params

    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    // Lookup citizen by TDL code
    const { data: citizen, error } = await supabase
      .from('citizens')
      .select(`
        id, full_name, phone, email, date_of_birth, gender, national_id,
        address, province, commune, street_address,
        tdl_customer_code, location_code, customer_sequence,
        daycare_status, aivihe_status, fd_status, rh_status,
        role, status, created_at, updated_at
      `)
      .eq('tdl_customer_code', tdlCode)
      .single()

    if (error || !citizen) {
      return NextResponse.json(
        { ok: false, error: 'Citizen not found' },
        { status: 404 }
      )
    }

    // Also fetch health profile if exists
    const { data: healthProfile } = await supabase
      .from('health_profiles')
      .select('blood_type, height_cm, weight_kg, allergies, chronic_conditions, current_medications')
      .eq('citizen_id', citizen.id)
      .single()

    // Fetch active service enrollments
    const { data: enrollments } = await supabase
      .from('service_enrollments')
      .select('service_type, service_code, status, enrolled_at')
      .eq('citizen_id', citizen.id)
      .eq('status', 'active')

    return NextResponse.json({
      ok: true,
      citizen,
      health_profile: healthProfile || null,
      service_enrollments: enrollments || [],
    })
  } catch (error) {
    console.error('[Integration] Error looking up citizen:', error)
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 })
  }
}
