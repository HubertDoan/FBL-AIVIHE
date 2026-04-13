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
import { Loader2, Plus, Trash2, UserPlus, Search } from 'lucide-react'
import { toast } from 'sonner'

interface StaffMember {
  id: string
  citizen_id: string
  position: string
  is_primary: boolean
  citizen?: {
    id: string
    full_name: string
    phone: string
  }
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

  // Search state
  const [searchPhone, setSearchPhone] = useState('')
  const [searching, setSearching] = useState(false)
  const [foundCitizen, setFoundCitizen] = useState<{ id: string; fullName: string; phone: string } | null>(null)

  // New staff fields
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

  // Search citizen by phone number
  async function handleSearch() {
    if (!searchPhone.trim()) return
    setSearching(true)
    setFoundCitizen(null)
    try {
      const res = await fetch(`/api/director/search-member?phone=${encodeURIComponent(searchPhone.trim())}`)
      if (res.ok) {
        const data = await res.json()
        setFoundCitizen(data)
      } else {
        toast.error('Không tìm thấy nhân viên với SĐT này.')
      }
    } catch {
      toast.error('Lỗi tìm kiếm.')
    } finally {
      setSearching(false)
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!foundCitizen) return
    setAdding(true)
    try {
      const res = await fetch(`/api/branches/${branchId}/staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          citizen_id: foundCitizen.id,
          position: newPosition,
          is_primary: newIsPrimary,
        }),
      })
      if (res.ok) {
        toast.success(`Đã thêm ${foundCitizen.fullName} vào chi nhánh.`)
        fetchStaff()
        resetAddForm()
      } else {
        const err = await res.json()
        toast.error(err.error ?? 'Lỗi thêm nhân viên.')
      }
    } finally {
      setAdding(false)
    }
  }

  function resetAddForm() {
    setShowAddForm(false)
    setSearchPhone('')
    setFoundCitizen(null)
    setNewPosition('')
    setNewIsPrimary(true)
  }

  async function handleRemove(citizenId: string) {
    const res = await fetch(`/api/branches/${branchId}/staff?citizen_id=${citizenId}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      setStaff((prev) => prev.filter((s) => s.citizen_id !== citizenId))
      toast.success('Đã xóa nhân viên khỏi chi nhánh.')
    } else {
      toast.error('Lỗi xóa nhân viên.')
    }
  }

  // Get display name from staff member
  function getStaffName(s: StaffMember) {
    return s.citizen?.full_name ?? 'Không rõ'
  }

  function getStaffPhone(s: StaffMember) {
    return s.citizen?.phone ?? ''
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nhân viên — {branchName}</DialogTitle>
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
                    <p className="font-medium text-base">{getStaffName(s)}</p>
                    <p className="text-sm text-muted-foreground">
                      {s.position ?? 'Chưa gán vị trí'}
                      {getStaffPhone(s) && ` · ${getStaffPhone(s)}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {s.is_primary && (
                      <Badge variant="secondary">Chi nhánh chính</Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(s.citizen_id)}
                      className="text-destructive h-8 w-8 p-0"
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

            {/* Search by phone */}
            <div className="space-y-1">
              <Label>Tìm theo SĐT</Label>
              <div className="flex gap-2">
                <Input
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                  placeholder="0912345678"
                  className="min-h-[44px]"
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearch() } }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSearch}
                  disabled={searching || !searchPhone.trim()}
                  className="min-h-[44px]"
                >
                  {searching ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
                </Button>
              </div>
            </div>

            {/* Found citizen */}
            {foundCitizen && (
              <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                <p className="font-medium">{foundCitizen.fullName}</p>
                <p className="text-sm text-muted-foreground">{foundCitizen.phone}</p>
              </div>
            )}

            {/* Position + primary */}
            {foundCitizen && (
              <>
                <div className="space-y-1">
                  <Label>Vị trí *</Label>
                  <Input
                    value={newPosition}
                    onChange={(e) => setNewPosition(e.target.value)}
                    placeholder="Kế toán, Lễ tân, Bác sĩ..."
                    className="min-h-[44px]"
                    required
                  />
                </div>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newIsPrimary}
                    onChange={(e) => setNewIsPrimary(e.target.checked)}
                    className="size-4 rounded"
                  />
                  Đây là chi nhánh chính của nhân viên
                </label>
                <div className="flex gap-2">
                  <Button type="submit" size="sm" disabled={adding || !newPosition}>
                    {adding && <Loader2 className="size-4 mr-1 animate-spin" />}
                    Thêm
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={resetAddForm}>
                    Hủy
                  </Button>
                </div>
              </>
            )}

            {!foundCitizen && (
              <Button type="button" variant="outline" size="sm" onClick={resetAddForm}>
                Hủy
              </Button>
            )}
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
