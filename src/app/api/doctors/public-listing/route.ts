// GET /api/doctors/public-listing — danh sách BS công khai (không cần đăng nhập)
// Chỉ trả về BS có is_publicly_listed=true và status='active'
// Phí tư vấn KHÔNG trả về — do chính sách công ty quản lý

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const search = url.searchParams.get('search')?.trim() ?? ''
  const specialty = url.searchParams.get('specialty')?.trim() ?? ''

  const supabase = await createServiceClient()

  let query = supabase
    .from('doctor_profiles')
    .select(`
      id,
      specialty,
      qualification,
      experience_years,
      public_bio,
      languages,
      avatar_url,
      rating,
      review_count,
      specialty_tags,
      years_at_center,
      citizens!doctor_citizen_id (
        full_name
      )
    `)
    .eq('is_publicly_listed', true)
    .eq('status', 'active')
    .order('rating', { ascending: false })
    .limit(50)

  if (specialty) {
    query = query.ilike('specialty', `%${specialty}%`)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: 'Không thể tải danh sách bác sĩ.' }, { status: 500 })
  }

  // Filter by name search client-side (sau khi join)
  const results = search
    ? (data ?? []).filter(d => {
        const citizens = d.citizens as unknown as { full_name: string } | null
        const name = citizens?.full_name ?? ''
        return name.toLowerCase().includes(search.toLowerCase()) ||
               d.specialty.toLowerCase().includes(search.toLowerCase())
      })
    : (data ?? [])

  return NextResponse.json({ doctors: results })
}
