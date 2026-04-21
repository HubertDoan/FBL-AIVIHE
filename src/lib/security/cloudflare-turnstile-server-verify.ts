/**
 * Cloudflare Turnstile — server-side token verification.
 *
 * Dùng cho public forms: register, consultation, doctor-application.
 * Ưu điểm so với hCaptcha/reCAPTCHA:
 *   - Free unlimited, không tracking user
 *   - Invisible mode — UX tốt hơn
 *   - Tích hợp với Cloudflare DNS đã có
 *
 * Fail-open: nếu TURNSTILE_SECRET_KEY chưa config → skip verify (dev/pilot).
 * Production MUST set secret, verify() sẽ reject nếu token invalid.
 *
 * Env required (optional — nếu thiếu thì bypass):
 *   TURNSTILE_SECRET_KEY (server-only)
 *   NEXT_PUBLIC_TURNSTILE_SITE_KEY (client widget)
 */

const VERIFY_ENDPOINT = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

export type TurnstileVerifyResult = {
  success: boolean
  skipped?: boolean
  error?: string
}

/**
 * Verify token với Cloudflare Turnstile API.
 *
 * @param token    Token từ widget (hidden input "cf-turnstile-response")
 * @param clientIp IP của user (optional, tăng độ chính xác)
 */
export async function verifyTurnstileToken(
  token: string | null | undefined,
  clientIp?: string
): Promise<TurnstileVerifyResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY

  // Bypass nếu env chưa setup (dev/pilot trước khi tạo Cloudflare site)
  if (!secret) {
    console.warn('[turnstile] TURNSTILE_SECRET_KEY not set — verification SKIPPED')
    return { success: true, skipped: true }
  }

  if (!token) {
    return { success: false, error: 'Thiếu Turnstile token' }
  }

  const formData = new URLSearchParams()
  formData.append('secret', secret)
  formData.append('response', token)
  if (clientIp) formData.append('remoteip', clientIp)

  try {
    const res = await fetch(VERIFY_ENDPOINT, {
      method: 'POST',
      body: formData,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      // Timeout ngắn — không block request khi Cloudflare chậm
      signal: AbortSignal.timeout(5000),
    })

    const data: {
      success: boolean
      'error-codes'?: string[]
      challenge_ts?: string
      hostname?: string
    } = await res.json()

    if (!data.success) {
      return {
        success: false,
        error: data['error-codes']?.join(',') || 'Turnstile verify failed',
      }
    }

    return { success: true }
  } catch (err) {
    console.error('[turnstile] verify error:', err)
    return { success: false, error: 'Turnstile network error' }
  }
}
