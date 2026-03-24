'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, Trash2, UserPlus } from 'lucide-react'

interface StaffMember {
  id: string
  citizen_id: string
  citizen_name: string
  position: string
  is_primary: boolean
}

interface BranchStaffDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  branchId: string
  branchName: string
}

export function BranchStaffDialog({
  open,
  onOpenChange,
  branchId,
  branchName,
}: BranchStaffDialogProps) {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newCitizenId, setNewCitizenId] = useState('')
  const [newCitizenName, setNewCitizenName] = useState('')
  const [newPosition, setNewPosition] = useState('')
  const [newIsPrimary, setNewIsPrimary] = useState(true)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    if (open && branchId) {
      fetchStaff()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, branchId])

  async function fetchStaff() {
    setLoading(true)
    try {
      const res = await fetch(`/api/branches/${branchId}/staff`)
      if (res.ok) {
        const data = await res.json()
        setStaff(data.staff ?? [])
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setAdding(true)
    try {
      const res = await fetch(`/api/branches/${branchId}/staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          citizen_id: newCitizenId,
          citizen_name: newCitizenName,
          position: newPosition,
          is_primary: newIsPrimary,
        }),
      })
      if (res.ok) {
        const newStaff = await res.json()
        setStaff((prev) => [...prev, newStaff])
        setShowAddForm(false)
        setNewCitizenId('')
        setNewCitizenName('')
        setNewPosition('')
        setNewIsPrimary(true)
      }
    } finally {
      setAdding(false)
    }
  }

  async function handleRemove(citizenId: string) {
    const res = await fetch(`/api/branches/${branchId}/staff?citizen_id=${citizenId}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      setStaff((prev) => prev.filter((s) => s.citizen_id !== citizenId))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nhân viên - {branchName}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {staff.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Chưa có nhân viên nào.
              </p>
            ) : (
              staff.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-base">{s.citizen_name}</p>
                    <p className="text-sm text-muted-foreground">{s.position}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {s.is_primary && (
                      <Badge variant="secondary">Chi nhánh chính</Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleRemove(s.citizen_id)}
                      className="text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {showAddForm ? (
          <form onSubmit={handleAdd} className="space-y-3 border-t pt-3">
            <p className="font-medium text-sm flex items-center gap-1.5">
              <UserPlus className="size-4" />
              Thêm nhân viên
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="staff-name">Tên nhân viên</Label>
                <Input
                  id="staff-name"
                  value={newCitizenName}
                  onChange={(e) => setNewCitizenName(e.target.value)}
                  placeholder="Họ tên"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="staff-id">ID nhân viên</Label>
                <Input
                  id="staff-id"
                  value={newCitizenId}
                  onChange={(e) => setNewCitizenId(e.target.value)}
                  placeholder="UUID"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="staff-position">Vị trí</Label>
                <Input
                  id="staff-position"
                  value={newPosition}
                  onChange={(e) => setNewPosition(e.target.value)}
                  placeholder="Kế toán, Lễ tân..."
                  required
                />
              </div>
              <div className="flex items-end gap-2 pb-0.5">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newIsPrimary}
                    onChange={(e) => setNewIsPrimary(e.target.checked)}
                    className="size-4 rounded"
                  />
                  Chi nhánh chính
                </label>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={adding}>
                {adding && <Loader2 className="size-4 mr-1 animate-spin" />}
                Thêm
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setShowAddForm(false)}>
                Hủy
              </Button>
            </div>
          </form>
        ) : (
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowAddForm(true)}>
              <Plus className="size-4 mr-1" />
              Thêm nhân viên
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
