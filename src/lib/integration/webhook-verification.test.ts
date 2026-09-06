import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createHmac } from 'crypto'
import { verifyWebhookSignature, verifyApiKey } from './webhook-verification'

/**
 * Test canh giữ cho lớp xác thực hệ thống–hệ thống.
 *
 * Đây là hàng rào duy nhất giữa hệ thống ngoài và dữ liệu sức khoẻ.
 * Mọi thay đổi làm các test này đỏ đều là hồi quy bảo mật, không phải
 * "test cũ cần cập nhật".
 */

const SECRET = 'test-webhook-secret-do-not-use-in-production'

function signPayload(payload: string, secret = SECRET): string {
  return 'sha256=' + createHmac('sha256', secret).update(payload).digest('hex')
}

describe('verifyWebhookSignature', () => {
  const payload = JSON.stringify({ event: 'vital_recorded', tdl: 'TDL-HN-000001' })

  it('chấp nhận chữ ký đúng', () => {
    expect(verifyWebhookSignature(payload, signPayload(payload), SECRET)).toBe(true)
  })

  it('từ chối khi không có chữ ký', () => {
    expect(verifyWebhookSignature(payload, null, SECRET)).toBe(false)
  })

  it('từ chối chuỗi rỗng', () => {
    expect(verifyWebhookSignature(payload, '', SECRET)).toBe(false)
  })

  it('từ chối chữ ký ký bằng khoá khác', () => {
    const wrong = signPayload(payload, 'khoa-khac')
    expect(verifyWebhookSignature(payload, wrong, SECRET)).toBe(false)
  })

  it('từ chối khi nội dung bị sửa sau khi ký', () => {
    const signature = signPayload(payload)
    const tampered = JSON.stringify({ event: 'vital_recorded', tdl: 'TDL-HN-999999' })
    expect(verifyWebhookSignature(tampered, signature, SECRET)).toBe(false)
  })

  it('từ chối chữ ký thiếu tiền tố sha256=', () => {
    const raw = createHmac('sha256', SECRET).update(payload).digest('hex')
    expect(verifyWebhookSignature(payload, raw, SECRET)).toBe(false)
  })

  it('từ chối chữ ký sai một ký tự', () => {
    const valid = signPayload(payload)
    const off = valid.slice(0, -1) + (valid.endsWith('a') ? 'b' : 'a')
    expect(verifyWebhookSignature(payload, off, SECRET)).toBe(false)
  })

  it('phân biệt chữ hoa chữ thường trong chữ ký hex', () => {
    expect(verifyWebhookSignature(payload, signPayload(payload).toUpperCase(), SECRET)).toBe(false)
  })

  it('xử lý được nội dung rỗng mà không ném lỗi', () => {
    expect(verifyWebhookSignature('', signPayload(''), SECRET)).toBe(true)
  })

  it('xử lý được nội dung tiếng Việt có dấu', () => {
    const vi = JSON.stringify({ note: 'Cụ bà đau đầu từ sáng, huyết áp 150/90' })
    expect(verifyWebhookSignature(vi, signPayload(vi), SECRET)).toBe(true)
  })
})

describe('verifyApiKey', () => {
  const ORIGINAL = process.env.DAYCARE_INTEGRATION_API_KEY

  beforeEach(() => {
    process.env.DAYCARE_INTEGRATION_API_KEY = 'khoa-tich-hop-hop-le'
  })

  afterEach(() => {
    if (ORIGINAL === undefined) delete process.env.DAYCARE_INTEGRATION_API_KEY
    else process.env.DAYCARE_INTEGRATION_API_KEY = ORIGINAL
  })

  it('chấp nhận khoá đúng kèm tiền tố Apikey', () => {
    expect(verifyApiKey('Apikey khoa-tich-hop-hop-le')).toBe(true)
  })

  it('từ chối khi không có header', () => {
    expect(verifyApiKey(null)).toBe(false)
  })

  it('từ chối header rỗng', () => {
    expect(verifyApiKey('')).toBe(false)
  })

  it('từ chối khoá sai', () => {
    expect(verifyApiKey('Apikey khoa-sai')).toBe(false)
  })

  it('từ chối khoá đúng tiền tố nhưng dài hơn', () => {
    expect(verifyApiKey('Apikey khoa-tich-hop-hop-le-them')).toBe(false)
  })

  it('từ chối khoá là tiền tố của khoá thật', () => {
    expect(verifyApiKey('Apikey khoa-tich-hop')).toBe(false)
  })

  it('từ chối mọi thứ khi biến môi trường chưa đặt', () => {
    delete process.env.DAYCARE_INTEGRATION_API_KEY
    expect(verifyApiKey('Apikey khoa-tich-hop-hop-le')).toBe(false)
    expect(verifyApiKey('Apikey bat-ky')).toBe(false)
  })

  it('từ chối khi biến môi trường là chuỗi rỗng', () => {
    process.env.DAYCARE_INTEGRATION_API_KEY = ''
    expect(verifyApiKey('Apikey ')).toBe(false)
  })

  it('từ chối lược đồ xác thực khác dù có kèm cụm Apikey', () => {
    // 'Bearer Apikey X'.replace('Apikey ','') → 'Bearer X' ≠ khoá thật.
    expect(verifyApiKey('Bearer Apikey khoa-tich-hop-hop-le')).toBe(false)
  })

  /**
   * KHIẾM KHUYẾT ĐÃ BIẾT — chưa sửa, có chủ đích.
   *
   * Hàm không kiểm tra header có đúng tiền tố `Apikey ` hay không, nên một
   * khoá trần vẫn được chấp nhận. Mức độ thấp: kẻ tấn công vẫn phải biết
   * khoá bí mật; đây là buông lỏng kiểm tra lược đồ, không phải đường vòng
   * qua xác thực.
   *
   * Chưa siết vì hệ thống Daycare đang chạy thật có thể đang gửi khoá trần;
   * siết ngay sẽ làm đứt tích hợp đang hoạt động. Sẽ xử lý trong hạng mục
   * hợp nhất xác thực (ADR-001 §2.5), sau khi đối chiếu với đội Daycare.
   *
   * Test này CỐ Ý khẳng định hành vi hiện tại, để lần siết tới làm test này
   * đỏ — báo cho người sửa biết đó là thay đổi có chủ đích, không phải vô tình.
   */
  it('[khiếm khuyết đã biết] chấp nhận khoá trần không có tiền tố', () => {
    expect(verifyApiKey('khoa-tich-hop-hop-le')).toBe(true)
  })
})
