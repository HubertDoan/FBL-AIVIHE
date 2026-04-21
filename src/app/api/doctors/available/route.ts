// GET /api/doctors/available — list active doctors available for family doctor registration
// Used by citizens on the choose-doctor page; supports search by name and specialty filter

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Bạn chưa đăng nhập.' }, { status: 401 })
    }

    const url = new URL(request.url)
    const search = url.searchParams.get('search')?.trim() ?? ''
    const specialty = url.searchParams.get('specialty')?.trim() ?? ''

    // Join doctor_profiles with citizens to get name + contact info
    let query = supabase
      .from('doctor_profiles')
      .select(`
        id,
        doctor_citizen_id,
        specialty,
        qualification,
        experience_years,
        bio,
        languages,
        avatar_url,
        rating,
        review_count,
        available_for_family_doctor,
        status,
        citizens!doctor_citizen_id (
          id,
          full_name,
          phone,
          email
        )
      `)
      .eq('status', 'active')
      .eq('available_for_family_doctor', true)
      .order('rating', { ascending: false })

    if (specialty) {
      query = query.ilike('specialty', `%${specialty}%`)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Filter by name search after join (Supabase doesn't support cross-table ilike in one query easily)
    let doctors = data ?? []
    if (search) {
      const lower = search.toLowerCase()
      doctors = doctors.filter((d) => {
        const citizen = d.citizens as { full_name?: string } | null
        return citizen?.full_name?.toLowerCase().includes(lower)
      })
    }

    return NextResponse.json({ doctors })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi không xác định'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
