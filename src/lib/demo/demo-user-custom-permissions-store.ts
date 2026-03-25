// Lưu trữ quyền tùy chỉnh được gán thêm cho người dùng (chỉ dùng trong demo mode)
// Trong production sẽ dùng Supabase table user_custom_permissions

import type { Permission } from '@/lib/permissions/permission-definitions'

// Map userId → danh sách quyền tùy chỉnh được gán thêm
const customPermissionsStore: Map<string, Permission[]> = new Map()

/**
 * Lấy quyền tùy chỉnh của người dùng
 */
export function getCustomPermissions(userId: string): Permission[] {
  return customPermissionsStore.get(userId) ?? []
}

/**
 * Ghi đè toàn bộ quyền tùy chỉnh của người dùng
 */
export function setCustomPermissions(userId: string, permissions: Permission[]): void {
  customPermissionsStore.set(userId, [...permissions])
}

/**
 * Thêm một quyền tùy chỉnh cho người dùng
 */
export function addCustomPermission(userId: string, permission: Permission): void {
  const current = customPermissionsStore.get(userId) ?? []
  if (!current.includes(permission)) {
    customPermissionsStore.set(userId, [...current, permission])
  }
}

/**
 * Thu hồi một quyền tùy chỉnh của người dùng
 */
export function removeCustomPermission(userId: string, permission: Permission): void {
  const current = customPermissionsStore.get(userId) ?? []
  customPermissionsStore.set(userId, current.filter((p) => p !== permission))
}

/**
 * Xóa toàn bộ quyền tùy chỉnh của người dùng
 */
export function clearCustomPermissions(userId: string): void {
  customPermissionsStore.delete(userId)
}

/**
 * Lấy tất cả bản ghi quyền tùy chỉnh (dùng cho trang quản lý)
 */
export function getAllCustomPermissions(): Record<string, Permission[]> {
  const result: Record<string, Permission[]> = {}
  customPermissionsStore.forEach((perms, userId) => {
    result[userId] = perms
  })
  return result
}
