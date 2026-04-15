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

    // Extract content + check payment type (AIVIHE membership vs SVC service registration)
    const contentUpper = (payload.content ?? '').toUpperCase()
    const isAivihePayment = contentUpper.includes('AIVIHE')
    const isServicePayment = contentUpper.includes('SVC')

    if (!isAivihePayment && !isServicePayment) {
      // Not an AIVIHE/SVC payment, ignore
      return NextResponse.json({ success: true })
    }

    // SVC payments — match service registration by payment_content
    if (isServicePayment) {
      console.log(
        `[SePay] Service payment received: ${payload.transferAmount}đ | Content: "${payload.content}"`
      )
      if (isDemoMode()) {
        const { findByPaymentContent, confirmPaymentForServiceRegistration } =
          await import('@/lib/demo/demo-service-registration-in-memory-store')
        const reg = findByPaymentContent(payload.content)
        if (reg && reg.status === 'payment_pending') {
          const updated = confirmPaymentForServiceRegistration(reg.id, String(payload.id))
          console.log(`[SePay] Activated service registration ${reg.id} → ${updated?.service_code}`)
        }
        return NextResponse.json({ success: true })
      }
      // TODO: Supabase — match service_enrollments by payment_content, auto-activate
      return NextResponse.json({ success: true })
    }

    // AIVIHE membership payments
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
          user_id: payment.citizen_id,
          title: 'Đã nhận thanh toán',
          content: `Chúng tôi đã nhận được thanh toán ${payload.transferAmount.toLocaleString('vi-VN')}đ. Cảm ơn bạn!`,
          category: 'admin',
          is_read: false,
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[SePay] Webhook error:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
