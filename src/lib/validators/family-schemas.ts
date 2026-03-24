import { z } from 'zod'

// ─── Constants ───────────────────────────────────────────────────────────────

const FAMILY_ROLES = [
  'owner',
  'manager',
  'member',
  'doctor',
  'staff',
  'viewer',
] as const

// ─── Family Schema ───────────────────────────────────────────────────────────

export const familySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Tên gia đình phải có ít nhất 2 ký tự.')
    .max(100, 'Tên gia đình tối đa 100 ký tự.'),
  familyDoctorName: z
    .string()
    .max(100, 'Tên bác sĩ tối đa 100 ký tự.')
    .nullable()
    .optional(),
  familyDoctorPhone: z
    .string()
    .trim()
    .regex(/^0\d{9}$/, 'Số điện thoại không hợp lệ.')
    .nullable()
    .optional(),
  address: z
    .string()
    .max(300, 'Địa chỉ tối đa 300 ký tự.')
    .nullable()
    .optional(),
})

// ─── Family Member Schema ────────────────────────────────────────────────────

export const familyMemberSchema = z.object({
  citizenId: z.string().uuid('ID công dân không hợp lệ.'),
  familyId: z.string().uuid('ID gia đình không hợp lệ.'),
  role: z.enum(FAMILY_ROLES),
  relationship: z
    .string()
    .max(50, 'Mối quan hệ tối đa 50 ký tự.')
    .nullable()
    .optional(),
  permissions: z
    .object({
      can_view: z.boolean().default(true),
      can_edit: z.boolean().default(false),
      can_upload: z.boolean().default(false),
    })
    .default({ can_view: true, can_edit: false, can_upload: false }),
})

// ─── Invite Member Schema ────────────────────────────────────────────────────

export const inviteMemberSchema = z.object({
  familyId: z.string().uuid('ID gia đình không hợp lệ.'),
  phone: z
    .string()
    .trim()
    .regex(/^0\d{9}$/, 'Số điện thoại không hợp lệ. Nhập 10 chữ số bắt đầu bằng 0.'),
  role: z.enum(FAMILY_ROLES).default('member'),
  relationship: z
    .string()
    .max(50, 'Mối quan hệ tối đa 50 ký tự.')
    .nullable()
    .optional(),
})

// ─── Update Family Schema ────────────────────────────────────────────────────

export const updateFamilySchema = familySchema.partial().extend({
  familyId: z.string().uuid('ID gia đình không hợp lệ.'),
})

export const updateFamilyMemberSchema = z.object({
  memberId: z.string().uuid('ID thành viên không hợp lệ.'),
  role: z.enum(FAMILY_ROLES).optional(),
  relationship: z.string().max(50).nullable().optional(),
  permissions: z
    .object({
      can_view: z.boolean(),
      can_edit: z.boolean(),
      can_upload: z.boolean(),
    })
    .partial()
    .optional(),
})

// ─── Invitation Schema ───────────────────────────────────────────────────────

const RELATIONSHIPS = [
  'father', 'mother', 'son', 'daughter',
  'grandfather', 'grandmother',
  'wife', 'husband', 'sibling', 'other',
] as const

export const createInvitationSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^0\d{9}$/, 'Số điện thoại không hợp lệ. Nhập 10 chữ số bắt đầu bằng 0.'),
  relationship: z.enum(RELATIONSHIPS, {
    error: 'Vui lòng chọn mối quan hệ.',
  }),
  message: z.string().max(200, 'Lời nhắn tối đa 200 ký tự.').optional(),
})

export const respondInvitationSchema = z.object({
  action: z.enum(['accept', 'decline'] as const, {
    error: 'Hành động không hợp lệ.',
  }),
})

// ─── Exported Types ──────────────────────────────────────────────────────────

export type FamilyInput = z.infer<typeof familySchema>
export type FamilyMemberInput = z.infer<typeof familyMemberSchema>
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>
export type UpdateFamilyInput = z.infer<typeof updateFamilySchema>
export type UpdateFamilyMemberInput = z.infer<typeof updateFamilyMemberSchema>
export type CreateInvitationInput = z.infer<typeof createInvitationSchema>
export type RespondInvitationInput = z.infer<typeof respondInvitationSchema>
