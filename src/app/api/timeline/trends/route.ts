import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isDemoMode, getDemoUser, demoResponse, demoUnauthorized } from '@/lib/demo/demo-api-helper'
import { getDemoTrendData } from '@/lib/demo/demo-data'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  // ── Demo mode ──
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()
    const citizenId = searchParams.get('citizenId') ?? demoUser.id
    const testName = searchParams.get('testName')
    if (!testName) {
      return demoResponse({ error: 'Thiếu tên chỉ số (testName).' }, 400)
    }
    const data = getDemoTrendData(citizenId, testName)
    return demoResponse({ data, testName })
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

    const testName = searchParams.get('testName')
    if (!testName) {
      return NextResponse.json(
        { error: 'Thiếu tên chỉ số (testName).' },
        { status: 400 }
      )
    }

    const months = parseInt(searchParams.get('months') ?? '12', 10)
    const fromDate = new Date()
    fromDate.setMonth(fromDate.getMonth() - months)

    const { data: labData, error: labError } = await supabase
      .from('lab_tests')
      .select('test_date, result_value, unit, reference_range')
      .eq('citizen_id', citizenId)
      .ilike('test_name', `%${testName}%`)
      .gte('test_date', fromDate.toISOString())
      .order('test_date', { ascending: true })

    if (labError) {
      console.error('[Trends API] lab_tests error:', labError.message)
      return NextResponse.json(
        { error: 'Không thể tải dữ liệu xu hướng.' },
        { status: 500 }
      )
    }

    const { data: confirmedData, error: confirmedError } = await supabase
      .from('confirmed_records')
      .select('record_date, confirmed_value, confirmed_unit')
      .eq('citizen_id', citizenId)
      .ilike('category', `%${testName}%`)
      .gte('record_date', fromDate.toISOString())
      .order('record_date', { ascending: true })

    if (confirmedError) {
      console.error('[Trends API] confirmed_records error:', confirmedError.message)
    }

    const trendPoints = [
      ...(labData ?? []).map((row) => ({
        date: row.test_date,
        value: parseFloat(row.result_value ?? '0'),
        unit: row.unit ?? '',
        referenceRange: row.reference_range ?? null,
      })),
      ...(confirmedData ?? []).map((row) => ({
        date: row.record_date,
        value: parseFloat(row.confirmed_value ?? '0'),
        unit: row.confirmed_unit ?? '',
        referenceRange: null,
      })),
    ]
      .filter((p) => !isNaN(p.value))
      .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime())

    return NextResponse.json({ data: trendPoints, testName })
  } catch (err) {
    console.error('[Trends API] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi không mong muốn.' },
      { status: 500 }
    )
  }
}
