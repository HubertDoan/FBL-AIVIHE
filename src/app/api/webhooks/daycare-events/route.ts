import { NextRequest, NextResponse } from 'next/server'
import { verifyApiKey } from '@/lib/integration/webhook-verification'
import {
  storeIntegrationEvent,
  processEvent,
  DAYCARE_EVENT_TYPES,
  type DaycareWebhookPayload,
} from '@/lib/integration/event-processor'

export async function POST(request: NextRequest) {
  // 1. Verify API key
  const authHeader = request.headers.get('authorization')
  if (!verifyApiKey(authHeader)) {
    return NextResponse.json(
      { ok: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // 2. Get idempotency key
  const requestId = request.headers.get('x-daycare-request-id')
  if (!requestId) {
    return NextResponse.json(
      { ok: false, error: 'Missing X-Daycare-Request-Id header' },
      { status: 400 }
    )
  }

  try {
    // 3. Parse payload
    const event: DaycareWebhookPayload = await request.json()

    // 4. Validate event type
    if (!DAYCARE_EVENT_TYPES.includes(event.type as typeof DAYCARE_EVENT_TYPES[number])) {
      return NextResponse.json(
        { ok: false, error: `Unknown event type: ${event.type}` },
        { status: 400 }
      )
    }

    if (!event.customer_code) {
      return NextResponse.json(
        { ok: false, error: 'Missing customer_code' },
        { status: 400 }
      )
    }

    // 5. Store event (idempotent)
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    const { isNew, eventId } = await storeIntegrationEvent(supabase, requestId, event)

    if (!isNew) {
      // Already processed — idempotent response
      return NextResponse.json({
        ok: true,
        accepted_type: event.type,
        customer_code: event.customer_code,
        merge_status: 'duplicate',
      }, { status: 202 })
    }

    // 6. Process event asynchronously (don't block response)
    if (eventId) {
      processEvent(supabase, eventId, event).catch((err) => {
        console.error(`[Webhook] Failed to process event ${eventId}:`, err)
      })
    }

    return NextResponse.json({
      ok: true,
      accepted_type: event.type,
      customer_code: event.customer_code,
      merge_status: 'accepted',
    }, { status: 202 })

  } catch (error) {
    console.error('[Webhook] Error processing daycare event:', error)
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
