import { createHmac, timingSafeEqual } from 'crypto'

/**
 * Verify HMAC SHA256 signature from Daycare webhook
 * Header: X-Daycare-Signature: sha256=<hex>
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) return false
  const expected = 'sha256=' + createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
  // Constant-time comparison
  if (signature.length !== expected.length) return false
  let result = 0
  for (let i = 0; i < signature.length; i++) {
    result |= signature.charCodeAt(i) ^ expected.charCodeAt(i)
  }
  return result === 0
}

/**
 * Verify Apikey auth header
 * Header: Authorization: Apikey <key>
 */
export function verifyApiKey(authHeader: string | null): boolean {
  if (!authHeader) return false
  const key = authHeader.replace('Apikey ', '')
  const expected = process.env.DAYCARE_INTEGRATION_API_KEY
  if (!expected) return false

  // So sánh theo thời gian hằng định để không rò rỉ độ khớp qua thời gian phản hồi.
  // Kiểm tra độ dài trước vì timingSafeEqual ném lỗi khi hai buffer khác độ dài;
  // việc lộ độ dài khoá là đánh đổi chấp nhận được và là cách làm chuẩn.
  const keyBuffer = Buffer.from(key, 'utf8')
  const expectedBuffer = Buffer.from(expected, 'utf8')
  if (keyBuffer.length !== expectedBuffer.length) return false
  return timingSafeEqual(keyBuffer, expectedBuffer)
}
