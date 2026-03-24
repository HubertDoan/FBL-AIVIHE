import { NextRequest, NextResponse } from 'next/server'
import {
  isDemoMode,
  getDemoUser,
  demoResponse,
  demoUnauthorized,
} from '@/lib/demo/demo-api-helper'
import { createClient } from '@/lib/supabase/server'

const DEMO_PAYMENTS = [
  {
    id: 'pay-1',
    date: '2026-03-24',
    amount: 50000,
    content: 'AIVIHE phí tháng 03/2026',
    status: 'confirmed',
  },
  {
    id: 'pay-2',
    date: '2026-02-20',
    amount: 50000,
    content: 'AIVIHE phí tháng 02/2026',
    status: 'confirmed',
  },
  {
    id: 'pay-3',
    date: '2026-01-15',
    amount: 50000,
    content: 'AIVIHE phí tháng 01/2026',
    status: 'pending',
  },
]

export async function GET(request: NextRequest) {
  // ── Demo mode ──
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()
    return demoResponse(DEMO_PAYMENTS)
  }

  // ── Supabase mode ──
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('membership_payments')
      .select('id, date, amount, content, status')
      .eq('citizen_id', user.id)
      .order('date', { ascending: false })
      .limit(20)

    if (error) throw error
    return NextResponse.json(data ?? [])
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi không xác định'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // ── Demo mode ──
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()

    const body = await request.json()
    const newPayment = {
      id: `pay-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      amount: body.amount ?? 50000,
      content: body.content ?? `AIVIHE ${demoUser.citizenId}`,
      status: 'pending',
    }
    return demoResponse(newPayment, 201)
  }

  // ── Supabase mode ──
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 })
    }

    const body = await request.json()

    const { data, error } = await supabase
      .from('membership_payments')
      .insert({
        citizen_id: user.id,
        date: new Date().toISOString().slice(0, 10),
        amount: body.amount ?? 50000,
        content: body.content ?? '',
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi không xác định'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
