// PATCH /api/vitals/[id]/context — lưu bối cảnh khi chỉ số vượt ngưỡng
// Body: { taking_medication, medication_types[], diet, exercise, mental_state, extra_notes }

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isDemoMode } from '@/lib/demo/demo-api-helper'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (isDemoMode()) return NextResponse.json({ ok: true })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const context_notes = {
    taking_medication: body.taking_medication ?? false,
    medication_types:  Array.isArray(body.medication_types) ? body.medication_types : [],
    diet:              body.diet ?? null,
    exercise:          body.exercise ?? 'none',
    mental_state:      body.mental_state ?? 'normal',
    extra_notes:       body.extra_notes ?? null,
  }

  const { error } = await supabase
    .from('vitals')
    .update({ context_notes })
    .eq('id', id)
    .eq('citizen_id', user.id) // RLS double-check

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
