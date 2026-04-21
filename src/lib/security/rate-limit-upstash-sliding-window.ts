/**
 * Rate limiter — sliding window via Upstash Redis.
 *
 * Mục đích: chống brute-force login, spam form public, abuse AI OCR.
 *
 * Fail-open design: nếu Upstash env vars chưa config hoặc Redis down,
 * HÀM vẫn trả success=true để KHÔNG BLOCK legitimate traffic.
 * → Lỗi production sẽ log warning, không 5xx user.
 *
 * Env required (optional — nếu thiếu thì bypass):
 *   UPSTASH_REDIS_REST_URL
 *   UPSTASH_REDIS_REST_TOKEN
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextRequest, NextResponse } from 'next/server'

// Lazy-init singleton — tránh cold start khi env chưa có
let _redis: Redis | null = null
let _initialized = false

function getRedis(): Redis | null {
  if (_initialized) return _redis
  _initialized = true

  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) {
    // Bypass silently — env chưa setup (dev/pilot trước khi gắn Upstash)
    console.warn('[rate-limit] Upstash env vars not set — rate limiting DISABLED')
    return null
  }

  _redis = new Redis({ url, token })
  return _redis
}

/**
 * Factory để tạo limiter với cấu hình riêng per route.
 *
 * @param requests  Số request tối đa trong window
 * @param window    Thời gian window (VD: '1 m', '15 m', '1 h', '1 d')
 * @param prefix    Prefix key trong Redis (phân biệt các limiter)
 */
export function createRateLimiter(
  requests: number,
  window: Parameters<typeof Ratelimit.slidingWindow>[1],
  prefix: string
): Ratelimit | null {
  const redis = getRedis()
  if (!redis) return null

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: true,
    prefix: `aivihe:${prefix}`,
  })
}

/**
 * Policies — tập trung ở đây để dễ audit và điều chỉnh.
 */
export const rateLimiters = {
  // Brute-force login: 5 lần fail / 15 phút / IP
  loginByIp: createRateLimiter(5, '15 m', 'login:ip'),

  // Register: 3 lần / giờ / IP (chống spam tài khoản giả)
  registerByIp: createRateLimiter(3, '1 h', 'register:ip'),

  // Consultation form: 3 lần / giờ / IP (public form — target spam dễ)
  consultationByIp: createRateLimiter(3, '1 h', 'consultation:ip'),

  // Doctor application: 3 lần / giờ / IP
  doctorApplicationByIp: createRateLimiter(3, '1 h', 'doctor-app:ip'),

  // AI OCR upload: 20 lần / ngày / user (cost control)
  aiOcrByUser: createRateLimiter(20, '1 d', 'ai-ocr:user'),

  // Generic API: 60 req / phút / IP (fallback)
  genericByIp: createRateLimiter(60, '1 m', 'generic:ip'),
}

/**
 * Extract client IP từ Next.js request (ưu tiên Cloudflare, Vercel, fallback X-Forwarded-For).
 */
export function getClientIp(req: NextRequest | Request): string {
  const headers = req.headers
  return (
    headers.get('cf-connecting-ip') ||
    headers.get('x-real-ip') ||
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  )
}

/**
 * Helper áp dụng limit + trả 429 response nếu vượt ngưỡng.
 *
 * Usage trong API route:
 *   const limited = await checkRateLimit(req, 'loginByIp', getClientIp(req))
 *   if (limited) return limited
 */
export async function checkRateLimit(
  limiterKey: keyof typeof rateLimiters,
  identifier: string
): Promise<NextResponse | null> {
  const limiter = rateLimiters[limiterKey]
  if (!limiter) return null // Upstash chưa config → skip

  const { success, limit, remaining, reset } = await limiter.limit(identifier)

  if (!success) {
    const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000))
    return NextResponse.json(
      {
        error: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.',
        retry_after_seconds: retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(limit),
          'X-RateLimit-Remaining': String(remaining),
          'X-RateLimit-Reset': String(reset),
        },
      }
    )
  }

  return null
}
