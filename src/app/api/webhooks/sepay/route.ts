import { NextRequest, NextResponse } from 'next/server'
import {
  isDemoMode,
  demoResponse,
} from '@/lib/demo/demo-api-helper'

/**
 * SePay webhook endpoint - receives payment notifications from SePay
 * when a bank transfer is made to BIDV account 12310000073672
 *
 * Payload format from SePay:
 * {
 *   id: number,           // Transaction ID (use for deduplication)
 *   gateway: string,      // Bank name (e.g. "BIDV")
 *   transactionDate: string,
 *   accountNumber: string,
 *   code: string,         // Transaction code
 *   content: string,      // Transfer content (e.g. "AIVIHE minhnv2026")
 *   transferType: "in"|"out",
 *   transferAmount: number,
 *   accumulated: number,
 *   subAccount: string|null,
 *   referenceCode: string,
 *   description: string
 * }
 */

interface SepayWebhookPayload {
  id: number
  gateway: string
  transactionDate: string
  accountNumber: string
  code: string
  content: string
  transferType: 'in' | 'out'
  transferAmount: number
  accumulated: number
  subAccount: string | null
  referenceCode: string
  description: string
}

// Track processed transaction IDs to prevent duplicates (in-memory for demo)
const processedTransactions = new Set<number>()

export async function POST(request: NextRequest) {
  // Verify SePay API key
  const authHeader = request.headers.get('authorization') ?? ''
  const apiKey = authHeader.replace('Apikey ', '')
  const expectedKey = process.env.SEPAY_API_KEY

  // In demo mode, skip API key verification
  if (!isDemoMode() && expectedKey && apiKey !== expectedKey) {
    return NextResponse.json({ success: false }, { status: 401 })
  }

  try {
    const payload: SepayWebhookPayload = await request.json()

    // Only process incoming transfers
    if (payload.transferType !== 'in') {
      return NextResponse.json({ success: true })
    }

    // Deduplication check
    if (processedTransactions.has(payload.id)) {
      return NextResponse.json({ success: true })
    }
    processedTransactions.add(payload.id)

    // Extract username from transfer content (e.g. "AIVIHE minhnv2026")
    const contentUpper = (payload.content ?? '').toUpperCase()
    const isAivihePayment = contentUpper.includes('AIVIHE')

    if (!isAivihePayment) {
      // Not an AIVIHE payment, ignore
      return NextResponse.json({ success: true })
    }

    // Extract member identifier from content after "AIVIHE "
    const match = payload.content.match(/AIVIHE\s+(\S+)/i)
    const memberIdentifier = match?.[1] ?? null

    console.log(
      `[SePay] Payment received: ${payload.transferAmount}đ from ${payload.gateway}` +
      ` | Content: "${payload.content}" | Member: ${memberIdentifier}`
    )

    // In demo mode, just log and return success
    if (isDemoMode()) {
      return demoResponse({
        success: true,
        message: 'Đã nhận thanh toán',
        transactionId: payload.id,
        amount: payload.transferAmount,
        member: memberIdentifier,
      })
    }

    // --- Supabase mode: update payment status ---
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    // Find pending payment for this member and update to confirmed
    if (memberIdentifier) {
      const { data: matchedPayments } = await supabase
        .from('membership_payments')
        .select('id, citizen_id, amount, status')
        .eq('status', 'pending')
        .ilike('content', `%${memberIdentifier}%`)
        .order('date', { ascending: false })
        .limit(1)

      if (matchedPayments && matchedPayments.length > 0) {
        const payment = matchedPayments[0]

        // Update payment status to confirmed
        await supabase
          .from('membership_payments')
          .update({
            status: 'confirmed',
            sepay_transaction_id: payload.id,
            sepay_reference: payload.referenceCode,
            confirmed_at: new Date().toISOString(),
          })
          .eq('id', payment.id)

        // Send notification to member
        await supabase.from('notifications').insert({
          citizen_id: payment.citizen_id,
          title: 'Đã nhận thanh toán',
          message: `Chúng tôi đã nhận được thanh toán ${payload.transferAmount.toLocaleString('vi-VN')}đ. Cảm ơn bạn!`,
          category: 'admin',
          read: false,
          created_at: new Date().toISOString(),
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[SePay] Webhook error:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
