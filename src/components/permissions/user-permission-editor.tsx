'use client'

// Component chỉnh sửa quyền tùy chỉnh cho một người dùng cụ thể
// Hiển thị checkbox nhóm theo danh mục, nút Lưu riêng mỗi người dùng

import { useState, useCallback } from 'react'
import { ChevronDown, ChevronUp, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  PERMISSION_GROUPS,
  PERMISSION_LABELS,
  type Permission,
} from '@/lib/permissions/permission-definitions'
import { getDefaultPermissions } from '@/lib/permissions/role-default-permissions'

interface UserPermissionEditorProps {
  userId: string
  userRole: string
  userName: string
  currentCustomPermissions: Permission[]
  /** Quyền của actor (người đang phân quyền) — không cho gán vượt quá */
  actorEffectivePermissions: Permission[]
  onSaved?: (userId: string, newCustom: Permission[]) => void
}

export function UserPermissionEditor({
  userId,
  userRole,
  userName,
  currentCustomPermissions,
  actorEffectivePermissions,
  onSaved,
}: UserPermissionEditorProps) {
  const defaults = getDefaultPermissions(userRole)

  // selected = tập hợp quyền HIỆU LỰC (mặc định + tùy chỉnh)
  const [selected, setSelected] = useState<Set<Permission>>(
    new Set([...defaults, ...currentCustomPermissions])
  )
  const [expanded, setExpanded] = useState(false)
  const [saving, setSaving] = useState(false)

  const toggle = useCallback((perm: Permission) => {
    // Không cho bỏ tick quyền mặc định
    if (defaults.includes(perm)) return
    // Không cho chọn quyền mà actor không có
    if (!actorEffectivePermissions.includes(perm)) return

    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(perm)) next.delete(perm)
      else next.add(perm)
      return next
    })
  }, [defaults, actorEffectivePermissions])

  async function handleSave() {
    setSaving(true)
    try {
      // Chỉ gửi phần vượt ngoài mặc định
      const customToSave = [...selected].filter((p) => !defaults.includes(p))
      const res = await fetch('/api/permissions/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: userId, permissions: customToSave }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error ?? 'Không thể lưu quyền.')
        return
      }
      const data = await res.json()
      toast.success(`Đã lưu quyền cho ${userName}`)
      onSaved?.(userId, data.customPermissions ?? [])
    } catch {
      toast.error('Lỗi kết nối. Vui lòng thử lại.')
    } finally {
      setSaving(false)
    }
  }

  const customCount = [...selected].filter((p) => !defaults.includes(p)).length

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header hàng người dùng */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-accent/50 transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold shrink-0">
            {userName[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-base truncate">{userName}</p>
            <p className="text-sm text-muted-foreground">{userRole}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          {customCount > 0 && (
            <Badge variant="secondary" className="text-sm">
              +{customCount} quyền bổ sung
            </Badge>
          )}
          {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </div>
      </button>

      {/* Panel quyền */}
      {expanded && (
        <div className="border-t px-4 py-4 space-y-4 bg-muted/20">
          {Object.entries(PERMISSION_GROUPS).map(([groupKey, group]) => {
            // Chỉ hiển thị nhóm có ít nhất 1 quyền actor được phép gán hoặc mặc định
            const visiblePerms = group.permissions.filter(
              (p) => defaults.includes(p) || actorEffectivePermissions.includes(p)
            )
            if (visiblePerms.length === 0) return null
            return (
              <div key={groupKey}>
                <p className="text-sm font-semibold text-muted-foreground mb-2">{group.label}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {visiblePerms.map((perm) => {
                    const isDefault = defaults.includes(perm)
                    const isChecked = selected.has(perm)
                    const isDisabled = isDefault || !actorEffectivePermissions.includes(perm)
                    return (
                      <label
                        key={perm}
                        className={`flex items-center gap-2 py-2 px-3 rounded-md cursor-pointer select-none text-base
                          ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'hover:bg-accent/50'}
                          ${isChecked ? 'bg-primary/5' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={isDisabled}
                          onChange={() => toggle(perm)}
                          className="size-5 accent-primary"
                        />
                        <span>{PERMISSION_LABELS[perm]}</span>
                        {isDefault && (
                          <span className="text-xs text-muted-foreground ml-auto">(mặc định)</span>
                        )}
                      </label>
                    )
                  })}
                </div>
              </div>
            )
          })}

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="min-h-[48px] px-6 text-base"
            >
              {saving ? <Loader2 className="size-4 animate-spin mr-2" /> : <Save className="size-4 mr-2" />}
              Lưu quyền
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
