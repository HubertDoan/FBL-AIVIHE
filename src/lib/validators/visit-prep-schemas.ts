import { z } from 'zod'

// ─── Constants ───────────────────────────────────────────────────────────────

const SPECIALTIES = [
  'cardiology',
  'endocrinology',
  'gastroenterology',
  'neurology',
  'pulmonology',
  'rheumatology',
  'dermatology',
  'ent',
  'ophthalmology',
  'dentistry',
  'nephrology',
  'obstetrics',
  'pediatrics',
  'oncology',
  'rehabilitation',
  'psychiatry',
] as const

const PREP_STATUSES = [
  'draft',
  'ai_generated',
  'doctor_reviewed',
  'completed',
  'used',
] as const

// ─── Specialty Schema ────────────────────────────────────────────────────────

export const specialtySchema = z.enum(SPECIALTIES, {
  message: 'Chuyên khoa không hợp lệ.',
})

// ─── Symptom Schema ──────────────────────────────────────────────────────────

export const symptomSchema = z.object({
  description: z
    .string()
    .trim()
    .min(2, 'Mô tả triệu chứng phải có ít nhất 2 ký tự.')
    .max(500, 'Mô tả triệu chứng tối đa 500 ký tự.'),
  duration: z
    .string()
    .max(100, 'Thời gian triệu chứng tối đa 100 ký tự.')
    .nullable()
    .optional(),
  severity: z
    .enum(['mild', 'moderate', 'severe'], {
      message: 'Mức độ phải là nhẹ, trung bình hoặc nặng.',
    })
    .nullable()
    .optional(),
})

// ─── Visit Prep Schema ───────────────────────────────────────────────────────

export const visitPrepSchema = z.object({
  citizenId: z.string().uuid('ID công dân không hợp lệ.'),
  specialty: specialtySchema,
  symptoms: z
    .array(z.string().min(1).max(500))
    .min(1, 'Cần ít nhất 1 triệu chứng.')
    .max(10, 'Tối đa 10 triệu chứng.'),
  symptomDescription: z
    .string()
    .max(2000, 'Mô tả tối đa 2000 ký tự.')
    .nullable()
    .optional(),
  questionsForDoctor: z
    .array(z.string().min(1).max(500))
    .max(10, 'Tối đa 10 câu hỏi.')
    .default([]),
})

// ─── Update Visit Prep Schema ────────────────────────────────────────────────

export const updateVisitPrepSchema = z.object({
  prepId: z.string().uuid('ID chuẩn bị khám không hợp lệ.'),
  symptoms: z
    .array(z.string().min(1).max(500))
    .min(1)
    .max(10)
    .optional(),
  symptomDescription: z.string().max(2000).nullable().optional(),
  questionsForDoctor: z
    .array(z.string().min(1).max(500))
    .max(10)
    .optional(),
  doctorNotes: z.string().max(5000).nullable().optional(),
  status: z.enum(PREP_STATUSES).optional(),
})

// ─── AI Summary Update Schema ────────────────────────────────────────────────

export const updateAiSummarySchema = z.object({
  prepId: z.string().uuid('ID chuẩn bị khám không hợp lệ.'),
  aiSummary: z.string().min(1, 'Bản tổng hợp AI không được để trống.'),
  aiSummaryCitations: z.array(z.unknown()).default([]),
})

// ─── Exported Types ──────────────────────────────────────────────────────────

export type SpecialtyInput = z.infer<typeof specialtySchema>
export type SymptomInput = z.infer<typeof symptomSchema>
export type VisitPrepInput = z.infer<typeof visitPrepSchema>
export type UpdateVisitPrepInput = z.infer<typeof updateVisitPrepSchema>
export type UpdateAiSummaryInput = z.infer<typeof updateAiSummarySchema>
