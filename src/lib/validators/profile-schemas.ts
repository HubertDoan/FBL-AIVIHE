import { z } from 'zod'

// ─── Citizen Schema ──────────────────────────────────────────────────────────

export const citizenSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Họ tên phải có ít nhất 2 ký tự.')
    .max(100, 'Họ tên tối đa 100 ký tự.'),
  dateOfBirth: z.string().nullable(),
  gender: z.enum(['male', 'female', 'other']).nullable(),
  nationalId: z
    .string()
    .trim()
    .regex(/^\d{9,12}$/, 'Số CMND/CCCD phải gồm 9-12 chữ số.')
    .nullable()
    .optional(),
  phone: z
    .string()
    .trim()
    .regex(/^0\d{9}$/, 'Số điện thoại không hợp lệ. Nhập 10 chữ số bắt đầu bằng 0.'),
  email: z
    .string()
    .trim()
    .email('Email không hợp lệ.')
    .nullable()
    .optional(),
  address: z
    .string()
    .max(300, 'Địa chỉ tối đa 300 ký tự.')
    .nullable()
    .optional(),
  ethnicity: z
    .string()
    .max(50, 'Dân tộc tối đa 50 ký tự.')
    .nullable()
    .optional(),
  occupation: z
    .string()
    .max(100, 'Nghề nghiệp tối đa 100 ký tự.')
    .nullable()
    .optional(),
})

// ─── Health Profile Schema ───────────────────────────────────────────────────

export const healthProfileSchema = z.object({
  citizenId: z.string().uuid('ID công dân không hợp lệ.'),
  bloodType: z
    .enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .nullable()
    .optional(),
  heightCm: z
    .number()
    .min(30, 'Chiều cao tối thiểu 30cm.')
    .max(250, 'Chiều cao tối đa 250cm.')
    .nullable()
    .optional(),
  weightKg: z
    .number()
    .min(1, 'Cân nặng tối thiểu 1kg.')
    .max(300, 'Cân nặng tối đa 300kg.')
    .nullable()
    .optional(),
  allergies: z.array(z.string().max(200)).default([]),
  disabilities: z.array(z.string().max(200)).default([]),
  chronicConditions: z.array(z.string().max(200)).default([]),
  currentMedications: z.array(z.string().max(200)).default([]),
  pregnancyStatus: z.string().nullable().optional(),
  organDonationStatus: z.boolean().default(false),
  lifestyleNotes: z.record(z.string(), z.unknown()).default({}),
})

// ─── Emergency Contact Schema ────────────────────────────────────────────────

export const emergencyContactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Tên người liên hệ phải có ít nhất 2 ký tự.')
    .max(100, 'Tên tối đa 100 ký tự.'),
  phone: z
    .string()
    .trim()
    .regex(/^0\d{9}$/, 'Số điện thoại không hợp lệ. Nhập 10 chữ số bắt đầu bằng 0.'),
  relationship: z
    .string()
    .trim()
    .min(1, 'Mối quan hệ không được để trống.')
    .max(50, 'Mối quan hệ tối đa 50 ký tự.'),
})

// ─── Update Profile Schema (partial) ─────────────────────────────────────────

export const updateCitizenSchema = citizenSchema.partial().extend({
  citizenId: z.string().uuid('ID công dân không hợp lệ.'),
})

export const updateHealthProfileSchema = healthProfileSchema.partial().extend({
  citizenId: z.string().uuid('ID công dân không hợp lệ.'),
})

// ─── Exported Types ──────────────────────────────────────────────────────────

export type CitizenInput = z.infer<typeof citizenSchema>
export type HealthProfileInput = z.infer<typeof healthProfileSchema>
export type EmergencyContactInput = z.infer<typeof emergencyContactSchema>
export type UpdateCitizenInput = z.infer<typeof updateCitizenSchema>
export type UpdateHealthProfileInput = z.infer<typeof updateHealthProfileSchema>
