import type { FamilyRole } from '@/types/database'

// ─── Permission Definitions ───────────────────────────────────────────────────

export interface Permission {
  canView: boolean
  canEdit: boolean
  canUpload: boolean
  canDelete: boolean
  canManageMembers: boolean
  canManageFamily: boolean
}

/**
 * Default permission map for each family role.
 */
export const ROLE_PERMISSIONS: Record<FamilyRole, Permission> = {
  owner: {
    canView: true,
    canEdit: true,
    canUpload: true,
    canDelete: true,
    canManageMembers: true,
    canManageFamily: true,
  },
  manager: {
    canView: true,
    canEdit: true,
    canUpload: true,
    canDelete: false,
    canManageMembers: true,
    canManageFamily: false,
  },
  doctor: {
    canView: true,
    canEdit: true,
    canUpload: true,
    canDelete: false,
    canManageMembers: false,
    canManageFamily: false,
  },
  staff: {
    canView: true,
    canEdit: false,
    canUpload: true,
    canDelete: false,
    canManageMembers: false,
    canManageFamily: false,
  },
  member: {
    canView: true,
    canEdit: false,
    canUpload: true,
    canDelete: false,
    canManageMembers: false,
    canManageFamily: false,
  },
  viewer: {
    canView: true,
    canEdit: false,
    canUpload: false,
    canDelete: false,
    canManageMembers: false,
    canManageFamily: false,
  },
}

/**
 * Vietnamese display labels for each role.
 */
export const ROLE_LABELS: Record<FamilyRole, string> = {
  owner: 'Chủ hộ',
  manager: 'Quản lý',
  doctor: 'Bác sĩ',
  staff: 'Nhân viên',
  member: 'Thành viên',
  viewer: 'Người xem',
}

/**
 * All family roles ordered by privilege level (highest first).
 */
export const FAMILY_ROLES: FamilyRole[] = [
  'owner',
  'manager',
  'doctor',
  'staff',
  'member',
  'viewer',
]

/**
 * Check if a role has a specific permission.
 */
export function hasPermission(
  role: FamilyRole,
  permission: keyof Permission
): boolean {
  return ROLE_PERMISSIONS[role]?.[permission] ?? false
}

// ─── Admin Roles ──────────────────────────────────────────────────────────────

export type AdminRole = 'super_admin' | 'admin' | 'support'

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: 'Quản trị viên cao cấp',
  admin: 'Quản trị viên',
  support: 'Hỗ trợ viên',
}
