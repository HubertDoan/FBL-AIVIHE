// GET /api/subscriptions/ocr-usage — trả về quota OCR tháng hiện tại của user

import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { checkOcrLimit } from '@/lib/subscriptions/ocr-limit-checker-and-usage-tracker'
import { isDemoMode } from '@/lib/demo/demo-api-helper'

export async function GET() {
  if (isDemoMode()) {
    // Demo: luôn trả về free với usage thấp
    return NextResponse.json({
      plan: 'free',
      pages_used: 12,
      pages_limit: 2000,
      remaining: 1988,
      exceeded: false,
    })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const svc = await createServiceClient()
  const status = await checkOcrLimit(svc, user.id)
  return NextResponse.json(status)
}
