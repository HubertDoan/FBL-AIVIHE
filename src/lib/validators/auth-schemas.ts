import { z } from 'zod'

/**
 * Vietnamese phone number: starts with 0, exactly 10 digits.
 * Examples: 0901234567, 0371234567
 */
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^0\d{9}$/, {
    message: 'Số điện thoại không hợp lệ. Vui lòng nhập 10 chữ số bắt đầu bằng 0.',
  })

/**
 * 6-digit OTP code sent via SMS.
 */
export const otpSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, {
    message: 'Mã OTP phải gồm 6 chữ số.',
  })

/**
 * Login request: phone number only (OTP is sent separately).
 */
export const loginSchema = z.object({
  phone: phoneSchema,
})

/**
 * OTP verification request.
 */
export const verifyOtpSchema = z.object({
  phone: phoneSchema,
  otp: otpSchema,
})

export type LoginInput = z.infer<typeof loginSchema>
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>
