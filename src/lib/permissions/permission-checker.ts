// Hàm kiểm tra quyền người dùng
// Kết hợp quyền mặc định theo vai trò + quyền tùy chỉnh được gán thêm

import { getDefaultPermissions } from './role-default-permissions'
import type { Permission } from './permission-definitions'

/**
 * Kiểm tra người dùng có quyền cụ thể không
 * Tính đến cả quyền mặc định lẫn quyền tùy chỉnh
 */
export function hasPermission(
  role: string,
  permission: Permission,
  customPermissions: Permission[] = []
): boolean {
  const defaults = getDefaultPermissions(role)
  return defaults.includes(permission) || customPermissions.includes(permission)
}

/**
 * Kiểm tra người dùng có ít nhất một trong các quyền không
 */
export function hasAnyPermission(
  role: string,
  permissions: Permission[],
  customPermissions: Permission[] = []
): boolean {
  return permissions.some((p) => hasPermission(role, p, customPermissions))
}

/**
 * Kiểm tra người dùng có tất cả các quyền không
 */
export function hasAllPermissions(
  role: string,
  permissions: Permission[],
  customPermissions: Permission[] = []
): boolean {
  return permissions.every((p) => hasPermission(role, p, customPermissions))
}

/**
 * Kiểm tra quyền quản lý chi nhánh
 * - super_admin / director: quản lý tất cả chi nhánh
 * - branch_director: chỉ quản lý chi nhánh của mình
 * - các vai trò khác: không có quyền
 */
export function canManageBranch(
  role: string,
  targetBranchId: string,
  userBranchIds: string[] = []
): boolean {
  if (role === 'super_admin' || role === 'director') return true
  if (role === 'branch_director') {
    return userBranchIds.includes(targetBranchId)
  }
  return false
}

/**
 * Kiểm tra vai trò có thể phân quyền không
 * Chỉ super_admin, director, branch_director mới được phân quyền
 */
export function canAssignPermissions(role: string): boolean {
  return ['super_admin', 'director', 'branch_director'].includes(role)
}

/**
 * Lấy danh sách quyền hiệu lực của người dùng
 * = quyền mặc định theo vai trò + quyền tùy chỉnh (không trùng)
 */
export function getEffectivePermissions(
  role: string,
  customPermissions: Permission[] = []
): Permission[] {
  const defaults = getDefaultPermissions(role)
  const extra = customPermissions.filter((p) => !defaults.includes(p))
  return [...defaults, ...extra]
}
