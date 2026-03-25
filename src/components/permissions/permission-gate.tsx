'use client'

// Component bảo vệ nội dung theo quyền
// Ẩn children nếu người dùng không có quyền yêu cầu
// Sử dụng: <PermissionGate permission="members.approve">...</PermissionGate>

import type { ReactNode } from 'react'
import { usePermissions } from '@/hooks/use-permissions'
import type { Permission } from '@/lib/permissions/permission-definitions'

interface PermissionGateProps {
  /** Quyền bắt buộc để hiển thị nội dung */
  permission?: Permission
  /** Hiển thị nếu có ít nhất một quyền trong danh sách */
  anyOf?: Permission[]
  /** Nội dung hiển thị khi có quyền */
  children: ReactNode
  /** Nội dung thay thế khi không có quyền (mặc định: ẩn) */
  fallback?: ReactNode
  /** Chờ loading xong mới quyết định hiển thị */
  showWhileLoading?: boolean
}

export function PermissionGate({
  permission,
  anyOf,
  children,
  fallback = null,
  showWhileLoading = false,
}: PermissionGateProps) {
  const { can, canAny, loading } = usePermissions()

  if (loading) {
    return showWhileLoading ? <>{children}</> : null
  }

  let allowed = false
  if (permission) {
    allowed = can(permission)
  } else if (anyOf && anyOf.length > 0) {
    allowed = canAny(anyOf)
  }

  return allowed ? <>{children}</> : <>{fallback}</>
}
