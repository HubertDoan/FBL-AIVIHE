'use client'

// Trang quản lý phân quyền — chỉ dành cho super_admin, director, branch_director
// Hiển thị danh sách nhân viên + checkbox quyền nhóm theo danh mục

import { useState, useEffect, useCallback } from 'react'
import { Shield, Search, Loader2, Users } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/use-auth'
import { usePermissions } from '@/hooks/use-permissions'
import { UserPermissionEditor } from '@/components/permissions/user-permission-editor'
import { getEffectivePermissions } from '@/lib/permissions/permission-checker'
import type { Permission } from '@/lib/permissions/permission-definitions'
import { DEMO_ACCOUNTS } from '@/lib/demo/demo-accounts'

const MANAGEABLE_ROLES = ['super_admin', 'director', 'branch_director']

interface UserEntry {
  id: string
  fullName: string
  role: string
  customPermissions: Permission[]
}

export default function PermissionsPage() {
  const { user, loading: authLoading } = useAuth({ redirect: false })
  const { isSuperAdmin, isDirector, isBranchDirector, loading: permLoading } = usePermissions()
  const [users, setUsers] = useState<UserEntry[]>([])
  const [actorEffective, setActorEffective] = useState<Permission[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const canAccess = isSuperAdmin || isDirector || isBranchDirector

  const loadData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      // Lấy quyền hiệu lực của actor
      const selfRes = await fetch('/api/permissions')
      if (selfRes.ok) {
        const selfData = await selfRes.json()
        setActorEffective(selfData.effectivePermissions ?? [])
      }

      // Lấy danh sách tất cả người dùng (bao gồm citizen, trừ guest)
      const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
      if (isDemoMode) {
        const accounts = DEMO_ACCOUNTS.filter((a) => a.role !== 'guest')
        // Lấy quyền tùy chỉnh cho từng tài khoản
        const entries: UserEntry[] = await Promise.all(
          accounts.map(async (a) => {
            try {
              const res = await fetch(`/api/permissions/user?userId=${a.id}`)
              const custom: Permission[] = res.ok ? ((await res.json()).customPermissions ?? []) : []
              return { id: a.id, fullName: a.fullName, role: a.role, customPermissions: custom }
            } catch {
              return { id: a.id, fullName: a.fullName, role: a.role, customPermissions: [] }
            }
          })
        )
        setUsers(entries)
      } else {
        const res = await fetch('/api/admin/members?limit=100')
        if (res.ok) {
          const data = await res.json()
          const entries: UserEntry[] = (data.members ?? []).map((m: { id: string; full_name: string; role: string }) => ({
            id: m.id,
            fullName: m.full_name,
            role: m.role,
            customPermissions: [],
          }))
          setUsers(entries)
        }
      }
    } catch {
      // giữ trạng thái rỗng
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    if (!authLoading && !permLoading && user) loadData()
  }, [authLoading, permLoading, user, loadData])

  function handleSaved(userId: string, newCustom: Permission[]) {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, customPermissions: newCustom } : u))
    )
  }

  const filtered = users.filter((u) =>
    u.fullName.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  )

  // Chờ auth + permission check
  if (authLoading || permLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!canAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-3 text-center px-4">
        <Shield className="size-12 text-muted-foreground" />
        <p className="text-lg font-medium">Không có quyền truy cập</p>
        <p className="text-muted-foreground">Trang này chỉ dành cho Giám đốc và Super Admin.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Shield className="size-7 text-primary shrink-0" />
        <div>
          <h1 className="text-2xl font-bold">Phân quyền</h1>
          <p className="text-muted-foreground text-base">
            Quản lý quyền truy cập module và chức năng cho tất cả thành viên
          </p>
        </div>
      </div>

      {/* Ghi chú */}
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800 px-4 py-3 text-sm text-yellow-800 dark:text-yellow-200">
        Quyền được đánh dấu <strong>(mặc định)</strong> không thể thay đổi — chúng được xác định bởi vai trò của người dùng. Bạn chỉ có thể gán thêm quyền mà bạn đang có.
      </div>

      {/* Tìm kiếm */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
        <Input
          placeholder="Tìm theo tên hoặc vai trò..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 text-base h-12"
        />
      </div>

      {/* Danh sách người dùng */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
          <Users className="size-10 text-muted-foreground" />
          <p className="text-muted-foreground">Không tìm thấy nhân viên nào.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((u) => (
            <UserPermissionEditor
              key={u.id}
              userId={u.id}
              userRole={u.role}
              userName={u.fullName}
              currentCustomPermissions={u.customPermissions}
              actorEffectivePermissions={actorEffective}
              onSaved={handleSaved}
            />
          ))}
        </div>
      )}
    </div>
  )
}
