/**
 * OCR limit checker & usage tracker cho freemium tier
 * Free: 2000 trang/tháng | Premium: không giới hạn
 */

import type { SupabaseClient } from '@supabase/supabase-js'

export const FREE_OCR_LIMIT = 2000 // trang/tháng

/** Trả về 'YYYY-MM' của tháng hiện tại */
function currentMonth(): string {
  return new Date().toISOString().slice(0, 7)
}

export interface OcrLimitStatus {
  plan: 'free' | 'premium' | 'enterprise'
  pages_used: number
  pages_limit: number | null // null = không giới hạn
  remaining: number | null
  exceeded: boolean
}

/**
 * Kiểm tra user còn quota OCR không (dùng service client để bypass RLS)
 */
export async function checkOcrLimit(
  supabase: SupabaseClient,
  citizenId: string
): Promise<OcrLimitStatus> {
  const month = currentMonth()

  // Lấy plan
  const { data: sub } = await supabase
    .from('user_subscriptions')
    .select('plan, status')
    .eq('citizen_id', citizenId)
    .eq('status', 'active')
    .maybeSingle()

  const plan = (sub?.plan ?? 'free') as 'free' | 'premium' | 'enterprise'

  // Premium/enterprise không giới hạn
  if (plan !== 'free') {
    return { plan, pages_used: 0, pages_limit: null, remaining: null, exceeded: false }
  }

  // Lấy usage tháng hiện tại
  const { data: usage } = await supabase
    .from('ocr_usage_monthly')
    .select('pages_used')
    .eq('citizen_id', citizenId)
    .eq('month', month)
    .maybeSingle()

  const pages_used = usage?.pages_used ?? 0
  const remaining = FREE_OCR_LIMIT - pages_used

  return {
    plan: 'free',
    pages_used,
    pages_limit: FREE_OCR_LIMIT,
    remaining,
    exceeded: pages_used >= FREE_OCR_LIMIT,
  }
}

/**
 * Tăng counter OCR sau khi xử lý thành công
 * pagesConsumed: số trang đã OCR (mặc định 1 per document)
 */
export async function incrementOcrUsage(
  supabase: SupabaseClient,
  citizenId: string,
  pagesConsumed = 1
): Promise<void> {
  const month = currentMonth()

  // Upsert: nếu chưa có row thì insert, nếu có thì cộng thêm
  await supabase.rpc('increment_ocr_usage', {
    p_citizen_id: citizenId,
    p_month: month,
    p_pages: pagesConsumed,
  })
}
