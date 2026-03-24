'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Copy, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { BranchCard, type BranchCardData } from '@/components/system/branch-card'
import { BranchForm, type BranchFormData } from '@/components/system/branch-form'
import { BranchStaffDialog } from '@/components/system/branch-staff-dialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
// Using native select for compatibility with base-ui
import { toast } from 'sonner'

// ── Clone dialog ──────────────────────────────────────────────────────────────

interface CloneDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  branches: BranchCardData[]
  onClone: (sourceBranchId: string, newName: string, newCode: string) => Promise<void>
}

function CloneDialog({ open, onOpenChange, branches, onClone }: CloneDialogProps) {
  const [sourceBranchId, setSourceBranchId] = useState('')
  const [newName, setNewName] = useState('')
  const [newCode, setNewCode] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!sourceBranchId || !newName || !newCode) return
    setSaving(true)
    try {
      await onClone(sourceBranchId, newName, newCode)
      onOpenChange(false)
      setSourceBranchId('')
      setNewName('')
      setNewCode('')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Clone chi nhánh</DialogTitle>
          <DialogDescription>Tạo chi nhánh mới từ cấu trúc chi nhánh có sẵn</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Chi nhánh nguồn *</Label>
            <select
              value={sourceBranchId}
              onChange={(e) => setSourceBranchId(e.target.value)}
              className="w-full min-h-[48px] text-base rounded-md border border-input bg-background px-3 py-2"
              required
            >
              <option value="">Chọn chi nhánh nguồn</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="clone-name">Tên chi nhánh mới *</Label>
            <Input
              id="clone-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="VD: Chi nhánh Gia Lâm"
              className="min-h-[48px] text-base"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clone-code">Mã chi nhánh mới *</Label>
            <Input
              id="clone-code"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value.toUpperCase())}
              placeholder="VD: GIALAM"
              className="min-h-[48px] text-base"
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={saving || !sourceBranchId || !newName || !newCode}>
              {saving && <Loader2 className="size-4 mr-2 animate-spin" />}
              Clone
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function SystemPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [branches, setBranches] = useState<BranchCardData[]>([])
  const [loadingBranches, setLoadingBranches] = useState(true)

  // Dialog state
  const [createOpen, setCreateOpen] = useState(false)
  const [editBranch, setEditBranch] = useState<BranchCardData | null>(null)
  const [cloneOpen, setCloneOpen] = useState(false)
  const [staffBranch, setStaffBranch] = useState<BranchCardData | null>(null)

  // Redirect non-super_admin
  useEffect(() => {
    if (!authLoading && user && user.role !== 'super_admin') {
      router.replace('/dashboard')
    }
    if (!authLoading && !user) {
      router.replace('/login')
    }
  }, [authLoading, user, router])

  const fetchBranches = useCallback(async () => {
    setLoadingBranches(true)
    try {
      const res = await fetch('/api/branches')
      if (res.ok) {
        const data = await res.json()
        setBranches(data.branches ?? [])
      } else {
        toast.error('Không thể tải danh sách chi nhánh.')
      }
    } catch {
      toast.error('Lỗi kết nối máy chủ.')
    } finally {
      setLoadingBranches(false)
    }
  }, [])

  useEffect(() => {
    if (user?.role === 'super_admin') {
      fetchBranches()
    }
  }, [user, fetchBranches])

  async function handleCreate(data: BranchFormData) {
    const res = await fetch('/api/branches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      toast.success('Đã tạo chi nhánh mới.')
      fetchBranches()
    } else {
      const err = await res.json()
      toast.error(err.error ?? 'Lỗi tạo chi nhánh.')
      throw new Error(err.error)
    }
  }

  async function handleEdit(data: BranchFormData) {
    if (!editBranch) return
    const res = await fetch(`/api/branches/${editBranch.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      toast.success('Đã cập nhật chi nhánh.')
      fetchBranches()
    } else {
      const err = await res.json()
      toast.error(err.error ?? 'Lỗi cập nhật chi nhánh.')
      throw new Error(err.error)
    }
  }

  async function handleClone(sourceBranchId: string, newName: string, newCode: string) {
    const res = await fetch('/api/branches/clone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceBranchId, newName, newCode }),
    })
    if (res.ok) {
      toast.success('Đã clone chi nhánh thành công.')
      fetchBranches()
    } else {
      const err = await res.json()
      toast.error(err.error ?? 'Lỗi clone chi nhánh.')
      throw new Error(err.error)
    }
  }

  async function handleDeactivate(id: string) {
    const res = await fetch(`/api/branches/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: false }),
    })
    if (res.ok) {
      toast.success('Đã tạm dừng chi nhánh.')
      fetchBranches()
    } else {
      toast.error('Lỗi tạm dừng chi nhánh.')
    }
  }

  function openEdit(id: string) {
    const branch = branches.find((b) => b.id === id)
    if (branch) setEditBranch(branch)
  }

  function openStaff(id: string) {
    const branch = branches.find((b) => b.id === id)
    if (branch) setStaffBranch(branch)
  }

  // Show loading / redirect guard
  if (authLoading || !user || user.role !== 'super_admin') {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Quản lý hệ thống</h1>
          <p className="text-muted-foreground text-base mt-1">
            Quản lý chi nhánh toàn hệ thống AIVIHE
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Button
            variant="outline"
            className="min-h-[48px] text-base gap-2"
            onClick={fetchBranches}
            disabled={loadingBranches}
          >
            <RefreshCw className={`size-4 ${loadingBranches ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
          <Button
            variant="outline"
            className="min-h-[48px] text-base gap-2"
            onClick={() => setCloneOpen(true)}
          >
            <Copy className="size-4" />
            Clone chi nhánh
          </Button>
          <Button
            className="min-h-[48px] text-base gap-2"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="size-4" />
            Tạo chi nhánh mới
          </Button>
        </div>
      </div>

      {/* Branch grid */}
      {loadingBranches ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : branches.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-base">
          Chưa có chi nhánh nào. Tạo chi nhánh đầu tiên.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {branches.map((branch) => (
            <BranchCard
              key={branch.id}
              branch={branch}
              onEdit={openEdit}
              onStaff={openStaff}
              onDeactivate={handleDeactivate}
            />
          ))}
        </div>
      )}

      {/* Create dialog */}
      <BranchForm
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode="create"
        onSubmit={handleCreate}
      />

      {/* Edit dialog */}
      {editBranch && (
        <BranchForm
          open={!!editBranch}
          onOpenChange={(open) => { if (!open) setEditBranch(null) }}
          mode="edit"
          initialData={{
            id: editBranch.id,
            name: editBranch.name,
            code: editBranch.code,
            address: editBranch.address,
            phone: editBranch.phone,
          }}
          onSubmit={handleEdit}
        />
      )}

      {/* Clone dialog */}
      <CloneDialog
        open={cloneOpen}
        onOpenChange={setCloneOpen}
        branches={branches}
        onClone={handleClone}
      />

      {/* Staff dialog */}
      {staffBranch && (
        <BranchStaffDialog
          open={!!staffBranch}
          onOpenChange={(open) => { if (!open) setStaffBranch(null) }}
          branchId={staffBranch.id}
          branchName={staffBranch.name}
        />
      )}
    </div>
  )
}
