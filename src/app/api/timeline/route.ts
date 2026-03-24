import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isDemoMode, getDemoUser, demoResponse, demoUnauthorized } from '@/lib/demo/demo-api-helper'
import { getDemoHealthEvents } from '@/lib/demo/demo-data'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  // ── Demo mode ──
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()
    const citizenId = searchParams.get('citizenId') ?? demoUser.id
    const eventType = searchParams.get('eventType')
    const fromDate = searchParams.get('fromDate')
    const toDate = searchParams.get('toDate')
    const page = parseInt(searchParams.get('page') ?? '1', 10)
    const limit = parseInt(searchParams.get('limit') ?? '20', 10)

    let events = getDemoHealthEvents(citizenId)
    if (eventType && eventType !== 'all') {
      events = events.filter((e) => e.event_type === eventType)
    }
    if (fromDate) {
      events = events.filter((e) => (e.occurred_at ?? '') >= fromDate)
    }
    if (toDate) {
      events = events.filter((e) => (e.occurred_at ?? '') <= toDate)
    }
    const total = events.length
    const start = (page - 1) * limit
    const paged = events.slice(start, start + limit)
    return demoResponse({ events: paged, total, page, limit, totalPages: Math.ceil(total / limit) })
  }

  // ── Supabase mode ──
  try {
    const supabase = await createClient()

    const citizenId = searchParams.get('citizenId')
    if (!citizenId) {
      return NextResponse.json(
        { error: 'Thiếu mã công dân (citizenId).' },
        { status: 400 }
      )
    }

    const eventType = searchParams.get('eventType')
    const specialty = searchParams.get('specialty')
    const fromDate = searchParams.get('fromDate')
    const toDate = searchParams.get('toDate')
    const page = parseInt(searchParams.get('page') ?? '1', 10)
    const limit = parseInt(searchParams.get('limit') ?? '20', 10)
    const offset = (page - 1) * limit

    let query = supabase
      .from('health_events')
      .select(
        '*, source_documents(id, original_filename, document_type, facility_name)',
        { count: 'exact' }
      )
      .eq('citizen_id', citizenId)
      .order('occurred_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (eventType && eventType !== 'all') {
      query = query.eq('event_type', eventType)
    }
    if (specialty) {
      query = query.eq('metadata->>specialty', specialty)
    }
    if (fromDate) {
      query = query.gte('occurred_at', fromDate)
    }
    if (toDate) {
      query = query.lte('occurred_at', toDate)
    }

    const { data, count, error } = await query

    if (error) {
      console.error('[Timeline API]', error.message)
      return NextResponse.json(
        { error: 'Không thể tải dữ liệu dòng thời gian.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      events: data ?? [],
      total: count ?? 0,
      page,
      limit,
      totalPages: Math.ceil((count ?? 0) / limit),
    })
  } catch (err) {
    console.error('[Timeline API] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi không mong muốn.' },
      { status: 500 }
    )
  }
}
