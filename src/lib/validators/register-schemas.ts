import { z } from 'zod'

/**
 * Registration form validation schema.
 * Requires full name (min 2 words for Vietnamese names) and phone number.
 */
export const registerSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, { message: 'Vui lòng nhập họ và tên.' })
    .refine((val) => val.trim().split(/\s+/).length >= 2, {
      message: 'Họ và tên phải có ít nhất 2 từ (ví dụ: Nguyễn Minh).',
    }),
  phone: z
    .string()
    .trim()
    .regex(/^0\d{9}$/, {
      message: 'Số điện thoại không hợp lệ. Vui lòng nhập 10 chữ số bắt đầu bằng 0.',
    }),
  gender: z
    .enum(['male', 'female', 'other'], {
      message: 'Giới tính không hợp lệ.',
    })
    .optional(),
  date_of_birth: z
    .string()
    .optional()
    .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      { message: 'Ngày sinh không hợp lệ.' }
    ),
})

export type RegisterInput = z.infer<typeof registerSchema>
