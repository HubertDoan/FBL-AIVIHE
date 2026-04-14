import { SupabaseClient } from '@supabase/supabase-js'

/** Daycare webhook event types */
export const DAYCARE_EVENT_TYPES = [
  'customer_created',
  'vital_recorded',
  'daycare_daily_summary',
  'incident_reported',
  'medication_log',
] as const

export type DaycareEventType = typeof DAYCARE_EVENT_TYPES[number]

/** Webhook payload shape */
export interface DaycareWebhookPayload {
  type: DaycareEventType
  customer_code: string // TDL-HN-000123
  updated_by: string
  updated_at: string // ISO timestamp
  payload: Record<string, unknown>
}

/**
 * Store event in integration_events table (idempotent)
 * Returns: { isNew, eventId }
 */
export async function storeIntegrationEvent(
  supabase: SupabaseClient,
  requestId: string,
  event: DaycareWebhookPayload
): Promise<{ isNew: boolean; eventId: string | null }> {
  // Check idempotency — if request_id already exists, skip
  const { data: existing } = await supabase
    .from('integration_events')
    .select('id')
    .eq('request_id', requestId)
    .single()

  if (existing) {
    return { isNew: false, eventId: existing.id }
  }

  // Insert new event
  const { data, error } = await supabase
    .from('integration_events')
    .insert({
      request_id: requestId,
      source_system: 'daycare',
      target_system: 'aivihe',
      event_type: event.type,
      customer_code: event.customer_code,
      payload: event.payload,
      status: 'received',
    })
    .select('id')
    .single()

  if (error) {
    console.error('[Integration] Failed to store event:', error)
    return { isNew: true, eventId: null }
  }

  return { isNew: true, eventId: data.id }
}

/**
 * Process event by type — route to appropriate handler
 */
export async function processEvent(
  supabase: SupabaseClient,
  eventId: string,
  event: DaycareWebhookPayload
): Promise<void> {
  try {
    // Mark as processing
    await supabase
      .from('integration_events')
      .update({ status: 'processing' })
      .eq('id', eventId)

    switch (event.type) {
      case 'daycare_daily_summary':
        await processDailySummary(supabase, event)
        break
      case 'vital_recorded':
      case 'incident_reported':
      case 'medication_log':
      case 'customer_created':
        // Sprint 2 — store payload only for now
        break
      default:
        console.warn(`[Integration] Unknown event type: ${event.type}`)
    }

    // Mark as processed
    await supabase
      .from('integration_events')
      .update({ status: 'processed', processed_at: new Date().toISOString() })
      .eq('id', eventId)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    await supabase
      .from('integration_events')
      .update({ status: 'failed', error_message: message })
      .eq('id', eventId)
    throw error
  }
}

/** Process daycare_daily_summary → upsert daycare_summary_cache */
async function processDailySummary(
  supabase: SupabaseClient,
  event: DaycareWebhookPayload
): Promise<void> {
  const p = event.payload as Record<string, unknown>

  // Find citizen by customer_code
  const { data: citizen } = await supabase
    .from('citizens')
    .select('id')
    .eq('tdl_customer_code', event.customer_code)
    .single()

  if (!citizen) {
    console.warn(`[Integration] Citizen not found for code: ${event.customer_code}`)
    return
  }

  // Upsert daily summary
  await supabase.from('daycare_summary_cache').upsert(
    {
      citizen_id: citizen.id,
      customer_code: event.customer_code,
      summary_date: p.date as string,
      checkin_at: (p.checkin_at as string) || null,
      checkout_at: (p.checkout_at as string) || null,
      activities: (p.activities as string[]) || [],
      meal_status: (p.meal as string) || null,
      nap_duration_minutes: (p.nap_duration_minutes as number) || null,
      mood_rating: (p.mood_rating as number) || null,
      staff_notes: (p.staff_notes as string) || null,
      vitals_snapshot: (p.vitals_snapshot as Record<string, unknown>) || {},
      incidents: (p.incidents as unknown[]) || [],
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'citizen_id,summary_date' }
  )
}
