// Annual checkup API: list and create annual health checkup records
// Demo mode: in-memory store from demo-annual-checkup-data.ts
// GET  /api/annual-checkup — list checkups for current user
// POST /api/annual-checkup — create new checkup record

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  isDemoMode,
  getDemoUser,
  demoResponse,
  demoUnauthorized,
} from '@/lib/demo/demo-api-helper'
import { getCheckups, addCheckup } from '@/lib/demo/demo-annual-checkup-data'
import type { CheckupStatus } from '@/lib/demo/demo-annual-checkup-data'

export async function GET(request: NextRequest) {
  if (isDemoMode()) {
    const user = await getDemoUser(request)
    if (!user) return demoUnauthorized()
    const checkups = getCheckups(user.id)
    return demoResponse({ checkups })
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 })

    const { data, error } = await supabase
      .from('annual_checkups')
      .select('*')
      .eq('citizen_id', user.id)
      .order('year', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ checkups: data ?? [] })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Lỗi máy chủ' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (isDemoMode()) {
    const user = await getDemoUser(request)
    if (!user) return demoUnauthorized()

    const body = await request.json()
    const { year, examDate, facility, doctorName, generalHealth, status } = body

    if (!year || !examDate || !facility || !doctorName || !generalHealth || !status) {
      return demoResponse({ error: 'Thiếu thông tin bắt buộc.' }, 400)
    }

    const checkup = addCheckup({
      citizenId: user.id,
      year: Number(year),
      examDate,
      facility,
      doctorName,
      generalHealth,
      status: status as CheckupStatus,
      bloodPressure: body.bloodPressure,
      heartRate: body.heartRate ? Number(body.heartRate) : undefined,
      weight: body.weight ? Number(body.weight) : undefined,
      height: body.height ? Number(body.height) : undefined,
      bmi: body.bmi ? Number(body.bmi) : undefined,
      bloodSugar: body.bloodSugar,
      cholesterol: body.cholesterol,
      notes: body.notes,
    })
    return demoResponse(checkup, 201)
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 })

    const body = await request.json()
    const { year, examDate, facility, doctorName, generalHealth, status } = body
    if (!year || !examDate || !facility || !doctorName || !generalHealth || !status) {
      return NextResponse.json({ error: 'Thiếu thông tin bắt buộc.' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('annual_checkups')
      .insert({
        citizen_id: user.id,
        year: Number(year),
        exam_date: examDate,
        facility,
        doctor_name: doctorName,
        general_health: generalHealth,
        status,
        blood_pressure: body.bloodPressure,
        heart_rate: body.heartRate,
        weight: body.weight,
        height: body.height,
        bmi: body.bmi,
        blood_sugar: body.bloodSugar,
        cholesterol: body.cholesterol,
        notes: body.notes,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Lỗi máy chủ' }, { status: 500 })
  }
}
