import { NextRequest, NextResponse } from 'next/server'
import { verifyApiKey } from '@/lib/integration/webhook-verification'
import { formatTdlCustomerCode } from '@/lib/integration/tdl-code-generator'

export async function POST(request: NextRequest) {
  // Verify API key
  const authHeader = request.headers.get('authorization')
  if (!verifyApiKey(authHeader)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const locationCode = (body.location_code as string)?.toUpperCase() || 'HN'

    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    // Get next sequence number using Supabase RPC or raw query
    // Use the sequence created in migration 00027
    const seqName = `tdl_customer_seq_${locationCode.toLowerCase()}`
    const { data: seqResult, error: seqError } = await supabase.rpc('nextval_text', {
      seq_name: seqName,
    })

    let sequence: number
    if (seqError || !seqResult) {
      // Fallback: find max sequence for this location and increment
      const { data: maxRow } = await supabase
        .from('citizens')
        .select('customer_sequence')
        .eq('location_code', locationCode)
        .order('customer_sequence', { ascending: false })
        .limit(1)
        .single()

      sequence = (maxRow?.customer_sequence || 5) + 1
    } else {
      sequence = parseInt(String(seqResult), 10)
    }

    const tdlCode = formatTdlCustomerCode(locationCode, sequence)

    return NextResponse.json({
      ok: true,
      tdl_customer_code: tdlCode,
      location_code: locationCode,
      sequence,
    })
  } catch (error) {
    console.error('[Integration] Error reserving TDL code:', error)
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 })
  }
}
