/**
 * SleepCare Service Token Validator
 *
 * Pi pod giao tiếp với AIVIHE qua header X-Service-Token.
 * Token được set trong env SMARTBED_SERVICE_TOKEN (không phải user auth).
 *
 * Usage:
 *   const ok = validateServiceToken(request)
 *   if (!ok) return NextResponse.json({ error: '...' }, { status: 401 })
 */

import { NextRequest } from 'next/server'

const SERVICE_TOKEN_HEADER = 'x-service-token'

/**
 * Validate service token từ Pi/pod requests.
 * Returns true nếu header match với env SMARTBED_SERVICE_TOKEN.
 * Demo mode: luôn return true nếu header có giá trị bất kỳ.
 */
export function validateServiceToken(request: NextRequest): boolean {
  const token = request.headers.get(SERVICE_TOKEN_HEADER)
  if (!token || token.trim() === '') return false

  // Demo mode — chấp nhận bất kỳ non-empty token
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') return true

  const envToken = process.env.SMARTBED_SERVICE_TOKEN
  if (!envToken) {
    console.warn('[sleepcare] SMARTBED_SERVICE_TOKEN not set — rejecting service token request')
    return false
  }

  return token === envToken
}

/**
 * Standard 401 response cho invalid service token
 */
export function serviceTokenUnauthorized() {
  return Response.json(
    { error: 'Service token không hợp lệ hoặc thiếu header X-Service-Token.' },
    { status: 401 }
  )
}
