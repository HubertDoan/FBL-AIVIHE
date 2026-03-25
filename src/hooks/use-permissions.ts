'use client'

// React hook cung cấp kiểm tra quyền dựa trên vai trò + quyền tùy chỉnh người dùng

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './use-auth'
import type { Permission } from '@/lib/permissions/permission-definitions'
import { hasPermission, hasAnyPermission } from '@/lib/permissions/permission-checker'

interface UsePermissionsResult {
  /** Kiểm tra người dùng có quyền cụ thể */
  can: (permission: Permission) => boolean
  /** Kiểm tra người dùng có ít nhất một trong các quyền */
  canAny: (permissions: Permission[]) => boolean
  /** Vai trò hiện tại */
  role: string | null
  /** Quyền tùy chỉnh được gán thêm */
  customPermissions: Permission[]
  isSuperAdmin: boolean
  isDirector: boolean
  isBranchDirector: boolean
  isAdmin: boolean
  isDoctor: boolean
  isReception: boolean
  isCitizen: boolean
  isGuest: boolean
  loading: boolean
}

export function usePermissions(): UsePermissionsResult {
  const { user, loading: authLoading } = useAuth({ redirect: false })
  const [customPermissions, setCustomPermissions] = useState<Permission[]>([])
  const [permLoading, setPermLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setPermLoading(false)
      return
    }

    async function fetchPermissions() {
      try {
        const res = await fetch('/api/permissions')
        if (res.ok) {
          const data = await res.json()
          setCustomPermissions(data.customPermissions ?? [])
        }
      } catch {
        // bỏ qua lỗi mạng
      } finally {
        setPermLoading(false)
      }
    }

    fetchPermissions()
  }, [user, authLoading])

  const role = user?.role ?? null

  const can = useCallback(
    (permission: Permission) => {
      if (!role) return false
      return hasPermission(role, permission, customPermissions)
    },
    [role, customPermissions]
  )

  const canAny = useCallback(
    (permissions: Permission[]) => {
      if (!role) return false
      return hasAnyPermission(role, permissions, customPermissions)
    },
    [role, customPermissions]
  )

  return {
    can,
    canAny,
    role,
    customPermissions,
    isSuperAdmin: role === 'super_admin',
    isDirector: role === 'director',
    isBranchDirector: role === 'branch_director',
    isAdmin: role === 'admin',
    isDoctor: role === 'doctor' || role === 'exam_doctor',
    isReception: role === 'reception',
    isCitizen: role === 'citizen',
    isGuest: role === 'guest' || !role,
    loading: authLoading || permLoading,
  }
}
